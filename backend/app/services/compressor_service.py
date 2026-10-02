"""Smart Media Compressor Service: High-efficiency image, audio, and video compression."""

import logging
from pathlib import Path
from typing import Optional
from pydantic import BaseModel
from PIL import Image
from backend.app.services.ffmpeg_service import (
    ffmpeg_service,
    AudioTranscodeOptions,
    VideoTranscodeOptions,
)

logger = logging.getLogger("omnistudio.compressor")


class CompressionResult(BaseModel):
    original_size_bytes: int
    compressed_size_bytes: int
    bytes_saved: int
    percent_saved: float
    output_path: str


class CompressorService:
    """Provides high-efficiency, visually lossless and balanced media compression."""

    @staticmethod
    def _calculate_metrics(orig_size: int, comp_size: int, out_path: Path) -> CompressionResult:
        saved = max(orig_size - comp_size, 0)
        pct = round((saved / orig_size * 100.0), 2) if orig_size > 0 else 0.0
        return CompressionResult(
            original_size_bytes=orig_size,
            compressed_size_bytes=comp_size,
            bytes_saved=saved,
            percent_saved=pct,
            output_path=str(out_path),
        )

    @classmethod
    def compress_pdf(
        cls,
        input_path: Path,
        output_path: Optional[Path] = None,
    ) -> CompressionResult:
        """Compresses PDF documents using PyMuPDF stream deflation and garbage cleanup."""
        import pymupdf
        orig_size = input_path.stat().st_size
        out_p = output_path or input_path.with_name(f"{input_path.stem}_compressed.pdf")
        out_p.parent.mkdir(parents=True, exist_ok=True)

        doc = pymupdf.open(input_path)
        doc.save(out_p, garbage=4, deflate=True, clean=True)
        doc.close()

        comp_size = out_p.stat().st_size
        return cls._calculate_metrics(orig_size, comp_size, out_p)

    @classmethod
    def compress_image(
        cls,
        input_path: Path,
        preset: str = "high_quality",
        output_path: Optional[Path] = None,
    ) -> CompressionResult:
        """Compresses images using optimized WebP or JPEG encoding."""
        orig_size = input_path.stat().st_size
        out_p = output_path or input_path.with_name(f"{input_path.stem}_compressed.webp")
        out_p.parent.mkdir(parents=True, exist_ok=True)

        mode = preset.lower()
        with Image.open(input_path) as img:
            # High Quality: WebP Q80 (balanced visually lossless)
            if mode == "high_quality":
                img.save(out_p, format="WEBP", quality=80, method=6)
            # Max Compression: WebP Q60, resize if larger than 1920px
            elif mode == "max_compression":
                w, h = img.size
                if max(w, h) > 1920:
                    scale = 1920 / max(w, h)
                    img = img.resize((int(w * scale), int(h * scale)), Image.Resampling.LANCZOS)
                img.save(out_p, format="WEBP", quality=60, method=6)
            # Lossless
            elif mode == "lossless":
                img.save(out_p, format="WEBP", lossless=True, method=6)
            else:
                img.save(out_p, format="WEBP", quality=80, method=6)

        comp_size = out_p.stat().st_size
        return cls._calculate_metrics(orig_size, comp_size, out_p)

    @classmethod
    async def compress_video(
        cls,
        input_path: Path,
        preset: str = "high_quality",
        output_path: Optional[Path] = None,
    ) -> CompressionResult:
        """Compresses video using Constant Rate Factor (CRF) and audio optimization."""
        orig_size = input_path.stat().st_size
        out_p = output_path or input_path.with_name(f"{input_path.stem}_compressed.mp4")

        mode = preset.lower()
        if mode == "max_compression":
            # CRF 30, 720p scaling, 96k audio
            options = VideoTranscodeOptions(crf=30, resolution="720p", audio_bitrate="96k", preset="medium")
        else:
            # High Quality: CRF 26, 128k audio, native resolution
            options = VideoTranscodeOptions(crf=26, resolution="original", audio_bitrate="128k", preset="medium")

        await ffmpeg_service.transcode_video(input_path, "mp4", options, out_p)
        comp_size = out_p.stat().st_size
        return cls._calculate_metrics(orig_size, comp_size, out_p)

    @classmethod
    async def compress_audio(
        cls,
        input_path: Path,
        preset: str = "high_quality",
        output_path: Optional[Path] = None,
    ) -> CompressionResult:
        """Compresses audio using modern AAC or MP3 bitrate optimization."""
        orig_size = input_path.stat().st_size
        out_p = output_path or input_path.with_name(f"{input_path.stem}_compressed.m4a")

        mode = preset.lower()
        bitrate = "96k" if mode == "max_compression" else "128k"
        options = AudioTranscodeOptions(bitrate=bitrate)

        await ffmpeg_service.transcode_audio(input_path, "m4a", options, out_p)
        comp_size = out_p.stat().st_size
        return cls._calculate_metrics(orig_size, comp_size, out_p)


compressor_service = CompressorService()
