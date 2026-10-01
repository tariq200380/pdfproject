"""REST API routes for universal audio, video, and image conversions."""

import logging
from pathlib import Path
from typing import List, Optional
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
    ALLOWED_AUDIO_FORMATS,
    ALLOWED_AUDIO_BITRATES,
    ALLOWED_VIDEO_FORMATS,
    ALLOWED_VIDEO_RESOLUTIONS,
    ALLOWED_IMAGE_FORMATS,
)
from backend.app.services.ffmpeg_service import (
    ffmpeg_service,
    AudioTranscodeOptions,
    VideoTranscodeOptions,
)
from backend.app.services.image_engine import image_engine
from backend.app.services.pdf_engine import pdf_engine

logger = logging.getLogger("omnistudio.routes_media")
router = APIRouter(prefix="/convert", tags=["Universal Converters"])


@router.post("/audio")
async def convert_audio_endpoint(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    target_format: str = Form(...),  # mp3, wav, aac, flac, ogg, m4a
    bitrate: Optional[str] = Form("192k"),
    sample_rate: Optional[int] = Form(None),
):
    """Transcodes uploaded audio into target format (MP3, WAV, AAC, FLAC, OGG, M4A)."""
    if not isinstance(target_format, str):
        target_format = str(getattr(target_format, "default", target_format))
    if not isinstance(bitrate, str):
        bitrate = str(getattr(bitrate, "default", "192k") or "192k")
    if not isinstance(sample_rate, int) and sample_rate is not None:
        sample_rate = getattr(sample_rate, "default", None)

    fmt = validate_allowlist(target_format.lstrip("."), ALLOWED_AUDIO_FORMATS, "target_format")
    if bitrate:
        bitrate = validate_allowlist(bitrate, ALLOWED_AUDIO_BITRATES, "bitrate")

    session_id, session_dir = sandbox_manager.create_session()
    
    src_ext = Path(file.filename).suffix if file.filename else ".bin"
    src_path = session_dir / f"input{src_ext}"
    content = await file.read()
    if len(content) == 0:
        sandbox_manager.cleanup_session(session_id)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty")

    src_path.write_bytes(content)

    out_path = session_dir / f"converted.{fmt}"
    options = AudioTranscodeOptions(bitrate=bitrate, sample_rate=sample_rate)

    try:
        await ffmpeg_service.transcode_audio(src_path, fmt, options, out_path)
    except Exception as e:
        sandbox_manager.cleanup_session(session_id)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Audio conversion failed: {e}")

    background_tasks.add_task(sandbox_manager.cleanup_session, session_id)
    safe_stem = sanitize_filename(Path(file.filename or "audio").stem, "audio")
    return FileResponse(
        path=out_path,
        filename=f"converted_{safe_stem}.{fmt}",
        media_type="application/octet-stream",
    )


@router.post("/video")
async def convert_video_endpoint(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    target_format: str = Form(...),  # mp4, mkv, avi, webm, mov
    resolution: Optional[str] = Form("original"),  # original, 1080p, 720p, 480p
):
    """Transcodes uploaded video into target container and resolution."""
    if not isinstance(target_format, str):
        target_format = str(getattr(target_format, "default", target_format))
    if not isinstance(resolution, str):
        resolution = str(getattr(resolution, "default", "original") or "original")

    fmt = validate_allowlist(target_format.lstrip("."), ALLOWED_VIDEO_FORMATS, "target_format")
    if resolution:
        resolution = validate_allowlist(resolution, ALLOWED_VIDEO_RESOLUTIONS, "resolution")

    session_id, session_dir = sandbox_manager.create_session()

    src_ext = Path(file.filename).suffix if file.filename else ".bin"
    src_path = session_dir / f"input{src_ext}"
    content = await file.read()
    if len(content) == 0:
        sandbox_manager.cleanup_session(session_id)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty")

    src_path.write_bytes(content)

    out_path = session_dir / f"converted.{fmt}"
    options = VideoTranscodeOptions(resolution=resolution)

    try:
        await ffmpeg_service.transcode_video(src_path, fmt, options, out_path)
    except Exception as e:
        sandbox_manager.cleanup_session(session_id)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Video conversion failed: {e}")

    background_tasks.add_task(sandbox_manager.cleanup_session, session_id)
    safe_stem = sanitize_filename(Path(file.filename or "video").stem, "video")
    media_type = (
        "image/gif"
        if fmt == "gif"
        else ("audio/mpeg" if fmt == "mp3" else "application/octet-stream")
    )
    return FileResponse(
        path=out_path,
        filename=f"converted_{safe_stem}.{fmt}",
        media_type=media_type,
    )


