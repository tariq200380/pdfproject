# Phase 2 Research: Universal Media & Compression Engine

## 1. FFmpeg Transcoding Architecture

### 1.1 Non-Blocking Asynchronous Subprocess Execution
To ensure the FastAPI event loop remains responsive during heavy media processing:
- Use `asyncio.create_subprocess_exec("ffmpeg", *args, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE)`
- **Security**: Never invoke via `shell=True`. Pass arguments strictly as a sanitized list of strings.
- Enforce process timeout (e.g. 180s) to prevent orphan zombie jobs.

### 1.2 Universal Audio Conversion Matrix
FFmpeg encodes across all target formats using verified system codecs:

| Format | Target Extension | Recommended Codec | Standard Bitrate | Sample Rates |
| :--- | :--- | :--- | :--- | :--- |
| **MP3** | `.mp3` | `libmp3lame` | 128k, 192k, 256k, 320k | 44.1kHz, 48kHz |
| **WAV** | `.wav` | `pcm_s16le` | Uncompressed PCM | 44.1kHz, 48kHz |
| **AAC** | `.aac` | `aac` | 128k, 192k, 256k | 44.1kHz, 48kHz |
| **FLAC** | `.flac` | `flac` | Lossless (`-compression_level 5`) | 44.1kHz, 48kHz, 96kHz |
| **OGG** | `.ogg` | `libvorbis` | Variable quality (`-q:a 4` to `8`) | 44.1kHz, 48kHz |
| **M4A** | `.m4a` | `aac` | 128k, 192k, 256k | 44.1kHz, 48kHz |

### 1.3 Universal Video Conversion Matrix

| Container | Codec Video | Codec Audio | Key FFmpeg Parameters |
| :--- | :--- | :--- | :--- |
| **MP4** | `libx264` | `aac` | `-pix_fmt yuv420p -movflags +faststart` |
| **MKV** | `libx264` | `aac` | Universal flexible container |
| **WEBM** | `libvpx-vp9` | `libopus` | Modern royalty-free web standard |
| **MOV** | `libx264` | `aac` | QuickTime compatibility |
| **AVI** | `mpeg4` | `libmp3lame` | Legacy player compatibility |

**Resolution Downscaling Logic**:
- Original: no scaling filter.
- 1080p: `-vf "scale='min(1920,iw)':-2"`
- 720p: `-vf "scale='min(1280,iw)':-2"`
- 480p: `-vf "scale='min(854,iw)':-2"`

---

## 2. Smart Media Compression Pipelines

### 2.1 Video Compression via Constant Rate Factor (CRF)
Constant Rate Factor (CRF) produces constant perceptual visual quality while allowing the encoder to vary bitrate dynamically based on scene complexity:
- **Preset Modes**:
  - *Light / Visually Lossless*: CRF 22, audio 192k. ~20–40% file size reduction.
  - *Balanced / High Quality (Recommended)*: CRF 26, audio 128k. ~50–70% file size reduction with imperceptible degradation.
  - *Maximum Compression*: CRF 30, audio 96k, downscale to 720p if higher. ~70–85% file size reduction.

### 2.2 Audio Compression
- Use Opus (`libopus`) or AAC (`aac`) with VBR targeting 96k–128k for stereo audio, providing up to 60–80% size savings over uncompressed WAV or high-bitrate MP3.

### 2.3 Image Compression & Format Transformation
- **Images to PDF**: PyMuPDF creates new document pages and embeds each image matching native DPI and aspect ratio, avoiding re-compression artifacts.
- **PDF to Images**: PyMuPDF renders pages at selectable DPI (72, 150, 300) directly into PNG, JPEG, WEBP, or SVG (`page.get_svg_image()`).
- **Image Optimization**:
  - WebP: Convert PNG/JPEG to WebP with `quality=80` and `method=6` (typically 30–50% smaller than JPEG at identical visual quality).
  - JPEG: Pillow `optimize=True`, `progressive=True`, `quality=80`.
  - PNG: Pillow `optimize=True`.
  - HEIC support: Integrated via `pillow_heif` to decode modern Apple HEIC/HEIF photos seamlessly into standard formats.
