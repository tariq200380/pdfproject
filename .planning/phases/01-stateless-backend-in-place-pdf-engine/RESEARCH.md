# Phase 1 Research: Stateless Backend & In-Place PDF Engine

## 1. PyMuPDF In-Place Text Editing & Font Matching

### 1.1 Text & Font Inspection Mechanism
PyMuPDF (`fitz`) provides low-level access to the PDF content stream via `page.get_text("dict")` or `page.get_text("rawdict")`.
Each page text dictionary decomposes into:
- **Blocks**: Text or image blocks with outer bounding boxes.
- **Lines**: Individual lines within a block with directional vectors.
- **Spans**: Atomic segments of uniform formatting containing:
  - `text`: String content.
  - `bbox`: `(x0, y0, x1, y1)` coordinates of the span.
  - `origin`: `(x, y)` baseline starting point of the text span.
  - `font`: Font name descriptor (e.g., `Helvetica-Bold`, `Times-Roman`, or embedded subset like `BAAAAA+LiberationSans`).
  - `size`: Font point size (float).
  - `color`: Integer encoding of RGB (`(color >> 16) & 255`, `(color >> 8) & 255`, `color & 255`).
  - `flags`: Bitmask indicating font attributes:
    - Bit 0: Superscript
    - Bit 1: Italic
    - Bit 2: Serif
    - Bit 3: Monospace
    - Bit 4: Bold

### 1.2 Seamless In-Place Text Replacement
To modify text in an existing PDF without disrupting surrounding layout:
1. **Locate Target Text Span**: Identify target text block, its exact bounding box `bbox`, baseline `origin`, font descriptor, and color.
2. **Redact Existing Content**:
   - `page.add_redact_annot(quad_or_rect, fill=None)`: Setting `fill=None` or matching the background color removes the original text glyphs from the content stream cleanly without leaving a black rectangle.
   - `page.apply_redactions(images=0)`: Strips original text glyphs while keeping vector drawings and underlying backgrounds intact.
3. **Typography Resolution**:
   - Extract embedded font data using `doc.extract_font(xref)` if available.
   - Fall back to standard Base-14 PDF fonts (`helv`, `tiro`, `couri`, etc.) or bundled system fonts when matching font family and weight.
4. **Re-insertion**:
   - Insert replacement text using `page.insert_text(point=origin, text=new_text, fontsize=size, fontname=fontname, fontfile=fontfile, color=color)`.
   - Using the exact `origin` coordinate guarantees identical baseline alignment.

### 1.3 Text Width & Bounding Box Adjustment
- If replacement text is wider than the original span, measure text width using `font.text_length(new_text, fontsize=size)`.
- If new text exceeds original bbox width, provide options to either proportionally scale font size down to fit, or shift subsequent inline spans.

---

## 2. Stateless Backend & Ephemeral Sandbox Architecture

### 2.1 Ephemeral Session Lifecycle
Since the architecture is strictly stateless (no database, no persistent user tracking):
1. **Isolated Workspace**: Each processing request creates an isolated directory:
   `sandbox/{session_id}/` (using a cryptographically secure UUID4).
2. **Immediate Cleanup on Stream Complete**:
   FastAPI `BackgroundTasks` execute `shutil.rmtree(session_dir)` immediately after `FileResponse` or `StreamingResponse` transmission finishes.
3. **Periodic Reaper Task**:
   A scheduled background thread/task runs every 5 minutes to identify and delete any orphaned session directories older than a configured TTL (e.g. 15 minutes), preventing disk leaks if a client disconnects mid-stream.

---

## 3. High-Performance Core Operations with PyMuPDF

| Operation | PyMuPDF Implementation Pattern | Memory / Performance Profile |
| :--- | :--- | :--- |
| **Thumbnail Rendering** | `page.get_pixmap(dpi=150).tobytes("png")` | Sub-50ms rendering per page |
| **PDF Merging** | `doc_target.insert_pdf(doc_source)` in order | Fast zero-recompression vector merge |
| **PDF Splitting / Extraction** | `doc.select(page_indices)` / `doc_target.insert_pdf(doc, from_page, to_page)` | Sub-millisecond stream slice |
| **Page Rotation** | `page.set_rotation((page.rotation + deg) % 360)` | Metadata update in header |
| **Metadata Extraction** | `doc.metadata`, `len(doc)`, page rects | Instant inspection |
