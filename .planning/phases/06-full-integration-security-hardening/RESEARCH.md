# Phase 6 Research: Full Integration, Security & Hardening

## Overview
Phase 6 delivers the final hardening, security audits, edge-case resilience, and unified operational readiness for the OmniMedia & PDF Studio platform.

---

## 1. Security Architecture & Threat Modeling

### 1.1 Input Parameter Validation & Injection Defense
- **FFmpeg Command Injection Prevention**:
  - FFmpeg is invoked asynchronously using `asyncio.create_subprocess_exec` with `shell=False`.
  - While arguments are passed as discrete argv strings, parameters such as `bitrate`, `sample_rate`, `resolution`, `preset`, and `target_format` must be strictly validated against allowlists.
  - Any parameter containing shell metacharacters, spaces, hyphens, or unexpected syntax must be rejected before reaching the subprocess.
  - Allowed bitrates: `{"64k", "96k", "128k", "192k", "256k", "320k"}`.
  - Allowed sample rates: `{22050, 44100, 48000, 96000}`.
  - Allowed video resolutions: `{"original", "1080p", "720p", "480p"}`.
  - Allowed presets: `{"high_quality", "max_compression", "lossless"}`.

### 1.2 Filename & Header Injection Sanitization
- Filenames extracted from `file.filename` or returned in `Content-Disposition` headers can be vectors for:
  - Directory traversal (`../../../etc/passwd`).
  - HTTP Header Injection (`\r\nSet-Cookie: ...` or `\r\nContent-Length: ...`).
- Mitigation:
  - Extract only the basename with `Path(filename).name`.
  - Strip non-ASCII or dangerous characters (null bytes, control characters, quotes, semicolons).
  - In `Content-Disposition`, quote the filename and encode safely.

### 1.3 HTTP Security Headers
- Apply standard OWASP-recommended HTTP security headers to all responses:
  - `X-Content-Type-Options: nosniff` (prevents MIME sniffing).
  - `X-Frame-Options: DENY` (clickjacking protection).
  - `Referrer-Policy: strict-origin-when-cross-origin`.
  - `X-XSS-Protection: 1; mode=block`.

### 1.4 Denial of Service & Resource Caps
- **Max File Size**: Enforce 100MB upload ceiling (`MAX_FILE_SIZE_MB`). Requests exceeding the limit are rejected immediately before disk writing or processing.
- **FFmpeg Execution Timeout**: FFmpeg processes are bounded by a 120-second timeout to prevent indefinite hangs or CPU starvation.
- **Reaper Thread & Sandbox Hygiene**: Ephemeral directories are isolated by UUID4 and pruned immediately upon download or after 15 minutes TTL by the background daemon.

---

## 2. Edge Case Handling

### 2.1 PDF Edge Cases
- **Encrypted / Password-Protected PDFs**:
  - `doc.is_encrypted`: When true, return HTTP 400 with `"PDF is password-protected or encrypted. Please unlock before editing."`.
- **Corrupted / Truncated PDFs**:
  - PyMuPDF raises `fitz.FileDataError` or `fitz.EmptyFileError`. Catch and map to HTTP 400 Bad Request instead of 500 internal errors.
- **Out of Bounds Page Requests**:
  - Return clear 400 responses when requested page exceeds total document pages.

### 2.2 Media Transcoding Edge Cases
- **Unsupported Codecs / Non-Media Formats**:
  - When FFmpeg cannot identify the stream, return HTTP 400 Bad Request with `"Corrupted or unrecognized media format."`.
- **Zero-Byte Uploads**:
  - Immediate 400 Bad Request before spawning sub-processes.
- **Subprocess Cleanup**:
  - Ensure session sandbox directory is cleaned up in `finally` blocks if exceptions occur prior to `FileResponse` return.

---

## 3. Operational Tooling & Startup

### 3.1 Unified Developer Startup Script (`scripts/start_dev.sh`)
- Boots both services concurrently:
  - Python FastAPI backend at `http://127.0.0.1:8000` via `.venv/bin/uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload`.
  - Next.js frontend at `http://localhost:3000` via `npm run dev` in `frontend/`.
- Traps `SIGINT` / `SIGTERM` so stopping the script cleanly terminates both processes without leaving zombie ports or orphaned background processes.
