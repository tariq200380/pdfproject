# Phase 6 Execution Plan: Full Integration, Security & Hardening

## Phase Summary
Comprehensive security auditing, parameter allowlists, HTTP security headers, robust edge-case handling for encrypted/corrupted media, unified multi-service startup script, and full end-to-end verification.

---

## Tasks

### Task 1: HTTP Security Headers & Middleware Hardening
- **Files**:
  - `backend/app/main.py`
  - `backend/app/core/config.py`
- **Actions**:
  1. Add ASGI middleware to inject OWASP security headers on all incoming requests:
     - `X-Content-Type-Options: nosniff`
     - `X-Frame-Options: DENY`
     - `Referrer-Policy: strict-origin-when-cross-origin`
     - `X-XSS-Protection: 1; mode=block`
  2. Implement file size validation middleware or dependency enforcing `settings.MAX_FILE_SIZE_MB` (default 100MB), rejecting oversized payloads with HTTP 413 Payload Too Large.
- **Verification**: Test responses from `/api/health` and endpoints for presence of security headers and rejection of oversized files.

### Task 2: Parameter Sanitization & Strict Allowlists
- **Files**:
  - `backend/app/api/routes_media.py`
  - `backend/app/api/routes_compress.py`
  - `backend/app/api/routes_pdf.py`
  - `backend/app/core/sanitizer.py` (New Helper)
- **Actions**:
  1. Create `backend/app/core/sanitizer.py` with:
     - `sanitize_filename(name: str, fallback: str) -> str`: strips path separators, null bytes, non-ASCII/dangerous characters, and quotes.
     - `validate_allowlist(val: str, allowed: set[str], param_name: str) -> str`: enforces strict enumerated values.
  2. Apply allowlists in media conversion routes:
     - Audio formats: `{"mp3", "wav", "aac", "flac", "ogg", "m4a"}`
     - Audio bitrates: `{"64k", "96k", "128k", "192k", "256k", "320k"}`
     - Video formats: `{"mp4", "mkv", "avi", "webm", "mov"}`
     - Video resolutions: `{"original", "1080p", "720p", "480p"}`
     - Image formats: `{"png", "jpg", "jpeg", "webp", "svg"}`
     - Compression presets: `{"high_quality", "max_compression", "lossless"}`
  3. Ensure `Content-Disposition` headers in all endpoints use sanitized filenames.
- **Verification**: Invalid values in `target_format`, `bitrate`, `resolution`, or `preset` return HTTP 400 Bad Request with descriptive message.

### Task 3: Edge Case & Exception Resilience
- **Files**:
  - `backend/app/services/pdf_engine.py`
  - `backend/app/services/in_place_editor.py`
  - `backend/app/services/ffmpeg_service.py`
  - `backend/app/api/routes_pdf.py`
- **Actions**:
  1. In `pdf_engine.py`: check `doc.is_encrypted` and raise informative error if password protection is active.
  2. In `routes_pdf.py`: catch PyMuPDF `FileDataError` / `EmptyFileError` and map to HTTP 400 Bad Request with `"Corrupted or invalid PDF file"`.
  3. In `routes_media.py` and `routes_compress.py`: catch 0-byte uploads and non-media inputs, cleaning up sandbox before raising HTTP 400.
- **Verification**: Unit tests validating rejection of encrypted PDFs, corrupted files, and zero-byte inputs.

### Task 4: Security & Hardening Test Suite
- **Files**:
  - `backend/tests/test_security_hardening.py`
- **Actions**:
  1. Write tests for:
     - Security response headers on API requests.
     - Filename sanitization against path traversal (`../../../etc/passwd`).
     - Rejection of invalid/injected audio bitrates and video resolutions.
     - Rejection of encrypted/password-protected PDFs.
     - Rejection of corrupted/empty files.
     - Sandbox session directory cleanup verification even upon route failures.
- **Verification**: `pytest backend/tests/test_security_hardening.py` passes 100%.

### Task 5: Unified Startup & Production Readiness
- **Files**:
  - `scripts/start_dev.sh`
  - `README.md`
- **Actions**:
  1. Create `scripts/start_dev.sh` with process tracking, virtual environment detection, port check, and trap cleanup for both FastAPI and Next.js.
  2. Update `README.md` with architecture diagram, prerequisites, one-command startup, feature capabilities, and security overview.
- **Verification**: Script execution and syntax validation (`bash -n scripts/start_dev.sh`).

### Task 6: Final Verification & Milestone Closure
- **Actions**:
  1. Run full pytest suite across all backend tests (`backend/tests/`).
  2. Run Next.js type check (`npx tsc --noEmit`) and production build (`npm run build`).
  3. Confirm 0 sandbox leaks or leftover temporary files.
  4. Write `VERIFICATION.md` for Phase 6.
  5. Update `STATE.md` marking Phase 6 and Milestone v1.0 complete.
  6. Git commit final release.
