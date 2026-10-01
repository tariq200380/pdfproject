"""Security, input validation, and hardening tests for OmniMedia & PDF Studio."""

import io
import pytest
from fastapi.testclient import TestClient
import pymupdf

from backend.app.main import app
from backend.app.core.sanitizer import (
    sanitize_filename,
    validate_allowlist,
    ALLOWED_AUDIO_FORMATS,
    ALLOWED_AUDIO_BITRATES,
    ALLOWED_VIDEO_FORMATS,
    ALLOWED_VIDEO_RESOLUTIONS,
    ALLOWED_COMPRESS_PRESETS,
)


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


def test_http_security_headers(client):
    """Verifies that all responses include OWASP recommended security headers."""
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.headers.get("X-Content-Type-Options") == "nosniff"
    assert res.headers.get("X-Frame-Options") == "DENY"
    assert res.headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"
    assert res.headers.get("X-XSS-Protection") == "1; mode=block"


def test_filename_sanitizer_path_traversal():
    """Verifies stripping of directory traversal patterns in filenames."""
    assert sanitize_filename("../../../etc/passwd") == "passwd"
    assert sanitize_filename("..\\..\\windows\\system32\\cmd.exe") == "cmd.exe"
    assert sanitize_filename("/var/log/syslog") == "syslog"


def test_filename_sanitizer_header_injection():
    """Verifies removal of quotes, newlines, null bytes, and CRLF sequences."""
    assert sanitize_filename('test\r\nSet-Cookie: evil=1.pdf') == "testSet-Cookie: evil=1.pdf"
    assert sanitize_filename('sample"quoted".pdf') == "samplequoted.pdf"
    assert sanitize_filename("null\x00byte.png") == "nullbyte.png"
    assert sanitize_filename("...hidden", fallback="doc.pdf") == "hidden"
    assert sanitize_filename("", fallback="fallback.pdf") == "fallback.pdf"


def test_audio_param_allowlist_validation(client):
    """Verifies strict allowlist enforcement for audio format and bitrate."""
    fake_audio = io.BytesIO(b"RIFF\x24\x00\x00\x00WAVEfmt \x10\x00\x00\x00")
    
    # Invalid audio target format
    res = client.post(
        "/api/convert/audio",
        files={"file": ("test.wav", fake_audio, "audio/wav")},
        data={"target_format": "sh; evil_cmd", "bitrate": "192k"},
    )
    assert res.status_code == 400
    assert "Invalid target_format" in res.json()["detail"]

    # Invalid bitrate injection attempt
    fake_audio.seek(0)
    res = client.post(
        "/api/convert/audio",
        files={"file": ("test.wav", fake_audio, "audio/wav")},
        data={"target_format": "mp3", "bitrate": "-b:a 192k -f null /dev/null"},
    )
    assert res.status_code == 400
    assert "Invalid bitrate" in res.json()["detail"]


def test_video_param_allowlist_validation(client):
    """Verifies strict allowlist enforcement for video format and resolution."""
    fake_video = io.BytesIO(b"\x00\x00\x00\x18ftypmp42\x00\x00\x00\x00")
    
    # Invalid video target container
    res = client.post(
        "/api/convert/video",
        files={"file": ("test.mp4", fake_video, "video/mp4")},
        data={"target_format": "exe", "resolution": "1080p"},
    )
    assert res.status_code == 400
    assert "Invalid target_format" in res.json()["detail"]

    # Invalid resolution
    fake_video.seek(0)
    res = client.post(
        "/api/convert/video",
        files={"file": ("test.mp4", fake_video, "video/mp4")},
        data={"target_format": "webm", "resolution": "4000x2000; rm -rf /"},
    )
    assert res.status_code == 400
    assert "Invalid resolution" in res.json()["detail"]


def test_compression_preset_allowlist(client):
    """Verifies rejection of invalid compression presets."""
    fake_img = io.BytesIO(b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR")
    res = client.post(
        "/api/compress/image",
        files={"file": ("test.png", fake_img, "image/png")},
        data={"preset": "ultra_extreme_unsupported"},
    )
    assert res.status_code == 400
    assert "Invalid preset" in res.json()["detail"]


def test_max_file_size_middleware_limit(client):
    """Verifies rejection when Content-Length exceeds the 100MB configured limit."""
    # 105 MB simulated Content-Length header
    oversized_length = str(105 * 1024 * 1024)
    res = client.post(
        "/api/convert/audio",
        headers={"Content-Length": oversized_length},
    )
    assert res.status_code == 413
    assert "Payload size exceeds maximum allowed limit" in res.json()["detail"]


def test_zero_byte_upload_handling(client):
    """Verifies that 0-byte uploads return HTTP 400 with a clear error message."""
    empty_file = io.BytesIO(b"")

    # PDF inspect empty
    res = client.post(
        "/api/pdf/inspect",
        files={"file": ("empty.pdf", empty_file, "application/pdf")},
    )
    assert res.status_code == 400
    assert "empty" in res.json()["detail"].lower()

    # Audio convert empty
    empty_file.seek(0)
    res = client.post(
        "/api/convert/audio",
        files={"file": ("empty.mp3", empty_file, "audio/mpeg")},
        data={"target_format": "wav"},
    )
    assert res.status_code == 400
    assert "empty" in res.json()["detail"].lower()

    # Image compress empty
    empty_file.seek(0)
    res = client.post(
        "/api/compress/image",
        files={"file": ("empty.png", empty_file, "image/png")},
    )
    assert res.status_code == 400
    assert "empty" in res.json()["detail"].lower()


def test_encrypted_pdf_handling(client):
    """Verifies that an encrypted/password-protected PDF is rejected with HTTP 400."""
    # Generate encrypted PDF in memory
    doc = pymupdf.open()
    page = doc.new_page()
    page.insert_text((50, 50), "Secret document")
    
    # Save with user password
    perm = pymupdf.PDF_PERM_ACCESSIBILITY
    pdf_bytes = doc.tobytes(
        encryption=pymupdf.PDF_ENCRYPT_AES_256,
        user_pw="password123",
        owner_pw="owner123",
        permissions=perm,
    )
    doc.close()

    res = client.post(
        "/api/pdf/inspect",
        files={"file": ("protected.pdf", io.BytesIO(pdf_bytes), "application/pdf")},
    )
    assert res.status_code == 400
    assert "encrypted" in res.json()["detail"].lower() or "password" in res.json()["detail"].lower()
