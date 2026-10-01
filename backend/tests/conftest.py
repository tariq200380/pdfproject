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


@pytest.fixture(scope="session")
def synthetic_wav_file(tmp_path_factory) -> Path:
    """Generates a 1-second synthetic 440Hz sine wave WAV file."""
    import subprocess
    tmp_dir = tmp_path_factory.mktemp("audio_fixtures")
    wav_path = tmp_dir / "test_sine.wav"
    subprocess.run(
        [
            "ffmpeg", "-y",
            "-f", "lavfi",
            "-i", "sine=frequency=440:duration=1",
            "-ar", "44100",
            "-ac", "2",
            str(wav_path),
        ],
        check=True,
        capture_output=True,
    )
    return wav_path


@pytest.fixture(scope="session")
def synthetic_mp4_file(tmp_path_factory) -> Path:
    """Generates a 1-second synthetic 640x360 test video file."""
    import subprocess
    tmp_dir = tmp_path_factory.mktemp("video_fixtures")
    mp4_path = tmp_dir / "test_pattern.mp4"
    subprocess.run(
        [
            "ffmpeg", "-y",
            "-f", "lavfi",
            "-i", "testsrc=duration=1:size=640x360:rate=15",
            "-f", "lavfi",
            "-i", "sine=frequency=440:duration=1",
            "-c:v", "libx264",
            "-pix_fmt", "yuv420p",
            "-c:a", "aac",
            str(mp4_path),
        ],
        check=True,
        capture_output=True,
    )
    return mp4_path

