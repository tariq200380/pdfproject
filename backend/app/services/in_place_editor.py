"""In-Place PDF Text Editor: Extracts text spans and seamlessly replaces text matching typography."""

import re
import logging
from typing import Any, Dict, List, Optional, Tuple
import pymupdf
from pydantic import BaseModel, Field

logger = logging.getLogger("omnistudio.in_place_editor")


class TextSpan(BaseModel):
    span_id: str
    page_index: int
    text: str
    bbox: List[float]  # [x0, y0, x1, y1]
    origin: List[float]  # [x, y] baseline origin
    font_name: str
    font_size: float
    flags: int
    is_bold: bool
    is_italic: bool
    color_rgb: List[float]  # [r, g, b] normalized 0.0 - 1.0
    color_hex: str


class PageSpansResponse(BaseModel):
    page_index: int
    total_spans: int
    spans: List[TextSpan]


class InPlaceTextReplacement(BaseModel):
    page_index: int
    span_id: str
    replacement_text: str
    font_size: Optional[float] = None
    color_hex: Optional[str] = None
    font_name: Optional[str] = None


class InPlacePDFEditor:
    """Provides precise typography extraction and seamless in-place text modification."""

    @staticmethod
    def int_color_to_rgb_and_hex(color_int: int) -> Tuple[List[float], str]:
        """Converts PyMuPDF integer color to normalized RGB and HEX string."""
        r = ((color_int >> 16) & 255) / 255.0
        g = ((color_int >> 8) & 255) / 255.0
        b = (color_int & 255) / 255.0
        hex_code = f"#{int(r * 255):02x}{int(g * 255):02x}{int(b * 255):02x}"
        return [round(r, 4), round(g, 4), round(b, 4)], hex_code

    @staticmethod
    def hex_to_rgb(hex_code: str) -> List[float]:
        """Converts '#RRGGBB' to normalized [r, g, b] float tuple."""
        clean_hex = hex_code.lstrip("#")
        if len(clean_hex) == 3:
            clean_hex = "".join([c * 2 for c in clean_hex])
        if len(clean_hex) != 6:
            return [0.0, 0.0, 0.0]
        r = int(clean_hex[0:2], 16) / 255.0
        g = int(clean_hex[2:4], 16) / 255.0
        b = int(clean_hex[4:6], 16) / 255.0
        return [r, g, b]

    @staticmethod
    def resolve_standard_fontname(raw_font_name: str, is_bold: bool = False, is_italic: bool = False) -> str:
        """Maps arbitrary PDF font name descriptors to supported PyMuPDF Base-14 fonts."""
        name_lower = raw_font_name.lower()
        # Strip subset prefix if present (e.g. "ABCDEF+Arial" -> "Arial")
        if "+" in name_lower:
            name_lower = name_lower.split("+", 1)[1]

        # Check for Times
        if any(k in name_lower for k in ("times", "serif", "roman")):
            if is_bold and is_italic:
                return "tibi"
            elif is_bold:
                return "tibo"
            elif is_italic:
                return "tiit"
            return "tiro"

        # Check for Courier / Monospace
        if any(k in name_lower for k in ("courier", "mono", "typewriter", "consolas")):
            if is_bold and is_italic:
                return "cobi"
            elif is_bold:
                return "cobo"
            elif is_italic:
                return "coit"
            return "couri"

        # Default to Helvetica / Sans-Serif (Arial, etc.)
        if is_bold and is_italic:
            return "hebi"
        elif is_bold:
            return "hebo"
        elif is_italic:
            return "heit"
        return "helv"

    @classmethod
    def extract_page_spans(cls, doc: pymupdf.Document, page_index: int) -> PageSpansResponse:
        """Extracts all text spans from a given page with exact coordinates and typography metrics."""
        if page_index < 0 or page_index >= len(doc):
            raise IndexError(f"Page index {page_index} out of bounds")

        page = doc[page_index]
        page_dict = page.get_text("dict")
        spans: List[TextSpan] = []

        for b_idx, block in enumerate(page_dict.get("blocks", [])):
            if block.get("type") != 0:  # 0 indicates text block
                continue
            for l_idx, line in enumerate(block.get("lines", [])):
                for s_idx, span in enumerate(line.get("spans", [])):
                    text = span.get("text", "")
                    if not text.strip():
                        continue  # Skip whitespace-only spans

                    span_id = f"p{page_index}_b{b_idx}_l{l_idx}_s{s_idx}"
                    flags = span.get("flags", 0)
                    is_italic = bool(flags & 2)
                    is_bold = bool(flags & 16)
                    color_rgb, color_hex = cls.int_color_to_rgb_and_hex(span.get("color", 0))

                    spans.append(
                        TextSpan(
                            span_id=span_id,
                            page_index=page_index,
                            text=text,
                            bbox=[round(coord, 2) for coord in span.get("bbox", [0, 0, 0, 0])],
                            origin=[round(coord, 2) for coord in span.get("origin", [0, 0])],
                            font_name=span.get("font", "Helvetica"),
                            font_size=round(span.get("size", 12.0), 2),
                            flags=flags,
                            is_bold=is_bold,
                            is_italic=is_italic,
                            color_rgb=color_rgb,
                            color_hex=color_hex,
                        )
                    )

        return PageSpansResponse(
            page_index=page_index,
            total_spans=len(spans),
            spans=spans,
        )

    @classmethod
    def replace_text_in_place(
        cls,
        doc: pymupdf.Document,
        replacement: InPlaceTextReplacement,
    ) -> pymupdf.Document:
        """Seamlessly replaces target text in-place matching original baseline, font, size, and color."""
        page_index = replacement.page_index
        if page_index < 0 or page_index >= len(doc):
            raise IndexError(f"Page index {page_index} out of bounds")

        page = doc[page_index]
        spans_response = cls.extract_page_spans(doc, page_index)
        target_span = next((s for s in spans_response.spans if s.span_id == replacement.span_id), None)

        if not target_span:
            raise ValueError(f"Span ID '{replacement.span_id}' not found on page {page_index}")

        # 1. Redact the original text span cleanly
        rect = pymupdf.Rect(target_span.bbox)
        # Redaction annotation with fill=None removes text glyphs without background blotches
        page.add_redact_annot(rect, fill=None)
        page.apply_redactions(images=pymupdf.PDF_REDACT_IMAGE_NONE)

        # 2. Resolve typography settings
        font_size = replacement.font_size or target_span.font_size
        color_rgb = cls.hex_to_rgb(replacement.color_hex) if replacement.color_hex else target_span.color_rgb

        font_name = replacement.font_name or cls.resolve_standard_fontname(
            target_span.font_name,
            is_bold=target_span.is_bold,
            is_italic=target_span.is_italic,
        )

        # 3. Check width fit: if replacement text is significantly wider, adapt font size
        try:
            test_font = pymupdf.Font(font_name)
            calc_width = test_font.text_length(replacement.replacement_text, fontsize=font_size)
            orig_width = target_span.bbox[2] - target_span.bbox[0]
            if orig_width > 0 and calc_width > (orig_width * 1.25):
                # Scale down slightly to preserve layout bounds
                scale_factor = (orig_width * 1.25) / calc_width
                font_size = round(max(font_size * scale_factor, 6.0), 2)
        except Exception as e:
            logger.debug(f"Could not compute exact font width: {e}")

        # 4. Insert replacement text at exact baseline origin
        origin = pymupdf.Point(target_span.origin[0], target_span.origin[1])
        page.insert_text(
            point=origin,
            text=replacement.replacement_text,
            fontsize=font_size,
            fontname=font_name,
            color=tuple(color_rgb),
        )

        return doc


in_place_editor = InPlacePDFEditor()
