"""REST API routes for all 23 Adobe Acrobat Online converters."""

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
from backend.app.core.sanitizer import sanitize_filename
from backend.app.services.universal_converters import universal_converters

logger = logging.getLogger("creedtech.routes_converters")
router = APIRouter(prefix="/convert", tags=["Adobe Acrobat 23 Converters"])


def _stream_and_cleanup(
    output_path: Path,
    download_filename: str,
    media_type: str,
    session_id: str,
    background_tasks: BackgroundTasks,
) -> FileResponse:
    """Helper to register session cleanup task and return FileResponse."""
    background_tasks.add_task(sandbox_manager.cleanup_session, session_id)
    return FileResponse(
        path=output_path,
        filename=sanitize_filename(download_filename, "converted_file"),
        media_type=media_type,
    )


# 1. PDF to Word
@router.post("/pdf-to-word")
async def pdf_to_word_endpoint(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
):
    """Converts uploaded PDF document to Microsoft Word (.docx)."""
    content = await file.read()
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    session_id, session_dir = sandbox_manager.create_session()
    src_path = session_dir / "input.pdf"
    src_path.write_bytes(content)
    out_path = session_dir / "document.docx"

    try:
        universal_converters.pdf_to_word(src_path, out_path)
    except Exception as e:
        sandbox_manager.cleanup_session(session_id)
        raise HTTPException(status_code=400, detail=f"PDF to Word conversion failed: {e}")

    stem = Path(file.filename or "document").stem
    return _stream_and_cleanup(
        out_path,
        f"{stem}.docx",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        session_id,
        background_tasks,
    )


# 2. Word to PDF
@router.post("/word-to-pdf")
async def word_to_pdf_endpoint(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
):
    """Converts uploaded Microsoft Word document (.docx) to PDF."""
    content = await file.read()
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    session_id, session_dir = sandbox_manager.create_session()
    src_path = session_dir / "input.docx"
    src_path.write_bytes(content)
    out_path = session_dir / "document.pdf"

    try:
        universal_converters.word_to_pdf(src_path, out_path)
    except Exception as e:
        sandbox_manager.cleanup_session(session_id)
        raise HTTPException(status_code=400, detail=f"Word to PDF conversion failed: {e}")

    stem = Path(file.filename or "document").stem
    return _stream_and_cleanup(out_path, f"{stem}.pdf", "application/pdf", session_id, background_tasks)


# 3. PDF to Excel
@router.post("/pdf-to-excel")
async def pdf_to_excel_endpoint(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
):
    """Converts uploaded PDF document to Microsoft Excel (.xlsx)."""
    content = await file.read()
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    session_id, session_dir = sandbox_manager.create_session()
    src_path = session_dir / "input.pdf"
    src_path.write_bytes(content)
    out_path = session_dir / "spreadsheet.xlsx"

    try:
        universal_converters.pdf_to_excel(src_path, out_path)
    except Exception as e:
        sandbox_manager.cleanup_session(session_id)
        raise HTTPException(status_code=400, detail=f"PDF to Excel conversion failed: {e}")

    stem = Path(file.filename or "spreadsheet").stem
    return _stream_and_cleanup(
        out_path,
        f"{stem}.xlsx",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        session_id,
        background_tasks,
    )


# 4. Excel to PDF
@router.post("/excel-to-pdf")
async def excel_to_pdf_endpoint(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
):
    """Converts uploaded Excel spreadsheet (.xlsx) to PDF."""
    content = await file.read()
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    session_id, session_dir = sandbox_manager.create_session()
    src_path = session_dir / "input.xlsx"
    src_path.write_bytes(content)
    out_path = session_dir / "spreadsheet.pdf"

    try:
        universal_converters.excel_to_pdf(src_path, out_path)
    except Exception as e:
        sandbox_manager.cleanup_session(session_id)
        raise HTTPException(status_code=400, detail=f"Excel to PDF conversion failed: {e}")

    stem = Path(file.filename or "spreadsheet").stem
    return _stream_and_cleanup(out_path, f"{stem}.pdf", "application/pdf", session_id, background_tasks)