@router.post("/images-to-pdf")
@router.post("/image-to-pdf")
async def convert_images_to_pdf_endpoint(
    background_tasks: BackgroundTasks,
    files: Optional[List[UploadFile]] = File(None),
    file: Optional[UploadFile] = File(None),
):
    """Combines one or more uploaded images into a multi-page PDF."""
    upload_list: List[UploadFile] = []
    if files:
        upload_list.extend(files)
    if file and file not in upload_list:
        upload_list.append(file)

    if not upload_list:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="At least one image is required")

    session_id, session_dir = sandbox_manager.create_session()
    saved_paths: List[Path] = []

    for i, f in enumerate(upload_list):
        ext = Path(f.filename).suffix if f.filename else ".png"
        fpath = session_dir / f"img_{i}{ext}"
        content = await f.read()
        if len(content) == 0:
            continue
        fpath.write_bytes(content)
        saved_paths.append(fpath)

    if not saved_paths:
        sandbox_manager.cleanup_session(session_id)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="All uploaded images were empty")

    pdf_out = session_dir / "converted_images.pdf"
    try:
        image_engine.convert_images_to_pdf(saved_paths, pdf_out)
    except Exception as e:
        sandbox_manager.cleanup_session(session_id)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Image to PDF conversion failed: {e}")

    background_tasks.add_task(sandbox_manager.cleanup_session, session_id)
    return FileResponse(
        path=pdf_out,
        filename="converted_images.pdf",
        media_type="application/pdf",
    )


@router.post("/pdf-to-images")
async def convert_pdf_to_images_endpoint(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    target_format: str = Form("png"),  # png, jpg, webp, svg
    dpi: int = Form(150),
):
    """Renders PDF pages into raster/vector images (returns single image or ZIP archive)."""
    fmt = validate_allowlist(target_format.lstrip("."), ALLOWED_IMAGE_FORMATS, "target_format")

    content = await file.read()
    if len(content) == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded PDF is empty")

    if not pdf_engine.validate_pdf_bytes(content):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File is not a valid PDF document")

    session_id, session_dir = sandbox_manager.create_session()
    src_pdf = session_dir / "input.pdf"
    src_pdf.write_bytes(content)

    out_file = session_dir / f"extracted.{fmt}"

    try:
        result_path = image_engine.convert_pdf_to_images(src_pdf, target_format=fmt, dpi=dpi, output_path=out_file)
    except Exception as e:
        sandbox_manager.cleanup_session(session_id)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"PDF to images failed: {e}")

    media_type = "application/zip" if result_path.name.endswith(".zip") else (
        "image/svg+xml" if fmt == "svg" else f"image/{fmt}"
    )

    safe_name = sanitize_filename(result_path.name, f"extracted.{fmt}")
    background_tasks.add_task(sandbox_manager.cleanup_session, session_id)
    return FileResponse(
        path=result_path,
        filename=safe_name,
        media_type=media_type,
    )


@router.post("/image")
async def convert_image_format_endpoint(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    target_format: str = Form(...),  # png, jpg, webp, svg
):
    """Converts a single image across raster formats."""
    fmt = validate_allowlist(target_format.lstrip("."), ALLOWED_IMAGE_FORMATS, "target_format")

    session_id, session_dir = sandbox_manager.create_session()

    src_ext = Path(file.filename).suffix if file.filename else ".png"
    src_path = session_dir / f"input{src_ext}"
    content = await file.read()
    if len(content) == 0:
        sandbox_manager.cleanup_session(session_id)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded image is empty")

    src_path.write_bytes(content)

    out_path = session_dir / f"converted.{fmt}"
    try:
        image_engine.convert_image_format(src_path, fmt, out_path)
    except Exception as e:
        sandbox_manager.cleanup_session(session_id)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Image conversion failed: {e}")

    background_tasks.add_task(sandbox_manager.cleanup_session, session_id)
    safe_stem = sanitize_filename(Path(file.filename or "image").stem, "image")
    return FileResponse(
        path=out_path,
        filename=f"converted_{safe_stem}.{fmt}",
        media_type=f"image/{fmt}",
    )


@router.post("/file")
@router.post("/media/convert")
async def universal_media_convert_endpoint(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    target_format: str = Form(...),
):
    """Unified file converter for audio, video, images, or documents."""
    fmt = target_format.lower().lstrip(".")
    if fmt in ALLOWED_AUDIO_FORMATS:
        return await convert_audio_endpoint(background_tasks, file=file, target_format=fmt, bitrate="192k", sample_rate=None)
    if fmt in ALLOWED_VIDEO_FORMATS:
        return await convert_video_endpoint(background_tasks, file=file, target_format=fmt, resolution="original")
    if fmt in ALLOWED_IMAGE_FORMATS:
        return await convert_image_format_endpoint(background_tasks, file=file, target_format=fmt)
    if fmt == "pdf":
        return await convert_images_to_pdf_endpoint(background_tasks, files=[file])
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=f"Unsupported target format: '{target_format}'",
    )
