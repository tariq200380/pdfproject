"""Asynchronous FFmpeg service for universal audio and video transcoding."""

import asyncio
import logging
import shutil
from pathlib import Path
from typing import List, Optional
from pydantic import BaseModel, Field

logger = logging.getLogger("omnistudio.ffmpeg")


class AudioTranscodeOptions(BaseModel):
    bitrate: Optional[str] = "192k"  # e.g., "128k", "192k", "256k", "320k"
    sample_rate: Optional[int] = None  # e.g., 44100, 48000
    channels: Optional[int] = None  # 1 (mono), 2 (stereo)


class VideoTranscodeOptions(BaseModel):
    resolution: Optional[str] = "original"  # "original", "1080p", "720p", "480p"
    crf: Optional[int] = None  # Constant Rate Factor (18-35)
    preset: Optional[str] = "medium"  # "ultrafast", "fast", "medium", "slow"
    audio_bitrate: Optional[str] = "128k"


class FFmpegService:
    """Manages asynchronous FFmpeg execution with argument sanitization and timeout protection."""

    def __init__(self, ffmpeg_bin: str = "ffmpeg", ffprobe_bin: str = "ffprobe", timeout_seconds: int = 180):
        self.ffmpeg_bin = ffmpeg_bin
        self.ffprobe_bin = ffprobe_bin
        self.timeout_seconds = timeout_seconds

    def is_available(self) -> bool:
        """Checks if ffmpeg binary is installed and executable."""
        return shutil.which(self.ffmpeg_bin) is not None

    async def run_command(self, args: List[str]) -> None:
        """Executes FFmpeg asynchronously with list arguments (strictly avoiding shell=True)."""
        cmd = [self.ffmpeg_bin] + args
        logger.debug(f"Executing: {' '.join(cmd)}")

        proc = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )

        try:
            stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=self.timeout_seconds)
        except asyncio.TimeoutError:
            proc.kill()
            await proc.wait()
            raise TimeoutError(f"FFmpeg process exceeded timeout of {self.timeout_seconds}s")

        if proc.returncode != 0:
            err_msg = stderr.decode("utf-8", errors="replace").strip()
            # Extract last 5 lines for concise error reporting
            err_lines = err_msg.splitlines()[-5:]
            raise RuntimeError(f"FFmpeg execution failed (code {proc.returncode}): {' | '.join(err_lines)}")

    async def transcode_audio(
        self,
        input_path: Path,
        target_format: str,
        options: Optional[AudioTranscodeOptions] = None,
        output_path: Optional[Path] = None,
    ) -> Path:
        """Transcodes audio across MP3, WAV, AAC, FLAC, OGG, and M4A."""
        opts = options or AudioTranscodeOptions()
        fmt = target_format.lower().lstrip(".")
        out_file = output_path or input_path.with_suffix(f".{fmt}")
        out_file.parent.mkdir(parents=True, exist_ok=True)

        args = ["-y", "-i", str(input_path)]

        # Codec selection based on format
        if fmt == "mp3":
            args += ["-c:a", "libmp3lame"]
            if opts.bitrate:
                args += ["-b:a", opts.bitrate]
        elif fmt == "wav":
            args += ["-c:a", "pcm_s16le"]
        elif fmt in ("aac", "m4a"):
            args += ["-c:a", "aac"]
            if opts.bitrate:
                args += ["-b:a", opts.bitrate]
        elif fmt == "flac":
            args += ["-c:a", "flac"]
        elif fmt == "ogg":
            args += ["-c:a", "libvorbis"]
            if opts.bitrate:
                args += ["-b:a", opts.bitrate]
        else:
            raise ValueError(f"Unsupported audio target format: {fmt}")

        if opts.sample_rate:
            args += ["-ar", str(opts.sample_rate)]
        if opts.channels:
            args += ["-ac", str(opts.channels)]

        args.append(str(out_file))
        await self.run_command(args)
        return out_file

    async def transcode_video(
        self,
        input_path: Path,
        target_format: str,
        options: Optional[VideoTranscodeOptions] = None,
        output_path: Optional[Path] = None,
    ) -> Path:
        """Transcodes video across MP4, MKV, AVI, WEBM, and MOV with resolution downscaling."""
        opts = options or VideoTranscodeOptions()
        fmt = target_format.lower().lstrip(".")
        out_file = output_path or input_path.with_suffix(f".{fmt}")
        out_file.parent.mkdir(parents=True, exist_ok=True)

        args = ["-y", "-i", str(input_path)]

        # Codec selection based on target container
        if fmt == "mp4":
            args += ["-c:v", "libx264", "-c:a", "aac", "-pix_fmt", "yuv420p", "-movflags", "+faststart"]
        elif fmt == "mkv":
            args += ["-c:v", "libx264", "-c:a", "aac", "-pix_fmt", "yuv420p"]
        elif fmt == "webm":
            args += ["-c:v", "libvpx-vp9", "-c:a", "libopus", "-pix_fmt", "yuv420p"]
        elif fmt == "mov":
            args += ["-c:v", "libx264", "-c:a", "aac", "-pix_fmt", "yuv420p"]
        elif fmt == "avi":
            args += ["-c:v", "mpeg4", "-c:a", "libmp3lame"]
        elif fmt == "gif":
            args += ["-vf", "fps=10,scale='min(480,iw)':-1:flags=lanczos"]
        elif fmt == "mp3":
            args += ["-vn", "-c:a", "libmp3lame", "-b:a", "192k"]
        else:
            raise ValueError(f"Unsupported video target format: {fmt}")

        if fmt not in ("gif", "mp3"):
            # CRF / Quality
            if opts.crf is not None:
                args += ["-crf", str(opts.crf)]
            if opts.preset and fmt in ("mp4", "mkv", "mov"):
                args += ["-preset", opts.preset]

            # Audio bitrate
            if opts.audio_bitrate and fmt != "avi":
                args += ["-b:a", opts.audio_bitrate]

            # Resolution scaling
            res = (opts.resolution or "original").lower()
            if res == "1080p":
                args += ["-vf", "scale='min(1920,iw)':-2"]
            elif res == "720p":
                args += ["-vf", "scale='min(1280,iw)':-2"]
            elif res == "480p":
                args += ["-vf", "scale='min(854,iw)':-2"]

        args.append(str(out_file))
        await self.run_command(args)
        return out_file


ffmpeg_service = FFmpegService()
