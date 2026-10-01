# Phase 5 Research: Media Converter & Compressor UI

## 1. Universal Media Converter UI Architecture

### 1.1 Context-Aware Conversion Controls
Depending on the category of staged files:
- **Audio Files**:
  - Target format dropdown: `MP3`, `WAV`, `AAC`, `FLAC`, `OGG`, `M4A`.
  - Bitrate selector: `128 kbps` (compact), `192 kbps` (standard), `256 kbps` (high), `320 kbps` (studio).
  - Sample rate selector: `44.1 kHz` (CD standard), `48 kHz` (broadcast).
- **Video Files**:
  - Target container: `MP4` (universal web), `MKV` (lossless container), `WEBM` (modern web), `MOV` (Apple QuickTime), `AVI` (legacy).
  - Resolution scaling presets: `Original` (native), `1080p Full HD`, `720p HD`, `480p SD`.
- **Image Files**:
  - Target format: `PNG`, `JPG`, `WEBP`, `HEIC`.
  - Batch "Combine to PDF": merges multiple selected images into a single multi-page PDF document.
- **PDF Documents**:
  - Convert PDF to Images: extract each page as `PNG`, `JPG`, `WEBP`, or vector `SVG` (packaged into a ZIP download for multi-page documents).

### 1.2 Binary Streaming & Download Handlers
- Use `fetch` with `POST` and `FormData`.
- Extract filename from `content-disposition` header or default to `converted_{originalName}.{ext}`.
- Trigger browser binary download via programmatic `URL.createObjectURL(blob)` and simulated link click.

---

## 2. Smart Compressor UI & Metrics Visualization

### 2.1 Preset Modes
- **High Quality (Recommended)**:
  - Images: WebP Q80 / MozJPEG Q80 (virtually indistinguishable visual retention).
  - Video: FFmpeg CRF 26 with 128k audio (typically 50–70% size reduction).
  - Audio: 128k AAC/Opus (typically 50–80% size reduction from uncompressed WAV).
- **Maximum Compression**:
  - Images: WebP Q60 with 1920px max dimension clamp.
  - Video: FFmpeg CRF 30 with 720p scaling and 96k audio.
  - Audio: 96k AAC/Opus.
- **Lossless** (Images only):
  - True lossless WebP / PNG optimization with 0 pixel loss.

### 2.2 Metrics & Savings Card
The backend attaches metrics in custom HTTP response headers:
- `X-Original-Size`: bytes
- `X-Compressed-Size`: bytes
- `X-Bytes-Saved`: bytes
- `X-Percent-Saved`: percentage
The UI renders a tactile daylight savings summary:
- Original size vs. Compressed size in bold slate typography.
- Green savings badge: e.g. `-64.5% saved`.
- Immediate one-click download button.
