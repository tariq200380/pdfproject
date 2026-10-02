"""API Routes for Missing Creed Tech Studio PDF Suite Tools.
Endpoints:
- POST /api/pdf/scan-to-pdf
- POST /api/pdf/ocr
- POST /api/pdf/html-to-pdf
- POST /api/pdf/to-pdfa
- POST /api/pdf/crop
- POST /api/pdf/forms
- POST /api/pdf/unlock
- POST /api/pdf/redact
- POST /api/pdf/compare
"""

import json
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
from fastapi.responses import FileResponse, JSONResponse

from backend.app.core.sandbox import sandbox_manager
from backend.app.core.sanitizer import sanitize_filename
from backend.app.services.pdf_engine import pdf_engine
from backend.app.services.pdf_operations import pdf_operations
from backend.app.services.watermark_remover import watermark_remover

logger = logging.getLogger("omnistudio.routes_pdf_tools")
router = APIRouter(prefix="/pdf", tags=["PDF Advanced Tools"])


@router.post("/scan-to-pdf")
async def scan_to_pdf_endpoint(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...),
):
    """Combines captured scan images or photos into a unified multi-page PDF document."""
    if not files:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one image file is required",
        )

    session_id, session_dir = sandbox_manager.create_session()
    out_path = session_dir / "scanned_document.pdf"

    try:
        image_inputs = []
        for f in files:
            content = await f.read()
            if content:
                image_inputs.append(content)

        if not image_inputs:
            raise ValueError("All uploaded files were empty")

        pdf_operations.scan_to_pdf(image_inputs, out_path)
    except Exception as e:
        logger.error(f"Scan to PDF failed: {e}")
        sandbox_manager.cleanup_session(session_id)
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"success": False, "detail": f"Scan to PDF conversion failed: {str(e)}"},
        )

    background_tasks.add_task(sandbox_manager.cleanup_session, session_id)
    return FileResponse(
        path=out_path,
        filename="scanned_document.pdf",
        media_type="application/pdf",
    )


@router.post("/ocr")
async def ocr_pdf_endpoint(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    lang: str = Form("eng"),
    return_file: bool = Form(False),
):
    """Performs OCR and text extraction on PDF documents, generating a searchable text layer."""
    content = await file.read()
    if not pdf_engine.validate_pdf_bytes(content):
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"success": False, "detail": "Uploaded file is not a valid PDF"},
        )

    session_id, session_dir = sandbox_manager.create_session()
    src_path = session_dir / "input.pdf"
    src_path.write_bytes(content)
    out_path = session_dir / "ocr_searchable.pdf"

    try:
        result = pdf_operations.ocr_pdf(
            src_path,
            lang=lang,
            output_path=out_path if return_file else None,
        )
    except Exception as e:
        logger.error(f"OCR operation failed: {e}")
        sandbox_manager.cleanup_session(session_id)
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"success": False, "detail": f"OCR processing failed: {str(e)}"},
        )

    if return_file and out_path.exists():
        background_tasks.add_task(sandbox_manager.cleanup_session, session_id)
        stem = Path(file.filename or "document").stem
        return FileResponse(
            path=out_path,
            filename=f"{stem}_searchable.pdf",
            media_type="application/pdf",
        )

    sandbox_manager.cleanup_session(session_id)
    return JSONResponse(status_code=status.HTTP_200_OK, content=result)


@router.post("/html-to-pdf")
async def html_to_pdf_endpoint(
    background_tasks: BackgroundTasks,
    html_content: Optional[str] = Form(None),
    url: Optional[str] = Form(None),
):
    """Converts HTML markup or a URL directly into a high-fidelity PDF document."""
    if not html_content and not url:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"success": False, "detail": "Either html_content or url must be provided"},
        )

    session_id, session_dir = sandbox_manager.create_session()
    out_path = session_dir / "converted.pdf"

    try:
        pdf_operations.html_to_pdf(
            html_content=html_content,
            url=url,
            output_path=out_path,
        )
    except Exception as e:
        logger.error(f"HTML to PDF failed: {e}")
        sandbox_manager.cleanup_session(session_id)
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"success": False, "detail": f"HTML to PDF conversion failed: {str(e)}"},
        )

    background_tasks.add_task(sandbox_manager.cleanup_session, session_id)
    return FileResponse(
        path=out_path,
        filename="converted_webpage.pdf",
        media_type="application/pdf",
    )


