"""Unit tests for FFmpegService audio and video transcoding."""

import pytest
import subprocess
from pathlib import Path
from backend.app.services.ffmpeg_service import (
    ffmpeg_service,
    AudioTranscodeOptions,
    VideoTranscodeOptions,
)


def test_ffmpeg_availability():
    assert ffmpeg_service.is_available() is True


@pytest.mark.asyncio
async def test_transcode_audio_formats(tmp_path, synthetic_wav_file):
    # Test MP3
    mp3_out = tmp_path / "output.mp3"
    await ffmpeg_service.transcode_audio(
        synthetic_wav_file,
        "mp3",
        AudioTranscodeOptions(bitrate="128k"),
        mp3_out,
    )
    assert mp3_out.exists()
    assert mp3_out.stat().st_size > 0

    # Test AAC
    aac_out = tmp_path / "output.aac"
    await ffmpeg_service.transcode_audio(synthetic_wav_file, "aac", output_path=aac_out)
    assert aac_out.exists()

    # Test FLAC
    flac_out = tmp_path / "output.flac"
    await ffmpeg_service.transcode_audio(synthetic_wav_file, "flac", output_path=flac_out)
    assert flac_out.exists()

    # Test OGG
    ogg_out = tmp_path / "output.ogg"
    await ffmpeg_service.transcode_audio(synthetic_wav_file, "ogg", output_path=ogg_out)
    assert ogg_out.exists()


@pytest.mark.asyncio
async def test_transcode_video_formats(tmp_path, synthetic_mp4_file):
    # Test MKV
    mkv_out = tmp_path / "output.mkv"
    await ffmpeg_service.transcode_video(
        synthetic_mp4_file,
        "mkv",
        VideoTranscodeOptions(resolution="original"),
        mkv_out,
    )
    assert mkv_out.exists()
    assert mkv_out.stat().st_size > 0

    # Test 480p downscaling
    p480_out = tmp_path / "output_480p.mp4"
    await ffmpeg_service.transcode_video(
        synthetic_mp4_file,
        "mp4",
        VideoTranscodeOptions(resolution="480p"),
        p480_out,
    )
    assert p480_out.exists()


@pytest.mark.asyncio
async def test_unsupported_audio_format(synthetic_wav_file):
    with pytest.raises(ValueError, match="Unsupported audio target format"):
        await ffmpeg_service.transcode_audio(synthetic_wav_file, "xyz_invalid")
