"""Tests for Advanced PDF Suite endpoints in backend/app/api/routes_pdf_tools.py."""

import io
import json
import pytest
import pymupdf
from PIL import Image
from httpx import AsyncClient, ASGITransport

from backend.app.main import app


@pytest.fixture
def sample_image_bytes():
    img = Image.new("RGB", (120, 80), color="blue")
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()


@pytest.fixture
def locked_pdf_bytes():
    doc = pymupdf.open()
    page = doc.new_page(width=300, height=300)
    page.insert_text((50, 50), "Confidential Protected Document")
    buf = io.BytesIO()
    doc.save(buf, encryption=pymupdf.PDF_ENCRYPT_AES_256, user_pw="pass123", owner_pw="pass123")
    doc.close()
    return buf.getvalue()


@pytest.fixture
def form_pdf_bytes():
    doc = pymupdf.open()
    page = doc.new_page(width=300, height=300)
    w = pymupdf.Widget()
    w.rect = pymupdf.Rect(50, 50, 200, 80)
    w.field_type = pymupdf.PDF_WIDGET_TYPE_TEXT
    w.field_name = "customer_name"
    w.field_value = "Initial Text"
    page.add_widget(w)
    buf = io.BytesIO()
    doc.save(buf)
    doc.close()
    return buf.getvalue()


@pytest.mark.asyncio
async def test_scan_to_pdf_endpoint(sample_image_bytes):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        files = [
            ("files", ("scan1.jpg", sample_image_bytes, "image/jpeg")),
            ("files", ("scan2.jpg", sample_image_bytes, "image/jpeg")),
        ]
        res = await ac.post("/api/pdf/scan-to-pdf", files=files)
        assert res.status_code == 200
        assert res.headers["content-type"] == "application/pdf"
        assert len(res.content) > 0


@pytest.mark.asyncio
async def test_ocr_endpoint(multi_page_pdf_bytes):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # JSON mode
        files = {"file": ("doc.pdf", multi_page_pdf_bytes, "application/pdf")}
        data = {"lang": "eng", "return_file": "false"}
        res = await ac.post("/api/pdf/ocr", files=files, data=data)
        assert res.status_code == 200
        body = res.json()
        assert body["success"] is True
        assert body["page_count"] == 3

        # File return mode
        files2 = {"file": ("doc.pdf", multi_page_pdf_bytes, "application/pdf")}
        data2 = {"lang": "eng", "return_file": "true"}
        res2 = await ac.post("/api/pdf/ocr", files=files2, data=data2)
        assert res2.status_code == 200
        assert res2.headers["content-type"] == "application/pdf"


@pytest.mark.asyncio
async def test_html_to_pdf_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        data = {"html_content": "<h1>Report Title</h1><p>Test paragraph content</p>"}
        res = await ac.post("/api/pdf/html-to-pdf", data=data)
        assert res.status_code == 200
        assert res.headers["content-type"] == "application/pdf"
        assert len(res.content) > 0


@pytest.mark.asyncio
async def test_to_pdfa_endpoint(sample_pdf_bytes):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        files = {"file": ("document.pdf", sample_pdf_bytes, "application/pdf")}
        data = {"conformance": "PDF/A-1b"}
        res = await ac.post("/api/pdf/to-pdfa", files=files, data=data)
        assert res.status_code == 200
        assert res.headers["content-type"] == "application/pdf"
        assert len(res.content) > 0


@pytest.mark.asyncio
async def test_crop_tools_endpoint(sample_pdf_bytes):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        files = {"file": ("document.pdf", sample_pdf_bytes, "application/pdf")}
        data = {
            "margin_percent": "8.0",
            "box": json.dumps({"x0": 20, "y0": 20, "x1": 250, "y1": 250}),
        }
        res = await ac.post("/api/pdf/crop", files=files, data=data)
        assert res.status_code == 200
        assert res.headers["content-type"] == "application/pdf"


@pytest.mark.asyncio
async def test_pdf_forms_endpoint(form_pdf_bytes):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Inspection mode
        files = {"file": ("form.pdf", form_pdf_bytes, "application/pdf")}
        res = await ac.post("/api/pdf/forms", files=files)
        assert res.status_code == 200
        body = res.json()
        assert body["success"] is True
        assert body["field_count"] >= 1
        assert body["fields"][0]["name"] == "customer_name"

        # 2. Fill & Flatten mode
        files2 = {"file": ("form.pdf", form_pdf_bytes, "application/pdf")}
        data2 = {
            "field_data": json.dumps({"customer_name": "Tariq Creed"}),
            "flatten": "true",
            "return_file": "true",
        }
        res2 = await ac.post("/api/pdf/forms", files=files2, data=data2)
        assert res2.status_code == 200
        assert res2.headers["content-type"] == "application/pdf"


@pytest.mark.asyncio
async def test_unlock_endpoint(locked_pdf_bytes):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Correct password
        files = {"file": ("locked.pdf", locked_pdf_bytes, "application/pdf")}
        data = {"password": "pass123"}
        res = await ac.post("/api/pdf/unlock", files=files, data=data)
        assert res.status_code == 200
        assert res.headers["content-type"] == "application/pdf"

        # Incorrect password -> 400 clean error
        files_bad = {"file": ("locked.pdf", locked_pdf_bytes, "application/pdf")}
        data_bad = {"password": "wrongpassword"}
        res_bad = await ac.post("/api/pdf/unlock", files=files_bad, data=data_bad)
        assert res_bad.status_code == 400
        assert "Incorrect password" in res_bad.json()["detail"]


@pytest.mark.asyncio
async def test_redact_endpoint(sample_pdf_bytes):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        files = {"file": ("document.pdf", sample_pdf_bytes, "application/pdf")}
        data = {
            "search_terms": json.dumps(["Test", "Creed"]),
            "coordinates": json.dumps([{"page": 1, "x0": 20, "y0": 20, "x1": 80, "y1": 50}]),
        }
        res = await ac.post("/api/pdf/redact", files=files, data=data)
        assert res.status_code == 200
        assert res.headers["content-type"] == "application/pdf"


@pytest.mark.asyncio
async def test_compare_endpoint(sample_pdf_bytes, multi_page_pdf_bytes):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # JSON diff output
        files = {
            "file1": ("doc1.pdf", sample_pdf_bytes, "application/pdf"),
            "file2": ("doc2.pdf", multi_page_pdf_bytes, "application/pdf"),
        }
        res = await ac.post("/api/pdf/compare", files=files, data={"return_file": "false"})
        assert res.status_code == 200
        body = res.json()
        assert body["success"] is True
        assert "differences" in body

        # Visual PDF diff report
        files2 = {
            "file1": ("doc1.pdf", sample_pdf_bytes, "application/pdf"),
            "file2": ("doc2.pdf", multi_page_pdf_bytes, "application/pdf"),
        }
        res2 = await ac.post("/api/pdf/compare", files=files2, data={"return_file": "true"})
        assert res2.status_code == 200
        assert res2.headers["content-type"] == "application/pdf"