@router.post("/to-pdfa")
async def to_pdfa_endpoint(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    conformance: str = Form("PDF/A-1b"),
):
    """Converts standard PDF to ISO 19005 compliant archival PDF."""
    content = await file.read()
    if not pdf_engine.validate_pdf_bytes(content):
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"success": False, "detail": "Uploaded file is not a valid PDF"},
        )

    session_id, session_dir = sandbox_manager.create_session()
    src_path = session_dir / "input.pdf"
    src_path.write_bytes(content)
    out_path = session_dir / "archival_pdfa.pdf"

    try:
        pdf_operations.to_pdfa(src_path, out_path, conformance=conformance)
    except Exception as e:
        logger.error(f"PDF/A conversion failed: {e}")
        sandbox_manager.cleanup_session(session_id)
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"success": False, "detail": f"PDF/A export failed: {str(e)}"},
        )

    background_tasks.add_task(sandbox_manager.cleanup_session, session_id)
    stem = Path(file.filename or "document").stem
    return FileResponse(
        path=out_path,
        filename=f"{stem}_pdfa.pdf",
        media_type="application/pdf",
    )


@router.post("/crop")
async def crop_pdf_endpoint(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    margin_percent: float = Form(5.0),
    box: Optional[str] = Form(None),
):
    """Trims margins and adjusts page bounding box dimensions across PDF pages."""
    content = await file.read()
    if not pdf_engine.validate_pdf_bytes(content):
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"success": False, "detail": "Uploaded file is not a valid PDF"},
        )

    session_id, session_dir = sandbox_manager.create_session()
    src_path = session_dir / "input.pdf"
    src_path.write_bytes(content)
    out_path = session_dir / "cropped.pdf"

    box_dict = None
    if box:
        try:
            box_dict = json.loads(box)
        except Exception:
            pass

    try:
        pdf_operations.crop_pdf(
            src_path,
            margin_percent=margin_percent,
            box=box_dict,
            output_path=out_path,
        )
    except Exception as e:
        logger.error(f"Cropping failed: {e}")
        sandbox_manager.cleanup_session(session_id)
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"success": False, "detail": f"Cropping failed: {str(e)}"},
        )

    background_tasks.add_task(sandbox_manager.cleanup_session, session_id)
    stem = Path(file.filename or "document").stem
    return FileResponse(
        path=out_path,
        filename=f"{stem}_cropped.pdf",
        media_type="application/pdf",
    )


@router.post("/forms")
async def pdf_forms_endpoint(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    field_data: Optional[str] = Form(None),
    flatten: bool = Form(False),
    return_file: bool = Form(False),
):
    """Inspects, populates, and flattens interactive AcroForm fields."""
    content = await file.read()
    if not pdf_engine.validate_pdf_bytes(content):
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"success": False, "detail": "Uploaded file is not a valid PDF"},
        )

    session_id, session_dir = sandbox_manager.create_session()
    src_path = session_dir / "input.pdf"
    src_path.write_bytes(content)
    out_path = session_dir / "forms_processed.pdf"

    parsed_data = None
    if field_data:
        try:
            parsed_data = json.loads(field_data)
        except Exception:
            pass

    try:
        result = pdf_operations.pdf_forms(
            src_path,
            field_data=parsed_data,
            flatten=flatten,
            output_path=out_path if (return_file or flatten or field_data) else None,
        )
    except Exception as e:
        logger.error(f"PDF forms processing failed: {e}")
        sandbox_manager.cleanup_session(session_id)
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"success": False, "detail": f"Form processing failed: {str(e)}"},
        )

    if (return_file or flatten or field_data) and out_path.exists():
        background_tasks.add_task(sandbox_manager.cleanup_session, session_id)
        stem = Path(file.filename or "document").stem
        return FileResponse(
            path=out_path,
            filename=f"{stem}_filled.pdf",
            media_type="application/pdf",
        )

    sandbox_manager.cleanup_session(session_id)
    return JSONResponse(status_code=status.HTTP_200_OK, content=result)


