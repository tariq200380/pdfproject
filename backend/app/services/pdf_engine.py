"""PDF Core Engine: validation, metadata extraction, and thumbnail generation using PyMuPDF."""

import logging
from pathlib import Path
from typing import Any, Dict, List, Optional
import pymupdf
from pydantic import BaseModel, Field

logger = logging.getLogger("omnistudio.pdf_engine")


class PageInfo(BaseModel):
    page_index: int
    page_number: int
    width: float
    height: float
    rotation: int


class PDFMetadata(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    subject: Optional[str] = None
    creator: Optional[str] = None
    producer: Optional[str] = None
    creation_date: Optional[str] = None
    modification_date: Optional[str] = None
    page_count: int
    is_encrypted: bool
    file_size_bytes: int
    pages: List[PageInfo] = Field(default_factory=list)


class PDFEngine:
    """Core engine for validating, inspecting, and rendering PDF documents."""

    @staticmethod
    def validate_pdf_bytes(data: bytes) -> bool:
        """Validates that bytes contain a valid PDF signature."""
        if len(data) < 5:
            return False
        # Search first 1024 bytes for %PDF-
        header = data[:1024]
        return b"%PDF-" in header

    @classmethod
    def open_document(cls, file_input: str | Path | bytes) -> pymupdf.Document:
        """Opens a PDF document from file path or bytes, raising ValueError on failure."""
        try:
            if isinstance(file_input, bytes):
                if not cls.validate_pdf_bytes(file_input):
                    raise ValueError("File does not start with valid PDF magic bytes (%PDF-)")
                return pymupdf.open(stream=file_input, filetype="pdf")
            
            path = Path(file_input)
            if not path.exists():
                raise FileNotFoundError(f"PDF file not found: {path}")
            
            with open(path, "rb") as f:
                header = f.read(1024)
            if b"%PDF-" not in header:
                raise ValueError("File does not start with valid PDF magic bytes (%PDF-)")
                
            return pymupdf.open(str(path))
        except Exception as e:
            if isinstance(e, (ValueError, FileNotFoundError)):
                raise
            raise ValueError(f"Failed to parse PDF document: {e}") from e

    @classmethod
    def extract_metadata(cls, file_input: str | Path | bytes) -> PDFMetadata:
        """Extracts comprehensive document and page-level metadata."""
        file_size = len(file_input) if isinstance(file_input, bytes) else Path(file_input).stat().st_size
        doc = cls.open_document(file_input)
        try:
            raw_meta = doc.metadata or {}
            is_encrypted = doc.is_encrypted

            pages: List[PageInfo] = []
            for i, page in enumerate(doc):
                rect = page.rect
                pages.append(
                    PageInfo(
                        page_index=i,
                        page_number=i + 1,
                        width=round(rect.width, 2),
                        height=round(rect.height, 2),
                        rotation=page.rotation,
                    )
                )

            return PDFMetadata(
                title=raw_meta.get("title") or None,
                author=raw_meta.get("author") or None,
                subject=raw_meta.get("subject") or None,
                creator=raw_meta.get("creator") or None,
                producer=raw_meta.get("producer") or None,
                creation_date=raw_meta.get("creationDate") or None,
                modification_date=raw_meta.get("modDate") or None,
                page_count=len(doc),
                is_encrypted=is_encrypted,
                file_size_bytes=file_size,
                pages=pages,
            )
        finally:
            doc.close()

    @classmethod
    def render_page_thumbnail(
        cls,
        file_input: str | Path | bytes,
        page_index: int = 0,
        dpi: int = 150,
    ) -> bytes:
        """Renders a single page as a high-fidelity PNG byte stream."""
        doc = cls.open_document(file_input)
        try:
            if page_index < 0 or page_index >= len(doc):
                raise IndexError(f"Page index {page_index} out of bounds (document has {len(doc)} pages)")
            page = doc[page_index]
            pix = page.get_pixmap(dpi=dpi)
            return pix.tobytes("png")
        finally:
            doc.close()


pdf_engine = PDFEngine()
