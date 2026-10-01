"""Pytest fixtures for PDF testing."""

import pytest
import pymupdf
from pathlib import Path


@pytest.fixture
def sample_pdf_bytes() -> bytes:
    """Creates a simple single-page PDF with known text and formatting."""
    doc = pymupdf.open()
    page = doc.new_page(width=595, height=842)  # A4 standard
    
    # Insert title
    page.insert_text(
        point=(50, 100),
        text="Sample PDF Title",
        fontsize=24,
        fontname="helv",
        color=(0.1, 0.2, 0.5),  # Navy blue
    )
    
    # Insert body paragraph
    page.insert_text(
        point=(50, 160),
        text="This is an original confidential document line that needs modification.",
        fontsize=12,
        fontname="tiro",
        color=(0, 0, 0),
    )
    
    doc.set_metadata({
        "title": "Test Document Title",
        "author": "Antigravity Test Suite",
        "subject": "Unit Testing",
    })
    
    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes


@pytest.fixture
def multi_page_pdf_bytes() -> bytes:
    """Creates a 3-page PDF document."""
    doc = pymupdf.open()
    for i in range(3):
        page = doc.new_page(width=595, height=842)
        page.insert_text(
            point=(50, 100),
            text=f"Page Number {i + 1}",
            fontsize=18,
            fontname="helv",
            color=(0, 0, 0),
        )
    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes


@pytest.fixture
def sample_pdf_file(tmp_path, sample_pdf_bytes) -> Path:
    path = tmp_path / "sample.pdf"
    path.write_bytes(sample_pdf_bytes)
    return path


@pytest.fixture
def multi_page_pdf_file(tmp_path, multi_page_pdf_bytes) -> Path:
    path = tmp_path / "multipage.pdf"
    path.write_bytes(multi_page_pdf_bytes)
    return path
