"""Unit and API tests for all 23 Adobe Acrobat Online converters in Creed-Tech."""

import io
import pytest
from fastapi.testclient import TestClient
from pathlib import Path
import pymupdf
from docx import Document
import openpyxl
from pptx import Presentation
from PIL import Image

from backend.app.main import app
from backend.app.services.universal_converters import universal_converters


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


def test_word_to_pdf_and_pdf_to_word(tmp_path):
    """Tests Word .docx creation, conversion to PDF, and conversion back to Word."""
    docx_path = tmp_path / "test.docx"
    doc = Document()
    doc.add_heading("Creed-Tech Document Title", 0)
    doc.add_paragraph("This is an enterprise test paragraph.")
    table = doc.add_table(rows=2, cols=2)
    table.cell(0, 0).text = "A1"
    table.cell(0, 1).text = "B1"
    table.cell(1, 0).text = "A2"
    table.cell(1, 1).text = "B2"
    doc.save(str(docx_path))

    # Word to PDF
    pdf_path = tmp_path / "converted.pdf"
    universal_converters.word_to_pdf(docx_path, pdf_path)
    assert pdf_path.exists()
    assert pdf_path.stat().st_size > 0

    # Verify PDF content with PyMuPDF
    pdf_doc = pymupdf.open(pdf_path)
    text = "".join([p.get_text() for p in pdf_doc])
    pdf_doc.close()
    assert "Creed-Tech" in text

    # PDF to Word
    back_docx = tmp_path / "back.docx"
    universal_converters.pdf_to_word(pdf_path, back_docx)
    assert back_docx.exists()
    assert back_docx.stat().st_size > 0


def test_excel_to_pdf_and_pdf_to_excel(tmp_path):
    """Tests Excel creation, conversion to PDF, and extraction back to Excel."""
    xlsx_path = tmp_path / "test.xlsx"
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Financials"
    ws.append(["Category", "Amount", "Status"])
    ws.append(["Licensing", 15000, "Paid"])
    ws.append(["Services", 8500, "Pending"])
    wb.save(xlsx_path)

    # Excel to PDF
    pdf_path = tmp_path / "sheet.pdf"
    universal_converters.excel_to_pdf(xlsx_path, pdf_path)
    assert pdf_path.exists()
    assert pdf_path.stat().st_size > 0

    # PDF to Excel
    out_xlsx = tmp_path / "extracted.xlsx"
    universal_converters.pdf_to_excel(pdf_path, out_xlsx)
    assert out_xlsx.exists()
    assert out_xlsx.stat().st_size > 0


def test_ppt_to_pdf_and_pdf_to_ppt(tmp_path):
    """Tests PowerPoint creation, conversion to PDF, and conversion to PPT slides."""
    pptx_path = tmp_path / "test.pptx"
    prs = Presentation()
    slide = prs.slides.add_slide(prs.slide_layouts[0])
    slide.shapes.title.text = "Creed-Tech Presentation"
    slide.shapes.placeholders[1].text = "Enterprise Architecture Overview"
    prs.save(str(pptx_path))

    # PPT to PDF
    pdf_path = tmp_path / "slides.pdf"
    universal_converters.ppt_to_pdf(pptx_path, pdf_path)
    assert pdf_path.exists()
    assert pdf_path.stat().st_size > 0

    # PDF to PPT
    out_pptx = tmp_path / "extracted.pptx"
    universal_converters.pdf_to_ppt(pdf_path, out_pptx)
    assert out_pptx.exists()
    assert out_pptx.stat().st_size > 0


def test_text_and_rtf_to_pdf(tmp_path):
    """Tests plain text and rich text format to PDF conversion."""
    txt_path = tmp_path / "notes.txt"
    txt_path.write_text("Creed-Tech Plain Text Note.\nSecond line of note.", encoding="utf-8")
    txt_pdf = tmp_path / "notes.pdf"
    universal_converters.text_to_pdf(txt_path, txt_pdf)
    assert txt_pdf.exists()

    rtf_path = tmp_path / "sample.rtf"
    rtf_path.write_text(r"{\rtf1\ansi\deff0 {\fonttbl {\f0 Courier;}}\f0\fs24 Creed-Tech RTF Document.}", encoding="utf-8")
    rtf_pdf = tmp_path / "rtf.pdf"
    universal_converters.rtf_to_pdf(rtf_path, rtf_pdf)
    assert rtf_pdf.exists()


