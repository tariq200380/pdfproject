# Project Context: OmniMedia & PDF Studio

## 1. Vision & Purpose
An ultra-modern, high-performance web platform combining professional in-place PDF editing, universal media format conversion (Images, Audio, Video), and intelligent lossless/near-lossless compression into a single, cohesive, friction-free web studio.

Designed for users who demand instant, privacy-respecting document and media manipulation without accounts, paywalls, or cluttered interfaces.

---

## 2. Architectural Pillars

### 2.1 Full-Stack Stateless Architecture
- **Frontend**: Next.js (React, TypeScript), featuring a component-driven architecture, responsive drag-and-drop file staging, live previewers, and instant operation feedback.
- **Backend**: Python (FastAPI, Uvicorn) serving stateless high-speed endpoints.
- **No Database**: Completely stateless server lifecycle. Operations process streams or ephemeral sandbox files on disk.
- **Automated Lifecycle Management**: Background tasks immediately clean up temporary files upon client download completion or timeout expiry (5–15 minutes).

### 2.2 Frictionless Access Model
- **Zero Registration**: No login, no sign-up, no user profile tracking, no cookies/trackers.
- Direct access to all tools immediately upon landing on the application.

### 2.3 Client-Side Storage & Auto-Recovery
- **Browser IndexedDB**: Active documents, staged files, and draft modification history are cached client-side.
- **Session Auto-Recovery**: If a user accidentally closes the tab or reloads, their workspace can be restored within a 2 to 4 hour Time-To-Live (TTL) window.
- **Automatic Client Purge**: Expired workspace sessions and binary blobs in IndexedDB are automatically garbage-collected after the TTL.

---

## 3. Core Processing Engines

### 3.1 Seamless In-Place PDF Editor
- **Precise Typography Matching**: Extract and analyze existing text blocks, font descriptors (family, size, weight, leading, color), and baseline bounding boxes.
- **Clean In-Place Replacement**: Replaces or modifies text directly in existing PDF content streams using PyMuPDF and font tools, rendering seamless edits that blend imperceptibly with original document typography.
- **Structural Integrity**: Preserves vector graphics, annotations, form fields, and layout coordinates.

### 3.2 Universal Media Conversion Engine
- **Image Conversion**:
  - Image to PDF: Combine single or multiple images (PNG, JPG, WEBP, SVG, HEIC) into unified PDFs with customizable page margins and orientation.
  - PDF to Image: Render PDF pages into high-DPI raster or vector formats (PNG, JPG, WEBP, SVG).
- **Universal Audio Converter**:
  - Transcode across all major audio formats: `MP3`, `WAV`, `AAC`, `FLAC`, `OGG`, `M4A`.
  - Powered by asynchronous FFmpeg pipelines with configurable sampling rate, bitrate, and channels.
- **Universal Video Converter**:
  - Transcode across major video containers and codecs: `MP4`, `MKV`, `AVI`, `WEBM`, `MOV`.
  - Fast stream copying or multi-thread FFmpeg re-encoding with hardware acceleration when available.

### 3.3 Smart High-Efficiency Compressor
- **Image Compression**:
  - Multi-pass compression using Pillow, WebP, MozJPEG, and OxiPNG algorithms.
  - Significant file size reduction (up to 70–85%) with visually lossless retention.
- **Audio & Video Compression**:
  - Video: Constant Rate Factor (CRF) encoding (libx264/libx265/libvpx-vp9) with two-pass or preset optimization to achieve maximum compression with imperceptible quality loss.
  - Audio: Dynamic bitrate control (VBR/CBR) and Opus/AAC optimizations.

---

## 4. UI/UX Standard
- **Aesthetic Excellence**: Ultra-modern visual polish, minimalist typography (Inter / Geist), smooth transitions, and subtle glassmorphic elements.
- **Unified Workspace**: Unified drag-and-drop zone that intelligently detects file type (PDF, Image, Audio, Video) and suggests contextual tools.
- **Zero Clutter**: Functional, focused tool views (Editor, Converter, Compressor) without distracting banners or complex multi-step wizards.
