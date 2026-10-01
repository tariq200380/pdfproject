# Phase 5 Execution Plan: Media Converter & Compressor UI

## Phase Summary
Build dedicated, tactile daylight interfaces for Universal Media Conversion (Audio, Video, Images, PDF) and Smart Media Compression (with before/after byte savings calculation and direct downloads).

---

## Tasks

### Task 1: Media API Client
- **Files**:
  - `frontend/src/lib/mediaApiClient.ts`
- **Actions**:
  1. Implement client methods connecting to Phase 2 endpoints:
     - `convertAudio(file: File, targetFormat: string, bitrate?: string, sampleRate?: number): Promise<{ blob: Blob; filename: string }>`
     - `convertVideo(file: File, targetFormat: string, resolution?: string): Promise<{ blob: Blob; filename: string }>`
     - `convertImagesToPdf(files: File[]): Promise<{ blob: Blob; filename: string }>`
     - `convertPdfToImages(file: File, targetFormat: string, dpi?: number): Promise<{ blob: Blob; filename: string }>`
     - `convertImage(file: File, targetFormat: string): Promise<{ blob: Blob; filename: string }>`
     - `compressAsset(file: File, category: string, preset: string): Promise<{ blob: Blob; filename: string; originalSize: number; compressedSize: number; bytesSaved: number; percentSaved: number }>`
  2. Implement browser file download helper: `triggerDownload(blob: Blob, filename: string)`.
- **Verification**: Type-check and parameter mapping against FastAPI routes.

### Task 2: Universal Media Converter Workspace
- **Files**:
  - `frontend/src/components/converter/MediaConverterWorkspace.tsx`
- **Actions**:
  1. File selector: select from currently staged files or upload new files directly.
  2. Contextual format controls:
     - Audio: `MP3`, `WAV`, `AAC`, `FLAC`, `OGG`, `M4A` + bitrate options (`128k`, `192k`, `256k`, `320k`).
     - Video: `MP4`, `MKV`, `AVI`, `WEBM`, `MOV` + resolution options (`Original`, `1080p`, `720p`, `480p`).
     - Image: `PNG`, `JPG`, `WEBP` or "Convert Multiple Images to Single PDF".
     - PDF: `PNG`, `JPG`, `WEBP`, `SVG` (ZIP archive download).
  3. Action button: "Convert & Download" with active conversion spinner and error toasts.
- **Verification**: Component rendering and format selection validation.

### Task 3: Smart Media Compressor Workspace
- **Files**:
  - `frontend/src/components/compressor/SmartCompressorWorkspace.tsx`
- **Actions**:
  1. File selector for active image, audio, or video files.
  2. Preset selector cards:
     - `high_quality`: "High Quality / Visually Lossless" (CRF 26 / WebP Q80 / 128k audio).
     - `max_compression`: "Maximum Compression" (CRF 30 / WebP Q60 / 720p scale / 96k audio).
     - `lossless`: "Lossless" (image optimization).
  3. Before / After metric card:
     - Original size badge vs. Compressed size badge.
     - Green percentage savings badge (e.g. `-68.4% saved`).
     - One-click "Download Compressed File" button.
- **Verification**: Metric calculation and component state transitions.

### Task 4: Main Studio Integration
- **Files**:
  - `frontend/src/app/page.tsx`
- **Actions**:
  1. Render `MediaConverterWorkspace` when `activeTab === 'converter'`.
  2. Render `SmartCompressorWorkspace` when `activeTab === 'compressor'`.
  3. Clicking "Convert" or "Compress" on any staged file card automatically switches to that tab and pre-selects the file.
- **Verification**: Seamless tab switching and contextual file selection.

### Task 5: Build Verification & TypeScript Compile Check
- **Actions**:
  1. Run `npx tsc --noEmit` and confirm 0 errors.
  2. Run `npm run build` and confirm production bundle passes.
