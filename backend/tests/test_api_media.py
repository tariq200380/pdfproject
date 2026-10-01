"""Integration tests for media conversion REST API routes."""

import pytest
from httpx import ASGITransport, AsyncClient
from backend.app.main import app
from backend.app.services.pdf_engine import pdf_engine


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.mark.asyncio
async def test_convert_audio_endpoint(synthetic_wav_file):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        with open(synthetic_wav_file, "rb") as f:
            files = {"file": ("sine.wav", f.read(), "audio/wav")}
        data = {"target_format": "mp3", "bitrate": "128k"}
        res = await ac.post("/api/convert/audio", files=files, data=data)
        assert res.status_code == 200
        assert len(res.content) > 0
        assert "converted_sine.mp3" in res.headers.get("content-disposition", "")


@pytest.mark.asyncio
async def test_convert_video_endpoint(synthetic_mp4_file):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        with open(synthetic_mp4_file, "rb") as f:
            files = {"file": ("pattern.mp4", f.read(), "video/mp4")}
        data = {"target_format": "webm", "resolution": "480p"}
        res = await ac.post("/api/convert/video", files=files, data=data)
        assert res.status_code == 200
        assert len(res.content) > 0
        assert "converted_pattern.webm" in res.headers.get("content-disposition", "")


@pytest.mark.asyncio
async def test_images_to_pdf_endpoint(tmp_path):
    from PIL import Image
    import io
    buf = io.BytesIO()
    Image.new("RGB", (100, 100), color="blue").save(buf, format="PNG")
    png_data = buf.getvalue()

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        files = [
            ("files", ("img1.png", png_data, "image/png")),
            ("files", ("img2.png", png_data, "image/png")),
        ]
        res = await ac.post("/api/convert/images-to-pdf", files=files)
        assert res.status_code == 200
        assert res.headers["content-type"] == "application/pdf"
        meta = pdf_engine.extract_metadata(res.content)
        assert meta.page_count == 2


@pytest.mark.asyncio
async def test_pdf_to_images_endpoint(sample_pdf_bytes):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        files = {"file": ("doc.pdf", sample_pdf_bytes, "application/pdf")}
        data = {"target_format": "png", "dpi": "72"}
        res = await ac.post("/api/convert/pdf-to-images", files=files, data=data)
        assert res.status_code == 200
        assert res.headers["content-type"] == "image/png"
        assert res.content.startswith(b"\x89PNG")


@pytest.mark.asyncio
async def test_image_format_conversion_endpoint():
    from PIL import Image
    import io
    buf = io.BytesIO()
    Image.new("RGB", (100, 100), color="red").save(buf, format="PNG")
    png_data = buf.getvalue()

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        files = {"file": ("test.png", png_data, "image/png")}
        data = {"target_format": "webp"}
        res = await ac.post("/api/convert/image", files=files, data=data)
        assert res.status_code == 200
        assert res.headers["content-type"] == "image/webp"
        assert len(res.content) > 0
