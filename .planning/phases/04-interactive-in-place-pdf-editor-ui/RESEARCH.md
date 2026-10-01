# Phase 4 Research: Interactive In-Place PDF Editor UI

## 1. Visual Text Overlay & Coordinate Alignment

### 1.1 PDF Points to Screen Pixels Mapping
PyMuPDF coordinates are expressed in PDF points (1 point = 1/72 inch).
When a thumbnail is rendered via `render_page_thumbnail(dpi=150)`:
- Scaling factor: `scale = 150 / 72 ≈ 2.0833`
- If rendered on screen with a CSS width `W_css` and PDF page width `W_pdf`:
  `display_scale = W_css / W_pdf`
- For any text span with bbox `[x0, y0, x1, y1]`:
  - `left = x0 * display_scale`
  - `top = y0 * display_scale`
  - `width = (x1 - x0) * display_scale`
  - `height = (y1 - y0) * display_scale`

### 1.2 Interactive Selection & Typography Inspector
- **Hover Layer**: A transparent coordinate layer placed directly over the page image.
  - Hovering a span highlights it with a subtle clean outline: `border: 1px solid #2563eb; background: rgba(37, 99, 235, 0.08);`.
  - Tooltip shows exact typography: font name (e.g. `Helvetica`, `Times`), point size, and hex color.
- **Click to Edit**:
  - Clicking on any span opens an inline editing popover positioned directly over or adjacent to the target span.
  - Form displays:
    - Target text preview
    - Replacement text input field
    - Font size slider or number input (pre-populated with original size)
    - Color picker / hex input (pre-populated with original color)
    - "Apply Seamless Replacement" button

### 1.3 In-Place Editing Round-Trip
1. Frontend calls `POST /api/pdf/inspect` if session is not yet established.
2. Frontend calls `GET /api/pdf/spans/{session_id}/{page_index}` to load coordinate map.
3. When user modifies a text span, frontend sends `POST /api/pdf/edit-text` with `{ session_id, page_index, span_id, replacement_text, font_size, color_hex }`.
4. Backend executes in-place redaction and baseline insertion, updating `document.pdf` in the session.
5. Frontend refreshes the page thumbnail with a cache-busting timestamp (`?t=Date.now()`) and re-queries spans to reflect updated text.
6. When done, user clicks "Download Edited PDF" which triggers `GET /api/pdf/download/{session_id}`.

---

## 2. Multi-Page Workspace & Navigation

### 2.1 Thumbnail Sidebar
- Vertical thumbnail strip showing all pages in the PDF document.
- Active page indicator with clean solid border.
- Page badges (`1`, `2`, `3`...).

### 2.2 Page Tools (Rotate, Delete, Split)
- Quick page rotation: calls `POST /api/pdf/rotate` with 90° angle.
- Split page ranges: allows user to specify ranges (e.g. `1-2`) and download extracted pages.
