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


@pytest.mark.asyncio
async def test_images_to_pdf_single_file_field():
    from PIL import Image
    import io
    buf = io.BytesIO()
    Image.new("RGB", (60, 60), color="green").save(buf, format="JPEG")
    jpg_data = buf.getvalue()

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        files = {"file": ("whatsapp_photo.jpg", jpg_data, "image/jpeg")}
        res = await ac.post("/api/convert/images-to-pdf", files=files)
        assert res.status_code == 200
        assert res.headers["content-type"] == "application/pdf"
        meta = pdf_engine.extract_metadata(res.content)
        assert meta.page_count == 1


@pytest.mark.asyncio
async def test_convert_video_to_gif_and_mp3(synthetic_mp4_file):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        with open(synthetic_mp4_file, "rb") as f:
            mp4_bytes = f.read()

        # 1. Video to GIF
        files_gif = {"file": ("clip.mp4", mp4_bytes, "video/mp4")}
        res_gif = await ac.post("/api/convert/video", files=files_gif, data={"target_format": "gif"})
        assert res_gif.status_code == 200
        assert res_gif.headers["content-type"] == "image/gif"
        assert len(res_gif.content) > 0

        # 2. Video to MP3 (Audio extraction)
        files_mp3 = {"file": ("clip.mp4", mp4_bytes, "video/mp4")}
        res_mp3 = await ac.post("/api/convert/video", files=files_mp3, data={"target_format": "mp3"})
        assert res_mp3.status_code == 200
        assert res_mp3.headers["content-type"] == "audio/mpeg"
        assert len(res_mp3.content) > 0


@pytest.mark.asyncio
async def test_media_convert_universal_endpoint(synthetic_wav_file):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        with open(synthetic_wav_file, "rb") as f:
            wav_bytes = f.read()
        files = {"file": ("voice.wav", wav_bytes, "audio/wav")}
        res = await ac.post("/api/media/convert", files=files, data={"target_format": "mp3"})
        assert res.status_code == 200
        assert "converted_voice.mp3" in res.headers.get("content-disposition", "")

