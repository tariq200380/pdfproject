"""Sanitization and parameter validation utilities."""

import re
from pathlib import Path
from fastapi import HTTPException, status

ALLOWED_AUDIO_FORMATS = {"mp3", "wav", "aac", "flac", "ogg", "m4a"}
ALLOWED_AUDIO_BITRATES = {"64k", "96k", "128k", "192k", "256k", "320k"}
ALLOWED_VIDEO_FORMATS = {"mp4", "mkv", "avi", "webm", "mov", "gif", "mp3"}
ALLOWED_VIDEO_RESOLUTIONS = {"original", "1080p", "720p", "480p"}
ALLOWED_IMAGE_FORMATS = {"png", "jpg", "jpeg", "webp", "svg"}
ALLOWED_COMPRESS_PRESETS = {"high_quality", "max_compression", "lossless"}


def sanitize_filename(name: str | None, fallback: str = "download") -> str:
    """Sanitizes an uploaded or output filename to prevent path traversal and header injection.

    - Normalizes Windows and POSIX separators to extract basename.
    - Removes newlines, control characters, null bytes, and quotes.
    - Limits length and falls back to safe string if empty.
    """
    if not name:
        return fallback

    # Normalize Windows backslashes to forward slashes first
    normalized = name.replace("\\", "/")

    # Extract basename to kill any directory path
    base = Path(normalized).name

    # Remove null bytes, newlines, carriage returns, and quotes
    cleaned = re.sub(r'[\r\n\x00"\'\\/]', '', base).strip()

    # Prevent hidden files or relative paths
    cleaned = re.sub(r'^\.+', '', cleaned)

    if not cleaned:
        return fallback

    # Limit to reasonable filename length (120 chars)
    if len(cleaned) > 120:
        ext = Path(cleaned).suffix
        stem = Path(cleaned).stem[:100]
        cleaned = f"{stem}{ext}"

    return cleaned


def validate_allowlist(val: str, allowed: set[str], param_name: str) -> str:
    """Validates that a string parameter belongs to a strict set of allowed values."""
    normalized = val.strip().lower()
    if normalized not in allowed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid {param_name} '{val}'. Must be one of: {sorted(list(allowed))}",
        )
    return normalized
