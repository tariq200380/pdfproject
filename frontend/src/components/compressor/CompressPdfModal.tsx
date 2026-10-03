'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  FileText,
  CheckCircle2,
  Download,
  Loader2,
  Sparkles,
  Zap,
  ArrowRight,
  TrendingDown,
  AlertCircle,
  RefreshCw,
  Eye,
  Sliders,
  ShieldCheck,
  Maximize2,
  Image as ImageIcon,
} from 'lucide-react';
import { mediaApiClient, triggerDownload, CompressionResponse } from '@/lib/mediaApiClient';

interface CompressPdfModalProps {
  isOpen: boolean;
  file: File | null;
  onClose: () => void;
  onCompressedSuccess?: (result: CompressionResponse) => void;
}

export const CompressPdfModal: React.FC<CompressPdfModalProps> = ({
  isOpen,
  file,
  onClose,
  onCompressedSuccess,
}) => {
  const [qualityPercent, setQualityPercent] = useState<number>(70);
  const [previewMode, setPreviewMode] = useState<'compressed' | 'original'>('compressed');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<CompressionResponse | null>(null);

  // Estimated size reduction based on quality percentage
  const estimatedSavings = useMemo(() => {
    const fileSize = file?.size || 0;
    const reductionFactor = Math.max(0.12, Math.min(0.88, (100 - qualityPercent * 0.9) / 100));
    const estimatedSizeBytes = Math.round(fileSize * (1 - reductionFactor));
    const percentReduction = Math.round(reductionFactor * 100);
    return {
      estimatedSizeBytes,
      percentReduction,
    };
  }, [file?.size, qualityPercent]);

  // Quality description & health indicator
  const qualityInfo = useMemo(() => {
    if (qualityPercent >= 80) {
      return {
        level: 'Excellent Quality',
        color: '#059669',
        bgColor: '#ecfdf5',
        text: 'Visual sharpness preserved. Perfect for legal documents, portfolios, and print.',
      };
    } else if (qualityPercent >= 60) {
      return {
        level: 'Good Quality (Balanced)',
        color: '#2563eb',
        bgColor: '#eff6ff',
        text: 'Great balance of clear text and small size. Recommended for email and web sharing.',
      };
    } else if (qualityPercent >= 40) {
      return {
        level: 'Standard Compression',
        color: '#d97706',
        bgColor: '#fffbeb',
        text: 'Moderate image downsampling. Ideal for upload portals with under 5MB restrictions.',
      };
    } else {
      return {
        level: 'Maximum Compression',
        color: '#dc2626',
        bgColor: '#fef2f2',
        text: 'Deepest size reduction. Images are heavily compressed for strict 1MB/2MB portals.',
      };
    }
  }, [qualityPercent]);

  if (!isOpen || !file) return null;

  const formatBytes = (bytes: number): string => {
    if (!bytes || bytes <= 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleStartCompression = async () => {
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      // Pass numeric quality percentage as preset parameter
      const res = await mediaApiClient.compressAsset(file, 'pdf', String(qualityPercent));
      setResult(res);
      if (onCompressedSuccess) {
        onCompressedSuccess(res);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Compression failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (result) {
      triggerDownload(result.blob, result.filename);
    }
  };

  const handleReset = () => {
    setResult(null);
    setErrorMsg(null);
  };

  // Preset buttons
  const presets = [
    { label: 'Low (85%)', value: 85, desc: 'Light reduction' },
    { label: 'Balanced (70%)', value: 70, desc: '~50% smaller' },
    { label: 'High (45%)', value: 45, desc: '~70% smaller' },
    { label: 'Extreme (25%)', value: 25, desc: '~85% smaller' },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(5px)',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35)',
          border: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: '1px solid #f1f5f9',
            backgroundColor: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: '#383431',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
              }}
            >
              <TrendingDown size={22} strokeWidth={2.4} />
            </div>
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: 800,
                  color: '#0f172a',
                  lineHeight: 1.2,
                }}
              >
                Custom PDF Compressor
              </h3>
              <p
                style={{
                  margin: '3px 0 0 0',
                  fontSize: '13px',
                  color: '#64748b',
                }}
              >
                Adjust compression percentage & preview visual quality
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {/* File Information Card */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 18px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              marginBottom: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: '#fee2e2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#dc2626',
                  flexShrink: 0,
                }}
              >
                <FileText size={20} />
              </div>
              <div style={{ minWidth: 0 }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#0f172a',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '380px',
                  }}
                  title={file.name}
                >
                  {file.name}
                </p>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                  Original Size: <strong>{formatBytes(file.size)}</strong>
                </p>
              </div>
            </div>
            <span
              style={{
                fontSize: '11.5px',
                fontWeight: 700,
                color: '#0369a1',
                backgroundColor: '#e0f2fe',
                padding: '4px 10px',
                borderRadius: '12px',
                flexShrink: 0,
              }}
            >
              PDF Document
            </span>
          </div>

          {/* Success View */}
          {result ? (
            <div>
              <div
                style={{
                  textAlign: 'center',
                  padding: '24px 20px',
                  backgroundColor: '#f0fdf4',
                  borderRadius: '14px',
                  border: '1px solid #bbf7d0',
                  marginBottom: '20px',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px auto',
                  }}
                >
                  <CheckCircle2 size={28} />
                </div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: 800, color: '#065f46' }}>
                  PDF Compressed Successfully!
                </h4>
                <p style={{ margin: 0, fontSize: '13.5px', color: '#047857' }}>
                  Target quality was set to <strong>{qualityPercent}%</strong>.
                </p>

                {/* Comparison Card */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '20px',
                    marginTop: '20px',
                    padding: '14px',
                    backgroundColor: '#ffffff',
                    borderRadius: '10px',
                    border: '1px solid #dcfce7',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>Before</span>
                    <strong style={{ fontSize: '16px', color: '#0f172a' }}>
                      {formatBytes(result.originalSize)}
                    </strong>
                  </div>
                  <ArrowRight size={18} color="#10b981" />
                  <div>
                    <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>After</span>
                    <strong style={{ fontSize: '16px', color: '#10b981' }}>
                      {formatBytes(result.compressedSize)}
                    </strong>
                  </div>
                  {result.percentSaved > 0 && (
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        backgroundColor: '#dcfce7',
                        color: '#15803d',
                        fontSize: '13px',
                        fontWeight: 800,
                      }}
                    >
                      -{result.percentSaved}% Saved
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={handleReset}
                  style={{
                    flex: 1,
                    padding: '12px 18px',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <RefreshCw size={15} />
                  <span>Adjust & Compress Again</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  style={{
                    flex: 2,
                    padding: '12px 24px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#383431',
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(56, 52, 49, 0.35)',
                  }}
                >
                  <Download size={17} />
                  <span>Download Compressed PDF</span>
                </button>
              </div>
            </div>
          ) : (
            /* Adjustment & Preview View */
            <div>
              {/* Quality & Reduction Metrics Header */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '12px',
                  marginBottom: '20px',
                }}
              >
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    textAlign: 'center',
                  }}
                >
                  <span style={{ fontSize: '12px', color: '#64748b', display: 'block', fontWeight: 500 }}>
                    Target Quality
                  </span>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: qualityInfo.color }}>
                    {qualityPercent}%
                  </span>
                </div>

                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    textAlign: 'center',
                  }}
                >
                  <span style={{ fontSize: '12px', color: '#64748b', display: 'block', fontWeight: 500 }}>
                    Est. Reduction
                  </span>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: '#059669' }}>
                    ~{estimatedSavings.percentReduction}%
                  </span>
                </div>

                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    textAlign: 'center',
                  }}
                >
                  <span style={{ fontSize: '12px', color: '#64748b', display: 'block', fontWeight: 500 }}>
                    Est. Output Size
                  </span>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                    {formatBytes(estimatedSavings.estimatedSizeBytes)}
                  </span>
                </div>
              </div>

              {/* Range Slider for Quality vs Size */}
              <div style={{ marginBottom: '22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '13.5px', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sliders size={16} />
                    <span>Compression Level & Quality Percentage</span>
                  </label>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '6px',
                      backgroundColor: qualityInfo.bgColor,
                      color: qualityInfo.color,
                    }}
                  >
                    {qualityInfo.level}
                  </span>
                </div>

                {/* Range Input */}
                <input
                  type="range"
                  min="20"
                  max="95"
                  step="5"
                  value={qualityPercent}
                  onChange={(e) => setQualityPercent(parseInt(e.target.value, 10))}
                  style={{
                    width: '100%',
                    height: '8px',
                    borderRadius: '5px',
                    accentColor: '#383431',
                    cursor: 'pointer',
                  }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#94a3b8', marginTop: '6px' }}>
                  <span>Max Compression (20% Quality)</span>
                  <span>Balanced (70%)</span>
                  <span>Max Quality (95%)</span>
                </div>

                {/* Presets Quick Buttons */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                  {presets.map((p) => {
                    const isSelected = qualityPercent === p.value;
                    return (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => setQualityPercent(p.value)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: isSelected ? '1.5px solid #383431' : '1px solid #cbd5e1',
                          backgroundColor: isSelected ? '#383431' : '#ffffff',
                          color: isSelected ? '#ffffff' : '#475569',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <span>{p.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quality Preview Section (User: "quality ka preview dekhy user ko") */}
              <div
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '14px',
                  backgroundColor: '#ffffff',
                  overflow: 'hidden',
                  marginBottom: '20px',
                }}
              >
                {/* Preview Header & Mode Toggle */}
                <div
                  style={{
                    padding: '10px 16px',
                    backgroundColor: '#f8fafc',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Eye size={15} color="#475569" />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                      Visual Quality Preview
                    </span>
                  </div>

                  {/* Toggle between Original and Compressed Preview */}
                  <div style={{ display: 'flex', backgroundColor: '#e2e8f0', padding: '2px', borderRadius: '6px' }}>
                    <button
                      type="button"
                      onClick={() => setPreviewMode('original')}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '4px',
                        border: 'none',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        backgroundColor: previewMode === 'original' ? '#ffffff' : 'transparent',
                        color: previewMode === 'original' ? '#0f172a' : '#64748b',
                        boxShadow: previewMode === 'original' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      }}
                    >
                      Original (100%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewMode('compressed')}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '4px',
                        border: 'none',
                        fontSize: '11.5px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        backgroundColor: previewMode === 'compressed' ? '#383431' : 'transparent',
                        color: previewMode === 'compressed' ? '#ffffff' : '#64748b',
                        boxShadow: previewMode === 'compressed' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                      }}
                    >
                      Compressed ({qualityPercent}%)
                    </button>
                  </div>
                </div>

                {/* Simulated Document / Image Preview Pane */}
                <div
                  style={{
                    padding: '20px',
                    backgroundColor: '#fcfcfc',
                    display: 'flex',
                    gap: '16px',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {/* Document Page Simulation Canvas */}
                  <div
                    style={{
                      width: '280px',
                      height: '190px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                      padding: '14px 16px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative',
                      overflow: 'hidden',
                      // Live CSS filter based on preview mode & quality percentage
                      filter:
                        previewMode === 'compressed'
                          ? `contrast(${100 - (100 - qualityPercent) * 0.15}%) blur(${(100 - qualityPercent) > 50 ? ((100 - qualityPercent) - 50) * 0.015 : 0}px)`
                          : 'none',
                      transition: 'filter 0.15s ease',
                    }}
                  >
                    {/* Simulated Document Header */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ height: '8px', width: '90px', backgroundColor: '#334155', borderRadius: '4px' }} />
                        <span style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 600 }}>PAGE 1</span>
                      </div>
                      <div style={{ height: '5px', width: '180px', backgroundColor: '#94a3b8', borderRadius: '3px', marginBottom: '6px' }} />
                      <div style={{ height: '5px', width: '220px', backgroundColor: '#cbd5e1', borderRadius: '3px', marginBottom: '6px' }} />
                      <div style={{ height: '5px', width: '150px', backgroundColor: '#e2e8f0', borderRadius: '3px' }} />
                    </div>

                    {/* Simulated Image & Chart Graphic inside Document */}
                    <div
                      style={{
                        height: '65px',
                        backgroundColor: '#f1f5f9',
                        borderRadius: '6px',
                        border: '1px dashed #cbd5e1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        padding: '0 10px',
                      }}
                    >
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '6px',
                          backgroundColor: '#e0e7ff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#4338ca',
                        }}
                      >
                        <ImageIcon size={20} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ height: '6px', width: '80%', backgroundColor: '#a5b4fc', borderRadius: '3px', marginBottom: '4px' }} />
                        <div style={{ height: '4px', width: '60%', backgroundColor: '#cbd5e1', borderRadius: '2px' }} />
                      </div>
                    </div>

                    {/* Simulated Text Lines */}
                    <div>
                      <div style={{ height: '4px', width: '100%', backgroundColor: '#cbd5e1', borderRadius: '2px', marginBottom: '4px' }} />
                      <div style={{ height: '4px', width: '85%', backgroundColor: '#e2e8f0', borderRadius: '2px' }} />
                    </div>

                    {/* Watermark Tag */}
                    <div
                      style={{
                        position: 'absolute',
                        right: '8px',
                        bottom: '6px',
                        fontSize: '9px',
                        fontWeight: 700,
                        color: previewMode === 'compressed' ? qualityInfo.color : '#64748b',
                      }}
                    >
                      {previewMode === 'compressed' ? `${qualityPercent}% Quality` : '100% Original'}
                    </div>
                  </div>

                  {/* Inspector Details */}
                  <div style={{ flex: 1, fontSize: '12px', color: '#475569' }}>
                    <div style={{ marginBottom: '8px' }}>
                      <span style={{ fontWeight: 700, color: '#0f172a', display: 'block', fontSize: '13px' }}>
                        {previewMode === 'compressed' ? `Compressed View (${qualityPercent}%)` : 'Original View (100%)'}
                      </span>
                      <p style={{ margin: '4px 0 0 0', lineHeight: 1.4, color: '#64748b', fontSize: '12px' }}>
                        {qualityInfo.text}
                      </p>
                    </div>

                    <div style={{ padding: '8px 10px', borderRadius: '8px', backgroundColor: qualityInfo.bgColor, color: qualityInfo.color, fontWeight: 600, fontSize: '11.5px' }}>
                      ✓ Text remains 100% vector-sharp and searchable.
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Alert */}
              {errorMsg && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 14px',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    color: '#b91c1c',
                    fontSize: '13px',
                    marginBottom: '16px',
                  }}
                >
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Target: <strong>{formatBytes(estimatedSavings.estimatedSizeBytes)}</strong> (~{estimatedSavings.percentReduction}% reduction)
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isProcessing}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      color: '#475569',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleStartCompression}
                    disabled={isProcessing}
                    style={{
                      padding: '11px 26px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: '#383431',
                      color: '#ffffff',
                      fontSize: '14px',
                      fontWeight: 700,
                      cursor: isProcessing ? 'not-allowed' : 'pointer',
                      opacity: isProcessing ? 0.75 : 1,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 14px rgba(56, 52, 49, 0.3)',
                    }}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Compressing at {qualityPercent}%...</span>
                      </>
                    ) : (
                      <>
                        <Zap size={16} />
                        <span>Compress ({qualityPercent}% Quality)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
