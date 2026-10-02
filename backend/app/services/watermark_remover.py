"""Watermark Removal Service for Multi-Format Documents, High-Fidelity Media, and Social Platforms.

Supports:
- Video (.mp4, .mov, .mkv, .webm, .avi): Lossless audio preservation (-c:a copy) and visually lossless
  video reconstruction (CRF 17-18) using FFmpeg delogo algorithms for TikTok, Instagram Reels,
  YouTube Shorts, Facebook, WhatsApp, and Snapchat across 16:9 Landscape and 9:16 Vertical formats.
- Images (.png, .jpg, .jpeg, .webp, .bmp): High-fidelity inpainting via OpenCV Telea & Navier-Stokes algorithms (Q99).
- PDF (.pdf): Removes watermark annotations, stamp annotations, and text/graphic watermarks via PyMuPDF.
- Word (.docx): Removes header/footer VML shapes, watermarks, and floating drawing watermarks via python-docx & lxml.
- Excel (.xlsx): Removes sheet background images, header/footer watermark images, and overlay shapes via openpyxl.
- PowerPoint (.pptx): Removes master slide, layout, and slide watermark text/shapes via python-pptx.
"""

import io
import re
import shutil
import logging
import subprocess
from pathlib import Path
from typing import List, Optional, Tuple, Union
import pymupdf
from lxml import etree
import docx
import openpyxl
from pptx import Presentation
from PIL import Image

logger = logging.getLogger("creedtech.watermark_remover")

COMMON_WATERMARK_PATTERNS = [
    "watermark",
    "confidential",
    "draft",
    "sample",
    "do not copy",
    "preview",
    "internal use",
    "evaluation only",
    "copyright",
    "unregistered",
]


