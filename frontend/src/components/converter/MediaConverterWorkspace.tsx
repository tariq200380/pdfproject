'use client';

import React, { useState } from 'react';
import { StagedFile } from '@/lib/types';
import { mediaApiClient, triggerDownload } from '@/lib/mediaApiClient';
import { RefreshCw, ArrowLeft, Download, Loader2, Sparkles, FileText, Music, Video, Image as ImageIcon } from 'lucide-react';

interface MediaConverterWorkspaceProps {
  stagedFiles: StagedFile[];
  initialFileId?: string;
  onBack: () => void;
}

export const MediaConverterWorkspace: React.FC<MediaConverterWorkspaceProps> = ({
  stagedFiles,
  initialFileId,
  onBack,
}) => {
  const [selectedId, setSelectedId] = useState<string>(
    initialFileId || (stagedFiles.length > 0 ? stagedFiles[0].id : '')
  );

  // Conversion options
  const [audioFormat, setAudioFormat] = useState('mp3');
  const [audioBitrate, setAudioBitrate] = useState('192k');

  const [videoFormat, setVideoFormat] = useState('mp4');
  const [videoResolution, setVideoResolution] = useState('original');

  const [imageFormat, setImageFormat] = useState('webp');
  const [pdfImageFormat, setPdfImageFormat] = useState('png');

  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedFile = stagedFiles.find((f) => f.id === selectedId) || stagedFiles[0];

  const handleConvert = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setErrorMsg(null);
    setStatusMsg(`Converting ${selectedFile.name}...`);

    try {
      let result: { blob: Blob; filename: string };

      if (selectedFile.category === 'audio') {
        result = await mediaApiClient.convertAudio(
          selectedFile.file,
          audioFormat,
          audioBitrate,
        );
      } else if (selectedFile.category === 'video') {
        result = await mediaApiClient.convertVideo(
          selectedFile.file,
          videoFormat,
          videoResolution,
        );
      } else if (selectedFile.category === 'image') {
        result = await mediaApiClient.convertImage(
          selectedFile.file,
          imageFormat,
        );
      } else if (selectedFile.category === 'pdf') {
        result = await mediaApiClient.convertPdfToImages(
          selectedFile.file,
          pdfImageFormat,
        );
      } else {
        throw new Error(`Unsupported file type: ${selectedFile.name}`);
      }

      setStatusMsg(`Conversion complete! Downloading ${result.filename}...`);
      triggerDownload(result.blob, result.filename);
      setTimeout(() => setStatusMsg(null), 5000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Conversion failed');
      setStatusMsg(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBatchImagesToPdf = async () => {
    const images = stagedFiles.filter((f) => f.category === 'image');
    if (images.length === 0) {
      setErrorMsg('No image files available to combine into PDF');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);
    setStatusMsg(`Combining ${images.length} images into a PDF...`);

    try {
      const result = await mediaApiClient.convertImagesToPdf(images.map((f) => f.file));
      setStatusMsg(`PDF created! Downloading ${result.filename}...`);
      triggerDownload(result.blob, result.filename);
      setTimeout(() => setStatusMsg(null), 5000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Batch images to PDF failed');
      setStatusMsg(null);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '24px auto', padding: '0 16px' }}>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={onBack} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }}>
            <ArrowLeft size={14} />
            Workspace
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <RefreshCw size={18} color="#0f172a" />
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a' }}>
              Universal Media Converter
            </h2>
          </div>
        </div>

        {stagedFiles.filter((f) => f.category === 'image').length >= 2 && (
          <button
            onClick={handleBatchImagesToPdf}
            disabled={isProcessing}
            className="btn btn-secondary"
            style={{ fontSize: '13px', padding: '6px 14px' }}
          >
            <FileText size={14} color="#b91c1c" />
            Combine All Images to PDF
          </button>
        )}
      </div>

      {statusMsg && (
        <div style={{
          padding: '10px 16px',
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '6px',
          color: '#166534',
          fontSize: '13px',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '16px',
        }}>
          <Sparkles size={15} />
          {statusMsg}
        </div>
      )}

      {errorMsg && (
        <div style={{
          padding: '10px 16px',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '6px',
          color: '#b91c1c',
          fontSize: '13px',
          fontWeight: 500,
          marginBottom: '16px',
        }}>
          {errorMsg}
        </div>
      )}

      {/* Main Conversion Control Card */}
      {selectedFile ? (
        <div className="solid-card" style={{ padding: '28px' }}>
          {/* File Picker Row */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '8px' }}>
              Select File to Convert
            </label>
            <select
              value={selectedFile.id}
              onChange={(e) => setSelectedId(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                fontSize: '14px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                outline: 'none',
              }}
            >
              {stagedFiles.map((f) => (
                <option key={f.id} value={f.id}>
                  [{f.category.toUpperCase()}] {f.name} ({(f.size / 1024 / 1024).toFixed(1)} MB)
                </option>
              ))}
            </select>
          </div>

          {/* Contextual Options */}
          {selectedFile.category === 'audio' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>
                  Target Audio Format
                </label>
                <select
                  value={audioFormat}
                  onChange={(e) => setAudioFormat(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '13px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <option value="mp3">MP3 (MPEG Audio Layer 3)</option>
                  <option value="wav">WAV (Uncompressed PCM)</option>
                  <option value="aac">AAC (Advanced Audio Coding)</option>
                  <option value="flac">FLAC (Free Lossless Audio)</option>
                  <option value="ogg">OGG (Vorbis)</option>
                  <option value="m4a">M4A (Apple Audio)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>
                  Bitrate
                </label>
                <select
                  value={audioBitrate}
                  onChange={(e) => setAudioBitrate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '13px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <option value="128k">128 kbps (Compact)</option>
                  <option value="192k">192 kbps (Standard High Quality)</option>
                  <option value="256k">256 kbps (Premium)</option>
                  <option value="320k">320 kbps (Maximum Quality)</option>
                </select>
              </div>
            </div>
          )}

          {selectedFile.category === 'video' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>
                  Target Video Container
                </label>
                <select
                  value={videoFormat}
                  onChange={(e) => setVideoFormat(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '13px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <option value="mp4">MP4 (H.264 / AAC - Universal Web)</option>
                  <option value="mkv">MKV (Matroska Multimedia)</option>
                  <option value="webm">WEBM (VP9 / Opus - Modern Web)</option>
                  <option value="mov">MOV (Apple QuickTime)</option>
                  <option value="avi">AVI (Audio Video Interleave)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>
                  Resolution Scaling
                </label>
                <select
                  value={videoResolution}
                  onChange={(e) => setVideoResolution(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    fontSize: '13px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <option value="original">Original Resolution</option>
                  <option value="1080p">1080p Full HD (1920x1080)</option>
                  <option value="720p">720p HD (1280x720)</option>
                  <option value="480p">480p SD (854x480)</option>
                </select>
              </div>
            </div>
          )}

          {selectedFile.category === 'image' && (
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>
                Target Image Format
              </label>
              <select
                value={imageFormat}
                onChange={(e) => setImageFormat(e.target.value)}
                style={{
                  maxWidth: '300px',
                  padding: '8px 12px',
                  fontSize: '13px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                }}
              >
                <option value="webp">WEBP (Modern High Efficiency)</option>
                <option value="png">PNG (Lossless with Alpha)</option>
                <option value="jpg">JPG (Standard Photography)</option>
              </select>
            </div>
          )}

          {selectedFile.category === 'pdf' && (
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '6px' }}>
                Convert PDF Pages to Image Format
              </label>
              <select
                value={pdfImageFormat}
                onChange={(e) => setPdfImageFormat(e.target.value)}
                style={{
                  maxWidth: '300px',
                  padding: '8px 12px',
                  fontSize: '13px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                }}
              >
                <option value="png">PNG (Raster 150 DPI - High Fidelity)</option>
                <option value="jpg">JPG (Compressed 150 DPI)</option>
                <option value="webp">WEBP (Ultra Compact)</option>
                <option value="svg">SVG (Scalable Vector Graphics)</option>
              </select>
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
                Multi-page PDFs will be automatically packaged into a convenient ZIP archive.
              </p>
            </div>
          )}

          {/* Action Trigger */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '18px' }}>
            <button
              onClick={handleConvert}
              disabled={isProcessing}
              className="btn btn-primary"
              style={{ padding: '10px 22px', fontSize: '14px' }}
            >
              {isProcessing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Transcoding with FFmpeg...
                </>
              ) : (
                <>
                  <Download size={16} />
                  Convert & Download
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="solid-card" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
          No files staged in workspace. Please add files in the Workspace tab first.
        </div>
      )}
    </div>
  );
};