@router.post("/unlock")
async def unlock_pdf_endpoint(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    password: str = Form(...),
):
    """Decrypts and permanently removes password restrictions with valid credentials."""
    content = await file.read()
    if not pdf_engine.validate_pdf_bytes(content):
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"success": False, "detail": "Uploaded file is not a valid PDF"},
        )

    session_id, session_dir = sandbox_manager.create_session()
    src_path = session_dir / "input.pdf"
    src_path.write_bytes(content)
    out_path = session_dir / "unlocked.pdf"

    try:
        pdf_operations.unlock_pdf(src_path, password=password, output_path=out_path)
    except ValueError as val_err:
        sandbox_manager.cleanup_session(session_id)
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"success": False, "detail": str(val_err)},
        )
    except Exception as e:
        logger.error(f"Unlocking PDF failed: {e}")
        sandbox_manager.cleanup_session(session_id)
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"success": False, "detail": f"Unlocking failed: {str(e)}"},
        )

    background_tasks.add_task(sandbox_manager.cleanup_session, session_id)
    stem = Path(file.filename or "document").stem
    return FileResponse(
        path=out_path,
        filename=f"{stem}_unlocked.pdf",
        media_type="application/pdf",
    )


@router.post("/redact")
async def redact_pdf_endpoint(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    search_terms: Optional[str] = Form(None),
    coordinates: Optional[str] = Form(None),
):
    """Permanently masks selected text and coordinates with black-box redactions."""
    content = await file.read()
    if not pdf_engine.validate_pdf_bytes(content):
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"success": False, "detail": "Uploaded file is not a valid PDF"},
        )

    session_id, session_dir = sandbox_manager.create_session()
    src_path = session_dir / "input.pdf"
    src_path.write_bytes(content)
    out_path = session_dir / "redacted.pdf"

    terms_list = []
    if search_terms:
        try:
            parsed = json.loads(search_terms)
            if isinstance(parsed, list):
                terms_list = [str(x) for x in parsed]
            else:
                terms_list = [str(parsed)]
        except Exception:
            terms_list = [t.strip() for t in search_terms.split(",") if t.strip()]

    coords_list = None
    if coordinates:
        try:
            parsed_c = json.loads(coordinates)
            if isinstance(parsed_c, list):
                coords_list = parsed_c
        except Exception:
            pass

    try:
        pdf_operations.redact_pdf(
            src_path,
            search_terms=terms_list,
            coordinates=coords_list,
            output_path=out_path,
        )
    except Exception as e:
        logger.error(f"Redaction failed: {e}")
        sandbox_manager.cleanup_session(session_id)
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"success": False, "detail": f"Redaction failed: {str(e)}"},
        )

    background_tasks.add_task(sandbox_manager.cleanup_session, session_id)
    stem = Path(file.filename or "document").stem
    return FileResponse(
        path=out_path,
        filename=f"{stem}_redacted.pdf",
        media_type="application/pdf",
    )