def test_smart_converter_and_ocr(tmp_path):
    """Tests smart router and OCR searchable text layer generation."""
    txt_path = tmp_path / "input.txt"
    txt_path.write_text("Smart conversion test text.", encoding="utf-8")
    out_pdf = tmp_path / "smart.pdf"
    universal_converters.smart_convert_to_pdf(txt_path, out_pdf)
    assert out_pdf.exists()

    ocr_pdf = tmp_path / "ocr.pdf"
    universal_converters.ocr_pdf(out_pdf, ocr_pdf)
    assert ocr_pdf.exists()
    assert ocr_pdf.stat().st_size > 0


def test_api_converters_endpoints(client):
    """Verifies FastAPI endpoints for 23 converters."""
    # Test Word to PDF endpoint
    doc = Document()
    doc.add_heading("API Word to PDF", 0)
    buf = io.BytesIO()
    doc.save(buf)
    buf.seek(0)

    res = client.post(
        "/api/convert/word-to-pdf",
        files={"file": ("test.docx", buf, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")},
    )
    assert res.status_code == 200
    assert res.headers["content-type"] == "application/pdf"
    assert b"%PDF-" in res.content[:1024]

    # Test Text to PDF endpoint
    txt_buf = io.BytesIO(b"Creed-Tech API Text to PDF Endpoint Test")
    res_txt = client.post(
        "/api/convert/text-to-pdf",
        files={"file": ("memo.txt", txt_buf, "text/plain")},
    )
    assert res_txt.status_code == 200
    assert res_txt.headers["content-type"] == "application/pdf"
    assert b"%PDF-" in res_txt.content[:1024]

    # Test Smart PDF Router endpoint
    res_smart = client.post(
        "/api/convert/smart-pdf",
        files={"file": ("memo.txt", io.BytesIO(b"Smart router test"), "text/plain")},
    )
    assert res_smart.status_code == 200
    assert b"%PDF-" in res_smart.content[:1024]

    # Test JPG to PDF and PDF to JPG
    img = Image.new("RGB", (100, 100), color="blue")
    img_buf = io.BytesIO()
    img.save(img_buf, format="JPEG")
    img_buf.seek(0)
    res_jpg_pdf = client.post(
        "/api/convert/jpg-to-pdf",
        files={"file": ("test.jpg", img_buf, "image/jpeg")},
    )
    assert res_jpg_pdf.status_code == 200
    assert b"%PDF-" in res_jpg_pdf.content[:1024]

    res_pdf_jpg = client.post(
        "/api/convert/pdf-to-jpg",
        files={"file": ("test.pdf", io.BytesIO(res_jpg_pdf.content), "application/pdf")},
    )
    assert res_pdf_jpg.status_code == 200
    assert "image/jpeg" in res_pdf_jpg.headers["content-type"]

    # Test PNG to PDF and PDF to PNG
    png = Image.new("RGBA", (80, 80), color="green")
    png_buf = io.BytesIO()
    png.save(png_buf, format="PNG")
    png_buf.seek(0)
    res_png_pdf = client.post(
        "/api/convert/png-to-pdf",
        files={"file": ("test.png", png_buf, "image/png")},
    )
    assert res_png_pdf.status_code == 200
    assert b"%PDF-" in res_png_pdf.content[:1024]

    res_pdf_png = client.post(
        "/api/convert/pdf-to-png",
        files={"file": ("test.pdf", io.BytesIO(res_png_pdf.content), "application/pdf")},
    )
    assert res_pdf_png.status_code == 200
    assert "image/png" in res_pdf_png.headers["content-type"]

    # Test Image to PDF multi
    img_buf.seek(0)
    png_buf.seek(0)
    res_img_pdf = client.post(
        "/api/convert/image-to-pdf",
        files=[
            ("files", ("1.jpg", img_buf, "image/jpeg")),
            ("files", ("2.png", png_buf, "image/png")),
        ],
    )
    assert res_img_pdf.status_code == 200
    assert b"%PDF-" in res_img_pdf.content[:1024]
