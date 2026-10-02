"""REST API routes for smart media compression."""

import logging
from pathlib import Path
from fastapi import (
    APIRouter,
    BackgroundTasks,
    File,
    Form,
    HTTPException,
    UploadFile,
    status,
)
from fastapi.responses import FileResponse

from backend.app.core.sandbox import sandbox_manager
from backend.app.core.sanitizer import (
    sanitize_filename,
    validate_allowlist,
    ALLOWED_COMPRESS_PRESETS,
)
from backend.app.services.compressor_service import compressor_service

logger = logging.getLogger("omnistudio.routes_compress")
router = APIRouter(prefix="/compress", tags=["Smart Compressor"])


def _build_compression_response(
    result,
    session_id: str,
    download_filename: str,
    media_type: str,
    background_tasks: BackgroundTasks,
) -> FileResponse:
    """Helper to attach compression metrics as response headers and schedule cleanup."""
    background_tasks.add_task(sandbox_manager.cleanup_session, session_id)
    safe_name = sanitize_filename(download_filename, "compressed_media")
    headers = {
        "X-Original-Size": str(result.original_size_bytes),
        "X-Compressed-Size": str(result.compressed_size_bytes),
        "X-Bytes-Saved": str(result.bytes_saved),
        "X-Percent-Saved": str(result.percent_saved),
        "Access-Control-Expose-Headers": "X-Original-Size, X-Compressed-Size, X-Bytes-Saved, X-Percent-Saved",
    }
    return FileResponse(
        path=result.output_path,
        filename=safe_name,
        media_type=media_type,
        headers=headers,
    )


@router.post("/pdf")
async def compress_pdf_endpoint(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
):
    """Compresses uploaded PDF document using PyMuPDF lossless optimization."""
    session_id, session_dir = sandbox_manager.create_session()
    src_path = session_dir / "input.pdf"
    content = await file.read()
    if len(content) == 0:
        sandbox_manager.cleanup_session(session_id)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded PDF is empty")

    src_path.write_bytes(content)
    out_path = session_dir / "compressed.pdf"
    try:
        result = compressor_service.compress_pdf(src_path, output_path=out_path)
    except Exception as e:
        sandbox_manager.cleanup_session(session_id)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"PDF compression failed: {e}")

    safe_stem = sanitize_filename(Path(file.filename or "document").stem, "document")
    return _build_compression_response(
        result=result,
        session_id=session_id,
        download_filename=f"compressed_{safe_stem}.pdf",
        media_type="application/pdf",
        background_tasks=background_tasks,
    )


@router.post("/image")
async def compress_image_endpoint(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    preset: str = Form("high_quality"),  # high_quality, max_compression, lossless
):
    """Compresses uploaded image, returning the compressed asset with size metrics."""
    valid_preset = validate_allowlist(preset, ALLOWED_COMPRESS_PRESETS, "preset")

    session_id, session_dir = sandbox_manager.create_session()
    src_ext = Path(file.filename).suffix if file.filename else ".png"
    src_path = session_dir / f"input{src_ext}"
    content = await file.read()
    if len(content) == 0:
        sandbox_manager.cleanup_session(session_id)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded image is empty")

    src_path.write_bytes(content)

    out_path = session_dir / "compressed.webp"
    try:
        result = compressor_service.compress_image(src_path, preset=valid_preset, output_path=out_path)
    except Exception as e:
        sandbox_manager.cleanup_session(session_id)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Image compression failed: {e}")

    safe_stem = sanitize_filename(Path(file.filename or "image").stem, "image")
    return _build_compression_response(
        result=result,
        session_id=session_id,
        download_filename=f"compressed_{safe_stem}.webp",
        media_type="image/webp",
        background_tasks=background_tasks,
    )


@router.post("/video")
async def compress_video_endpoint(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    preset: str = Form("high_quality"),  # high_quality, max_compression
):
    """Compresses uploaded video using CRF and audio rate control."""
    valid_preset = validate_allowlist(preset, {"high_quality", "max_compression"}, "preset")

    session_id, session_dir = sandbox_manager.create_session()
    src_ext = Path(file.filename).suffix if file.filename else ".mp4"
    src_path = session_dir / f"input{src_ext}"
    content = await file.read()
    if len(content) == 0:
        sandbox_manager.cleanup_session(session_id)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded video is empty")

    src_path.write_bytes(content)

    out_path = session_dir / "compressed.mp4"
    try:
        result = await compressor_service.compress_video(src_path, preset=valid_preset, output_path=out_path)
    except Exception as e:
        sandbox_manager.cleanup_session(session_id)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Video compression failed: {e}")

    safe_stem = sanitize_filename(Path(file.filename or "video").stem, "video")
    return _build_compression_response(
        result=result,
        session_id=session_id,
        download_filename=f"compressed_{safe_stem}.mp4",
        media_type="video/mp4",
        background_tasks=background_tasks,
    )


@router.post("/audio")
async def compress_audio_endpoint(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    preset: str = Form("high_quality"),  # high_quality, max_compression
):
    """Compresses uploaded audio using bitrate optimization."""
    valid_preset = validate_allowlist(preset, {"high_quality", "max_compression"}, "preset")

    session_id, session_dir = sandbox_manager.create_session()
    src_ext = Path(file.filename).suffix if file.filename else ".wav"
    src_path = session_dir / f"input{src_ext}"
    content = await file.read()
    if len(content) == 0:
        sandbox_manager.cleanup_session(session_id)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded audio is empty")

    src_path.write_bytes(content)

    out_path = session_dir / "compressed.m4a"
    try:
        result = await compressor_service.compress_audio(src_path, preset=valid_preset, output_path=out_path)
    except Exception as e:
        sandbox_manager.cleanup_session(session_id)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Audio compression failed: {e}")

    safe_stem = sanitize_filename(Path(file.filename or "audio").stem, "audio")
    return _build_compression_response(
        result=result,
        session_id=session_id,
        download_filename=f"compressed_{safe_stem}.m4a",
        media_type="audio/mp4",
        background_tasks=background_tasks,
    )
