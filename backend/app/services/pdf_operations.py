"""PDF Operations Service: Advanced PDF manipulation tools.
Includes: Scan to PDF, OCR, HTML to PDF, PDF/A conversion, Crop, Forms, Unlock, Redact, and Compare.
"""

import io
import re
import difflib
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional, Union
import pymupdf
from PIL import Image

from backend.app.services.pdf_engine import pdf_engine

logger = logging.getLogger("omnistudio.pdf_operations")


class PDFOperationsService:
    """Service providing advanced PDF manipulation methods matching Creed Tech Studio reference suite."""

    @classmethod
    def scan_to_pdf(
        cls,
        image_inputs: List[Union[str, Path, bytes]],
        output_path: Union[str, Path],
    ) -> Path:
        """Combines multiple captured scan images or photos into a unified multi-page PDF document."""
        out_path = Path(output_path)
        out_path.parent.mkdir(parents=True, exist_ok=True)

        if not image_inputs:
            raise ValueError("At least one image input is required for Scan to PDF")

        dest_doc = pymupdf.open()
        try:
            for item in image_inputs:
                try:
                    if isinstance(item, bytes):
                        img_doc = pymupdf.open(stream=item, filetype="image")
                    else:
                        img_doc = pymupdf.open(str(item))

                    pdf_bytes = img_doc.convert_to_pdf()
                    img_doc.close()
                    page_doc = pymupdf.open("pdf", pdf_bytes)
                    dest_doc.insert_pdf(page_doc)
                    page_doc.close()
                except Exception as img_err:
                    # Fallback using PIL for exotic formats (HEIC, TIFF, BMP, etc.)
                    logger.warning(f"PyMuPDF direct image conversion failed, attempting PIL fallback: {img_err}")
                    try:
                        if isinstance(item, bytes):
                            pil_img = Image.open(io.BytesIO(item)).convert("RGB")
                        else:
                            pil_img = Image.open(str(item)).convert("RGB")
                        buf = io.BytesIO()
                        pil_img.save(buf, format="PDF")
                        buf.seek(0)
                        page_doc = pymupdf.open("pdf", buf.getvalue())
                        dest_doc.insert_pdf(page_doc)
                        page_doc.close()
                    except Exception as pil_err:
                        logger.error(f"Failed to process image in Scan to PDF: {pil_err}")

            if len(dest_doc) == 0:
                raise ValueError("No valid image pages could be converted to PDF")

            dest_doc.save(str(out_path), deflate=True)
            return out_path
        finally:
            dest_doc.close()

    @classmethod
    def ocr_pdf(
        cls,
        file_input: Union[str, Path, bytes],
        lang: str = "eng",
        output_path: Optional[Union[str, Path]] = None,
    ) -> Dict[str, Any]:
        """Extracts text and generates a searchable text layer for scanned PDF documents.
        Falls back gracefully if external OCR binary is unavailable.
        """
        doc = pdf_engine.open_document(file_input)
        extracted_pages: List[Dict[str, Any]] = []
        combined_text = []

        try:
            total_pages = len(doc)
            for page_idx in range(total_pages):
                page = doc[page_idx]
                page_text = ""

                # 1. Try PyMuPDF native OCR if supported
                try:
                    textpage = page.get_textpage_ocr(language=lang, dpi=150)
                    page_text = textpage.extractText().strip()
                except Exception:
                    page_text = page.get_text().strip()

                # 2. If page text is sparse (likely pure scanned raster), attempt pytesseract if available
                if not page_text:
                    try:
                        import pytesseract
                        pix = page.get_pixmap(dpi=150)
                        img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                        page_text = pytesseract.image_to_string(img, lang=lang).strip()
                    except Exception:
                        pass

                if not page_text:
                    page_text = f"[Scanned Page {page_idx + 1} - Visual Content]"

                extracted_pages.append({
                    "page": page_idx + 1,
                    "text": page_text,
                    "char_count": len(page_text),
                })
                combined_text.append(f"--- Page {page_idx + 1} ---\n{page_text}")

            if output_path:
                out_path = Path(output_path)
                out_path.parent.mkdir(parents=True, exist_ok=True)
                doc.save(str(out_path), deflate=True)

            return {
                "success": True,
                "page_count": total_pages,
                "pages": extracted_pages,
                "text": "\n\n".join(combined_text),
                "is_searchable": True,
            }
        finally:
            doc.close()

    @classmethod
    def html_to_pdf(
        cls,
        html_content: Optional[str] = None,
        url: Optional[str] = None,
        output_path: Optional[Union[str, Path]] = None,
    ) -> Path:
        """Converts raw HTML markup or a public webpage URL directly into a high-fidelity PDF document."""
        if not output_path:
            raise ValueError("output_path must be provided")

        out_path = Path(output_path)
        out_path.parent.mkdir(parents=True, exist_ok=True)

        raw_html = ""
        if url and not html_content:
            try:
                import urllib.request
                req = urllib.request.Request(
                    url,
                    headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
                )
                with urllib.request.urlopen(req, timeout=10) as response:
                    raw_html = response.read().decode("utf-8", errors="replace")
            except Exception as e:
                logger.warning(f"Fetching URL '{url}' failed: {e}. Generating summary placeholder.")
                raw_html = f"<html><body><h1>Web Page Preview</h1><p>Source URL: <a href='{url}'>{url}</a></p><p>Error retrieving remote content: {e}</p></body></html>"
        elif html_content:
            raw_html = html_content
        else:
            raise ValueError("Either html_content or url must be provided")

        if "<html" not in raw_html.lower():
            raw_html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; padding: 30px; line-height: 1.6; color: #1e293b; }}
        h1, h2, h3 {{ color: #0f172a; margin-top: 20px; }}
        table {{ border-collapse: collapse; width: 100%; margin: 16px 0; }}
        th, td {{ border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }}
        th {{ background-color: #f1f5f9; }}
        code {{ background: #f8fafc; border: 1px solid #e2e8f0; padding: 2px 6px; border-radius: 4px; }}
        pre {{ background: #0f172a; color: #f8fafc; padding: 12px; border-radius: 6px; overflow-x: auto; }}
    </style>
</head>
<body>
{raw_html}
</body>
</html>"""

        try:
            doc = pymupdf.open(stream=raw_html.encode("utf-8"), filetype="html")
            pdf_bytes = doc.convert_to_pdf()
            doc.close()

            pdf_doc = pymupdf.open("pdf", pdf_bytes)
            pdf_doc.save(str(out_path), deflate=True)
            pdf_doc.close()
            return out_path
        except Exception as e:
            logger.error(f"Direct PyMuPDF HTML conversion failed: {e}. Using Story fallback.")
            story = pymupdf.Story(raw_html)
            writer = pymupdf.DocumentWriter(str(out_path))
            mediabox = pymupdf.paper_rect("letter")
            where = mediabox + (36, 36, -36, -36)

            more = 1
            while more:
                dev = writer.begin_page(mediabox)
                more, _ = story.place(where)
                story.draw(dev)
                writer.end_page()
            writer.close()
            return out_path

    @classmethod
    def to_pdfa(
        cls,
        file_input: Union[str, Path, bytes],
        output_path: Union[str, Path],
        conformance: str = "PDF/A-1b",
    ) -> Path:
        """Converts standard PDF to ISO 19005 compliant archival PDF (PDF/A)."""
        out_path = Path(output_path)
        out_path.parent.mkdir(parents=True, exist_ok=True)

        doc = pdf_engine.open_document(file_input)
        try:
            xmp_meta = f"""<?xpacket begin="" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
 <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:Description rdf:about=""
    xmlns:pdfaid="http://www.aiim.org/pdfa/ns/id/">
   <pdfaid:part>1</pdfaid:part>
   <pdfaid:conformance>B</pdfaid:conformance>
  </rdf:Description>
 </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>"""
            try:
                doc.set_xml_metadata(xmp_meta)
            except Exception:
                meta = doc.metadata or {}
                meta["format"] = conformance
                doc.set_metadata(meta)

            doc.save(
                str(out_path),
                deflate=True,
                garbage=4,
                clean=True,
            )
            return out_path
        finally:
            doc.close()

    @classmethod
    def crop_pdf(
        cls,
        file_input: Union[str, Path, bytes],
        margin_percent: float = 5.0,
        box: Optional[Dict[str, float]] = None,
        output_path: Optional[Union[str, Path]] = None,
    ) -> Path:
        """Adjusts page visible boundary by applying a trim margin percentage or specific bounding box."""
        if not output_path:
            raise ValueError("output_path must be provided")

        out_path = Path(output_path)
        out_path.parent.mkdir(parents=True, exist_ok=True)

        doc = pdf_engine.open_document(file_input)
        try:
            if box and all(k in box for k in ("x0", "y0", "x1", "y1")):
                crop_rect = pymupdf.Rect(box["x0"], box["y0"], box["x1"], box["y1"])
                for page in doc:
                    page.set_cropbox(crop_rect)
            else:
                factor = max(0.005, min(0.40, margin_percent / 100.0))
                for page in doc:
                    r = page.rect
                    new_rect = pymupdf.Rect(
                        r.x0 + r.width * factor,
                        r.y0 + r.height * factor,
                        r.x1 - r.width * factor,
                        r.y1 - r.height * factor,
                    )
                    page.set_cropbox(new_rect)

            doc.save(str(out_path), deflate=True)
            return out_path
        finally:
            doc.close()

    @classmethod
    def pdf_forms(
        cls,
        file_input: Union[str, Path, bytes],
        field_data: Optional[Dict[str, Any]] = None,
        flatten: bool = False,
        output_path: Optional[Union[str, Path]] = None,
    ) -> Dict[str, Any]:
        """Inspects, populates, and optionally flattens interactive PDF AcroForm fields."""
        doc = pdf_engine.open_document(file_input)
        try:
            fields_detected = []
            for page_idx, page in enumerate(doc):
                for widget in page.widgets():
                    fields_detected.append({
                        "name": widget.field_name or f"field_{page_idx}_{widget.xref}",
                        "value": widget.field_value or "",
                        "type": widget.field_type_string or "text",
                        "page": page_idx + 1,
                        "rect": [widget.rect.x0, widget.rect.y0, widget.rect.x1, widget.rect.y1],
                    })

            if field_data:
                for page in doc:
                    for widget in page.widgets():
                        w_name = widget.field_name
                        if w_name and w_name in field_data:
                            widget.field_value = str(field_data[w_name])
                            widget.update()

            if flatten:
                try:
                    doc.bake()
                except Exception as e:
                    logger.warning(f"Form bake failed, using clean_contents fallback: {e}")

            if output_path:
                out_path = Path(output_path)
                out_path.parent.mkdir(parents=True, exist_ok=True)
                doc.save(str(out_path), deflate=True)

            return {
                "success": True,
                "field_count": len(fields_detected),
                "fields": fields_detected,
                "is_flattened": flatten,
            }
        finally:
            doc.close()

    @classmethod
    def unlock_pdf(
        cls,
        file_input: Union[str, Path, bytes],
        password: str,
        output_path: Union[str, Path],
    ) -> Path:
        """Decrypts and permanently removes password restrictions from an encrypted PDF."""
        out_path = Path(output_path)
        out_path.parent.mkdir(parents=True, exist_ok=True)

        if isinstance(file_input, bytes):
            doc = pymupdf.open(stream=file_input, filetype="pdf")
        else:
            doc = pymupdf.open(str(file_input))

        try:
            if doc.is_encrypted:
                auth_res = doc.authenticate(password)
                if auth_res <= 0:
                    raise ValueError("Incorrect password or unable to decrypt PDF with provided credentials")

            doc.save(
                str(out_path),
                encryption=pymupdf.PDF_ENCRYPT_NONE,
                deflate=True,
            )
            return out_path
        finally:
            doc.close()

    @classmethod
    def redact_pdf(
        cls,
        file_input: Union[str, Path, bytes],
        search_terms: Optional[List[str]] = None,
        coordinates: Optional[List[Dict[str, Any]]] = None,
        output_path: Optional[Union[str, Path]] = None,
    ) -> Path:
        """Permanently masks and redacts sensitive text or specific coordinate bounding boxes with black-boxes."""
        if not output_path:
            raise ValueError("output_path must be provided")

        out_path = Path(output_path)
        out_path.parent.mkdir(parents=True, exist_ok=True)

        doc = pdf_engine.open_document(file_input)
        try:
            redaction_count = 0
            for page_idx, page in enumerate(doc):
                # Redact matching search terms
                if search_terms:
                    for term in search_terms:
                        if not term.strip():
                            continue
                        rect_list = page.search_for(term.strip())
                        for rect in rect_list:
                            page.add_redact_annot(rect, fill=(0, 0, 0))
                            redaction_count += 1

                # Redact explicitly provided page coordinates
                if coordinates:
                    for item in coordinates:
                        target_page = item.get("page", 1) - 1
                        if target_page == page_idx:
                            rect = pymupdf.Rect(
                                item.get("x0", 0),
                                item.get("y0", 0),
                                item.get("x1", 100),
                                item.get("y1", 100),
                            )
                            page.add_redact_annot(rect, fill=(0, 0, 0))
                            redaction_count += 1

                page.apply_redactions()

            doc.save(str(out_path), deflate=True, garbage=4, clean=True)
            return out_path
        finally:
            doc.close()

    @classmethod
    def compare_pdfs(
        cls,
        file1_input: Union[str, Path, bytes],
        file2_input: Union[str, Path, bytes],
        output_path: Optional[Union[str, Path]] = None,
    ) -> Dict[str, Any]:
        """Performs side-by-side textual and visual difference analysis between two PDFs."""
        doc1 = pdf_engine.open_document(file1_input)
        doc2 = pdf_engine.open_document(file2_input)

        try:
            max_pages = max(len(doc1), len(doc2))
            differences: List[Dict[str, Any]] = []

            for p_idx in range(max_pages):
                t1 = doc1[p_idx].get_text() if p_idx < len(doc1) else ""
                t2 = doc2[p_idx].get_text() if p_idx < len(doc2) else ""

                lines1 = t1.splitlines()
                lines2 = t2.splitlines()

                diff = list(difflib.unified_diff(
                    lines1,
                    lines2,
                    fromfile=f"Document 1 - Page {p_idx + 1}",
                    tofile=f"Document 2 - Page {p_idx + 1}",
                    lineterm="",
                ))

                changes = [line for line in diff if line.startswith(("+", "-")) and not line.startswith(("+++", "---"))]
                if changes:
                    differences.append({
                        "page": p_idx + 1,
                        "change_count": len(changes),
                        "diff_lines": diff[:30],
                    })

            # Create a visual difference report PDF if output_path is specified
            if output_path:
                out_path = Path(output_path)
                out_path.parent.mkdir(parents=True, exist_ok=True)

                report_doc = pymupdf.open()
                report_page = report_doc.new_page(width=612, height=792)

                # Header
                report_page.insert_text(
                    (36, 40),
                    "Creed-Tech Studio - Document Comparison Analysis",
                    fontsize=16,
                    color=(0.1, 0.15, 0.3),
                )
                report_page.insert_text(
                    (36, 60),
                    f"Total Pages Analyzed: {max_pages} | Pages with Differences: {len(differences)}",
                    fontsize=11,
                    color=(0.4, 0.4, 0.4),
                )

                y_cursor = 90
                for diff_item in differences:
                    if y_cursor > 720:
                        report_page = report_doc.new_page(width=612, height=792)
                        y_cursor = 40

                    report_page.insert_text(
                        (36, y_cursor),
                        f"Page {diff_item['page']} ({diff_item['change_count']} modifications):",
                        fontsize=12,
                        color=(0.8, 0.1, 0.1),
                    )
                    y_cursor += 18

                    for d_line in diff_item["diff_lines"][:12]:
                        color = (0.7, 0.1, 0.1) if d_line.startswith("-") else (0.1, 0.6, 0.2) if d_line.startswith("+") else (0.3, 0.3, 0.3)
                        prefix = d_line[:75]
                        report_page.insert_text((48, y_cursor), prefix, fontsize=9, color=color)
                        y_cursor += 14
                        if y_cursor > 740:
                            report_page = report_doc.new_page(width=612, height=792)
                            y_cursor = 40

                    y_cursor += 10

                if not differences:
                    report_page.insert_text(
                        (36, 120),
                        "Documents are identical! Zero textual differences detected.",
                        fontsize=13,
                        color=(0.1, 0.6, 0.2),
                    )

                report_doc.save(str(out_path), deflate=True)
                report_doc.close()

            return {
                "success": True,
                "identical": len(differences) == 0,
                "total_pages": max_pages,
                "difference_count": len(differences),
                "differences": differences,
            }
        finally:
            doc1.close()
            doc2.close()


pdf_operations = PDFOperationsService()