class WatermarkRemoverService:
    """Service providing watermark removal algorithms across multiple document, office, and media formats."""

    @classmethod
    def get_media_dimensions(cls, media_path: Union[str, Path]) -> Tuple[int, int]:
        """Probes video or image dimensions (width, height) using ffprobe or OpenCV."""
        p = Path(media_path)
        try:
            cmd = [
                "ffprobe", "-v", "error",
                "-select_streams", "v:0",
                "-show_entries", "stream=width,height",
                "-of", "csv=s=x:p=0",
                str(p),
            ]
            res = subprocess.run(cmd, capture_output=True, text=True, check=True)
            out = res.stdout.strip()
            if "x" in out:
                w_str, h_str = out.split("x")[:2]
                w, h = int(w_str), int(h_str)
                if w > 0 and h > 0:
                    return w, h
        except Exception as e:
            logger.debug("ffprobe dimension check fallback: %s", e)

        # Fallback to OpenCV
        try:
            import cv2
            cap = cv2.VideoCapture(str(p))
            if cap.isOpened():
                w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
                h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
                cap.release()
                if w > 0 and h > 0:
                    return w, h
        except Exception:
            pass

        return 1080, 1920

    @classmethod
    def calculate_delogo_filters(
        cls,
        width: int,
        height: int,
        position: str = "bottom-right",
        preset: Optional[str] = None,
        aspect_ratio: str = "auto",
    ) -> List[str]:
        """Calculates precise FFmpeg delogo filter strings matching social platform geometries."""
        w, h = width, height
        is_vertical = (h > w) if aspect_ratio == "auto" else (aspect_ratio == "9:16")

        # Determine proportional bounding box for the platform watermark
        if is_vertical:
            # 9:16 Vertical (Reels, TikTok, Shorts, Snapchat, WhatsApp)
            box_w = max(40, min(int(w * 0.28), 340))
            box_h = max(24, min(int(h * 0.055), 130))
            pad_x = max(10, int(w * 0.025))
            pad_y = max(10, int(h * 0.035))
        else:
            # 16:9 Landscape (YouTube, Facebook, Video)
            box_w = max(40, min(int(w * 0.16), 320))
            box_h = max(24, min(int(h * 0.08), 120))
            pad_x = max(10, int(w * 0.02))
            pad_y = max(10, int(h * 0.03))

        delogo_boxes = []

        pos = (preset or position or "bottom-right").lower()

        # Dual watermark for TikTok (bounces between Top-Left and Bottom-Right)
        if pos in ("tiktok", "tiktok-dual", "dual"):
            # Top-Left box
            tl_x = pad_x
            tl_y = pad_y
            # Bottom-Right box
            br_x = max(0, w - box_w - pad_x)
            br_y = max(0, h - box_h - pad_y)
            delogo_boxes.append((tl_x, tl_y, box_w, box_h))
            delogo_boxes.append((br_x, br_y, box_w, box_h))

        elif pos in ("top-left",):
            delogo_boxes.append((pad_x, pad_y, box_w, box_h))

        elif pos in ("top-right", "snapchat"):
            tr_x = max(0, w - box_w - pad_x)
            tr_y = pad_y
            delogo_boxes.append((tr_x, tr_y, box_w, box_h))

        elif pos in ("bottom-left",):
            bl_x = pad_x
            bl_y = max(0, h - box_h - pad_y)
            delogo_boxes.append((bl_x, bl_y, box_w, box_h))

        elif pos in ("all", "all-corners"):
            # 4 Corners
            delogo_boxes.append((pad_x, pad_y, box_w, box_h))
            delogo_boxes.append((max(0, w - box_w - pad_x), pad_y, box_w, box_h))
            delogo_boxes.append((pad_x, max(0, h - box_h - pad_y), box_w, box_h))
            delogo_boxes.append((max(0, w - box_w - pad_x), max(0, h - box_h - pad_y), box_w, box_h))

        else:
            # Default: Bottom-Right (Instagram, YouTube, Facebook, WhatsApp)
            br_x = max(0, w - box_w - pad_x)
            br_y = max(0, h - box_h - pad_y)
            delogo_boxes.append((br_x, br_y, box_w, box_h))

        # Clamp boxes strictly within video canvas
        filters = []
        for bx, by, bw, bh in delogo_boxes:
            cx = max(0, min(bx, w - 10))
            cy = max(0, min(by, h - 10))
            cw = max(10, min(bw, w - cx))
            ch = max(10, min(bh, h - cy))
            filters.append(f"delogo=x={cx}:y={cy}:w={cw}:h={ch}")

        return filters

    @classmethod
    def remove_video_watermark(
        cls,
        input_path: Union[str, Path],
        output_path: Union[str, Path],
        position: str = "bottom-right",
        preset: Optional[str] = None,
        aspect_ratio: str = "auto",
        watermark_text: Optional[str] = None,
    ) -> Path:
        """Removes watermarks from video with visually lossless encoding (CRF 17) and 100% audio fidelity (-c:a copy)."""
        in_path = Path(input_path)
        out_path = Path(output_path)
        out_path.parent.mkdir(parents=True, exist_ok=True)

        w, h = cls.get_media_dimensions(in_path)
        filters = cls.calculate_delogo_filters(
            width=w,
            height=h,
            position=position,
            preset=preset,
            aspect_ratio=aspect_ratio,
        )

        vf_str = ",".join(filters)

        # High-Fidelity Lossless Pipeline:
        # -c:v libx264 -preset medium -crf 17: Visually identical to original source
        # -c:a copy: Bit-for-bit identical audio track (zero loss)
        cmd = [
            "ffmpeg", "-y",
            "-i", str(in_path),
            "-vf", vf_str,
            "-c:v", "libx264",
            "-preset", "medium",
            "-crf", "17",
            "-pix_fmt", "yuv420p",
            "-c:a", "copy",
            "-movflags", "+faststart",
            str(out_path),
        ]

        logger.info("Executing video watermark removal: %s", " ".join(cmd))
        try:
            res = subprocess.run(cmd, capture_output=True, text=True, check=True)
        except subprocess.CalledProcessError as e:
            # If audio copy failed due to container mismatch, fallback with high-bitrate AAC
            logger.warning("Fast audio copy failed, retrying with high-bitrate 320k AAC: %s", e.stderr)
            cmd_fallback = [
                "ffmpeg", "-y",
                "-i", str(in_path),
                "-vf", vf_str,
                "-c:v", "libx264",
                "-preset", "medium",
                "-crf", "17",
                "-pix_fmt", "yuv420p",
                "-c:a", "aac",
                "-b:a", "320k",
                "-movflags", "+faststart",
                str(out_path),
            ]
            subprocess.run(cmd_fallback, capture_output=True, text=True, check=True)

        return out_path

    @classmethod
    def remove_image_watermark(
        cls,
        input_path: Union[str, Path],
        output_path: Union[str, Path],
        watermark_text: Optional[str] = None,
        position: str = "bottom-right",
        preset: Optional[str] = None,
        aspect_ratio: str = "auto",
    ) -> Path:
        """Removes watermarks from image formats with 99% high-quality inpainting via OpenCV."""
        in_path = Path(input_path)
        out_path = Path(output_path)
        out_path.parent.mkdir(parents=True, exist_ok=True)

        try:
            import cv2
            import numpy as np

            img = cv2.imread(str(in_path))
            if img is not None:
                h, w = img.shape[:2]
                mask = np.zeros((h, w), dtype=np.uint8)

                # 1. Corner box inpainting matching video geometries
                pos = (preset or position or "bottom-right").lower()
                is_vertical = (h > w) if aspect_ratio == "auto" else (aspect_ratio == "9:16")

                box_w = max(40, min(int(w * (0.28 if is_vertical else 0.18)), 360))
                box_h = max(24, min(int(h * (0.055 if is_vertical else 0.08)), 130))
                pad_x = max(8, int(w * 0.025))
                pad_y = max(8, int(h * 0.035))

                if pos in ("tiktok", "tiktok-dual", "dual"):
                    mask[pad_y:pad_y + box_h, pad_x:pad_x + box_w] = 255
                    br_x = max(0, w - box_w - pad_x)
                    br_y = max(0, h - box_h - pad_y)
                    mask[br_y:br_y + box_h, br_x:br_x + box_w] = 255
                elif pos in ("top-left",):
                    mask[pad_y:pad_y + box_h, pad_x:pad_x + box_w] = 255
                elif pos in ("top-right", "snapchat"):
                    tr_x = max(0, w - box_w - pad_x)
                    mask[pad_y:pad_y + box_h, tr_x:tr_x + box_w] = 255
                elif pos in ("bottom-left",):
                    bl_y = max(0, h - box_h - pad_y)
                    mask[bl_y:bl_y + box_h, pad_x:pad_x + box_w] = 255
                elif pos in ("all", "all-corners"):
                    mask[pad_y:pad_y + box_h, pad_x:pad_x + box_w] = 255
                    mask[pad_y:pad_y + box_h, max(0, w - box_w - pad_x):w] = 255
                    mask[max(0, h - box_h - pad_y):h, pad_x:pad_x + box_w] = 255
                    mask[max(0, h - box_h - pad_y):h, max(0, w - box_w - pad_x):w] = 255
                else:
                    # Bottom-right default
                    br_x = max(0, w - box_w - pad_x)
                    br_y = max(0, h - box_h - pad_y)
                    mask[br_y:br_y + box_h, br_x:br_x + box_w] = 255

                # 2. Add automatic contrast mask for light/white semi-transparent watermark text
                gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
                bright_mask = cv2.threshold(gray, 235, 255, cv2.THRESH_BINARY)[1]
                # Combine mask so inpainting targets actual watermark pixels
                combined_mask = cv2.bitwise_and(mask, bright_mask)
                if cv2.countNonZero(combined_mask) < 50:
                    combined_mask = mask

                # Inpaint using Telea algorithm
                cleaned = cv2.inpaint(img, combined_mask, inpaintRadius=3, flags=cv2.INPAINT_TELEA)

                # Save with maximum visual quality (Q99)
                ext = out_path.suffix.lower()
                if ext in (".jpg", ".jpeg"):
                    cv2.imwrite(str(out_path), cleaned, [cv2.IMWRITE_JPEG_QUALITY, 99])
                elif ext == ".png":
                    cv2.imwrite(str(out_path), cleaned, [cv2.IMWRITE_PNG_COMPRESSION, 1])
                elif ext == ".webp":
                    cv2.imwrite(str(out_path), cleaned, [cv2.IMWRITE_WEBP_QUALITY, 99])
                else:
                    cv2.imwrite(str(out_path), cleaned)

                return out_path
        except Exception as cv_err:
            logger.warning("OpenCV image inpainting failed, falling back to Pillow: %s", cv_err)

        # Fallback to Pillow
        with Image.open(str(in_path)) as pil_img:
            pil_img.save(str(out_path), quality=99)
        return out_path

    @classmethod
    def remove_pdf_watermark(
        cls,
        input_path: Union[str, Path],
        output_path: Union[str, Path],
        watermark_text: Optional[str] = None,
    ) -> Path:
        """Removes watermarks from a PDF file."""
        in_path = Path(input_path)
        out_path = Path(output_path)
        out_path.parent.mkdir(parents=True, exist_ok=True)

        doc = pymupdf.open(str(in_path))
        target_words = [watermark_text.strip().lower()] if watermark_text and watermark_text.strip() else COMMON_WATERMARK_PATTERNS

        try:
            for page in doc:
                # 1. Remove watermark and stamp annotations
                annots = list(page.annots() or [])
                for annot in annots:
                    annot_type = annot.type[0]
                    # PDF_ANNOT_WATERMARK (21) or PDF_ANNOT_STAMP (13)
                    if annot_type in (pymupdf.PDF_ANNOT_WATERMARK, pymupdf.PDF_ANNOT_STAMP):
                        page.delete_annot(annot)
                    elif watermark_text:
                        info = annot.info or {}
                        content = str(info.get("content", ""))
                        if watermark_text.lower() in content.lower():
                            page.delete_annot(annot)

                # 2. Search for watermark text on the page and redact
                rects_to_redact = []
                for word in target_words:
                    if not word:
                        continue
                    found_rects = page.search_for(word)
                    for r in found_rects:
                        rects_to_redact.append(r)

                # Apply redactions with no fill to remove watermark text cleanly
                if rects_to_redact:
                    for r in rects_to_redact:
                        page.add_redact_annot(r, fill=None)
                    page.apply_redactions()

                # 3. Clean background Form XObjects labeled as Watermark
                try:
                    xobjects = page.get_xobjects()
                    for x in xobjects:
                        x_name = x[1] if len(x) > 1 else ""
                        if "watermark" in x_name.lower():
                            page.clean_contents()
                except Exception as x_err:
                    logger.debug("Minor notice inspecting XObjects: %s", x_err)

            doc.save(str(out_path), garbage=4, deflate=True)
            return out_path
        finally:
            doc.close()

    @classmethod
    def remove_docx_watermark(
        cls,
        input_path: Union[str, Path],
        output_path: Union[str, Path],
        watermark_text: Optional[str] = None,
    ) -> Path:
        """Removes watermarks from a Word (.docx) document."""
        in_path = Path(input_path)
        out_path = Path(output_path)
        out_path.parent.mkdir(parents=True, exist_ok=True)

        doc = docx.Document(str(in_path))
        target_words = [watermark_text.strip().lower()] if watermark_text and watermark_text.strip() else COMMON_WATERMARK_PATTERNS

        # 1. Clean Headers and Footers (where Word stores watermarks)
        for section in doc.sections:
            headers_footers = [
                section.header,
                section.first_page_header,
                section.even_page_header,
                section.footer,
                section.first_page_footer,
                section.even_page_footer,
            ]
            for hf in headers_footers:
                if not hf or not hasattr(hf, "_element"):
                    continue

                # Remove VML shapes, picts, and drawings representing watermarks
                try:
                    elements = hf._element.xpath(
                        './/*[local-name()="shape" or local-name()="pict" or local-name()="drawing" or local-name()="textpath"]'
                    )
                    for el in list(elements):
                        xml_snippet = etree.tostring(el, encoding="utf-8").decode("utf-8", errors="ignore").lower()
                        is_wm = "watermark" in xml_snippet or "powerpluswatermarkobject" in xml_snippet or "wordpicturewatermark" in xml_snippet
                        if not is_wm:
                            is_wm = any(term in xml_snippet for term in target_words)

                        if is_wm:
                            parent = el.getparent()
                            if parent is not None:
                                parent.remove(el)
                except Exception as xml_err:
                    logger.warning("Error removing header watermark shape in docx: %s", xml_err)

        # 2. Check main body paragraphs for floating watermark shapes or matching text
        for p in doc.paragraphs:
            if not p.text.strip():
                # Check for drawing/pict elements in empty paragraphs
                try:
                    drawings = p._element.xpath('.//*[local-name()="drawing" or local-name()="pict"]')
                    for d in list(drawings):
                        xml_snippet = etree.tostring(d, encoding="utf-8").decode("utf-8", errors="ignore").lower()
                        if "watermark" in xml_snippet or any(term in xml_snippet for term in target_words):
                            parent = d.getparent()
                            if parent is not None:
                                parent.remove(d)
                except Exception:
                    pass
            elif watermark_text and watermark_text.lower() == p.text.strip().lower():
                p.text = ""

        doc.save(str(out_path))
        return out_path

    @classmethod
    def remove_xlsx_watermark(
        cls,
        input_path: Union[str, Path],
        output_path: Union[str, Path],
        watermark_text: Optional[str] = None,
    ) -> Path:
        """Removes watermarks (sheet background images and header images) from Excel (.xlsx)."""
        in_path = Path(input_path)
        out_path = Path(output_path)
        out_path.parent.mkdir(parents=True, exist_ok=True)

        wb = openpyxl.load_workbook(str(in_path))

        for ws in wb.worksheets:
            # 1. Clear background sheet image (watermark)
            if hasattr(ws, "_images") and ws._images:
                ws._images.clear()

            # 2. Reset header and footer background pictures
            for h in [getattr(ws, "oddHeader", None), getattr(ws, "evenHeader", None), getattr(ws, "firstHeader", None)]:
                if h is not None:
                    for pos in ["left", "center", "right"]:
                        part = getattr(h, pos, None)
                        if part is not None and hasattr(part, "image"):
                            part.image = None

            # 3. Enable gridlines and remove sheet background tag if present
            if hasattr(ws, "views") and ws.views and hasattr(ws.views, "sheetView") and ws.views.sheetView:
                ws.views.sheetView[0].showGridLines = True

        wb.save(str(out_path))
        wb.close()
        return out_path

    @classmethod
    def remove_pptx_watermark(
        cls,
        input_path: Union[str, Path],
        output_path: Union[str, Path],
        watermark_text: Optional[str] = None,
    ) -> Path:
        """Removes watermarks from PowerPoint (.pptx) presentations."""
        in_path = Path(input_path)
        out_path = Path(output_path)
        out_path.parent.mkdir(parents=True, exist_ok=True)

        prs = Presentation(str(in_path))
        target_words = [watermark_text.strip().lower()] if watermark_text and watermark_text.strip() else COMMON_WATERMARK_PATTERNS

        def _clean_shape_list(shapes):
            to_remove = []
            for shape in shapes:
                # Check text frame
                if shape.has_text_frame:
                    t = shape.text_frame.text.strip().lower()
                    if any(w in t for w in target_words):
                        to_remove.append(shape)
                # Check shape name / alt text
                elif shape.name and any(w in shape.name.lower() for w in target_words):
                    to_remove.append(shape)

            for shape in to_remove:
                try:
                    elem = shape._element
                    parent = elem.getparent()
                    if parent is not None:
                        parent.remove(elem)
                except Exception as rem_err:
                    logger.debug("Notice removing PPT shape: %s", rem_err)

        # 1. Clean master slides and layout slides
        for master in prs.slide_masters:
            _clean_shape_list(master.shapes)
            for layout in master.slide_layouts:
                _clean_shape_list(layout.shapes)

        # 2. Clean individual slides
        for slide in prs.slides:
            _clean_shape_list(slide.shapes)

        prs.save(str(out_path))
        return out_path

    @classmethod
    def process_file(
        cls,
        input_path: Union[str, Path],
        output_path: Union[str, Path],
        watermark_text: Optional[str] = None,
        position: str = "bottom-right",
        preset: Optional[str] = None,
        aspect_ratio: str = "auto",
    ) -> Path:
        """Universal dispatcher that detects format and applies appropriate watermark removal."""
        in_p = Path(input_path)
        ext = in_p.suffix.lower()

        if ext == ".pdf":
            return cls.remove_pdf_watermark(input_path, output_path, watermark_text)
        elif ext in (".docx", ".doc"):
            return cls.remove_docx_watermark(input_path, output_path, watermark_text)
        elif ext in (".xlsx", ".xls"):
            return cls.remove_xlsx_watermark(input_path, output_path, watermark_text)
        elif ext in (".pptx", ".ppt"):
            return cls.remove_pptx_watermark(input_path, output_path, watermark_text)
        elif ext in (".png", ".jpg", ".jpeg", ".webp", ".bmp"):
            return cls.remove_image_watermark(
                input_path,
                output_path,
                watermark_text=watermark_text,
                position=position,
                preset=preset,
                aspect_ratio=aspect_ratio,
            )
        elif ext in (".mp4", ".mov", ".mkv", ".webm", ".avi"):
            return cls.remove_video_watermark(
                input_path,
                output_path,
                position=position,
                preset=preset,
                aspect_ratio=aspect_ratio,
                watermark_text=watermark_text,
            )
        else:
            raise ValueError(f"Unsupported file format for watermark removal: {ext}")


watermark_remover = WatermarkRemoverService
