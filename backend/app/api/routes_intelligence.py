"""REST API routes for Document Intelligence suite:
- /summarize: Local extractive document summarization.
- /translate: In-memory structure-preserving translation.
- /to-markdown: High-fidelity document to Markdown conversion.
"""

import asyncio
import logging
from pathlib import Path
from typing import Optional, List
from fastapi import (
    APIRouter,
    BackgroundTasks,
    File,
    Form,
    HTTPException,
    UploadFile,
    status,
)
from pydantic import BaseModel

from backend.app.core.sandbox import sandbox_manager
from backend.app.core.sanitizer import sanitize_filename
from backend.app.services.document_intelligence_service import (
    document_intelligence_service,
    SUPPORTED_LANGUAGES,
)

logger = logging.getLogger("creedtech.routes_intelligence")
router = APIRouter(prefix="/intelligence", tags=["Document Intelligence"])


class SummaryResponse(BaseModel):
    status: str = "success"
    summary: str
    bullets: List[str]
    mode: str
    sentence_count: int
    original_word_count: int
    summary_word_count: int
    compression_ratio: float
    filename: Optional[str] = None


class TranslationResponse(BaseModel):
    status: str = "success"
    translated_text: str
    source_lang: str
    target_lang: str
    target_lang_name: str
    is_rtl: bool = False
    char_count: int
    word_count: int
    filename: Optional[str] = None


class MarkdownResponse(BaseModel):
    status: str = "success"
    markdown: str
    word_count: int
    heading_count: int
    table_count: int
    filename: Optional[str] = None


@router.post("/summarize", response_model=SummaryResponse)
async def summarize_document_endpoint(
    background_tasks: BackgroundTasks,
    file: Optional[UploadFile] = File(None),
    text: Optional[str] = Form(None),
    mode: str = Form("bullets"),  # "bullets", "executive", "digest"
    sentences: Optional[int] = Form(None),
    password: Optional[str] = Form(None),
):
    """Summarizes document or text using local extractive sentence ranking."""
    content_text = ""
    filename = None

    if file and file.filename:
        session_id, session_dir = sandbox_manager.create_session()
        background_tasks.add_task(sandbox_manager.cleanup_session, session_id)
        filename = sanitize_filename(file.filename, "document")
        file_path = session_dir / filename
        data = await file.read()
        if len(data) == 0:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty")
        file_path.write_bytes(data)

        try:
            extracted = await asyncio.to_thread(
                document_intelligence_service.extract_text,
                file_path,
                password=password,
            )
            content_text = extracted["text"]
        except ValueError as ve:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
        except Exception as e:
            logger.error(f"Text extraction failed: {e}", exc_info=True)
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    elif text and text.strip():
        content_text = text.strip()
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide an uploaded document (PDF, DOCX, TXT) or raw text.",
        )

    if not content_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No readable text found in document. This file may be a scanned image or empty. Please upload a document with selectable text.",
        )

    try:
        result = await asyncio.to_thread(
            document_intelligence_service.summarize,
            content_text,
            mode=mode,
            num_sentences=sentences,
        )
    except Exception as e:
        logger.error(f"Summarization processing error: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Summarization failed: {str(e)}")

    return SummaryResponse(
        status="success",
        summary=result["summary"],
        bullets=result["bullets"],
        mode=result["mode"],
        sentence_count=result["sentence_count"],
        original_word_count=result["original_word_count"],
        summary_word_count=result["summary_word_count"],
        compression_ratio=result["compression_ratio"],
        filename=filename,
    )


@router.post("/translate", response_model=TranslationResponse)
async def translate_document_endpoint(
    background_tasks: BackgroundTasks,
    file: Optional[UploadFile] = File(None),
    text: Optional[str] = Form(None),
    target_lang: str = Form("ur"),  # ur, ar, es, fr, de, zh-CN, en
    source_lang: str = Form("auto"),
    password: Optional[str] = Form(None),
):
    """Translates document text in-memory preserving structure and paragraphs."""
    content_text = ""
    filename = None

    if file and file.filename:
        session_id, session_dir = sandbox_manager.create_session()
        background_tasks.add_task(sandbox_manager.cleanup_session, session_id)
        filename = sanitize_filename(file.filename, "document")
        file_path = session_dir / filename
        data = await file.read()
        if len(data) == 0:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty")
        file_path.write_bytes(data)

        try:
            extracted = await asyncio.to_thread(
                document_intelligence_service.extract_text,
                file_path,
                password=password,
            )
            content_text = extracted["text"]
        except ValueError as ve:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
        except Exception as e:
            logger.error(f"Text extraction failed: {e}", exc_info=True)
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    elif text and text.strip():
        content_text = text.strip()
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide an uploaded document (PDF, DOCX, TXT) or raw text.",
        )

    if not content_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No readable text found in document. This file may be a scanned image or empty. Please upload a document with selectable text.",
        )

    try:
        result = await asyncio.to_thread(
            document_intelligence_service.translate,
            content_text,
            target_lang=target_lang,
            source_lang=source_lang,
        )
    except Exception as e:
        logger.error(f"Translation processing error: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Translation failed: {str(e)}")

    return TranslationResponse(
        status="success",
        translated_text=result["translated_text"],
        source_lang=result["source_lang"],
        target_lang=result["target_lang"],
        target_lang_name=result["target_lang_name"],
        is_rtl=result.get("is_rtl", False),
        char_count=result["char_count"],
        word_count=result["word_count"],
        filename=filename,
    )


@router.post("/to-markdown", response_model=MarkdownResponse)
async def convert_to_markdown_endpoint(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    password: Optional[str] = Form(None),
):
    """Converts PDF or document directly to clean, syntax-structured Markdown."""
    if not file or not file.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Please upload a valid document file.")

    session_id, session_dir = sandbox_manager.create_session()
    background_tasks.add_task(sandbox_manager.cleanup_session, session_id)

    filename = sanitize_filename(file.filename, "document")
    file_path = session_dir / filename
    data = await file.read()
    if len(data) == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded document is empty")
    file_path.write_bytes(data)

    try:
        result = await asyncio.to_thread(
            document_intelligence_service.to_markdown,
            file_path,
            password=password,
        )
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        logger.error(f"Markdown extraction error: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Markdown extraction failed: {str(e)}")

    return MarkdownResponse(
        status="success",
        markdown=result["markdown"],
        word_count=result["word_count"],
        heading_count=result["heading_count"],
        table_count=result["table_count"],
        filename=filename,
    )
