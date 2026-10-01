"""Unit tests for InPlacePDFEditor service."""

import pytest
import pymupdf
from backend.app.services.in_place_editor import (
    in_place_editor,
    InPlaceTextReplacement,
)


def test_extract_page_spans(sample_pdf_bytes):
    doc = pymupdf.open(stream=sample_pdf_bytes, filetype="pdf")
    try:
        response = in_place_editor.extract_page_spans(doc, page_index=0)
        assert response.page_index == 0
        assert response.total_spans >= 2  # Title and body line

        # Find title span
        title_span = next((s for s in response.spans if "Sample PDF Title" in s.text), None)
        assert title_span is not None
        assert title_span.font_size == 24.0
        assert len(title_span.bbox) == 4
        assert len(title_span.origin) == 2
        assert title_span.color_hex.startswith("#")

        # Find body span
        body_span = next((s for s in response.spans if "confidential document line" in s.text), None)
        assert body_span is not None
        assert body_span.font_size == 12.0
    finally:
        doc.close()


def test_replace_text_in_place(sample_pdf_bytes):
    doc = pymupdf.open(stream=sample_pdf_bytes, filetype="pdf")
    try:
        spans_response = in_place_editor.extract_page_spans(doc, page_index=0)
        title_span = next(s for s in spans_response.spans if "Sample PDF Title" in s.text)

        replacement = InPlaceTextReplacement(
            page_index=0,
            span_id=title_span.span_id,
            replacement_text="Modified Official Executive Summary",
        )

        modified_doc = in_place_editor.replace_text_in_place(doc, replacement)
        modified_bytes = modified_doc.tobytes()
    finally:
        doc.close()

    # Verify modification
    check_doc = pymupdf.open(stream=modified_bytes, filetype="pdf")
    try:
        page_text = check_doc[0].get_text()
        assert "Modified Official Executive Summary" in page_text
        assert "Sample PDF Title" not in page_text
    finally:
        check_doc.close()


def test_replace_text_with_custom_color(sample_pdf_bytes):
    doc = pymupdf.open(stream=sample_pdf_bytes, filetype="pdf")
    try:
        spans_response = in_place_editor.extract_page_spans(doc, page_index=0)
        body_span = next(s for s in spans_response.spans if "confidential" in s.text)

        replacement = InPlaceTextReplacement(
            page_index=0,
            span_id=body_span.span_id,
            replacement_text="This is an updated public release document line.",
            color_hex="#ff0000",  # Red
        )

        modified_doc = in_place_editor.replace_text_in_place(doc, replacement)
        modified_bytes = modified_doc.tobytes()
    finally:
        doc.close()

    check_doc = pymupdf.open(stream=modified_bytes, filetype="pdf")
    try:
        page_text = check_doc[0].get_text()
        assert "public release document line" in page_text
        assert "confidential" not in page_text
    finally:
        check_doc.close()


def test_invalid_span_id_raises_error(sample_pdf_bytes):
    doc = pymupdf.open(stream=sample_pdf_bytes, filetype="pdf")
    try:
        replacement = InPlaceTextReplacement(
            page_index=0,
            span_id="non_existent_span",
            replacement_text="Test",
        )
        with pytest.raises(ValueError, match="not found"):
            in_place_editor.replace_text_in_place(doc, replacement)
    finally:
        doc.close()
