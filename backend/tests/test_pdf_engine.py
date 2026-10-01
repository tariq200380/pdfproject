"""Unit tests for PDFEngine service."""

import pytest
from PIL import Image
import io
from backend.app.services.pdf_engine import pdf_engine


def test_validate_pdf_bytes(sample_pdf_bytes):
    assert pdf_engine.validate_pdf_bytes(sample_pdf_bytes) is True
    assert pdf_engine.validate_pdf_bytes(b"Not a PDF file at all") is False
    assert pdf_engine.validate_pdf_bytes(b"") is False


def test_extract_metadata(sample_pdf_file, sample_pdf_bytes):
    # From path
    meta_from_file = pdf_engine.extract_metadata(sample_pdf_file)
    assert meta_from_file.title == "Test Document Title"
    assert meta_from_file.author == "Antigravity Test Suite"
    assert meta_from_file.page_count == 1
    assert len(meta_from_file.pages) == 1
    assert meta_from_file.pages[0].width == 595.0
    assert meta_from_file.pages[0].height == 842.0

    # From bytes
    meta_from_bytes = pdf_engine.extract_metadata(sample_pdf_bytes)
    assert meta_from_bytes.title == "Test Document Title"
    assert meta_from_bytes.page_count == 1


def test_extract_metadata_multipage(multi_page_pdf_file):
    meta = pdf_engine.extract_metadata(multi_page_pdf_file)
    assert meta.page_count == 3
    assert len(meta.pages) == 3
    for i, p in enumerate(meta.pages):
        assert p.page_index == i
        assert p.page_number == i + 1


def test_render_page_thumbnail(sample_pdf_bytes):
    png_bytes = pdf_engine.render_page_thumbnail(sample_pdf_bytes, page_index=0, dpi=72)
    assert png_bytes.startswith(b"\x89PNG\r\n\x1a\n")  # PNG signature
    
    # Verify image opens with Pillow
    img = Image.open(io.BytesIO(png_bytes))
    assert img.format == "PNG"
    assert img.width > 0
    assert img.height > 0


def test_render_page_thumbnail_out_of_bounds(sample_pdf_bytes):
    with pytest.raises(IndexError, match="out of bounds"):
        pdf_engine.render_page_thumbnail(sample_pdf_bytes, page_index=99)


def test_invalid_file_handling(tmp_path):
    invalid_file = tmp_path / "corrupt.pdf"
    invalid_file.write_text("Corrupt header text")
    with pytest.raises(ValueError, match="valid PDF magic bytes"):
        pdf_engine.open_document(invalid_file)