@router.post("/compare")
async def compare_pdf_endpoint(
    background_tasks: BackgroundTasks,
    file1: UploadFile = File(...),
    file2: UploadFile = File(...),
    return_file: bool = Form(False),
):
    """Side-by-side textual and visual difference analysis between two PDFs."""
    content1 = await file1.read()
    content2 = await file2.read()

    if not pdf_engine.validate_pdf_bytes(content1) or not pdf_engine.validate_pdf_bytes(content2):
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"success": False, "detail": "Both uploaded files must be valid PDF documents"},
        )

    session_id, session_dir = sandbox_manager.create_session()
    path1 = session_dir / "file1.pdf"
    path2 = session_dir / "file2.pdf"
    path1.write_bytes(content1)
    path2.write_bytes(content2)
    out_path = session_dir / "comparison_diff_report.pdf"

    try:
        result = pdf_operations.compare_pdfs(
            path1,
            path2,
            output_path=out_path if return_file else None,
        )
    except Exception as e:
        logger.error(f"Comparison failed: {e}")
        sandbox_manager.cleanup_session(session_id)
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"success": False, "detail": f"Comparison failed: {str(e)}"},
        )

    if return_file and out_path.exists():
        background_tasks.add_task(sandbox_manager.cleanup_session, session_id)
        return FileResponse(
            path=out_path,
            filename="pdf_comparison_report.pdf",
            media_type="application/pdf",
        )

    sandbox_manager.cleanup_session(session_id)
    return JSONResponse(status_code=status.HTTP_200_OK, content=result)


@router.post("/remove-watermark")
async def remove_watermark_endpoint(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    watermark_text: Optional[str] = Form(None),
    position: Optional[str] = Form("bottom-right"),
    preset: Optional[str] = Form(None),
    aspect_ratio: Optional[str] = Form("auto"),
):
    """Removes watermarks from Videos, Images, PDF, Word, Excel, and PowerPoint files.
    
    Supports:
    - Videos (.mp4, .mov, .mkv, .webm, .avi): High-fidelity CRF 17-18 reconstruction,
      bit-for-bit lossless audio (-c:a copy), and TikTok, Instagram, YouTube Shorts,
      Facebook, Snapchat, WhatsApp presets across 16:9 and 9:16 aspect ratios.
    - Images (.png, .jpg, .jpeg, .webp, .bmp): Q99 inpainting via OpenCV Telea.
    - PDF (.pdf): Annotations, XObjects, and text redaction.
    - Office (.docx, .xlsx, .pptx): VML shapes, background pictures, and master layouts.
    """
    content = await file.read()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    safe_name = sanitize_filename(file.filename or "document.pdf")
    suffix = Path(safe_name).suffix.lower()
    allowed_suffixes = {
        ".pdf": "application/pdf",
        ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ".doc": "application/msword",
        ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ".xls": "application/vnd.ms-excel",
        ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        ".ppt": "application/vnd.ms-powerpoint",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".webp": "image/webp",
        ".bmp": "image/bmp",
        ".mp4": "video/mp4",
        ".mov": "video/quicktime",
        ".mkv": "video/x-matroska",
        ".webm": "video/webm",
        ".avi": "video/x-msvideo",
    }

    if suffix not in allowed_suffixes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported format '{suffix}'. Supported formats: Video (MP4, MOV, MKV, WEBM), Images (JPG, PNG, WEBP), PDF, Word, Excel, PowerPoint.",
        )

    session_id, session_dir = sandbox_manager.create_session()
    in_path = session_dir / f"input{suffix}"
    out_path = session_dir / f"cleaned{suffix}"
    in_path.write_bytes(content)

    try:
        watermark_remover.process_file(
            input_path=in_path,
            output_path=out_path,
            watermark_text=watermark_text,
            position=position or "bottom-right",
            preset=preset,
            aspect_ratio=aspect_ratio or "auto",
        )
    except Exception as e:
        logger.error(f"Watermark removal failed: {e}")
        sandbox_manager.cleanup_session(session_id)
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"success": False, "detail": f"Watermark removal failed: {str(e)}"},
        )

    background_tasks.add_task(sandbox_manager.cleanup_session, session_id)
    stem = Path(safe_name).stem
    media_type = allowed_suffixes.get(suffix, "application/octet-stream")
    return FileResponse(
        path=out_path,
        filename=f"{stem}_nowatermark{suffix}",
        media_type=media_type,
    )
