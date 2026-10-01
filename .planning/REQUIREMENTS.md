# Requirements: OmniMedia & PDF Studio

## 1. Functional Requirements

### FR-1: Frictionless Access & Stateless Architecture
- **FR-1.1**: The platform shall be completely open and accessible without login, registration, password, or cookies.
- **FR-1.2**: The backend shall operate statelessly with zero database requirements.
- **FR-1.3**: The backend shall manage file processing in isolated ephemeral directories, auto-purging files immediately upon download or via background task cleanup after a short timeout (5–15 minutes).

### FR-2: Seamless In-Place PDF Editor
- **FR-2.1**: **Font & Geometry Analysis**: The system shall extract text blocks with precise coordinates, font family, font size, weight, line height, baseline offset, and RGB/hex color.
- **FR-2.2**: **In-Place Replacement**: The system shall redact/replace targeted text spans directly in the PDF stream, matching the original font appearance, baseline alignment, and color so edits are visually indistinguishable.
- **FR-2.3**: **Visual Interactive Canvas**: The user shall be able to click on text elements within the PDF page preview, edit text inline, and see live font matching before saving.
- **FR-2.4**: **Core PDF Operations**: The editor shall also support merging multiple PDFs, splitting/bursting pages, page re-ordering, and 90°/180°/270° rotations.

### FR-3: Universal Media Conversion Engine
- **FR-3.1: Image-to-PDF**: Combine single or multiple images (`PNG`, `JPG`, `WEBP`, `SVG`, `HEIC`) into a single PDF with configurable margins, orientation, and resolution.
- **FR-3.2: PDF-to-Image**: Convert PDF pages to raster and vector formats (`PNG`, `JPG`, `WEBP`, `SVG`) at selectable DPI (72, 150, 300 DPI) with single-page or ZIP batch download.
- **FR-3.3: Universal Audio Converter**:
  - Convert between `MP3`, `WAV`, `AAC`, `FLAC`, `OGG`, and `M4A`.
  - Configurable bitrate (128k, 192k, 256k, 320k) and sample rate (44.1kHz, 48kHz).
  - FFmpeg asynchronous transcoding pipeline.
- **FR-3.4: Universal Video Converter**:
  - Convert between `MP4`, `MKV`, `AVI`, `WEBM`, and `MOV`.
  - Configurable resolution presets (Original, 1080p, 720p, 480p) and codec presets (H.264, H.265, VP9).
  - Stream progress indicator for long video conversions.

### FR-4: Smart Media Compressor (High Quality / Lossless Reduction)
- **FR-4.1: Image Compression**:
  - Reduce file sizes by up to 70–85% using modern algorithms (`WebP`, `MozJPEG`, `OxiPNG`).
  - Interactive comparison displaying original size, compressed size, and percentage saved.
- **FR-4.2: Video Compression**:
  - Multi-pass / CRF (Constant Rate Factor) encoding via FFmpeg (CRF 23–28 for H.264/H.265).
  - Smart audio track bitrate normalization.
  - Significant file size reduction without perceptible visual distortion.
- **FR-4.3: Audio Compression**:
  - Lossy & lossless optimization (Opus/AAC bitrate targeting or FLAC compression levels).

### FR-5: Client-Side Cache & Auto-Recovery (IndexedDB)
- **FR-5.1: Local Persistence**: The frontend shall store active file blobs, staged items, and in-progress PDF edit states in browser IndexedDB.
- **FR-5.2: Tab/Browser Close Recovery**: If the user navigates away or accidentally closes the tab, visiting the studio again within 2–4 hours shall prompt an option: *"Restore previous session?"*.
- **FR-5.3: Automated TTL Purge**: Any cached session or binary file in IndexedDB older than the configured TTL (2 to 4 hours) shall be automatically deleted on startup or periodic check.
- **FR-5.4: Manual Purge**: The user can click a "Clear Workspace" button to immediately wipe all local IndexedDB cached files.

### FR-6: Next.js Ultra-Modern Interface
- **FR-6.1**: Premium, clutter-free UI with sleek typography, polished controls, and smooth micro-interactions.
- **FR-6.2**: Universal drag-and-drop workspace that automatically recognizes file types and highlights suitable actions (Edit, Convert, Compress).
- **FR-6.3**: Real-time progress feedback (upload progress, encoding progress, download ready state).

---

## 2. Non-Functional Requirements

### NFR-1: Processing Performance & Concurrency
- Stream-based and asynchronous background processing so long media conversions do not block FastAPI event loop.
- PyMuPDF native C-bindings used for sub-second PDF page rendering and text parsing.

### NFR-2: Statelessness & Security
- Strict file sanitization: safe filename hashing, MIME type verification, and path traversal protection.
- No client data or telemetry saved in any persistent server-side database.
- Ephemeral workspace auto-cleaned via FastAPI `BackgroundTask` and periodic scheduled cleanups.

### NFR-3: User Experience Standards
- Zero external ad banners, zero popups, zero mandatory registration hurdles.
- Highly responsive across all standard desktop and tablet screen dimensions.
