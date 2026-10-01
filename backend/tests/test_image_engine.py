"""Unit tests for ImageEngine service."""

import zipfile
import pytest
from PIL import Image
from pathlib import Path
from backend.app.services.image_engine import image_engine
from backend.app.services.pdf_engine import pdf_engine


@pytest.fixture
def sample_png_image(tmp_path) -> Path:
    img_path = tmp_path / "test_image.png"
    img = Image.new("RGBA", (200, 150), color=(30, 144, 255, 255))
    img.save(img_path, format="PNG")
    return img_path


def test_convert_images_to_pdf(tmp_path, sample_png_image):
    pdf_out = tmp_path / "from_images.pdf"
    result = image_engine.convert_images_to_pdf([sample_png_image, sample_png_image], pdf_out)
    assert result.exists()

    meta = pdf_engine.extract_metadata(result)
    assert meta.page_count == 2


def test_convert_pdf_to_single_image(tmp_path, sample_pdf_bytes):
    # PNG output
    png_out = tmp_path / "page_1.png"
    result = image_engine.convert_pdf_to_images(sample_pdf_bytes, target_format="png", output_path=png_out)
    assert result.exists()
    assert result.read_bytes().startswith(b"\x89PNG")

    # SVG output
    svg_out = tmp_path / "page_1.svg"
    result_svg = image_engine.convert_pdf_to_images(sample_pdf_bytes, target_format="svg", output_path=svg_out)
    assert result_svg.exists()
    assert "<svg" in result_svg.read_text()


def test_convert_multipage_pdf_to_zip(tmp_path, multi_page_pdf_bytes):
    zip_out = tmp_path / "pages.zip"
    result = image_engine.convert_pdf_to_images(multi_page_pdf_bytes, target_format="png", output_path=zip_out)
    assert result.exists()

    with zipfile.ZipFile(result, "r") as zf:
        namelist = zf.namelist()
        assert len(namelist) == 3
        assert any(n.endswith(".png") for n in namelist)


def test_convert_image_format(tmp_path, sample_png_image):
    # PNG -> JPG
    jpg_out = tmp_path / "converted.jpg"
    image_engine.convert_image_format(sample_png_image, "jpg", jpg_out)
    assert jpg_out.exists()
    with Image.open(jpg_out) as img:
        assert img.format == "JPEG"

    # PNG -> WEBP
    webp_out = tmp_path / "converted.webp"
    image_engine.convert_image_format(sample_png_image, "webp", webp_out)
    assert webp_out.exists()
    with Image.open(webp_out) as img:
        assert img.format == "WEBP"
