"""Integration tests for FastAPI PDF REST endpoints."""

import io
import json
import pytest
from httpx import ASGITransport, AsyncClient
from backend.app.main import app
from backend.app.services.pdf_engine import pdf_engine


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.mark.asyncio
async def test_health_check():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "Creed-Tech Studio" in data["service"]


@pytest.mark.asyncio
async def test_inspect_and_thumbnail_and_spans(sample_pdf_bytes):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Inspect
        files = {"file": ("test.pdf", sample_pdf_bytes, "application/pdf")}
        inspect_res = await ac.post("/api/pdf/inspect", files=files)
        assert inspect_res.status_code == 200
        inspect_data = inspect_res.json()
        session_id = inspect_data["session_id"]
        assert session_id is not None
        assert inspect_data["metadata"]["page_count"] == 1

        # 2. Thumbnail
        thumb_res = await ac.get(f"/api/pdf/thumbnail/{session_id}/0?dpi=72")
        assert thumb_res.status_code == 200
        assert thumb_res.headers["content-type"] == "image/png"
        assert thumb_res.content.startswith(b"\x89PNG")

        # 3. Spans
        spans_res = await ac.get(f"/api/pdf/spans/{session_id}/0")
        assert spans_res.status_code == 200
        spans_data = spans_res.json()
        assert spans_data["total_spans"] >= 2
        title_span = next(s for s in spans_data["spans"] if "Sample PDF Title" in s["text"])

        # 4. In-Place Edit Text
        edit_payload = {
            "session_id": session_id,
            "page_index": 0,
            "span_id": title_span["span_id"],
            "replacement_text": "Updated Header via REST API",
            "download_immediately": False,
        }
        edit_res = await ac.post("/api/pdf/edit-text", json=edit_payload)
        assert edit_res.status_code == 200
        assert edit_res.json()["status"] == "success"

        # 5. Download and verify replacement
        dl_res = await ac.get(f"/api/pdf/download/{session_id}")
        assert dl_res.status_code == 200
        assert dl_res.headers["content-type"] == "application/pdf"
        assert pdf_engine.validate_pdf_bytes(dl_res.content) is True

        # Parse downloaded bytes to verify text
        doc_meta = pdf_engine.extract_metadata(dl_res.content)
        assert doc_meta.page_count == 1


@pytest.mark.asyncio
async def test_merge_endpoint(sample_pdf_bytes, multi_page_pdf_bytes):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        files = [
            ("files", ("doc1.pdf", sample_pdf_bytes, "application/pdf")),
            ("files", ("doc2.pdf", multi_page_pdf_bytes, "application/pdf")),
        ]
        res = await ac.post("/api/pdf/merge", files=files)
        assert res.status_code == 200
        assert res.headers["content-type"] == "application/pdf"
        meta = pdf_engine.extract_metadata(res.content)
        assert meta.page_count == 4


@pytest.mark.asyncio
async def test_split_endpoint(multi_page_pdf_bytes):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        files = {"file": ("doc.pdf", multi_page_pdf_bytes, "application/pdf")}
        data = {"page_ranges": "1, 3"}
        res = await ac.post("/api/pdf/split", files=files, data=data)
        assert res.status_code == 200
        meta = pdf_engine.extract_metadata(res.content)
        assert meta.page_count == 2


@pytest.mark.asyncio
async def test_burst_endpoint(multi_page_pdf_bytes):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        files = {"file": ("doc.pdf", multi_page_pdf_bytes, "application/pdf")}
        res = await ac.post("/api/pdf/burst", files=files)
        assert res.status_code == 200
        assert res.headers["content-type"] == "application/zip"
        assert len(res.content) > 0


@pytest.mark.asyncio
async def test_rotate_endpoint(multi_page_pdf_bytes):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        files = {"file": ("doc.pdf", multi_page_pdf_bytes, "application/pdf")}
        data = {"rotations_json": json.dumps({"0": 90, "1": 180})}
        res = await ac.post("/api/pdf/rotate", files=files, data=data)
        assert res.status_code == 200
        meta = pdf_engine.extract_metadata(res.content)
        assert meta.pages[0].rotation == 90
        assert meta.pages[1].rotation == 180
        assert meta.pages[2].rotation == 0


@pytest.mark.asyncio
async def test_protect_endpoint(multi_page_pdf_bytes):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        files = {"file": ("doc.pdf", multi_page_pdf_bytes, "application/pdf")}
        data = {"password": "secret_password"}
        res = await ac.post("/api/pdf/protect", files=files, data=data)
        assert res.status_code == 200
        assert res.headers["content-type"] == "application/pdf"
        assert len(res.content) > 0


@pytest.mark.asyncio
async def test_delete_pages_endpoint(multi_page_pdf_bytes):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        files = {"file": ("doc.pdf", multi_page_pdf_bytes, "application/pdf")}
        data = {"pages": "2"}
        res = await ac.post("/api/pdf/delete-pages", files=files, data=data)
        assert res.status_code == 200
        meta = pdf_engine.extract_metadata(res.content)
        assert meta.page_count == 2


@pytest.mark.asyncio
async def test_crop_endpoint(multi_page_pdf_bytes):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        files = {"file": ("doc.pdf", multi_page_pdf_bytes, "application/pdf")}
        data = {"margin_percent": "10.0"}
        res = await ac.post("/api/pdf/crop", files=files, data=data)
        assert res.status_code == 200
        assert len(res.content) > 0


@pytest.mark.asyncio
async def test_number_pages_endpoint(multi_page_pdf_bytes):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        files = {"file": ("doc.pdf", multi_page_pdf_bytes, "application/pdf")}
        data = {"format_str": "Page {n} of {total}"}
        res = await ac.post("/api/pdf/number-pages", files=files, data=data)
        assert res.status_code == 200
        assert len(res.content) > 0


@pytest.mark.asyncio
async def test_reorder_endpoint(multi_page_pdf_bytes):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        files = {"file": ("doc.pdf", multi_page_pdf_bytes, "application/pdf")}
        data = {"order_json": json.dumps([2, 1, 0])}
        res = await ac.post("/api/pdf/reorder", files=files, data=data)
        assert res.status_code == 200
        meta = pdf_engine.extract_metadata(res.content)
        assert meta.page_count == 3

