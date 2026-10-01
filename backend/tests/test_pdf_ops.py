"""Unit tests for PDFOpsService."""

import pytest
import zipfile
import pymupdf
from pathlib import Path
from backend.app.services.pdf_ops import pdf_ops
from backend.app.services.pdf_engine import pdf_engine


def test_parse_page_ranges():
    assert pdf_ops.parse_page_ranges("1-3", total_pages=5) == [0, 1, 2]
    assert pdf_ops.parse_page_ranges("1, 3, 5", total_pages=5) == [0, 2, 4]
    assert pdf_ops.parse_page_ranges("2-4, 5", total_pages=5) == [1, 2, 3, 4]

    with pytest.raises(IndexError):
        pdf_ops.parse_page_ranges("6", total_pages=5)

    with pytest.raises(ValueError):
        pdf_ops.parse_page_ranges("4-2", total_pages=5)


def test_merge_pdfs(tmp_path, sample_pdf_bytes, multi_page_pdf_bytes):
    out_file = tmp_path / "merged.pdf"
    result = pdf_ops.merge_pdfs([sample_pdf_bytes, multi_page_pdf_bytes], out_file)
    assert result.exists()

    meta = pdf_engine.extract_metadata(result)
    assert meta.page_count == 4  # 1 + 3 pages


def test_split_pdf(tmp_path, multi_page_pdf_bytes):
    out_file = tmp_path / "split.pdf"
    result = pdf_ops.split_pdf(multi_page_pdf_bytes, "1, 3", out_file)
    assert result.exists()

    meta = pdf_engine.extract_metadata(result)
    assert meta.page_count == 2


def test_burst_pdf(tmp_path, multi_page_pdf_bytes):
    zip_out = tmp_path / "burst.zip"
    result = pdf_ops.burst_pdf(multi_page_pdf_bytes, zip_out)
    assert result.exists()

    with zipfile.ZipFile(result, "r") as zf:
        namelist = zf.namelist()
        assert len(namelist) == 3
        assert "page_1.pdf" in namelist or "page_01.pdf" in namelist or "page_1.pdf" in [n.lower() for n in namelist]
        # Verify first extracted file is valid PDF
        page_1_data = zf.read(namelist[0])
        assert pdf_engine.validate_pdf_bytes(page_1_data) is True


def test_rotate_pages(tmp_path, multi_page_pdf_bytes):
    out_file = tmp_path / "rotated.pdf"
    result = pdf_ops.rotate_pages(multi_page_pdf_bytes, {0: 90, 1: 180}, out_file)
    assert result.exists()

    meta = pdf_engine.extract_metadata(result)
    assert meta.pages[0].rotation == 90
    assert meta.pages[1].rotation == 180
    assert meta.pages[2].rotation == 0
