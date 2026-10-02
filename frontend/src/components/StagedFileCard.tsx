'use client';

import React, { useState, useEffect, useRef } from 'react';
import { StagedFile } from '@/lib/types';
import { convertersApiClient } from '@/lib/convertersApiClient';
import { mediaApiClient } from '@/lib/mediaApiClient';
import { pdfApiClient } from '@/lib/pdfApiClient';
import {
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Trash2,
  ChevronDown,
  PenLine,
  Minimize2,
  MoreVertical,
  Scissors,
  Copy,
  Sparkles,
  Lock,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Layers,
  FileSpreadsheet,
  Presentation,
  Languages,
} from 'lucide-react';

interface StagedFileCardProps {
  stagedFile: StagedFile;
  onRemove: (id: string) => void;
  onSelectAction: (file: StagedFile, action: string) => void;
}

function formatBytes(bytes: number, decimals = 1) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export const StagedFileCard: React.FC<StagedFileCardProps> = ({
  stagedFile,
  onRemove,
  onSelectAction,
}) => {
  // Dropdown states
  const [showConvertDropdown, setShowConvertDropdown] = useState(false);
  const [showMoreDropdown, setShowMoreDropdown] = useState(false);
  const [showIntelligenceDropdown, setShowIntelligenceDropdown] = useState(false);

  // Conversion / Compression processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionStage, setActionStage] = useState<string>('');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(stagedFile.metadata?.page_count || null);

  const convertRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const intelligenceRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (convertRef.current && !convertRef.current.contains(e.target as Node)) {
        setShowConvertDropdown(false);
      }
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setShowMoreDropdown(false);
      }
      if (intelligenceRef.current && !intelligenceRef.current.contains(e.target as Node)) {
        setShowIntelligenceDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Inspect PDF for page count
  useEffect(() => {
    if (stagedFile.category === 'pdf' && pageCount === null) {
      pdfApiClient
        .inspectPdf(stagedFile.file)
        .then((res) => {
          if (res?.metadata?.page_count) {
            setPageCount(res.metadata.page_count);
          }
        })
        .catch(() => {
          // Non-critical fallback if inspection is delayed
        });
    }
  }, [stagedFile, pageCount]);

  // Execute quick conversion directly from staged card
  const handleQuickConvert = async (
    targetExt: string,
    label: string,
    endpoint?: string,
    extraParams?: Record<string, string>
  ) => {
    setShowConvertDropdown(false);
    setIsProcessing(true);
    setActionStage(`Converting to ${label}...`);
    setErrorNotice(null);
    setSuccessNotice(null);

    try {
      let finalEndpoint = endpoint;
      let finalParams = extraParams;

      // Smart endpoint resolution
      if (!finalEndpoint) {
        if (stagedFile.category === 'pdf') {
          if (targetExt === 'docx') finalEndpoint = '/api/convert/pdf-to-word';
          else if (targetExt === 'xlsx') finalEndpoint = '/api/convert/pdf-to-excel';
          else if (targetExt === 'pptx') finalEndpoint = '/api/convert/pdf-to-ppt';
          else if (targetExt === 'jpg') finalEndpoint = '/api/convert/pdf-to-jpg';
          else if (targetExt === 'png') finalEndpoint = '/api/convert/pdf-to-png';
          else {
            finalEndpoint = '/api/convert/universal';
            finalParams = { target_ext: targetExt };
          }
        } else if (stagedFile.category === 'image' && targetExt === 'pdf') {
          finalEndpoint = '/api/convert/image-to-pdf';
        } else {
          finalEndpoint = '/api/convert/universal';
          finalParams = { target_ext: targetExt };
        }
      }

      setActionStage(`Processing ${label}...`);
      const result = await convertersApiClient.executeConversion(
        finalEndpoint,
        stagedFile.file,
        finalParams
      );

      setActionStage('Downloading file...');
      convertersApiClient.triggerBrowserDownload(result.blob, result.filename);

      setSuccessNotice(`Converted to ${label} successfully!`);
      setTimeout(() => setSuccessNotice(null), 5000);
    } catch (err: any) {
      console.error('Quick conversion error:', err);
      setErrorNotice(err.message || 'Conversion failed. Please try again.');
      setTimeout(() => setErrorNotice(null), 6000);
    } finally {
      setIsProcessing(false);
      setActionStage('');
    }
  };

  // Execute quick compression
  const handleQuickCompress = async () => {
    setIsProcessing(true);
    setActionStage('Compressing file...');
    setErrorNotice(null);
    setSuccessNotice(null);

    try {
      const res = await mediaApiClient.compressAsset(stagedFile.file, stagedFile.category);
      convertersApiClient.triggerBrowserDownload(res.blob, res.filename);
      const savedText = res.percentSaved > 0 ? ` (${res.percentSaved}% reduced)` : '';
      setSuccessNotice(`Compressed successfully!${savedText}`);
      setTimeout(() => setSuccessNotice(null), 5000);
    } catch (err: any) {
      console.error('Compression error:', err);
      setErrorNotice(err.message || 'Compression failed. Please try again.');
      setTimeout(() => setErrorNotice(null), 6000);
    } finally {
      setIsProcessing(false);
      setActionStage('');
    }
  };

  // Trigger modal from ToolsGrid for advanced operations
  const handleTriggerToolModal = (toolId: string) => {
    setShowMoreDropdown(false);
    setShowIntelligenceDropdown(false);
    window.dispatchEvent(
      new CustomEvent('creed-open-tool', {
        detail: { toolId, file: stagedFile.file },
      })
    );
  };

  const getIcon = () => {
    switch (stagedFile.category) {
      case 'pdf':
        return <FileText size={22} color="#b91c1c" />;
      case 'image':
        return <ImageIcon size={22} color="#047857" />;
      case 'video':
        return <Video size={22} color="#6d28d9" />;
      case 'audio':
        return <Music size={22} color="#0369a1" />;
      default:
        return <FileText size={22} color="#475569" />;
    }
  };

  const getBadgeClass = () => {
    switch (stagedFile.category) {
      case 'pdf':
        return 'badge-pdf';
      case 'image':
        return 'badge-image';
      case 'video':
        return 'badge-video';
      case 'audio':
        return 'badge-audio';
      default:
        return '';
    }
  };

  // Convert options based on file category
  const renderConvertMenuItems = () => {
    if (stagedFile.category === 'pdf') {
      return [
        { label: 'Word (.docx)', ext: 'docx', icon: <FileText size={15} color="#2563eb" /> },
        { label: 'Excel (.xlsx)', ext: 'xlsx', icon: <FileSpreadsheet size={15} color="#16a34a" /> },
        { label: 'PowerPoint (.pptx)', ext: 'pptx', icon: <Presentation size={15} color="#ea580c" /> },
        { label: 'JPEG Image (.jpg)', ext: 'jpg', icon: <ImageIcon size={15} color="#0891b2" /> },
        { label: 'PNG Image (.png)', ext: 'png', icon: <ImageIcon size={15} color="#0284c7" /> },
        { label: 'Plain Text (.txt)', ext: 'txt', icon: <FileCode size={15} color="#475569" /> },
      ];
    }
    if (stagedFile.category === 'image') {
      return [
        { label: 'PDF Document (.pdf)', ext: 'pdf', icon: <FileText size={15} color="#b91c1c" /> },
        { label: 'PNG Image (.png)', ext: 'png', icon: <ImageIcon size={15} color="#0284c7" /> },
        { label: 'JPG Image (.jpg)', ext: 'jpg', icon: <ImageIcon size={15} color="#0891b2" /> },
        { label: 'WebP Graphic (.webp)', ext: 'webp', icon: <Layers size={15} color="#7c3aed" /> },
      ];
    }
    if (stagedFile.category === 'video' || stagedFile.category === 'audio') {
      return [
        { label: 'MP4 Video (.mp4)', ext: 'mp4', icon: <Video size={15} color="#6d28d9" /> },
        { label: 'WebM Video (.webm)', ext: 'webm', icon: <Video size={15} color="#0284c7" /> },
        { label: 'MP3 Audio (.mp3)', ext: 'mp3', icon: <Music size={15} color="#0369a1" /> },
        { label: 'WAV Audio (.wav)', ext: 'wav', icon: <Music size={15} color="#0891b2" /> },
      ];
    }
    return [
      { label: 'PDF Document (.pdf)', ext: 'pdf', icon: <FileText size={15} color="#b91c1c" /> },
    ];
  };

  return (
    <div
      className="solid-card"
      style={{
        padding: '16px 20px',
        marginBottom: '14px',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
        transition: 'all 0.2s ease',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        {/* Left Side: Thumbnail & File Metadata */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: '1 1 320px', minWidth: 0 }}>
          {stagedFile.previewUrl ? (
            <img
              src={stagedFile.previewUrl}
              alt={stagedFile.name}
              style={{
                width: '46px',
                height: '46px',
                objectFit: 'cover',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                flexShrink: 0,
              }}
            />
          ) : (
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '8px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {getIcon()}
            </div>
          )}

          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              title={stagedFile.name}
              style={{
                fontSize: '15px',
                fontWeight: 700,
                color: '#0f172a',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                letterSpacing: '-0.01em',
              }}
            >
              {stagedFile.name}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
              <span className={`badge ${getBadgeClass()}`}>{stagedFile.category.toUpperCase()}</span>
              <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
                {formatBytes(stagedFile.size)}
              </span>
              {pageCount !== null && (
                <>
                  <span style={{ color: '#cbd5e1', fontSize: '12px' }}>•</span>
                  <span style={{ fontSize: '12px', color: '#475569', fontWeight: 600, backgroundColor: '#f8fafc', padding: '1px 6px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                    {pageCount} {pageCount === 1 ? 'page' : 'pages'}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Intuitive Action Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Primary Action Button */}
          {stagedFile.category === 'pdf' ? (
            <button
              type="button"
              onClick={() => onSelectAction(stagedFile, 'edit-text')}
              className="btn btn-primary"
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                border: '1px solid #0f172a',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              <PenLine size={15} />
              Open in Editor
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleQuickConvert('pdf', 'PDF Document')}
              className="btn btn-primary"
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                border: '1px solid #0f172a',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              <PenLine size={15} />
              Convert to PDF
            </button>
          )}

          {/* Intelligence Tools Dropdown */}
          <div ref={intelligenceRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => {
                setShowIntelligenceDropdown((prev) => !prev);
                setShowConvertDropdown(false);
                setShowMoreDropdown(false);
              }}
              style={{
                padding: '8px 14px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#1d4ed8',
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
              title="Document Intelligence tools"
            >
              <Sparkles size={14} color="#2563eb" />
              <span>Intelligence Tools</span>
              <ChevronDown
                size={14}
                style={{
                  transition: 'transform 0.2s ease',
                  transform: showIntelligenceDropdown ? 'rotate(180deg)' : 'none',
                }}
              />
            </button>

            {showIntelligenceDropdown && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  right: 0,
                  width: '260px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.08)',
                  padding: '6px',
                  zIndex: 60,
                }}
              >
                <div
                  style={{
                    padding: '6px 10px',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Document Intelligence
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowIntelligenceDropdown(false);
                    handleTriggerToolModal('summarize-doc');
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '13px',
                    color: '#1e293b',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <Sparkles size={16} color="#2563eb" />
                  <div>
                    <div style={{ fontWeight: 600 }}>Summarize Document</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Key bullet insights & executive overview</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowIntelligenceDropdown(false);
                    handleTriggerToolModal('translate-doc');
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '13px',
                    color: '#1e293b',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <Languages size={16} color="#16a34a" />
                  <div>
                    <div style={{ fontWeight: 600 }}>Translate Document</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Preserve formatting across languages</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowIntelligenceDropdown(false);
                    handleTriggerToolModal('pdf-to-markdown');
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '13px',
                    color: '#1e293b',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <FileCode size={16} color="#7c3aed" />
                  <div>
                    <div style={{ fontWeight: 600 }}>Convert to Markdown</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Extract headings & tables to .md</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Quick Conversion Dropdown */}
          <div ref={convertRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => {
                setShowConvertDropdown((prev) => !prev);
                setShowMoreDropdown(false);
                setShowIntelligenceDropdown(false);
              }}
              style={{
                padding: '8px 14px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#1e293b',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
            >
              <span>Convert to</span>
              <ChevronDown
                size={14}
                style={{
                  transition: 'transform 0.2s ease',
                  transform: showConvertDropdown ? 'rotate(180deg)' : 'none',
                }}
              />
            </button>

            {showConvertDropdown && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  right: 0,
                  width: '230px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.08)',
                  padding: '6px',
                  zIndex: 60,
                }}
              >
                <div
                  style={{
                    padding: '6px 10px',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Select Target Format
                </div>
                {renderConvertMenuItems().map((item) => (
                  <button
                    key={item.ext}
                    type="button"
                    onClick={() => handleQuickConvert(item.ext, item.label)}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontSize: '13px',
                      color: '#1e293b',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <span style={{ display: 'flex', alignItems: 'center' }}>{item.icon}</span>
                    <span style={{ fontWeight: 500 }}>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Action: Compress */}
          <button
            type="button"
            onClick={handleQuickCompress}
            style={{
              padding: '8px 14px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#047857',
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
            title="Reduce file size"
          >
            <Minimize2 size={14} />
            <span>Compress</span>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                backgroundColor: '#10b981',
                color: '#ffffff',
                padding: '1px 5px',
                borderRadius: '6px',
                marginLeft: '2px',
              }}
            >
              -40%
            </span>
          </button>

          {/* More Actions Dropdown (•••) */}
          <div ref={moreRef} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => {
                setShowMoreDropdown((prev) => !prev);
                setShowConvertDropdown(false);
                setShowIntelligenceDropdown(false);
              }}
              style={{
                padding: '8px 10px',
                fontSize: '13px',
                color: '#64748b',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
              }}
              title="More actions"
            >
              <MoreVertical size={16} />
            </button>

            {showMoreDropdown && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  right: 0,
                  width: '210px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.08)',
                  padding: '6px',
                  zIndex: 60,
                }}
              >
                {stagedFile.category === 'pdf' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleTriggerToolModal('split-pdf')}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '13px',
                        color: '#1e293b',
                        backgroundColor: 'transparent',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <Scissors size={15} color="#e11d48" />
                      <span>Split / Extract Pages</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTriggerToolModal('merge-pdf')}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '13px',
                        color: '#1e293b',
                        backgroundColor: 'transparent',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <Copy size={15} color="#e11d48" />
                      <span>Merge with Another</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTriggerToolModal('add-watermark')}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '13px',
                        color: '#1e293b',
                        backgroundColor: 'transparent',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <Sparkles size={15} color="#0891b2" />
                      <span>Add Watermark</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTriggerToolModal('protect-pdf')}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '13px',
                        color: '#1e293b',
                        backgroundColor: 'transparent',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <Lock size={15} color="#d97706" />
                      <span>Protect with Password</span>
                    </button>

                    <div style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '4px 0' }} />
                  </>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setShowMoreDropdown(false);
                    onRemove(stagedFile.id);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '13px',
                    color: '#dc2626',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fef2f2')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <Trash2 size={15} color="#dc2626" />
                  <span>Delete File</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Inline Processing / Notification Bar */}
      {isProcessing && (
        <div
          style={{
            marginTop: '12px',
            padding: '10px 14px',
            borderRadius: '8px',
            backgroundColor: '#eff6ff',
            border: '1px solid #bfdbfe',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13px',
            color: '#1d4ed8',
            fontWeight: 500,
          }}
        >
          <Loader2 size={16} className="animate-spin" />
          <span>{actionStage || 'Processing file...'}</span>
        </div>
      )}

      {successNotice && (
        <div
          style={{
            marginTop: '12px',
            padding: '10px 14px',
            borderRadius: '8px',
            backgroundColor: '#ecfdf5',
            border: '1px solid #a7f3d0',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13px',
            color: '#065f46',
            fontWeight: 500,
          }}
        >
          <CheckCircle2 size={16} color="#059669" />
          <span>{successNotice}</span>
        </div>
      )}

      {errorNotice && (
        <div
          style={{
            marginTop: '12px',
            padding: '10px 14px',
            borderRadius: '8px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13px',
            color: '#991b1b',
            fontWeight: 500,
          }}
        >
          <AlertCircle size={16} color="#dc2626" />
          <span>{errorNotice}</span>
        </div>
      )}
    </div>
  );
};