# 5. PDF to PowerPoint
@router.post("/pdf-to-ppt")
async def pdf_to_ppt_endpoint(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
):
    """Converts uploaded PDF pages into PowerPoint slide presentation (.pptx)."""
    content = await file.read()
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    session_id, session_dir = sandbox_manager.create_session()
    src_path = session_dir / "input.pdf"
    src_path.write_bytes(content)
    out_path = session_dir / "presentation.pptx"

    try:
        universal_converters.pdf_to_ppt(src_path, out_path)
    except Exception as e:
        sandbox_manager.cleanup_session(session_id)
        raise HTTPException(status_code=400, detail=f"PDF to PPT conversion failed: {e}")

    stem = Path(file.filename or "presentation").stem
    return _stream_and_cleanup(
        out_path,
        f"{stem}.pptx",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        session_id,
        background_tasks,
    )


# 6. PowerPoint to PDF
@router.post("/ppt-to-pdf")
async def ppt_to_pdf_endpoint(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
):
    """Converts PowerPoint presentation (.pptx) to PDF."""
    content = await file.read()
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    session_id, session_dir = sandbox_manager.create_session()
    src_path = session_dir / "input.pptx"
    src_path.write_bytes(content)
    out_path = session_dir / "presentation.pdf"

    try:
        universal_converters.ppt_to_pdf(src_path, out_path)
    except Exception as e:
        sandbox_manager.cleanup_session(session_id)
        raise HTTPException(status_code=400, detail=f"PPT to PDF conversion failed: {e}")

    stem = Path(file.filename or "presentation").stem
    return _stream_and_cleanup(out_path, f"{stem}.pdf", "application/pdf", session_id, background_tasks)


# 7. PDF to JPG
@router.post("/pdf-to-jpg")
async def pdf_to_jpg_endpoint(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
):
    """Converts PDF document to JPG images (packaged as ZIP if multipage)."""
    content = await file.read()
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    session_id, session_dir = sandbox_manager.create_session()
    src_path = session_dir / "input.pdf"
    src_path.write_bytes(content)
    out_target = session_dir / "converted.jpg"

    try:
        result_path = universal_converters.pdf_to_jpg(src_path, out_target)
    except Exception as e:
        sandbox_manager.cleanup_session(session_id)
        raise HTTPException(status_code=400, detail=f"PDF to JPG conversion failed: {e}")

    stem = Path(file.filename or "document").stem
    media_type = "application/zip" if result_path.suffix == ".zip" else "image/jpeg"
    ext = result_path.suffix
    return _stream_and_cleanup(result_path, f"{stem}{ext}", media_type, session_id, background_tasks)


# 8. JPG to PDF
@router.post("/jpg-to-pdf")
async def jpg_to_pdf_endpoint(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
):
    """Converts JPG image to a standard PDF document."""
    content = await file.read()
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    session_id, session_dir = sandbox_manager.create_session()
    src_path = session_dir / "input.jpg"
    src_path.write_bytes(content)
    out_path = session_dir / "converted.pdf"

    try:
        universal_converters.jpg_to_pdf(src_path, out_path)
    except Exception as e:
        sandbox_manager.cleanup_session(session_id)
        raise HTTPException(status_code=400, detail=f"JPG to PDF conversion failed: {e}")

    stem = Path(file.filename or "image").stem
    return _stream_and_cleanup(out_path, f"{stem}.pdf", "application/pdf", session_id, background_tasks)


# 9. PDF to PNG
@router.post("/pdf-to-png")
async def pdf_to_png_endpoint(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
):
    """Converts PDF document to PNG images (packaged as ZIP if multipage)."""
    content = await file.read()
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    session_id, session_dir = sandbox_manager.create_session()
    src_path = session_dir / "input.pdf"
    src_path.write_bytes(content)
    out_target = session_dir / "converted.png"

    try:
        result_path = universal_converters.pdf_to_png(src_path, out_target)
    except Exception as e:
        sandbox_manager.cleanup_session(session_id)
        raise HTTPException(status_code=400, detail=f"PDF to PNG conversion failed: {e}")

    stem = Path(file.filename or "document").stem
    media_type = "application/zip" if result_path.suffix == ".zip" else "image/png"
    ext = result_path.suffix
    return _stream_and_cleanup(result_path, f"{stem}{ext}", media_type, session_id, background_tasks)


