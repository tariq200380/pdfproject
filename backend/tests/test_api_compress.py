"""Integration tests for compression REST API routes."""

import io
import pytest
from PIL import Image
from httpx import ASGITransport, AsyncClient
from backend.app.main import app


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.mark.asyncio
async def test_compress_image_endpoint():
    # Generate uncompressed PNG
    buf = io.BytesIO()
    img = Image.new("RGB", (300, 300))
    pixels = [(x % 255, y % 255, (x + y) % 255) for y in range(300) for x in range(300)]
    img.putdata(pixels)
    img.save(buf, format="PNG", compress_level=0)
    raw_bytes = buf.getvalue()

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        files = {"file": ("test_uncompressed.png", raw_bytes, "image/png")}
        data = {"preset": "high_quality"}
        res = await ac.post("/api/compress/image", files=files, data=data)
        assert res.status_code == 200
        assert res.headers["content-type"] == "image/webp"
        assert "x-original-size" in res.headers
        assert "x-compressed-size" in res.headers
        assert "x-percent-saved" in res.headers
        assert float(res.headers["x-percent-saved"]) > 0


@pytest.mark.asyncio
async def test_compress_video_endpoint(synthetic_mp4_file):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        with open(synthetic_mp4_file, "rb") as f:
            files = {"file": ("video.mp4", f.read(), "video/mp4")}
        data = {"preset": "high_quality"}
        res = await ac.post("/api/compress/video", files=files, data=data)
        assert res.status_code == 200
        assert res.headers["content-type"] == "video/mp4"
        assert "x-original-size" in res.headers
        assert "x-compressed-size" in res.headers


@pytest.mark.asyncio
async def test_compress_audio_endpoint(synthetic_wav_file):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        with open(synthetic_wav_file, "rb") as f:
            files = {"file": ("audio.wav", f.read(), "audio/wav")}
        data = {"preset": "high_quality"}
        res = await ac.post("/api/compress/audio", files=files, data=data)
        assert res.status_code == 200
        assert res.headers["content-type"] == "audio/mp4"
        assert "x-original-size" in res.headers
        assert "x-compressed-size" in res.headers
        assert float(res.headers["x-percent-saved"]) > 40.0
