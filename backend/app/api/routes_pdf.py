"""PDF REST API routes for inspection, thumbnails, in-place editing, and operations."""

import json
import logging
from pathlib import Path
from typing import List, Optional
import pymupdf
from fastapi import (
    APIRouter,
    BackgroundTasks,
    File,
    Form,
    HTTPException,
    Response,
    UploadFile,
    status,
)
from fastapi.responses import FileResponse
from pydantic import BaseModel

from backend.app.core.sandbox import sandbox_manager
from backend.app.services.in_place_editor import (
    in_place_editor,
    InPlaceTextReplacement,
    PageSpansResponse,
)
from backend.app.services.pdf_engine import PDFMetadata, pdf_engine
from backend.app.services.pdf_ops import pdf_ops

logger = logging.getLogger("omnistudio.routes_pdf")
router = APIRouter(prefix="/pdf", tags=["PDF Studio"])


class InspectResponse(BaseModel):
    session_id: str
    filename: str
    metadata: PDFMetadata


class EditTextRequest(BaseModel):
    session_id: str
    page_index: int
    span_id: str
    replacement_text: str
    font_size: Optional[float] = None
    color_hex: Optional[str] = None
    font_name: Optional[str] = None
    download_immediately: bool = False


@router.post("/inspect", response_model=InspectResponse)
async def inspect_pdf(file: UploadFile = File(...)):
    """Uploads and inspects a PDF document, establishing an ephemeral session."""
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file must have a .pdf extension",
        )

    content = await file.read()
    if not pdf_engine.validate_pdf_bytes(content):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File content does not have a valid PDF header (%PDF-)",
        )

    session_id, session_dir = sandbox_manager.create_session()
    doc_path = session_dir / "document.pdf"
    doc_path.write_bytes(content)

    try:
        metadata = pdf_engine.extract_metadata(doc_path)
    except Exception as e:
        sandbox_manager.cleanup_session(session_id)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed to extract PDF metadata: {e}",
        )

    return InspectResponse(
        session_id=session_id,
        filename=file.filename,
        metadata=metadata,
    )


