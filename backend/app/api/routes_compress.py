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
    headers = {
        "X-Original-Size": str(result.original_size_bytes),
        "X-Compressed-Size": str(result.compressed_size_bytes),
        "X-Bytes-Saved": str(result.bytes_saved),
        "X-Percent-Saved": str(result.percent_saved),
        "Access-Control-Expose-Headers": "X-Original-Size, X-Compressed-Size, X-Bytes-Saved, X-Percent-Saved",
    }
    return FileResponse(
        path=result.output_path,
        filename=download_filename,
        media_type=media_type,
        headers=headers,
    )


@router.post("/image")
async def compress_image_endpoint(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    preset: str = Form("high_quality"),  # high_quality, max_compression, lossless
):
    """Compresses uploaded image, returning the compressed asset with size metrics."""
    session_id, session_dir = sandbox_manager.create_session()
    src_ext = Path(file.filename).suffix if file.filename else ".png"
    src_path = session_dir / f"input{src_ext}"
    content = await file.read()
    src_path.write_bytes(content)

    out_path = session_dir / f"compressed.webp"
    try:
        result = compressor_service.compress_image(src_path, preset=preset, output_path=out_path)
    except Exception as e:
        sandbox_manager.cleanup_session(session_id)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Image compression failed: {e}")

    return _build_compression_response(
        result=result,
        session_id=session_id,
        download_filename=f"compressed_{Path(file.filename).stem}.webp",
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
    session_id, session_dir = sandbox_manager.create_session()
    src_ext = Path(file.filename).suffix if file.filename else ".mp4"
    src_path = session_dir / f"input{src_ext}"
    content = await file.read()
    src_path.write_bytes(content)

    out_path = session_dir / f"compressed.mp4"
    try:
        result = await compressor_service.compress_video(src_path, preset=preset, output_path=out_path)
    except Exception as e:
        sandbox_manager.cleanup_session(session_id)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Video compression failed: {e}")

    return _build_compression_response(
        result=result,
        session_id=session_id,
        download_filename=f"compressed_{Path(file.filename).stem}.mp4",
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
    session_id, session_dir = sandbox_manager.create_session()
    src_ext = Path(file.filename).suffix if file.filename else ".wav"
    src_path = session_dir / f"input{src_ext}"
    content = await file.read()
    src_path.write_bytes(content)

    out_path = session_dir / f"compressed.m4a"
    try:
        result = await compressor_service.compress_audio(src_path, preset=preset, output_path=out_path)
    except Exception as e:
        sandbox_manager.cleanup_session(session_id)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Audio compression failed: {e}")

    return _build_compression_response(
        result=result,
        session_id=session_id,
        download_filename=f"compressed_{Path(file.filename).stem}.m4a",
        media_type="audio/mp4",
        background_tasks=background_tasks,
    )