# 10. PNG to PDF
@router.post("/png-to-pdf")
async def png_to_pdf_endpoint(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
):
    """Converts PNG image to PDF."""
    content = await file.read()
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    session_id, session_dir = sandbox_manager.create_session()
    src_path = session_dir / "input.png"
    src_path.write_bytes(content)
    out_path = session_dir / "converted.pdf"

    try:
        universal_converters.png_to_pdf(src_path, out_path)
    except Exception as e:
        sandbox_manager.cleanup_session(session_id)
        raise HTTPException(status_code=400, detail=f"PNG to PDF conversion failed: {e}")

    stem = Path(file.filename or "image").stem
    return _stream_and_cleanup(out_path, f"{stem}.pdf", "application/pdf", session_id, background_tasks)


# 13. Image to PDF (Multi-format image combiner)
@router.post("/image-to-pdf")
async def image_to_pdf_endpoint(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...),
):
    """Combines one or multiple images into a multi-page PDF."""
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")

    session_id, session_dir = sandbox_manager.create_session()
    saved_paths = []
    for i, file in enumerate(files):
        content = await file.read()
        if len(content) == 0:
            continue
        p = session_dir / f"img_{i}_{sanitize_filename(file.filename or f'img_{i}.png')}"
        p.write_bytes(content)
        saved_paths.append(p)

    if not saved_paths:
        sandbox_manager.cleanup_session(session_id)
        raise HTTPException(status_code=400, detail="All uploaded files were empty")

    out_path = session_dir / "combined_images.pdf"
    try:
        universal_converters.image_to_pdf(saved_paths, out_path)
    except Exception as e:
        sandbox_manager.cleanup_session(session_id)
        raise HTTPException(status_code=400, detail=f"Image to PDF conversion failed: {e}")

    return _stream_and_cleanup(out_path, "combined_images.pdf", "application/pdf", session_id, background_tasks)


# 7. Text (.txt) to PDF
@router.post("/text-to-pdf")
async def text_to_pdf_endpoint(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
):
    """Converts plain text file to PDF."""
    content = await file.read()
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    session_id, session_dir = sandbox_manager.create_session()
    src_path = session_dir / "input.txt"
    src_path.write_bytes(content)
    out_path = session_dir / "document.pdf"

    try:
        universal_converters.text_to_pdf(src_path, out_path)
    except Exception as e:
        sandbox_manager.cleanup_session(session_id)
        raise HTTPException(status_code=400, detail=f"Text to PDF conversion failed: {e}")

    stem = Path(file.filename or "document").stem
    return _stream_and_cleanup(out_path, f"{stem}.pdf", "application/pdf", session_id, background_tasks)


# 8. RTF to PDF
@router.post("/rtf-to-pdf")
async def rtf_to_pdf_endpoint(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
):
    """Converts Rich Text Format (.rtf) to PDF."""
    content = await file.read()
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    session_id, session_dir = sandbox_manager.create_session()
    src_path = session_dir / "input.rtf"
    src_path.write_bytes(content)
    out_path = session_dir / "document.pdf"

    try:
        universal_converters.rtf_to_pdf(src_path, out_path)
    except Exception as e:
        sandbox_manager.cleanup_session(session_id)
        raise HTTPException(status_code=400, detail=f"RTF to PDF conversion failed: {e}")

    stem = Path(file.filename or "document").stem
    return _stream_and_cleanup(out_path, f"{stem}.pdf", "application/pdf", session_id, background_tasks)


