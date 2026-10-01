"""Universal Conversion Service for 23 Adobe Acrobat Online converters.

Implements end-to-end format conversions across Documents, Spreadsheets,
Presentations, Images, Vector/Raw formats, and OCR.
"""

import io
import logging
import os
import shutil
import zipfile
from pathlib import Path
from typing import List, Optional

import openpyxl
import pdfplumber
import pymupdf
from docx import Document
from fpdf import FPDF
from pdf2docx import Converter
from PIL import Image, ImageSequence
import pillow_heif
from pptx import Presentation
from pptx.util import Inches, Pt
from psd_tools import PSDImage
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
from striprtf.striprtf import rtf_to_text

# Register HEIF opener with Pillow
pillow_heif.register_heif_opener()

logger = logging.getLogger("creedtech.universal_converters")


class UniversalConvertersService:
    """Service providing 23 format conversion pipelines matching Adobe Acrobat Online."""

    # 1. PDF to Word (.docx)
    @staticmethod
    def pdf_to_word(src_pdf: Path, out_docx: Path) -> Path:
        """Converts PDF document to Microsoft Word .docx using pdf2docx."""
        out_docx.parent.mkdir(parents=True, exist_ok=True)
        cv = Converter(str(src_pdf))
        try:
            cv.convert(str(out_docx), start=0, end=None)
        finally:
            cv.close()
        return out_docx

    # 2. Word (.docx) to PDF
    @staticmethod
    def word_to_pdf(src_docx: Path, out_pdf: Path) -> Path:
        """Converts Microsoft Word .docx to PDF using python-docx and reportlab."""
        out_pdf.parent.mkdir(parents=True, exist_ok=True)
        doc = Document(str(src_docx))
        styles = getSampleStyleSheet()
        normal_style = styles["Normal"]
        heading_style = styles["Heading1"]

        pdf_doc = SimpleDocTemplate(str(out_pdf), pagesize=letter, rightMargin=54, leftMargin=54, topMargin=54, bottomMargin=54)
        story = []

        for p in doc.paragraphs:
            text = p.text.strip()
            if not text:
                story.append(Spacer(1, 8))
                continue
            if p.style.name.startswith("Heading"):
                story.append(Paragraph(text, heading_style))
                story.append(Spacer(1, 6))
            else:
                story.append(Paragraph(text, normal_style))
                story.append(Spacer(1, 4))

        for table in doc.tables:
            table_data = []
            for row in table.rows:
                row_data = [cell.text.strip() for cell in row.cells]
                table_data.append(row_data)
            if table_data:
                t = Table(table_data)
                t.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f1f5f9')),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#0f172a')),
                    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('BOTTOMPADDING', (0, 0), (-1, 0), 6),
                    ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
                ]))
                story.append(t)
                story.append(Spacer(1, 12))

        if not story:
            story.append(Paragraph("Empty document", normal_style))

        pdf_doc.build(story)
        return out_pdf

    # 3. PDF to Excel (.xlsx)
    @staticmethod
    def pdf_to_excel(src_pdf: Path, out_xlsx: Path) -> Path:
        """Extracts tabular data and text from PDF into an Excel spreadsheet."""
        out_xlsx.parent.mkdir(parents=True, exist_ok=True)
        wb = openpyxl.Workbook()
        wb.remove(wb.active)  # Remove default empty sheet

        with pdfplumber.open(src_pdf) as pdf:
            for i, page in enumerate(pdf.pages):
                ws = wb.create_sheet(title=f"Page {i + 1}")
                tables = page.extract_tables()
                if tables:
                    row_idx = 1
                    for table in tables:
                        for row in table:
                            clean_row = [cell or "" for cell in row]
                            ws.append(clean_row)
                            row_idx += 1
                        ws.append([])  # Spacer between tables
                else:
                    text = page.extract_text() or ""
                    for line in text.split("\n"):
                        ws.append([line])

        if len(wb.sheetnames) == 0:
            ws = wb.create_sheet(title="Sheet 1")
            ws.append(["No text or tables extracted from PDF"])

        wb.save(out_xlsx)
        return out_xlsx

    # 4. Excel (.xlsx) to PDF
    @staticmethod
    def excel_to_pdf(src_xlsx: Path, out_pdf: Path) -> Path:
        """Converts an Excel workbook into a formatted PDF document."""
        out_pdf.parent.mkdir(parents=True, exist_ok=True)
        wb = openpyxl.load_workbook(str(src_xlsx), data_only=True)
        pdf_doc = SimpleDocTemplate(str(out_pdf), pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
        styles = getSampleStyleSheet()
        title_style = styles["Heading2"]
        story = []

        for sheet_name in wb.sheetnames:
            ws = wb[sheet_name]
            story.append(Paragraph(f"Sheet: {sheet_name}", title_style))
            story.append(Spacer(1, 8))

            sheet_data = []
            for row in ws.iter_rows(values_only=True):
                if any(val is not None for val in row):
                    sheet_data.append([str(val) if val is not None else "" for val in row])

            if sheet_data:
                # Limit columns if too wide for page
                max_cols = min(8, max(len(r) for r in sheet_data))
                trimmed_data = [r[:max_cols] for r in sheet_data[:100]]  # First 100 rows
                t = Table(trimmed_data)
                t.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f8fafc')),
                    ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#0f172a')),
                    ('FONTSIZE', (0, 0), (-1, -1), 8),
                    ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
                ]))
                story.append(t)
                story.append(Spacer(1, 16))

        if not story:
            story.append(Paragraph("Empty workbook", styles["Normal"]))

        pdf_doc.build(story)
        return out_pdf

    # 5. PDF to PowerPoint (.pptx)
    @staticmethod
    def pdf_to_ppt(src_pdf: Path, out_pptx: Path) -> Path:
        """Converts PDF pages into PowerPoint slide presentations."""
        out_pptx.parent.mkdir(parents=True, exist_ok=True)
        prs = Presentation()
        # Set slide dimensions to 16:9 or standard 4:3
        prs.slide_width = Inches(10)
        prs.slide_height = Inches(7.5)
        blank_slide_layout = prs.slide_layouts[6]

        doc = pymupdf.open(src_pdf)
        temp_dir = out_pptx.parent / "ppt_temp"
        temp_dir.mkdir(parents=True, exist_ok=True)

        try:
            for i, page in enumerate(doc):
                slide = prs.slides.add_slide(blank_slide_layout)
                pix = page.get_pixmap(dpi=150)
                img_path = temp_dir / f"slide_{i}.png"
                pix.save(str(img_path))

                slide.shapes.add_picture(
                    str(img_path),
                    left=Inches(0.5),
                    top=Inches(0.5),
                    width=Inches(9.0),
                )
            prs.save(str(out_pptx))
        finally:
            doc.close()
            shutil.rmtree(temp_dir, ignore_errors=True)

        return out_pptx

    # 6. PowerPoint (.pptx) to PDF
    @staticmethod
    def ppt_to_pdf(src_pptx: Path, out_pdf: Path) -> Path:
        """Converts PowerPoint slides into PDF document format."""
        out_pdf.parent.mkdir(parents=True, exist_ok=True)
        prs = Presentation(str(src_pptx))
        pdf_doc = SimpleDocTemplate(str(out_pdf), pagesize=letter, rightMargin=54, leftMargin=54, topMargin=54, bottomMargin=54)
        styles = getSampleStyleSheet()
        title_style = styles["Heading1"]
        body_style = styles["Normal"]
        story = []

        for i, slide in enumerate(prs.slides):
            story.append(Paragraph(f"Slide {i + 1}", title_style))
            story.append(Spacer(1, 10))

            for shape in slide.shapes:
                if shape.has_text_frame:
                    for paragraph in shape.text_frame.paragraphs:
                        text = paragraph.text.strip()
                        if text:
                            story.append(Paragraph(text, body_style))
                            story.append(Spacer(1, 4))
            story.append(Spacer(1, 20))

        if not story:
            story.append(Paragraph("Empty presentation", body_style))

        pdf_doc.build(story)
        return out_pdf

    # 7. PDF to JPG
    @staticmethod
    def pdf_to_jpg(src_pdf: Path, out_path: Path, dpi: int = 150) -> Path:
        """Renders PDF pages to JPG. Single-page returns JPG; multi-page packages into ZIP."""
        doc = pymupdf.open(src_pdf)
        try:
            if len(doc) == 1:
                out_jpg = out_path if out_path.suffix.lower() == ".jpg" else out_path.with_suffix(".jpg")
                pix = doc[0].get_pixmap(dpi=dpi)
                pix.save(str(out_jpg))
                return out_jpg

            out_zip = out_path if out_path.suffix.lower() == ".zip" else out_path.with_suffix(".zip")
            with zipfile.ZipFile(out_zip, "w", zipfile.ZIP_DEFLATED) as zf:
                for i, page in enumerate(doc):
                    pix = page.get_pixmap(dpi=dpi)
                    img_bytes = pix.tobytes("jpeg")
                    zf.writestr(f"page_{i + 1:03d}.jpg", img_bytes)
            return out_zip
        finally:
            doc.close()

    # 8. JPG to PDF
    @staticmethod
    def jpg_to_pdf(src_jpg: Path, out_pdf: Path) -> Path:
        """Converts JPG image to a standard PDF document."""
        out_pdf.parent.mkdir(parents=True, exist_ok=True)
        img = Image.open(src_jpg)
        if img.mode != "RGB":
            img = img.convert("RGB")
        img.save(out_pdf, "PDF", resolution=150.0)
        return out_pdf

    # 9. PDF to PNG
    @staticmethod
    def pdf_to_png(src_pdf: Path, out_path: Path, dpi: int = 150) -> Path:
        """Renders PDF pages to PNG. Single-page returns PNG; multi-page packages into ZIP."""
        doc = pymupdf.open(src_pdf)
        try:
            if len(doc) == 1:
                out_png = out_path if out_path.suffix.lower() == ".png" else out_path.with_suffix(".png")
                pix = doc[0].get_pixmap(dpi=dpi)
                pix.save(str(out_png))
                return out_png

            out_zip = out_path if out_path.suffix.lower() == ".zip" else out_path.with_suffix(".zip")
            with zipfile.ZipFile(out_zip, "w", zipfile.ZIP_DEFLATED) as zf:
                for i, page in enumerate(doc):
                    pix = page.get_pixmap(dpi=dpi)
                    img_bytes = pix.tobytes("png")
                    zf.writestr(f"page_{i + 1:03d}.png", img_bytes)
            return out_zip
        finally:
            doc.close()

    # 10. PNG to PDF
    @staticmethod
    def png_to_pdf(src_png: Path, out_pdf: Path) -> Path:
        """Converts PNG image (with alpha/RGB support) into a PDF."""
        out_pdf.parent.mkdir(parents=True, exist_ok=True)
        img = Image.open(src_png)
        if img.mode != "RGB":
            img = img.convert("RGB")
        img.save(out_pdf, "PDF", resolution=150.0)
        return out_pdf

    # 11. Text (.txt) to PDF
    @staticmethod
    def text_to_pdf(src_txt: Path, out_pdf: Path) -> Path:
        """Converts plain text file to PDF with clean margins using reportlab."""
        out_pdf.parent.mkdir(parents=True, exist_ok=True)
        content = src_txt.read_text(encoding="utf-8", errors="replace")
        pdf_doc = SimpleDocTemplate(str(out_pdf), pagesize=letter, rightMargin=54, leftMargin=54, topMargin=54, bottomMargin=54)
        styles = getSampleStyleSheet()
        mono_style = ParagraphStyle(
            'Mono',
            parent=styles['Normal'],
            fontName='Courier',
            fontSize=10,
            leading=14,
            textColor=colors.HexColor('#0f172a'),
        )
        story = []
        for line in content.splitlines():
            escaped = (
                line.replace("&", "&amp;")
                    .replace("<", "&lt;")
                    .replace(">", "&gt;")
            )
            story.append(Paragraph(escaped or "&nbsp;", mono_style))

        if not story:
            story.append(Paragraph("&nbsp;", mono_style))

        pdf_doc.build(story)
        return out_pdf

    # 12. RTF to PDF
    @staticmethod
    def rtf_to_pdf(src_rtf: Path, out_pdf: Path) -> Path:
        """Strips RTF control words and formats text into a PDF document."""
        out_pdf.parent.mkdir(parents=True, exist_ok=True)
        raw_rtf = src_rtf.read_text(encoding="utf-8", errors="replace")
        plain_text = rtf_to_text(raw_rtf)

        pdf_doc = SimpleDocTemplate(str(out_pdf), pagesize=letter, rightMargin=54, leftMargin=54, topMargin=54, bottomMargin=54)
        styles = getSampleStyleSheet()
        normal_style = styles["Normal"]
        story = []
        for line in plain_text.splitlines():
            escaped = (
                line.replace("&", "&amp;")
                    .replace("<", "&lt;")
                    .replace(">", "&gt;")
            )
            story.append(Paragraph(escaped or "&nbsp;", normal_style))

        if not story:
            story.append(Paragraph("&nbsp;", normal_style))

        pdf_doc.build(story)
        return out_pdf

    # 13. Image to PDF (Multi-format combiner)
    @staticmethod
    def image_to_pdf(src_images: List[Path], out_pdf: Path) -> Path:
        """Combines multiple raster images (PNG, JPG, WEBP, BMP, etc.) into a multi-page PDF."""
        out_pdf.parent.mkdir(parents=True, exist_ok=True)
        if not src_images:
            raise ValueError("No images provided for PDF conversion")

        pil_images = []
        for path in src_images:
            im = Image.open(path)
            if im.mode != "RGB":
                im = im.convert("RGB")
            pil_images.append(im)

        first = pil_images[0]
        rest = pil_images[1:] if len(pil_images) > 1 else []
        first.save(out_pdf, "PDF", save_all=True, append_images=rest, resolution=150.0)
        return out_pdf

    # 14. HEIC to PDF
    @staticmethod
    def heic_to_pdf(src_heic: Path, out_pdf: Path) -> Path:
        """Converts Apple High-Efficiency Image Format (HEIC) to PDF."""
        out_pdf.parent.mkdir(parents=True, exist_ok=True)
        im = Image.open(src_heic)
        if im.mode != "RGB":
            im = im.convert("RGB")
        im.save(out_pdf, "PDF", resolution=150.0)
        return out_pdf

    # 15. TIFF to PDF
    @staticmethod
    def tiff_to_pdf(src_tiff: Path, out_pdf: Path) -> Path:
        """Converts single or multi-frame TIFF images into a multi-page PDF."""
        out_pdf.parent.mkdir(parents=True, exist_ok=True)
        im = Image.open(src_tiff)
        frames = []
        for frame in ImageSequence.Iterator(im):
            f = frame.copy()
            if f.mode != "RGB":
                f = f.convert("RGB")
            frames.append(f)

        if not frames:
            raise ValueError("TIFF file contains no valid image frames")

        frames[0].save(out_pdf, "PDF", save_all=True, append_images=frames[1:], resolution=150.0)
        return out_pdf

    # 16. BMP to PDF
    @staticmethod
    def bmp_to_pdf(src_bmp: Path, out_pdf: Path) -> Path:
        """Converts Windows Bitmap (.bmp) to PDF."""
        out_pdf.parent.mkdir(parents=True, exist_ok=True)
        im = Image.open(src_bmp)
        if im.mode != "RGB":
            im = im.convert("RGB")
        im.save(out_pdf, "PDF", resolution=150.0)
        return out_pdf

    # 17. GIF to PDF
    @staticmethod
    def gif_to_pdf(src_gif: Path, out_pdf: Path) -> Path:
        """Converts static or animated GIF frames into a multi-page PDF."""
        out_pdf.parent.mkdir(parents=True, exist_ok=True)
        im = Image.open(src_gif)
        frames = []
        for frame in ImageSequence.Iterator(im):
            f = frame.copy()
            if f.mode != "RGB":
                f = f.convert("RGB")
            frames.append(f)

        if not frames:
            raise ValueError("GIF file contains no valid frames")

        frames[0].save(out_pdf, "PDF", save_all=True, append_images=frames[1:], resolution=150.0)
        return out_pdf

    # 18. PSD (Photoshop) to PDF
    @staticmethod
    def psd_to_pdf(src_psd: Path, out_pdf: Path) -> Path:
        """Extracts flattened composite from Adobe Photoshop PSD and saves as PDF."""
        out_pdf.parent.mkdir(parents=True, exist_ok=True)
        psd = PSDImage.open(src_psd)
        composite = psd.composite()
        if composite is None:
            raise ValueError("Unable to extract composite layer from PSD file")
        if composite.mode != "RGB":
            composite = composite.convert("RGB")
        composite.save(out_pdf, "PDF", resolution=150.0)
        return out_pdf

    # 19. AI (Illustrator) to PDF
    @staticmethod
    def ai_to_pdf(src_ai: Path, out_pdf: Path) -> Path:
        """Parses Adobe Illustrator .ai file with PDF compatibility stream into PDF."""
        out_pdf.parent.mkdir(parents=True, exist_ok=True)
        try:
            doc = pymupdf.open(src_ai)
            doc.save(str(out_pdf))
            doc.close()
            return out_pdf
        except Exception:
            # Fallback: scan for embedded PDF header in raw stream
            raw_bytes = src_ai.read_bytes()
            pdf_start = raw_bytes.find(b"%PDF-")
            if pdf_start != -1:
                pdf_data = raw_bytes[pdf_start:]
                out_pdf.write_bytes(pdf_data)
                return out_pdf
            raise ValueError("Illustrator file does not contain an embedded PDF-compatible stream")

    # 20. INDD (InDesign) to PDF
    @staticmethod
    def indd_to_pdf(src_indd: Path, out_pdf: Path) -> Path:
        """Extracts embedded preview from InDesign document or IDML package into PDF."""
        out_pdf.parent.mkdir(parents=True, exist_ok=True)

        # Check if file is IDML zip package
        if zipfile.is_zipfile(src_indd):
            with zipfile.ZipFile(src_indd, "r") as zf:
                for name in zf.namelist():
                    if "preview" in name.lower() or "thumbnail" in name.lower():
                        img_data = zf.read(name)
                        im = Image.open(io.BytesIO(img_data))
                        if im.mode != "RGB":
                            im = im.convert("RGB")
                        im.save(out_pdf, "PDF")
                        return out_pdf

        # Binary INDD scan for embedded JPEG preview stream (Adobe INDD preview markers)
        raw = src_indd.read_bytes()
        jpg_start = raw.find(b"\xff\xd8\xff")
        if jpg_start != -1:
            jpg_end = raw.find(b"\xff\xd9", jpg_start)
            if jpg_end != -1:
                jpeg_bytes = raw[jpg_start : jpg_end + 2]
                try:
                    im = Image.open(io.BytesIO(jpeg_bytes))
                    if im.mode != "RGB":
                        im = im.convert("RGB")
                    im.save(out_pdf, "PDF")
                    return out_pdf
                except Exception:
                    pass

        # Fallback informative document
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Helvetica", size=14)
        pdf.cell(0, 10, f"InDesign Document: {src_indd.name}", ln=True, align="C")
        pdf.set_font("Helvetica", size=10)
        pdf.multi_cell(0, 8, "This file was processed by Creed-Tech Studio. Direct INDD vector geometry without Adobe InDesign Server requires exporting as IDML with embedded previews.")
        pdf.output(str(out_pdf))
        return out_pdf

    # 21. Smart PDF Converter (Auto-detects format -> PDF)
    @classmethod
    def smart_convert_to_pdf(cls, src_file: Path, out_pdf: Path) -> Path:
        """Inspects uploaded file extension and MIME type, routing to the optimal PDF converter."""
        ext = src_file.suffix.lower()

        if ext == ".pdf":
            shutil.copyfile(src_file, out_pdf)
            return out_pdf
        elif ext in [".docx", ".doc"]:
            return cls.word_to_pdf(src_file, out_pdf)
        elif ext in [".xlsx", ".xls"]:
            return cls.excel_to_pdf(src_file, out_pdf)
        elif ext in [".pptx", ".ppt"]:
            return cls.ppt_to_pdf(src_file, out_pdf)
        elif ext == ".txt":
            return cls.text_to_pdf(src_file, out_pdf)
        elif ext == ".rtf":
            return cls.rtf_to_pdf(src_file, out_pdf)
        elif ext in [".jpg", ".jpeg"]:
            return cls.jpg_to_pdf(src_file, out_pdf)
        elif ext == ".png":
            return cls.png_to_pdf(src_file, out_pdf)
        elif ext == ".heic":
            return cls.heic_to_pdf(src_file, out_pdf)
        elif ext in [".tiff", ".tif"]:
            return cls.tiff_to_pdf(src_file, out_pdf)
        elif ext == ".bmp":
            return cls.bmp_to_pdf(src_file, out_pdf)
        elif ext == ".gif":
            return cls.gif_to_pdf(src_file, out_pdf)
        elif ext == ".psd":
            return cls.psd_to_pdf(src_file, out_pdf)
        elif ext == ".ai":
            return cls.ai_to_pdf(src_file, out_pdf)
        elif ext in [".indd", ".idml"]:
            return cls.indd_to_pdf(src_file, out_pdf)
        else:
            # Attempt general PIL image opening as fallback
            try:
                return cls.image_to_pdf([src_file], out_pdf)
            except Exception:
                return cls.text_to_pdf(src_file, out_pdf)

    # 22. Universal File Converter Router
    @classmethod
    def universal_file_converter(cls, src_file: Path, out_file: Path, target_ext: str) -> Path:
        """Routes any source format to requested target extension."""
        tgt = target_ext.lower().lstrip(".")
        if tgt == "pdf":
            return cls.smart_convert_to_pdf(src_file, out_file)
        elif tgt in ["docx", "doc"]:
            return cls.pdf_to_word(src_file, out_file)
        elif tgt in ["xlsx", "xls"]:
            return cls.pdf_to_excel(src_file, out_file)
        elif tgt in ["pptx", "ppt"]:
            return cls.pdf_to_ppt(src_file, out_file)
        elif tgt == "jpg" or tgt == "jpeg":
            return cls.pdf_to_jpg(src_file, out_file)
        elif tgt == "png":
            return cls.pdf_to_png(src_file, out_file)
        else:
            raise ValueError(f"Unsupported target format: {target_ext}")

    # 23. OCR PDF (Searchable Text Overlay)
    @staticmethod
    def ocr_pdf(src_pdf: Path, out_pdf: Path) -> Path:
        """Generates searchable OCR text layer over PDF pages."""
        out_pdf.parent.mkdir(parents=True, exist_ok=True)
        doc = pymupdf.open(src_pdf)

        try:
            # Check if tesseract binary exists on system
            has_tesseract = shutil.which("tesseract") is not None
            out_doc = pymupdf.open()

            for i, page in enumerate(doc):
                pix = page.get_pixmap(dpi=150)
                img_data = pix.tobytes("png")

                # Create new page in destination document
                rect = page.rect
                new_page = out_doc.new_page(width=rect.width, height=rect.height)
                new_page.insert_image(rect, stream=img_data)

                if has_tesseract:
                    import pytesseract
                    ocr_text = pytesseract.image_to_string(Image.open(io.BytesIO(img_data)))
                else:
                    # Native PyMuPDF text layer preservation
                    ocr_text = page.get_text()

                if ocr_text:
                    # Embed invisible searchable text layer
                    for line in ocr_text.splitlines():
                        if line.strip():
                            new_page.insert_text(
                                (50, 50),
                                line.strip(),
                                fontname="helv",
                                fontsize=8,
                                render_mode=3,  # invisible searchable text
                            )

            out_doc.save(str(out_pdf))
            out_doc.close()
            return out_pdf
        finally:
            doc.close()


universal_converters = UniversalConvertersService()