@router.get("/thumbnail/{session_id}/{page_index}")
async def get_page_thumbnail(session_id: str, page_index: int, dpi: int = 150):
    """Renders a high-resolution PNG thumbnail for a given document page."""
    try:
        session_dir = sandbox_manager.get_session_dir(session_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    doc_path = session_dir / "document.pdf"
    if not doc_path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session document not found")

    try:
        png_bytes = pdf_engine.render_page_thumbnail(doc_path, page_index=page_index, dpi=dpi)
        return Response(content=png_bytes, media_type="image/png")
    except IndexError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/spans/{session_id}/{page_index}", response_model=PageSpansResponse)
async def get_page_spans(session_id: str, page_index: int):
    """Extracts all text spans on a page with exact typography and coordinates for in-place editing."""
    try:
        session_dir = sandbox_manager.get_session_dir(session_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    doc_path = session_dir / "document.pdf"
    if not doc_path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session document not found")

    doc = pymupdf.open(str(doc_path))
    try:
        return in_place_editor.extract_page_spans(doc, page_index=page_index)
    except IndexError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    finally:
        doc.close()


@router.post("/edit-text")
async def edit_text_in_place(payload: EditTextRequest, background_tasks: BackgroundTasks):
    """Seamlessly replaces text on a page matching original typography."""
    try:
        session_dir = sandbox_manager.get_session_dir(payload.session_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    doc_path = session_dir / "document.pdf"
    if not doc_path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session document not found")

    doc = pymupdf.open(str(doc_path))
    try:
        replacement = InPlaceTextReplacement(
            page_index=payload.page_index,
            span_id=payload.span_id,
            replacement_text=payload.replacement_text,
            font_size=payload.font_size,
            color_hex=payload.color_hex,
            font_name=payload.font_name,
        )
        in_place_editor.replace_text_in_place(doc, replacement)
        output_path = session_dir / "edited.pdf"
        doc.save(str(output_path))
    except (IndexError, ValueError) as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    finally:
        doc.close()

    if payload.download_immediately:
        background_tasks.add_task(sandbox_manager.cleanup_session, payload.session_id)
        return FileResponse(
            path=output_path,
            filename="document_edited.pdf",
            media_type="application/pdf",
        )

    # Overwrite working document so user can perform further edits
    output_path.replace(doc_path)
    return {
        "status": "success",
        "session_id": payload.session_id,
        "message": "Text replaced successfully in-place",
    }


@router.get("/download/{session_id}")
async def download_session_pdf(session_id: str, background_tasks: BackgroundTasks):
    """Downloads the final session document and automatically purges the ephemeral workspace."""
    try:
        session_dir = sandbox_manager.get_session_dir(session_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    doc_path = session_dir / "document.pdf"
    if not doc_path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session document not found")

    background_tasks.add_task(sandbox_manager.cleanup_session, session_id)
    return FileResponse(
        path=doc_path,
        filename="document_final.pdf",
        media_type="application/pdf",
    )


@router.post("/merge")
async def merge_pdfs_endpoint(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...),
):
    """Merges two or more uploaded PDFs in sequence and streams the combined document."""
    if len(files) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least 2 PDF files are required for merge operation",
        )

    session_id, session_dir = sandbox_manager.create_session()
    input_paths: List[Path] = []

    for i, file in enumerate(files):
        content = await file.read()
        if not pdf_engine.validate_pdf_bytes(content):
            sandbox_manager.cleanup_session(session_id)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File '{file.filename}' is not a valid PDF document",
            )
        fpath = session_dir / f"input_{i}.pdf"
        fpath.write_bytes(content)
        input_paths.append(fpath)

    merged_output = session_dir / "merged.pdf"
    try:
        pdf_ops.merge_pdfs(input_paths, merged_output)
    except Exception as e:
        sandbox_manager.cleanup_session(session_id)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Merge failed: {e}")

    background_tasks.add_task(sandbox_manager.cleanup_session, session_id)
    return FileResponse(
        path=merged_output,
        filename="merged_document.pdf",
        media_type="application/pdf",
    )


@router.post("/split")
async def split_pdf_endpoint(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    page_ranges: str = Form(...),
):
    """Splits a PDF by specified page ranges (e.g. '1-3, 5') and streams the extracted document."""
    content = await file.read()
    if not pdf_engine.validate_pdf_bytes(content):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is not a valid PDF document",
        )

    session_id, session_dir = sandbox_manager.create_session()
    src_path = session_dir / "input.pdf"
    src_path.write_bytes(content)
    split_output = session_dir / "split.pdf"

    try:
        pdf_ops.split_pdf(src_path, page_ranges, split_output)
    except (IndexError, ValueError) as e:
        sandbox_manager.cleanup_session(session_id)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        sandbox_manager.cleanup_session(session_id)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Split failed: {e}")

    background_tasks.add_task(sandbox_manager.cleanup_session, session_id)
    return FileResponse(
        path=split_output,
        filename="split_document.pdf",
        media_type="application/pdf",
    )


@router.post("/burst")
async def burst_pdf_endpoint(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
):
    """Splits every page of a PDF into individual files and packages them into a ZIP archive."""
    content = await file.read()
    if not pdf_engine.validate_pdf_bytes(content):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is not a valid PDF document",
        )

    session_id, session_dir = sandbox_manager.create_session()
    src_path = session_dir / "input.pdf"
    src_path.write_bytes(content)
    zip_output = session_dir / "burst_pages.zip"

    try:
        pdf_ops.burst_pdf(src_path, zip_output)
    except Exception as e:
        sandbox_manager.cleanup_session(session_id)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Burst failed: {e}")

    background_tasks.add_task(sandbox_manager.cleanup_session, session_id)
    return FileResponse(
        path=zip_output,
        filename="burst_pages.zip",
        media_type="application/zip",
    )


@router.post("/rotate")
async def rotate_pdf_endpoint(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    rotations_json: str = Form(...),  # e.g. '{"0": 90, "1": 180}'
):
    """Rotates specified pages and streams the resulting document."""
    content = await file.read()
    if not pdf_engine.validate_pdf_bytes(content):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is not a valid PDF document",
        )

    try:
        rotations_dict = {int(k): int(v) for k, v in json.loads(rotations_json).items()}
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="rotations_json must be valid JSON mapping integer page_index to rotation angle (e.g. {'0': 90})",
        )

    session_id, session_dir = sandbox_manager.create_session()
    src_path = session_dir / "input.pdf"
    src_path.write_bytes(content)
    rotated_output = session_dir / "rotated.pdf"

    try:
        pdf_ops.rotate_pages(src_path, rotations_dict, rotated_output)
    except Exception as e:
        sandbox_manager.cleanup_session(session_id)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Rotation failed: {e}")

    background_tasks.add_task(sandbox_manager.cleanup_session, session_id)
    return FileResponse(
        path=rotated_output,
        filename="rotated_document.pdf",
        media_type="application/pdf",
    )