# 9. HEIC to PDF
@router.post("/heic-to-pdf")
async def heic_to_pdf_endpoint(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
):
    """Converts Apple HEIC photo format to PDF."""
    content = await file.read()
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    session_id, session_dir = sandbox_manager.create_session()
    src_path = session_dir / "input.heic"
    src_path.write_bytes(content)
    out_path = session_dir / "photo.pdf"

    try:
        universal_converters.heic_to_pdf(src_path, out_path)
    except Exception as e:
        sandbox_manager.cleanup_session(session_id)
        raise HTTPException(status_code=400, detail=f"HEIC to PDF conversion failed: {e}")

    stem = Path(file.filename or "photo").stem
    return _stream_and_cleanup(out_path, f"{stem}.pdf", "application/pdf", session_id, background_tasks)


# 10. TIFF to PDF
@router.post("/tiff-to-pdf")
async def tiff_to_pdf_endpoint(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
):
    """Converts TIFF multi-frame image to multi-page PDF."""
    content = await file.read()
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    session_id, session_dir = sandbox_manager.create_session()
    src_path = session_dir / "input.tiff"
    src_path.write_bytes(content)
    out_path = session_dir / "document.pdf"

    try:
        universal_converters.tiff_to_pdf(src_path, out_path)
    except Exception as e:
        sandbox_manager.cleanup_session(session_id)
        raise HTTPException(status_code=400, detail=f"TIFF to PDF conversion failed: {e}")

    stem = Path(file.filename or "document").stem
    return _stream_and_cleanup(out_path, f"{stem}.pdf", "application/pdf", session_id, background_tasks)


# 11. BMP to PDF
@router.post("/bmp-to-pdf")
async def bmp_to_pdf_endpoint(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
):
    """Converts Bitmap (.bmp) image to PDF."""
    content = await file.read()
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    session_id, session_dir = sandbox_manager.create_session()
    src_path = session_dir / "input.bmp"
    src_path.write_bytes(content)
    out_path = session_dir / "image.pdf"

    try:
        universal_converters.bmp_to_pdf(src_path, out_path)
    except Exception as e:
        sandbox_manager.cleanup_session(session_id)
        raise HTTPException(status_code=400, detail=f"BMP to PDF conversion failed: {e}")

    stem = Path(file.filename or "image").stem
    return _stream_and_cleanup(out_path, f"{stem}.pdf", "application/pdf", session_id, background_tasks)


# 12. GIF to PDF
@router.post("/gif-to-pdf")
async def gif_to_pdf_endpoint(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
):
    """Converts GIF image frames to PDF."""
    content = await file.read()
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    session_id, session_dir = sandbox_manager.create_session()
    src_path = session_dir / "input.gif"
    src_path.write_bytes(content)
    out_path = session_dir / "animation.pdf"

    try:
        universal_converters.gif_to_pdf(src_path, out_path)
    except Exception as e:
        sandbox_manager.cleanup_session(session_id)
        raise HTTPException(status_code=400, detail=f"GIF to PDF conversion failed: {e}")

    stem = Path(file.filename or "animation").stem
    return _stream_and_cleanup(out_path, f"{stem}.pdf", "application/pdf", session_id, background_tasks)


# 13. PSD to PDF
@router.post("/psd-to-pdf")
async def psd_to_pdf_endpoint(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
):
    """Extracts composite from Photoshop (.psd) and converts to PDF."""
    content = await file.read()
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    session_id, session_dir = sandbox_manager.create_session()
    src_path = session_dir / "input.psd"
    src_path.write_bytes(content)
    out_path = session_dir / "design.pdf"

    try:
        universal_converters.psd_to_pdf(src_path, out_path)
    except Exception as e:
        sandbox_manager.cleanup_session(session_id)
        raise HTTPException(status_code=400, detail=f"PSD to PDF conversion failed: {e}")

    stem = Path(file.filename or "design").stem
    return _stream_and_cleanup(out_path, f"{stem}.pdf", "application/pdf", session_id, background_tasks)


