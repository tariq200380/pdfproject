# Phase 1 Execution Plan: Stateless Backend & In-Place PDF Engine

## Phase Summary
Build the foundational Python FastAPI stateless backend, ephemeral sandbox lifecycle manager, and PyMuPDF-based in-place text replacement engine with typography matching and baseline alignment.

---

## Tasks

### Task 1: Environment & Directory Scaffold
- **Files**:
  - `backend/requirements.txt`
  - `backend/pyproject.toml` or `backend/setup.cfg`
  - `backend/app/__init__.py`
  - `backend/app/core/__init__.py`
  - `backend/app/services/__init__.py`
  - `backend/app/api/__init__.py`
- **Actions**:
  1. Define dependencies: `fastapi>=0.110.0`, `uvicorn[standard]>=0.28.0`, `pymupdf>=1.24.0`, `python-multipart>=0.0.9`, `pydantic>=2.6.0`, `pytest>=8.0.0`, `httpx>=0.27.0`.
  2. Create Python virtual environment `.venv` and install dependencies.
- **Verification**: Run `python3 -m pytest --version` and import `fitz`, `fastapi` inside `.venv`.

### Task 2: Ephemeral Sandbox & Garbage Collection Reaper
- **Files**:
  - `backend/app/core/config.py`
  - `backend/app/core/sandbox.py`
- **Actions**:
  1. Build `SandboxManager`: creates unique `/tmp/omnistudio_sandbox/{session_id}` directories.
  2. Implement safe path resolution to strictly prevent path traversal.
  3. Implement immediate deletion helper for FastAPI `BackgroundTask`.
  4. Implement periodic reaper thread/task that scans and purges session directories older than TTL (default 15 minutes).
- **Verification**: Unit tests creating temporary sessions and verifying immediate deletion and reaper eviction.

### Task 3: PDF Core Engine (Validation, Metadata & Thumbnails)
- **Files**:
  - `backend/app/services/pdf_engine.py`
- **Actions**:
  1. Implement PDF validation (magic byte check `%PDF-`, parseability via `fitz.open()`).
  2. Implement metadata extractor (title, author, creation date, page count, encrypted status, dimensions per page).
  3. Implement high-res thumbnail generator returning PNG bytes for any given page index (sub-50ms).
- **Verification**: Unit tests on sample PDFs validating metadata accuracy and valid PNG thumbnail generation.

### Task 4: Seamless In-Place PDF Text Editor
- **Files**:
  - `backend/app/services/in_place_editor.py`
- **Actions**:
  1. Implement `extract_page_spans(page)`: extracts every text span with its text, `bbox`, baseline `origin`, font name, font size, flags (bold/italic), and RGB color.
  2. Implement font resolver: map embedded font descriptors to standard Base-14 fonts (`helv`, `tiro`, `couri`) or extract embedded font buffers via `doc.extract_font(xref)`.
  3. Implement `replace_text_in_place(doc, page_num, target_span_id_or_bbox, replacement_text)`:
     - Applies clean redaction with `fill=None` or background match to strip original glyphs.
     - Inserts replacement text at exact baseline origin using matched font, size, and color.
     - Validates text width and applies proportional scaling if replacement exceeds span bounds.
- **Verification**: Automated test that replaces text on a generated PDF, parses output, and asserts new text exists at original coordinates with no residual old text.

### Task 5: PDF Operations Service (Merge, Split, Rotate)
- **Files**:
  - `backend/app/services/pdf_ops.py`
- **Actions**:
  1. `merge_pdfs(pdf_paths: list[Path], output_path: Path)`: merges multiple PDFs in user-defined order.
  2. `split_pdf(pdf_path: Path, page_ranges: str, output_path: Path)`: extracts page ranges (e.g. `1-3, 5`).
  3. `burst_pdf(pdf_path: Path, output_zip_path: Path)`: splits all pages into individual PDFs packed into a ZIP archive.
  4. `rotate_pages(pdf_path: Path, rotations: dict[int, int], output_path: Path)`: rotates specified pages by 90°, 180°, or 270°.
- **Verification**: Unit tests for merge, split, burst, and rotation verifying page counts and orientation flags.

### Task 6: FastAPI Application & REST API Endpoints
- **Files**:
  - `backend/app/main.py`
  - `backend/app/api/routes_pdf.py`
  - `backend/app/api/routes_health.py`
- **Actions**:
  1. Configure FastAPI app with CORS middleware (allowing Next.js client origin).
  2. Set up lifespan handler for background reaper lifecycle (start on startup, cancel on shutdown).
  3. Implement routes:
     - `GET /api/health` -> Status & system info.
     - `POST /api/pdf/inspect` -> Upload PDF, return metadata and page list.
     - `GET /api/pdf/thumbnail/{session_id}/{page_num}` -> Stream PNG thumbnail.
     - `POST /api/pdf/spans` -> Return all text spans with font metrics for in-place editing.
     - `POST /api/pdf/edit-text` -> Perform in-place text replacement, return edited PDF stream with cleanup.
     - `POST /api/pdf/merge` -> Merge multiple files, stream output with cleanup.
     - `POST /api/pdf/split` -> Split/burst PDF, stream output/ZIP with cleanup.
     - `POST /api/pdf/rotate` -> Rotate pages, stream output with cleanup.
- **Verification**: Integration tests via `httpx.AsyncClient` verifying endpoints with live multipart requests.

### Task 7: Comprehensive Verification & Test Suite
- **Files**:
  - `backend/tests/conftest.py`
  - `backend/tests/test_pdf_engine.py`
  - `backend/tests/test_in_place_editor.py`
  - `backend/tests/test_pdf_ops.py`
  - `backend/tests/test_sandbox.py`
  - `backend/tests/test_api_pdf.py`
- **Actions**:
  1. Create synthetic fixture PDFs with specific fonts, colors, and multiple pages.
  2. Run `pytest -v` across all test modules.
  3. Assert 100% test pass rate with zero remaining temporary files.
