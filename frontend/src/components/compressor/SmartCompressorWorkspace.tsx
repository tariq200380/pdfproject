'use client';

import React, { useState } from 'react';
import { StagedFile } from '@/lib/types';
import { mediaApiClient, triggerDownload, CompressionResponse } from '@/lib/mediaApiClient';
import { ArrowLeft, Download, Loader2, Sparkles, Zap, CheckCircle2, TrendingDown, Layers, FileQuestion } from 'lucide-react';

interface SmartCompressorWorkspaceProps {
  stagedFiles: StagedFile[];
  initialFileId?: string;
  onBack: () => void;
}

export const SmartCompressorWorkspace: React.FC<SmartCompressorWorkspaceProps> = ({
  stagedFiles,
  initialFileId,
  onBack,
}) => {
  // Filter for compressible assets (image, video, audio)
  const compressibleFiles = stagedFiles.filter(
    (f) => f.category === 'image' || f.category === 'video' || f.category === 'audio'
  );

  const [selectedId, setSelectedId] = useState<string>(() => {
    if (initialFileId && stagedFiles.some((f) => f.id === initialFileId)) {
      return initialFileId;
    }
    return compressibleFiles.length > 0 ? compressibleFiles[0].id : (stagedFiles[0]?.id || '');
  });

  const [preset, setPreset] = useState<'high_quality' | 'max_compression' | 'lossless'>('high_quality');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<CompressionResponse | null>(null);

  const selectedFile = stagedFiles.find((f) => f.id === selectedId) || compressibleFiles[0] || stagedFiles[0];

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleCompress = async () => {
    if (!selectedFile) return;

    if (selectedFile.category === 'pdf') {
      setErrorMsg('PDF direct compression is handled via raster export or PDF operations. Please select an image, video, or audio file.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);
    setLastResult(null);

    try {
      const result = await mediaApiClient.compressAsset(
        selectedFile.file,
        selectedFile.category,
        preset
      );
      setLastResult(result);
    } catch (err: any) {
      setErrorMsg(err.message || 'Compression failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (lastResult) {
      triggerDownload(lastResult.blob, lastResult.filename);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '24px auto', padding: '0 16px' }}>
      {/* Top Bar */}
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
            <Zap size={18} color="#0f172a" />
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a' }}>
              Smart File Compressor
            </h2>
          </div>
        </div>
      </div>

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

      {selectedFile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* File Picker & Configuration Solid Card */}
          <div className="solid-card" style={{ padding: '24px' }}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '8px' }}>
                Select Asset to Compress
              </label>
              <select
                value={selectedFile.id}
                onChange={(e) => {
                  setSelectedId(e.target.value);
                  setLastResult(null);
                  setErrorMsg(null);
                }}
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
                    [{f.category.toUpperCase()}] {f.name} ({formatBytes(f.size)})
                  </option>
                ))}
              </select>
            </div>

            {selectedFile.category === 'pdf' && (
              <div style={{
                padding: '12px 16px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                color: '#64748b',
                fontSize: '13px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <FileQuestion size={16} />
                Notice: PDFs are compressed via raster conversion or vector flattening. Select an image, video, or audio file for media compression.
              </div>
            )}

            {/* Presets Grid */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '10px' }}>
                Compression Preset
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                {/* High Quality */}
                <div
                  onClick={() => setPreset('high_quality')}
                  style={{
                    padding: '16px',
                    borderRadius: '8px',
                    border: preset === 'high_quality' ? '2px solid #0f172a' : '1px solid #e2e8f0',
                    backgroundColor: preset === 'high_quality' ? '#f8fafc' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                      Balanced Quality
                    </span>
                    <span style={{ fontSize: '10px', fontWeight: 700, backgroundColor: '#dcfce7', color: '#166534', padding: '2px 6px', borderRadius: '4px' }}>
                      Recommended
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
                    Visually indistinguishable quality. Optimal WebP Q80 / CRF 26 / 128 kbps.
                  </p>
                </div>

                {/* Maximum Compression */}
                <div
                  onClick={() => setPreset('max_compression')}
                  style={{
                    padding: '16px',
                    borderRadius: '8px',
                    border: preset === 'max_compression' ? '2px solid #0f172a' : '1px solid #e2e8f0',
                    backgroundColor: preset === 'max_compression' ? '#f8fafc' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                      Max Compression
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
                    Maximum byte reduction for tight bandwidth. WebP Q60 / CRF 30 / 720p scaling / 96 kbps.
                  </p>
                </div>

                {/* Lossless (Image only) */}
                {selectedFile.category === 'image' && (
                  <div
                    onClick={() => setPreset('lossless')}
                    style={{
                      padding: '16px',
                      borderRadius: '8px',
                      border: preset === 'lossless' ? '2px solid #0f172a' : '1px solid #e2e8f0',
                      backgroundColor: preset === 'lossless' ? '#f8fafc' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                        Strict Lossless
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
                      Zero artifact reduction. Bit-perfect lossless WebP compression.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '18px' }}>
              <button
                onClick={handleCompress}
                disabled={isProcessing || selectedFile.category === 'pdf'}
                className="btn btn-primary"
                style={{ padding: '10px 24px', fontSize: '14px' }}
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Optimizing asset...
                  </>
                ) : (
                  <>
                    <Zap size={16} />
                    Compress Asset
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Card */}
          {lastResult && (
            <div className="solid-card" style={{ padding: '24px', border: '1px solid #bbf7d0', backgroundColor: '#fafffa' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <CheckCircle2 size={20} color="#166534" />
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#166534', margin: 0 }}>
                  Compression Successful
                </h3>
              </div>

              {/* Metrics Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                <div style={{ backgroundColor: '#ffffff', padding: '14px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                    Original Size
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
                    {formatBytes(lastResult.originalSize)}
                  </div>
                </div>

                <div style={{ backgroundColor: '#ffffff', padding: '14px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                    Compressed Size
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#166534', marginTop: '4px' }}>
                    {formatBytes(lastResult.compressedSize)}
                  </div>
                </div>

                <div style={{ backgroundColor: '#ffffff', padding: '14px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                    Storage Reduction
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                    <TrendingDown size={18} color="#166534" />
                    <span style={{ fontSize: '18px', fontWeight: 700, color: '#166534' }}>
                      -{lastResult.percentSaved}%
                    </span>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      ({formatBytes(lastResult.bytesSaved)} saved)
                    </span>
                  </div>
                </div>
              </div>

              {/* Download Trigger */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  onClick={handleDownload}
                  className="btn btn-primary"
                  style={{
                    backgroundColor: '#166534',
                    borderColor: '#166534',
                    padding: '10px 20px',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Download size={16} />
                  Download Compressed Asset ({lastResult.filename})
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="solid-card" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
          No files staged in workspace. Please add files in the Workspace tab first.
        </div>
      )}
    </div>
  );
};