# 14. AI to PDF
@router.post("/ai-to-pdf")
async def ai_to_pdf_endpoint(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
):
    """Converts Adobe Illustrator (.ai) vector artwork to PDF."""
    content = await file.read()
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    session_id, session_dir = sandbox_manager.create_session()
    src_path = session_dir / "input.ai"
    src_path.write_bytes(content)
    out_path = session_dir / "vector.pdf"

    try:
        universal_converters.ai_to_pdf(src_path, out_path)
    except Exception as e:
        sandbox_manager.cleanup_session(session_id)
        raise HTTPException(status_code=400, detail=f"AI to PDF conversion failed: {e}")

    stem = Path(file.filename or "vector").stem
    return _stream_and_cleanup(out_path, f"{stem}.pdf", "application/pdf", session_id, background_tasks)


# 15. INDD to PDF
@router.post("/indd-to-pdf")
async def indd_to_pdf_endpoint(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
):
    """Extracts embedded preview from Adobe InDesign (.indd / .idml) to PDF."""
    content = await file.read()
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    session_id, session_dir = sandbox_manager.create_session()
    ext = Path(file.filename or "file.indd").suffix or ".indd"
    src_path = session_dir / f"input{ext}"
    src_path.write_bytes(content)
    out_path = session_dir / "publication.pdf"

    try:
        universal_converters.indd_to_pdf(src_path, out_path)
    except Exception as e:
        sandbox_manager.cleanup_session(session_id)
        raise HTTPException(status_code=400, detail=f"INDD to PDF conversion failed: {e}")

    stem = Path(file.filename or "publication").stem
    return _stream_and_cleanup(out_path, f"{stem}.pdf", "application/pdf", session_id, background_tasks)


# 16. Smart PDF Converter Router
@router.post("/smart-pdf")
async def smart_pdf_converter_endpoint(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
):
    """Auto-detects format of uploaded file (Word, Excel, PPT, Image, etc.) and converts to PDF."""
    content = await file.read()
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    session_id, session_dir = sandbox_manager.create_session()
    ext = Path(file.filename or "input.bin").suffix
    src_path = session_dir / f"input{ext}"
    src_path.write_bytes(content)
    out_path = session_dir / "converted.pdf"

    try:
        universal_converters.smart_convert_to_pdf(src_path, out_path)
    except Exception as e:
        sandbox_manager.cleanup_session(session_id)
        raise HTTPException(status_code=400, detail=f"Smart PDF conversion failed: {e}")

    stem = Path(file.filename or "converted").stem
    return _stream_and_cleanup(out_path, f"{stem}.pdf", "application/pdf", session_id, background_tasks)


# 17. Universal File Converter Router
@router.post("/universal")
async def universal_file_converter_endpoint(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    target_format: str = Form(...),
):
    """Converts source file to requested target extension."""
    content = await file.read()
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    session_id, session_dir = sandbox_manager.create_session()
    src_ext = Path(file.filename or "input.bin").suffix
    src_path = session_dir / f"input{src_ext}"
    src_path.write_bytes(content)

    clean_tgt = target_format.lower().lstrip(".")
    out_path = session_dir / f"converted.{clean_tgt}"

    try:
        result_path = universal_converters.universal_file_converter(src_path, out_path, clean_tgt)
    except Exception as e:
        sandbox_manager.cleanup_session(session_id)
        raise HTTPException(status_code=400, detail=f"Universal conversion failed: {e}")

    stem = Path(file.filename or "converted").stem
    out_ext = result_path.suffix
    return _stream_and_cleanup(result_path, f"{stem}{out_ext}", "application/octet-stream", session_id, background_tasks)


# 18. OCR PDF (Searchable Text Overlay)
@router.post("/ocr-pdf")
async def ocr_pdf_endpoint(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
):
    """Processes PDF and generates searchable OCR text overlay."""
    content = await file.read()
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    session_id, session_dir = sandbox_manager.create_session()
    src_path = session_dir / "input.pdf"
    src_path.write_bytes(content)
    out_path = session_dir / "ocr_searchable.pdf"

    try:
        universal_converters.ocr_pdf(src_path, out_path)
    except Exception as e:
        sandbox_manager.cleanup_session(session_id)
        raise HTTPException(status_code=400, detail=f"OCR PDF conversion failed: {e}")

    stem = Path(file.filename or "document").stem
    return _stream_and_cleanup(out_path, f"{stem}_searchable.pdf", "application/pdf", session_id, background_tasks)
