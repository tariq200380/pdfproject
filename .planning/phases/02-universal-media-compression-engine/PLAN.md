# Phase 2 Execution Plan: Universal Media & Compression Engine

## Phase Summary
Implement universal audio/video conversion and smart media compression pipelines powered by asynchronous FFmpeg subprocesses, Pillow, and PyMuPDF.

---

## Tasks

### Task 1: Asynchronous FFmpeg Service (Audio & Video Transcoding)
- **Files**:
  - `backend/app/services/ffmpeg_service.py`
  - `backend/tests/test_ffmpeg_service.py`
- **Actions**:
  1. Build secure asynchronous process runner (`asyncio.create_subprocess_exec`) with strict list arguments (`shell=False`) and timeout handling.
  2. Implement `AudioTranscodeOptions` and `transcode_audio()`:
     - Formats: `mp3`, `wav`, `aac`, `flac`, `ogg`, `m4a`.
     - Codecs: `libmp3lame`, `pcm_s16le`, `aac`, `flac`, `libvorbis`.
     - Parameters: bitrate (`128k`, `192k`, `256k`, `320k`), sample rate (`44100`, `48000`), channels (`1`, `2`).
  3. Implement `VideoTranscodeOptions` and `transcode_video()`:
     - Containers: `mp4`, `mkv`, `avi`, `webm`, `mov`.
     - Codecs: `libx264`, `libvpx-vp9`, `mpeg4`.
     - Resolution presets: `original`, `1080p`, `720p`, `480p`.
- **Verification**: Transcode synthetic audio and video files and assert target format and playable headers with `ffprobe`.

### Task 2: Image Conversion & Transformation Engine
- **Files**:
  - `backend/app/services/image_engine.py`
  - `backend/tests/test_image_engine.py`
- **Actions**:
  1. Implement `convert_images_to_pdf(image_paths, output_pdf)`: converts single or multiple images (`PNG`, `JPG`, `WEBP`, `HEIC`) to a multi-page PDF.
  2. Implement `convert_pdf_to_images(pdf_input, target_format, dpi, output_zip_or_img)`: extracts PDF pages to `PNG`, `JPG`, `WEBP`, or `SVG` (ZIP for multi-page).
  3. Implement `convert_image_format(input_img, target_format, output_img)`: converts between `PNG`, `JPG`, `WEBP`, and `HEIC`.
- **Verification**: Convert PNG -> PDF, PDF -> SVG/WEBP, and verify output dimensions and valid file headers.

### Task 3: Smart Media Compressor Service
- **Files**:
  - `backend/app/services/compressor_service.py`
  - `backend/tests/test_compressor_service.py`
- **Actions**:
  1. Implement `compress_image(input_img, preset, output_img) -> CompressionResult`:
     - Presets: `lossless`, `high_quality` (quality 80, webp/mozjpeg), `max_compression` (quality 60).
     - Returns: `original_size`, `compressed_size`, `bytes_saved`, `percent_saved`.
  2. Implement `compress_video(input_vid, preset, output_vid) -> CompressionResult`:
     - Presets:
       - `high_quality`: CRF 26, audio 128k.
       - `max_compression`: CRF 30, audio 96k, downscale to 720p.
     - Returns before/after metrics.
  3. Implement `compress_audio(input_aud, preset, output_aud) -> CompressionResult`:
     - Presets: `high_quality` (128k AAC/Opus), `max_compression` (96k AAC/Opus).
- **Verification**: Compress sample images, audio, and video files, verifying size reduction (>20%) and output integrity.

### Task 4: Media REST API Endpoints
- **Files**:
  - `backend/app/api/routes_media.py`
  - `backend/app/api/routes_compress.py`
- **Actions**:
  1. Build `/api/convert/audio` endpoint (multipart audio upload, format selection, stream download with background cleanup).
  2. Build `/api/convert/video` endpoint (multipart video upload, container/resolution selection, stream download with background cleanup).
  3. Build `/api/convert/images-to-pdf` endpoint (multiple image upload, returns single PDF with cleanup).
  4. Build `/api/convert/pdf-to-images` endpoint (PDF upload, returns image or ZIP archive with cleanup).
  5. Build `/api/convert/image` endpoint (single image conversion between PNG/JPG/WEBP/HEIC).
  6. Build `/api/compress/image`, `/api/compress/video`, `/api/compress/audio` endpoints.
- **Verification**: Route tests verifying HTTP 200 responses, correct Content-Type headers, and cleanup execution.

### Task 5: App Integration & Lifespan Check
- **Files**:
  - `backend/app/main.py`
- **Actions**:
  1. Mount `routes_media` and `routes_compress` into FastAPI router.
  2. Add FFmpeg and codec health check to `/api/health`.
- **Verification**: `GET /api/health` reports ffmpeg availability.

### Task 6: Comprehensive Verification & Pytest Suite
- **Files**:
  - `backend/tests/test_api_media.py`
  - `backend/tests/test_api_compress.py`
- **Actions**:
  1. Generate synthetic audiovisual media fixture helpers via FFmpeg command-line generators (`sine` audio, `testsrc` video).
  2. Run `pytest -v` across all test modules.
  3. Assert 100% test pass rate with zero orphaned files in `/tmp/omnistudio_sandbox`.
