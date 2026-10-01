# OmniMedia & PDF Studio

> A high-performance, stateless web studio for seamless in-place PDF editing, universal media conversion, and smart file compression. Zero registration, zero cookies, frictionless access with client-side IndexedDB session auto-recovery.

---

## 🌟 Key Features

### 1. In-Place PDF Text Editor
- **Seamless Text Replacement**: Click directly on PDF text to edit. Automatically extracts original font family, weight, point size, baseline origin, and color so replacements blend imperceptibly without visual artifacts.
- **Interactive Daylight Canvas**: 150 DPI page rendering with coordinate-aligned hover overlays and live typography inspectors.
- **Core Document Operations**: Page rotation (90°/180°/270°), multi-page splitting/range extraction, and all-page ZIP bursting.

### 2. Universal Media Converter
- **Audio Transcoding**: Convert across `MP3`, `WAV`, `AAC`, `FLAC`, `OGG`, and `M4A` with custom bitrate selection (`64k` to `320k`).
- **Video Transcoding**: Transcode across `MP4`, `MKV`, `AVI`, `WEBM`, and `MOV` with resolution scaling (`1080p`, `720p`, `480p`, or `original`).
- **Images & PDF**: Combine multiple images into a multi-page PDF or extract PDF pages to `PNG`, `JPG`, `WEBP`, or `SVG` packaged in ZIP archives.

### 3. Smart File Compressor
- **Quality Presets**:
  - *Balanced Quality (Recommended)*: Visually indistinguishable WebP Q80 / CRF 26 / 128 kbps audio.
  - *Max Compression*: WebP Q60 / CRF 30 / 720p scaling / 96 kbps audio for tight bandwidth.
  - *Strict Lossless*: Bit-perfect compression for graphics.
- **Real-Time Savings**: Displays original size vs. compressed size, total bytes reduced, and percentage reduction badges (e.g. `-72.4%`).

### 4. Stateless Architecture & Auto-Recovery
- **Zero Registration & Zero Databases**: No user accounts, cookies, or persistent storage of user files on the server.
- **Ephemeral Sandbox**: UUID-isolated workspaces in `/tmp/omnistudio_sandbox`, automatically purged immediately upon download completion or via a background garbage-collection daemon (15m TTL).
- **Client-Side Auto-Recovery**: Staged files are cached locally in browser IndexedDB with a 3-hour TTL. If the browser or tab closes, a recovery prompt allows instant session restoration.

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────┐
│                   Next.js 15 Frontend                  │
│  - React 19 + TypeScript                               │
│  - Minimal Daylight Design Tokens (zero glass/neon)     │
│  - Browser IndexedDB Engine (3-Hour Auto-Recovery TTL) │
└───────────────────────────┬────────────────────────────┘
                            │ Reverse Proxy / API calls
┌───────────────────────────▼────────────────────────────┐
│                  FastAPI Python Backend                │
│  - Ephemeral Sandbox Manager (UUID Isolation + GC)     │
│  - PyMuPDF In-Place Text Replacement Engine            │
│  - FFmpeg Asynchronous Transcoding & CRF Pipeline      │
│  - OWASP Security Headers & Strict Parameter Allowlists│
└────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- **Linux / macOS**
- **Python 3.11+** with virtual environment
- **Node.js 18+** & npm
- **FFmpeg 6.0+** installed on system (`ffmpeg` and `ffprobe` in `$PATH`)

### One-Command Launch (Backend + Frontend)
```bash
./scripts/start_dev.sh
```
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Health Check**: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

---

## 🔒 Security & Hardening Standards
- **Subprocess Isolation**: FFmpeg commands run via `asyncio.create_subprocess_exec` with `shell=False`. All flags, formats, bitrates, and presets are validated against strict allowlists.
- **Filename Sanitization**: Directory traversal patterns (`../`, `..\`) and header injection characters (`\r`, `\n`, `"`, null bytes) are stripped from all uploads and downloads.
- **Security Headers**: All API responses enforce `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, and `X-XSS-Protection: 1; mode=block`.
- **Payload Limits**: Rejects requests exceeding 100MB with HTTP 413.
- **Document Protection**: Identifies and rejects password-protected PDFs with user-friendly error guidance.

---

## 🧪 Testing

### Backend Unit & Security Tests (54/54 Passing)
```bash
PYTHONPATH=. .venv/bin/pytest backend/tests/ -v
```

### Frontend Type-Check & Production Build
```bash
cd frontend
npx tsc --noEmit
npm run build
```

---

## 📄 License
MIT License. Open-source, frictionless media and document utilities.
