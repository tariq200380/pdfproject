"""Image Conversion & Transformation Engine: Images <-> PDF and cross-image format conversions."""

import io
import zipfile
import logging
from pathlib import Path
from typing import List, Union
import pymupdf
from PIL import Image, ImageOps, ImageFile
ImageFile.LOAD_TRUNCATED_IMAGES = True
try:
    import pillow_heif
    pillow_heif.register_heif_opener()
except ImportError:
    pass

logger = logging.getLogger("omnistudio.image_engine")


class ImageEngine:
    """Provides high-performance image conversion, PDF export, and format transformation."""

    @classmethod
    def convert_images_to_pdf(
        cls,
        image_inputs: List[Union[str, Path]],
        output_pdf_path: Union[str, Path],
    ) -> Path:
        """Combines single or multiple images (PNG, JPG, WEBP, HEIC, etc.) into a multi-page PDF."""
        if not image_inputs:
            raise ValueError("At least one image input is required")

        out_path = Path(output_pdf_path)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        pdf_doc = pymupdf.open()

        try:
            for item in image_inputs:
                src_path = Path(item)
                # Attempt PyMuPDF native conversion first
                try:
                    img_doc = pymupdf.open(str(src_path))
                    pdf_bytes = img_doc.convert_to_pdf()
                    img_pdf = pymupdf.open("pdf", pdf_bytes)
                    pdf_doc.insert_pdf(img_pdf)
                    img_doc.close()
                    img_pdf.close()
                except Exception:
                    # Fall back to Pillow conversion (e.g. for HEIC, WhatsApp JPG, or non-standard formats)
                    with Image.open(src_path) as pil_img:
                        pil_img = ImageOps.exif_transpose(pil_img)
                        rgb_img = pil_img.convert("RGB")
                        buf = io.BytesIO()
                        rgb_img.save(buf, format="JPEG", quality=95)
                        buf.seek(0)
                        img_doc = pymupdf.open(stream=buf.getvalue(), filetype="jpeg")
                        pdf_bytes = img_doc.convert_to_pdf()
                        img_pdf = pymupdf.open("pdf", pdf_bytes)
                        pdf_doc.insert_pdf(img_pdf)
                        img_doc.close()
                        img_pdf.close()

            pdf_doc.save(str(out_path))
            return out_path
        finally:
            pdf_doc.close()

    @classmethod
    def convert_pdf_to_images(
        cls,
        pdf_input: Union[str, Path, bytes],
        target_format: str = "png",
        dpi: int = 150,
        output_path: Union[str, Path] = None,
    ) -> Path:
        """Renders PDF pages into target format (PNG, JPG, WEBP, SVG) as a single file or ZIP archive."""
        fmt = target_format.lower().lstrip(".")
        if fmt == "jpeg":
            fmt = "jpg"

        doc = pymupdf.open(stream=pdf_input, filetype="pdf") if isinstance(pdf_input, bytes) else pymupdf.open(str(pdf_input))

        try:
            total_pages = len(doc)
            if total_pages == 0:
                raise ValueError("PDF document has 0 pages")

            out_file = Path(output_path)
            out_file.parent.mkdir(parents=True, exist_ok=True)

            # If 1 page and output is not a zip, render single image
            if total_pages == 1 and not out_file.name.endswith(".zip"):
                page = doc[0]
                if fmt == "svg":
                    svg_content = page.get_svg_image()
                    out_file.write_text(svg_content, encoding="utf-8")
                else:
                    pix = page.get_pixmap(dpi=dpi)
                    img_bytes = pix.tobytes(fmt)
                    out_file.write_bytes(img_bytes)
                return out_file

            # Multi-page or explicit ZIP output
            zip_dest = out_file if out_file.name.endswith(".zip") else out_file.with_suffix(".zip")
            digits = len(str(total_pages))

            with zipfile.ZipFile(zip_dest, "w", compression=zipfile.ZIP_DEFLATED) as zf:
                for i, page in enumerate(doc):
                    filename = f"page_{str(i + 1).zfill(digits)}.{fmt}"
                    if fmt == "svg":
                        zf.writestr(filename, page.get_svg_image().encode("utf-8"))
                    else:
                        pix = page.get_pixmap(dpi=dpi)
                        zf.writestr(filename, pix.tobytes(fmt))

            return zip_dest
        finally:
            doc.close()

    @classmethod
    def convert_image_format(
        cls,
        input_path: Union[str, Path],
        target_format: str,
        output_path: Union[str, Path],
    ) -> Path:
        """Converts between raster formats (PNG, JPG, WEBP, HEIC) using Pillow."""
        fmt = target_format.lower().lstrip(".")
        if fmt == "jpg":
            fmt = "jpeg"

        in_p = Path(input_path)
        out_p = Path(output_path)
        out_p.parent.mkdir(parents=True, exist_ok=True)

        with Image.open(in_p) as img:
            # Handle alpha channel when converting RGBA to JPEG
            if fmt == "jpeg" and img.mode in ("RGBA", "LA", "P"):
                background = Image.new("RGB", img.size, (255, 255, 255))
                if img.mode == "P":
                    img = img.convert("RGBA")
                background.paste(img, mask=img.split()[-1] if img.mode == "RGBA" else None)
                background.save(out_p, format="JPEG", quality=90)
            else:
                pillow_format = "WEBP" if fmt == "webp" else ("PNG" if fmt == "png" else fmt.upper())
                img.save(out_p, format=pillow_format)

        return out_p


image_engine = ImageEngine()
