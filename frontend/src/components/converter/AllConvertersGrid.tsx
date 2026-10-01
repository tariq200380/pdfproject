'use client';

import React, { useState, useRef } from 'react';
import {
  ALL_23_CONVERTERS,
  convertersApiClient,
  ConverterConfig,
} from '@/lib/convertersApiClient';
import {
  FileText,
  FileSpreadsheet,
  Presentation,
  Image as ImageIcon,
  FileCode,
  Layers,
  Scan,
  RefreshCw,
  Search,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight,
  Download,
  Loader2,
  Sparkles,
} from 'lucide-react';

interface AllConvertersGridProps {
  onOpenConverter?: (converterId: string) => void;
}

export const AllConvertersGrid: React.FC<AllConvertersGridProps> = () => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'to-pdf' | 'from-pdf' | 'specialized'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeConverter, setActiveConverter] = useState<ConverterConfig | null>(null);

  // Modal State
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [targetExtension, setTargetExtension] = useState<string>('pdf');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStage, setProgressStage] = useState<'idle' | 'uploading' | 'converting' | 'downloading' | 'completed' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [downloadResult, setDownloadResult] = useState<{ blob: Blob; filename: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter converters
  const filteredConverters = ALL_23_CONVERTERS.filter((c) => {
    const matchesCategory = activeCategory === 'all' || c.category === activeCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      c.title.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.accept.toLowerCase().includes(q) ||
      (c.badge && c.badge.toLowerCase().includes(q));
    return matchesCategory && matchesQuery;
  });

  const getIcon = (type: ConverterConfig['iconType']) => {
    switch (type) {
      case 'word':
        return <FileText size={22} />;
      case 'excel':
        return <FileSpreadsheet size={22} />;
      case 'ppt':
        return <Presentation size={22} />;
      case 'image':
        return <ImageIcon size={22} />;
      case 'design':
        return <Layers size={22} />;
      case 'scan':
        return <Scan size={22} />;
      case 'text':
        return <FileCode size={22} />;
      case 'universal':
        return <RefreshCw size={22} />;
      default:
        return <FileText size={22} />;
    }
  };

  const getIconStyles = (type: ConverterConfig['iconType']) => {
    switch (type) {
      case 'word':
        return { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' }; // Blue
      case 'excel':
        return { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' }; // Green
      case 'ppt':
        return { bg: '#fff7ed', color: '#ea580c', border: '#fed7aa' }; // Orange
      case 'image':
        return { bg: '#ecfeff', color: '#0891b2', border: '#a5f3fc' }; // Cyan
      case 'design':
        return { bg: '#faf5ff', color: '#7c3aed', border: '#e9d5ff' }; // Purple
      case 'scan':
        return { bg: '#fffbeb', color: '#d97706', border: '#fde68a' }; // Amber
      case 'text':
        return { bg: '#f8fafc', color: '#475569', border: '#e2e8f0' }; // Slate
      case 'universal':
        return { bg: '#fdf2f8', color: '#db2777', border: '#fbcfe8' }; // Pink
      default:
        return { bg: '#fee2e2', color: '#e11d48', border: '#fecdd3' }; // Red
    }
  };

  const getCategoryBadge = (c: ConverterConfig): string => {
    if (c.badge) return c.badge;
    switch (c.id) {
      case 'word-to-pdf':
        return 'Office';
      case 'excel-to-pdf':
        return 'Spreadsheet';
      case 'ppt-to-pdf':
        return 'Presentation';
      case 'jpg-to-pdf':
      case 'png-to-pdf':
      case 'bmp-to-pdf':
        return 'Image';
      case 'text-to-pdf':
        return 'Text';
      case 'rtf-to-pdf':
        return 'Rich Text';
      case 'image-to-pdf':
        return 'Multi-Image';
      case 'tiff-to-pdf':
        return 'TIFF';
      case 'gif-to-pdf':
        return 'Animation';
      case 'pdf-to-word':
        return 'DOCX';
      case 'pdf-to-excel':
        return 'XLSX';
      case 'pdf-to-ppt':
        return 'PPTX';
      case 'pdf-to-jpg':
        return 'JPG';
      case 'pdf-to-png':
        return 'PNG';
      case 'smart-pdf':
        return 'All Formats';
      case 'universal-converter':
        return 'Universal';
      case 'ocr-pdf':
        return 'Searchable OCR';
      default:
        return 'Document';
    }
  };

  const handleOpenModal = (converter: ConverterConfig) => {
    setActiveConverter(converter);
    setSelectedFiles([]);
    setIsProcessing(false);
    setProgress(0);
    setProgressStage('idle');
    setErrorMessage(null);
    setDownloadResult(null);
    setTargetExtension(converter.id === 'universal-converter' ? 'pdf' : 'pdf');
  };

  const handleCloseModal = () => {
    if (isProcessing) return;
    setActiveConverter(null);
    setSelectedFiles([]);
    setErrorMessage(null);
    setDownloadResult(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(activeConverter?.multiple ? filesArray : [filesArray[0]]);
      setErrorMessage(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (isProcessing) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      setSelectedFiles(activeConverter?.multiple ? filesArray : [filesArray[0]]);
      setErrorMessage(null);
    }
  };

  const executeActiveConversion = async () => {
    if (!activeConverter || selectedFiles.length === 0) return;

    setIsProcessing(true);
    setErrorMessage(null);
    setProgressStage('uploading');
    setProgress(20);

    const timer1 = setTimeout(() => {
      setProgress(55);
      setProgressStage('converting');
    }, 400);

    const timer2 = setTimeout(() => {
      setProgress(85);
    }, 1100);

    try {
      const extraParams: Record<string, string> = {};
      if (activeConverter.id === 'universal-converter') {
        extraParams['target_format'] = targetExtension;
      }

      const result = await convertersApiClient.executeConversion(
        activeConverter.endpoint,
        activeConverter.multiple ? selectedFiles : selectedFiles[0],
        extraParams
      );

      clearTimeout(timer1);
      clearTimeout(timer2);

      setProgress(100);
      setProgressStage('completed');
      setDownloadResult(result);

      // Auto trigger browser download
      convertersApiClient.triggerBrowserDownload(result.blob, result.filename);
    } catch (err: any) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setProgressStage('error');
      setErrorMessage(err.message || 'Conversion failed. Please verify file integrity.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <section style={{ maxWidth: '1180px', margin: '48px auto 0 auto' }} id="all-converters-grid">
      {/* Header & Filter Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '28px',
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '20px',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', margin: 0 }}>
              All 23 Adobe Acrobat Converters
            </h3>
            <span style={{
              fontSize: '12px',
              fontWeight: 700,
              backgroundColor: '#fee2e2',
              color: '#e11d48',
              padding: '3px 10px',
              borderRadius: '12px',
              border: '1px solid #fecdd3',
            }}>
              100% End-to-End
            </span>
          </div>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px', margin: 0 }}>
            Convert to and from PDF across Microsoft Office, high-res images, Photoshop, Illustrator, InDesign, and OCR.
          </p>
        </div>

        {/* Search input */}
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '10px' }} />
          <input
            type="text"
            placeholder="Search 23 converters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              outline: 'none',
              backgroundColor: '#ffffff',
              color: '#0f172a',
            }}
          />
        </div>
      </div>

      {/* Category Pills Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px', flexWrap: 'wrap' }}>
        {[
          { id: 'all', label: 'All Converters', count: ALL_23_CONVERTERS.length },
          { id: 'to-pdf', label: 'Convert to PDF', count: ALL_23_CONVERTERS.filter(c => c.category === 'to-pdf').length },
          { id: 'from-pdf', label: 'Convert from PDF', count: ALL_23_CONVERTERS.filter(c => c.category === 'from-pdf').length },
          { id: 'specialized', label: 'Specialized & OCR', count: ALL_23_CONVERTERS.filter(c => c.category === 'specialized').length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id as any)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '13px',
              fontWeight: activeCategory === tab.id ? 700 : 500,
              border: activeCategory === tab.id ? '1px solid #0f172a' : '1px solid #e2e8f0',
              backgroundColor: activeCategory === tab.id ? '#0f172a' : '#ffffff',
              color: activeCategory === tab.id ? '#ffffff' : '#475569',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            <span>{tab.label}</span>
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              backgroundColor: activeCategory === tab.id ? 'rgba(255,255,255,0.2)' : '#f1f5f9',
              color: activeCategory === tab.id ? '#ffffff' : '#64748b',
              padding: '1px 6px',
              borderRadius: '10px',
            }}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* 23 Converters Grid */}
      <div
        className="adobe-converters-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-stretch"
        style={{
          display: 'grid',
          gap: '24px',
          alignItems: 'stretch',
        }}
      >
        {filteredConverters.map((c) => {
          const style = getIconStyles(c.iconType);
          return (
            <div
              key={c.id}
              onClick={() => handleOpenModal(c)}
              className="adobe-converter-card h-full flex flex-col justify-between border border-slate-200 hover:border-slate-300 rounded-xl p-6"
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
              }}
            >
              <div>
                {/* Header with Icon & Clean Subtle Badge */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    backgroundColor: style.bg,
                    color: style.color,
                    border: `1px solid ${style.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {getIcon(c.iconType)}
                  </div>

                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    backgroundColor: '#f1f5f9',
                    color: '#475569',
                    padding: '3px 10px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    letterSpacing: '0.02em',
                  }}>
                    {getCategoryBadge(c)}
                  </span>
                </div>

                {/* Converter Title */}
                <h4 style={{
                  fontSize: '16px',
                  fontWeight: 800,
                  color: '#0f172a',
                  letterSpacing: '-0.02em',
                  marginBottom: '8px',
                }}>
                  {c.title}
                </h4>

                {/* Converter Description with line-clamp-2 and h-10 */}
                <p
                  className="line-clamp-2 h-10"
                  style={{
                    fontSize: '13px',
                    color: '#64748b',
                    lineHeight: '20px',
                    margin: 0,
                    marginBottom: '20px',
                    height: '40px',
                    minHeight: '40px',
                    maxHeight: '40px',
                    overflow: 'hidden',
                  }}
                >
                  {c.description}
                </p>
              </div>

              {/* Adobe Acrobat Signature Pill Button aligned to bottom-left */}
              <div className="mt-auto" style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-start' }}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenModal(c);
                  }}
                  className="adobe-pill-button rounded-full border border-slate-900 text-slate-900 font-semibold text-xs px-5 py-2 hover:bg-slate-900 hover:text-white transition-all inline-flex items-center justify-center self-start mt-auto"
                  style={{
                    borderRadius: '9999px',
                    border: '1px solid #0f172a',
                    color: '#0f172a',
                    fontWeight: 600,
                    fontSize: '12px',
                    padding: '8px 20px',
                    backgroundColor: 'transparent',
                    transition: 'all 0.18s ease',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    alignSelf: 'flex-start',
                    cursor: 'pointer',
                  }}
                >
                  Convert
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredConverters.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          marginTop: '20px',
        }}>
          <p style={{ fontSize: '16px', fontWeight: 600, color: '#475569' }}>
            No converters match "{searchQuery}"
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('all');
            }}
            className="btn btn-secondary"
            style={{ marginTop: '12px', fontSize: '13px' }}
          >
            Clear Search
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ACTIVE CONVERTER MODAL (Frictionless, End-to-End Execution & Auto-Download) */}
      {/* ========================================================================= */}
      {activeConverter && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            width: '100%',
            maxWidth: '560px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: getIconStyles(activeConverter.iconType).bg,
                  color: getIconStyles(activeConverter.iconType).color,
                  border: `1px solid ${getIconStyles(activeConverter.iconType).border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {getIcon(activeConverter.iconType)}
                </div>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    {activeConverter.title}
                  </h3>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0, marginTop: '2px' }}>
                    Creed-Tech High-Fidelity Conversion Pipeline
                  </p>
                </div>
              </div>

              <button
                onClick={handleCloseModal}
                disabled={isProcessing}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  padding: '6px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px' }}>
              <p style={{ fontSize: '13px', color: '#475569', marginBottom: '20px', lineHeight: 1.5 }}>
                {activeConverter.description}
              </p>

              {/* Target Format Selector for Universal File Converter */}
              {activeConverter.id === 'universal-converter' && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '6px' }}>
                    Select Target Format
                  </label>
                  <select
                    value={targetExtension}
                    onChange={(e) => setTargetExtension(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      color: '#0f172a',
                      backgroundColor: '#ffffff',
                      fontWeight: 600,
                    }}
                  >
                    <option value="pdf">PDF Document (.pdf)</option>
                    <option value="docx">Microsoft Word (.docx)</option>
                    <option value="xlsx">Microsoft Excel (.xlsx)</option>
                    <option value="pptx">PowerPoint Presentation (.pptx)</option>
                    <option value="jpg">JPG Image (.jpg)</option>
                    <option value="png">PNG Image (.png)</option>
                    <option value="txt">Plain Text (.txt)</option>
                    <option value="mp3">Audio (.mp3)</option>
                    <option value="mp4">Video (.mp4)</option>
                  </select>
                </div>
              )}

              {/* Interactive File Drop Zone */}
              {selectedFiles.length === 0 && (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: '2px dashed #cbd5e1',
                    borderRadius: '12px',
                    padding: '36px 20px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: '#f8fafc',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: '#fee2e2',
                    color: '#e11d48',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px auto',
                  }}>
                    <Upload size={22} />
                  </div>

                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                    Choose a file or drag & drop here
                  </p>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                    Accepted formats: <span style={{ fontWeight: 600, color: '#0f172a' }}>{activeConverter.accept}</span>
                  </p>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={activeConverter.accept}
                    multiple={Boolean(activeConverter.multiple)}
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </div>
              )}

              {/* Selected File Card */}
              {selectedFiles.length > 0 && (
                <div style={{
                  padding: '16px',
                  borderRadius: '10px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  marginBottom: '20px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #cbd5e1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#0f172a',
                      }}>
                        <FileText size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', wordBreak: 'break-all' }}>
                          {selectedFiles.length === 1 ? selectedFiles[0].name : `${selectedFiles.length} files selected`}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          {selectedFiles.length === 1
                            ? `${(selectedFiles[0].size / 1024).toFixed(1)} KB`
                            : `${(selectedFiles.reduce((acc, f) => acc + f.size, 0) / 1024).toFixed(1)} KB total`}
                        </div>
                      </div>
                    </div>

                    {!isProcessing && progressStage !== 'completed' && (
                      <button
                        onClick={() => setSelectedFiles([])}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#94a3b8',
                          cursor: 'pointer',
                          padding: '4px',
                        }}
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Progress & Status Indicator */}
              {isProcessing && (
                <div style={{ marginTop: '16px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    <span>
                      {progressStage === 'uploading' && 'Uploading document...'}
                      {progressStage === 'converting' && 'Executing conversion pipeline...'}
                    </span>
                    <span>{progress}%</span>
                  </div>
                  <div style={{ height: '6px', borderRadius: '4px', backgroundColor: '#e2e8f0', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${progress}%`,
                      backgroundColor: '#e11d48',
                      transition: 'width 0.3s ease',
                    }} />
                  </div>
                </div>
              )}

              {/* Completed Success Banner */}
              {progressStage === 'completed' && downloadResult && (
                <div style={{
                  padding: '16px',
                  borderRadius: '10px',
                  backgroundColor: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  color: '#065f46',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}>
                  <CheckCircle2 size={24} color="#059669" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 700 }}>Conversion Complete!</div>
                    <div style={{ fontSize: '12px', marginTop: '2px' }}>
                      Downloaded as <span style={{ fontWeight: 600 }}>{downloadResult.filename}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => convertersApiClient.triggerBrowserDownload(downloadResult.blob, downloadResult.filename)}
                    className="btn btn-secondary"
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      backgroundColor: '#ffffff',
                      borderColor: '#a7f3d0',
                      color: '#065f46',
                    }}
                  >
                    <Download size={13} />
                    Download Again
                  </button>
                </div>
              )}

              {/* Error Message */}
              {errorMessage && (
                <div style={{
                  padding: '14px',
                  borderRadius: '8px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecdd3',
                  color: '#991b1b',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '20px',
                }}>
                  <AlertCircle size={18} />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isProcessing}
                  className="btn btn-secondary"
                  style={{ padding: '9px 18px', fontSize: '13px' }}
                >
                  {progressStage === 'completed' ? 'Done' : 'Cancel'}
                </button>

                {progressStage !== 'completed' && (
                  <button
                    type="button"
                    onClick={executeActiveConversion}
                    disabled={selectedFiles.length === 0 || isProcessing}
                    className="btn btn-primary"
                    style={{
                      padding: '9px 22px',
                      fontSize: '13px',
                      fontWeight: 700,
                      backgroundColor: '#e11d48',
                      color: '#ffffff',
                      border: 'none',
                      opacity: selectedFiles.length === 0 || isProcessing ? 0.6 : 1,
                      cursor: selectedFiles.length === 0 || isProcessing ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Converting...
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        Convert to {activeConverter.id === 'universal-converter' ? targetExtension.toUpperCase() : 'PDF'}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
