"""PDF Operations Service: Merge, Split/Burst, and Page Rotation."""

import re
import zipfile
import logging
from pathlib import Path
from typing import Dict, List, Union
import pymupdf
from backend.app.services.pdf_engine import pdf_engine

logger = logging.getLogger("omnistudio.pdf_ops")


class PDFOpsService:
    """Provides high-performance PDF manipulation services."""

    @staticmethod
    def parse_page_ranges(range_str: str, total_pages: int) -> List[int]:
        """Parses human-friendly page ranges (e.g. '1-3, 5') into 0-indexed list of integers."""
        if not range_str or not range_str.strip():
            raise ValueError("Page range string cannot be empty")

        selected_pages: set[int] = set()
        parts = [p.strip() for p in range_str.split(",") if p.strip()]

        for part in parts:
            if "-" in part:
                bounds = part.split("-")
                if len(bounds) != 2:
                    raise ValueError(f"Invalid range format: '{part}'")
                start_str, end_str = bounds[0].strip(), bounds[1].strip()
                if not start_str.isdigit() or not end_str.isdigit():
                    raise ValueError(f"Non-numeric range values: '{part}'")
                start, end = int(start_str), int(end_str)
                if start > end:
                    raise ValueError(f"Start page cannot exceed end page: '{part}'")
                for page_num in range(start, end + 1):
                    if 1 <= page_num <= total_pages:
                        selected_pages.add(page_num - 1)
                    else:
                        raise IndexError(f"Page number {page_num} out of range (1 to {total_pages})")
            else:
                if not part.isdigit():
                    raise ValueError(f"Non-numeric page number: '{part}'")
                page_num = int(part)
                if 1 <= page_num <= total_pages:
                    selected_pages.add(page_num - 1)
                else:
                    raise IndexError(f"Page number {page_num} out of range (1 to {total_pages})")

        if not selected_pages:
            raise ValueError("No valid pages were selected in range")

        return sorted(list(selected_pages))

    @classmethod
    def merge_pdfs(
        cls,
        inputs: List[Union[str, Path, bytes]],
        output_path: Union[str, Path],
    ) -> Path:
        """Merges multiple PDFs into a single document in sequential order."""
        if len(inputs) < 2:
            raise ValueError("At least 2 PDF inputs are required for merge")

        out_path = Path(output_path)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        merged_doc = pymupdf.open()

        try:
            for item in inputs:
                src_doc = pdf_engine.open_document(item)
                try:
                    merged_doc.insert_pdf(src_doc)
                finally:
                    src_doc.close()

            merged_doc.save(str(out_path))
            return out_path
        finally:
            merged_doc.close()

    @classmethod
    def split_pdf(
        cls,
        file_input: Union[str, Path, bytes],
        page_ranges: str,
        output_path: Union[str, Path],
    ) -> Path:
        """Extracts specified page ranges into a new PDF document."""
        out_path = Path(output_path)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        src_doc = pdf_engine.open_document(file_input)

        try:
            page_indices = cls.parse_page_ranges(page_ranges, len(src_doc))
            dest_doc = pymupdf.open()
            try:
                for idx in page_indices:
                    dest_doc.insert_pdf(src_doc, from_page=idx, to_page=idx)
                dest_doc.save(str(out_path))
                return out_path
            finally:
                dest_doc.close()
        finally:
            src_doc.close()

    @classmethod
    def burst_pdf(
        cls,
        file_input: Union[str, Path, bytes],
        output_zip_path: Union[str, Path],
    ) -> Path:
        """Splits every page into an individual PDF file and packages them into a ZIP archive."""
        zip_path = Path(output_zip_path)
        zip_path.parent.mkdir(parents=True, exist_ok=True)
        src_doc = pdf_engine.open_document(file_input)

        try:
            total_pages = len(src_doc)
            digits = len(str(total_pages))

            with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as zf:
                for i in range(total_pages):
                    page_doc = pymupdf.open()
                    try:
                        page_doc.insert_pdf(src_doc, from_page=i, to_page=i)
                        page_pdf_bytes = page_doc.tobytes()
                        page_filename = f"page_{str(i + 1).zfill(digits)}.pdf"
                        zf.writestr(page_filename, page_pdf_bytes)
                    finally:
                        page_doc.close()

            return zip_path
        finally:
            src_doc.close()

    @classmethod
    def rotate_pages(
        cls,
        file_input: Union[str, Path, bytes],
        rotations: Dict[int, int],  # page_index -> angle (e.g. {0: 90, 1: 180})
        output_path: Union[str, Path],
    ) -> Path:
        """Rotates specified pages by 90, 180, or 270 degrees and saves to output."""
        out_path = Path(output_path)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        doc = pdf_engine.open_document(file_input)

        try:
            for page_idx, angle in rotations.items():
                if 0 <= page_idx < len(doc):
                    current_rot = doc[page_idx].rotation
                    new_rot = (current_rot + angle) % 360
                    doc[page_idx].set_rotation(new_rot)

            doc.save(str(out_path))
            return out_path
        finally:
            doc.close()

    @classmethod
    def protect_pdf(
        cls,
        file_input: Union[str, Path, bytes],
        password: str,
        output_path: Union[str, Path],
    ) -> Path:
        """Encrypts PDF with AES-256 password protection."""
        out_path = Path(output_path)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        doc = pdf_engine.open_document(file_input)
        try:
            doc.save(
                str(out_path),
                encryption=pymupdf.PDF_ENCRYPT_AES_256,
                user_pw=password,
                owner_pw=password,
            )
            return out_path
        finally:
            doc.close()

    @classmethod
    def delete_pages(
        cls,
        file_input: Union[str, Path, bytes],
        page_indices: List[int],
        output_path: Union[str, Path],
    ) -> Path:
        """Deletes specified 0-indexed pages from the PDF."""
        out_path = Path(output_path)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        doc = pdf_engine.open_document(file_input)
        try:
            for p in sorted(page_indices, reverse=True):
                if 0 <= p < len(doc) and len(doc) > 1:
                    doc.delete_page(p)
            doc.save(str(out_path))
            return out_path
        finally:
            doc.close()

    @classmethod
    def crop_pdf(
        cls,
        file_input: Union[str, Path, bytes],
        margin_percent: float,
        output_path: Union[str, Path],
    ) -> Path:
        """Adjusts page visible boundary by applying a trim margin percentage."""
        out_path = Path(output_path)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        doc = pdf_engine.open_document(file_input)
        try:
            factor = max(0.01, min(0.35, margin_percent / 100.0))
            for page in doc:
                r = page.rect
                new_rect = pymupdf.Rect(
                    r.x0 + r.width * factor,
                    r.y0 + r.height * factor,
                    r.x1 - r.width * factor,
                    r.y1 - r.height * factor,
                )
                page.set_cropbox(new_rect)
            doc.save(str(out_path))
            return out_path
        finally:
            doc.close()

    @classmethod
    def number_pages(
        cls,
        file_input: Union[str, Path, bytes],
        format_str: str,
        output_path: Union[str, Path],
    ) -> Path:
        """Numbers PDF document pages with customized footer text."""
        out_path = Path(output_path)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        doc = pdf_engine.open_document(file_input)
        try:
            total = len(doc)
            for i, page in enumerate(doc):
                text = format_str.replace("{n}", str(i + 1)).replace("{total}", str(total))
                rect = page.rect
                page.insert_text(
                    pymupdf.Point(rect.width / 2 - 35, rect.height - 25),
                    text,
                    fontsize=10,
                    color=(0.3, 0.3, 0.3),
                )
            doc.save(str(out_path))
            return out_path
        finally:
            doc.close()

    @classmethod
    def reorder_pages(
        cls,
        file_input: Union[str, Path, bytes],
        order: List[int],
        output_path: Union[str, Path],
    ) -> Path:
        """Reorders document pages according to specified sequence."""
        out_path = Path(output_path)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        doc = pdf_engine.open_document(file_input)
        try:
            valid_order = [p for p in order if 0 <= p < len(doc)]
            if valid_order:
                doc.select(valid_order)
            doc.save(str(out_path))
            return out_path
        finally:
            doc.close()


pdf_ops = PDFOpsService()
