"""Unit tests for CompressorService."""

import pytest
from PIL import Image
from pathlib import Path
from backend.app.services.compressor_service import compressor_service


@pytest.fixture
def uncompressed_png(tmp_path) -> Path:
    """Creates a raw uncompressed PNG to test compression savings."""
    img_path = tmp_path / "large_raw.png"
    img = Image.new("RGB", (600, 400))
    pixels = []
    for y in range(400):
        for x in range(600):
            pixels.append((x % 255, y % 255, (x + y) % 255))
    img.putdata(pixels)
    img.save(img_path, format="PNG", compress_level=0)
    return img_path


def test_compress_image(tmp_path, uncompressed_png):
    out_file = tmp_path / "compressed.webp"
    result = compressor_service.compress_image(uncompressed_png, preset="high_quality", output_path=out_file)

    assert result.original_size_bytes > 0
    assert result.compressed_size_bytes > 0
    assert result.compressed_size_bytes < result.original_size_bytes
    assert result.percent_saved > 20.0
    assert Path(result.output_path).exists()


@pytest.mark.asyncio
async def test_compress_audio(tmp_path, synthetic_wav_file):
    out_file = tmp_path / "compressed_audio.m4a"
    result = await compressor_service.compress_audio(synthetic_wav_file, preset="high_quality", output_path=out_file)

    assert result.original_size_bytes > 0
    assert result.compressed_size_bytes > 0
    # Converting 1s uncompressed PCM WAV to 128k AAC yields >50% savings
    assert result.compressed_size_bytes < result.original_size_bytes
    assert result.percent_saved > 50.0
    assert Path(result.output_path).exists()


@pytest.mark.asyncio
async def test_compress_video(tmp_path, synthetic_mp4_file):
    out_file = tmp_path / "compressed_video.mp4"
    result = await compressor_service.compress_video(synthetic_mp4_file, preset="high_quality", output_path=out_file)

    assert result.original_size_bytes > 0
    assert result.compressed_size_bytes > 0
    assert Path(result.output_path).exists()
