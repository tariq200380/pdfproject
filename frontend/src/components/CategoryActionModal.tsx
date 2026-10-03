'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  FileText,
  TrendingDown,
  RefreshCw,
  Layers,
  Pencil,
  PenTool,
  Video,
  Music,
  Image as ImageIcon,
  FileSpreadsheet,
  Presentation,
  Scissors,
  RotateCw,
  Trash2,
  Lock,
  Unlock,
  Sparkles,
  Download,
  Loader2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Hash,
  Crop,
  Eye,
  Check,
  Sliders,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { HeroTabId } from '@/context/HeroTabContext';
import { mediaApiClient, triggerDownload, CompressionResponse } from '@/lib/mediaApiClient';

export interface ActionOptionItem {
  id: string;
  title: string;
  description: string;
  badge?: string;
  badgeColor?: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  isDirectCompress?: 'basic' | 'strong';
}

export interface CategoryActionGroup {
  id: HeroTabId;
  label: string;
  title: string;
  subtitle: string;
  themeColor: string;
  icon: React.ReactNode;
  options: ActionOptionItem[];
}

const CATEGORY_GROUPS: Record<HeroTabId, CategoryActionGroup> = {
  compress: {
    id: 'compress',
    label: 'Compress',
    title: 'PDF & File Compression',
    subtitle: 'Reduce file size with high visual quality or maximum reduction',
    themeColor: '#383431',
    icon: <TrendingDown size={16} strokeWidth={2.4} />,
    options: [
      {
        id: 'compress-basic',
        title: 'Basic Compression',
        description: 'Medium file size, high quality (~40% reduction). Preserves text sharpness and image resolution.',
        badge: 'Recommended',
        badgeColor: '#059669',
        icon: <TrendingDown size={18} strokeWidth={2.4} />,
        iconBg: '#ecfdf5',
        iconColor: '#059669',
        isDirectCompress: 'basic',
      },
      {
        id: 'compress-strong',
        title: 'Strong Compression',
        description: 'Smallest file size (~75% reduction). Maximum stream deflation and image optimization for tight limits.',
        badge: 'Max Savings',
        badgeColor: '#2563eb',
        icon: <TrendingDown size={18} strokeWidth={2.4} />,
        iconBg: '#eff6ff',
        iconColor: '#2563eb',
        isDirectCompress: 'strong',
      },
      {
        id: 'compress-image',
        title: 'Compress Images',
        description: 'Lossless & balanced compression for WebP, PNG, and JPEG graphics.',
        badge: 'Media',
        icon: <ImageIcon size={18} strokeWidth={2.4} />,
        iconBg: '#fef3c7',
        iconColor: '#d97706',
      },
      {
        id: 'compress-video',
        title: 'Compress Video',
        description: 'H.264/CRF intelligent compression for MP4, MKV, and MOV footage.',
        badge: 'Media',
        icon: <Video size={18} strokeWidth={2.4} />,
        iconBg: '#fce7f3',
        iconColor: '#db2777',
      },
    ],
  },

  convert: {
    id: 'convert',
    label: 'Convert',
    title: 'PDF & Office Converters',
    subtitle: 'Convert between PDF, Microsoft Office, Images, and specialized formats',
    themeColor: '#ea580c',
    icon: <RefreshCw size={16} strokeWidth={2.4} />,
    options: [
      {
        id: 'pdf-to-word',
        title: 'PDF to Word',
        description: 'Convert PDF document to editable Microsoft Word (DOCX) with exact formatting.',
        badge: 'Popular',
        badgeColor: '#2563eb',
        icon: <FileText size={18} strokeWidth={2.4} />,
        iconBg: '#dbeafe',
        iconColor: '#1d4ed8',
      },
      {
        id: 'pdf-to-excel',
        title: 'PDF to Excel',
        description: 'Extract tables, rows, and financial data into editable Microsoft Excel (XLSX).',
        badge: 'Data',
        icon: <FileSpreadsheet size={18} strokeWidth={2.4} />,
        iconBg: '#dcfce7',
        iconColor: '#15803d',
      },
      {
        id: 'pdf-to-ppt',
        title: 'PDF to PowerPoint',
        description: 'Convert PDF pages into editable PowerPoint (PPTX) presentation slides.',
        icon: <Presentation size={18} strokeWidth={2.4} />,
        iconBg: '#ffedd5',
        iconColor: '#c2410c',
      },
      {
        id: 'pdf-to-jpg',
        title: 'PDF to JPG',
        description: 'Extract PDF pages or images as high-resolution JPEG graphics.',
        icon: <ImageIcon size={18} strokeWidth={2.4} />,
        iconBg: '#fef3c7',
        iconColor: '#b45309',
      },
      {
        id: 'word-to-pdf',
        title: 'Word to PDF',
        description: 'Convert Microsoft Word (DOCX) files to standardized PDF documents.',
        icon: <FileText size={18} strokeWidth={2.4} />,
        iconBg: '#e0e7ff',
        iconColor: '#4338ca',
      },
      {
        id: 'excel-to-pdf',
        title: 'Excel to PDF',
        description: 'Convert spreadsheets and workbooks (XLSX) to clean PDF format.',
        icon: <FileSpreadsheet size={18} strokeWidth={2.4} />,
        iconBg: '#d1fae5',
        iconColor: '#047857',
      },
      {
        id: 'ppt-to-pdf',
        title: 'PPT to PDF',
        description: 'Convert slide decks (PPTX) into high-fidelity PDF presentations.',
        icon: <Presentation size={18} strokeWidth={2.4} />,
        iconBg: '#fee2e2',
        iconColor: '#b91c1c',
      },
      {
        id: 'jpg-to-pdf',
        title: 'JPG to PDF',
        description: 'Merge and convert multiple JPG, PNG, and WebP images into a single PDF.',
        icon: <ImageIcon size={18} strokeWidth={2.4} />,
        iconBg: '#fef9c3',
        iconColor: '#a16207',
      },
      {
        id: 'pdf-to-pdfa',
        title: 'PDF to PDF/A',
        description: 'Convert document into ISO-compliant PDF/A-1b format for long-term archiving.',
        badge: 'ISO Compliant',
        icon: <CheckCircle2 size={18} strokeWidth={2.4} />,
        iconBg: '#ede9fe',
        iconColor: '#6d28d9',
      },
      {
        id: 'ocr-pdf',
        title: 'PDF OCR',
        description: 'Extract and recognize text from scanned PDFs and image-only documents.',
        badge: 'Text OCR',
        icon: <Sparkles size={18} strokeWidth={2.4} />,
        iconBg: '#fae8ff',
        iconColor: '#a21caf',
      },
    ],
  },

  merge: {
    id: 'merge',
    label: 'Organize',
    title: 'Organize & Merge PDF',
    subtitle: 'Combine documents, split pages, rotate orientation, or delete unwanted pages',
    themeColor: '#0f172a',
    icon: <Layers size={16} strokeWidth={2.4} />,
    options: [
      {
        id: 'merge-pdf',
        title: 'Merge PDF',
        description: 'Combine multiple PDF documents into one single organized PDF file.',
        badge: 'Popular',
        badgeColor: '#0f172a',
        icon: <Layers size={18} strokeWidth={2.4} />,
        iconBg: '#f1f5f9',
        iconColor: '#0f172a',
      },
      {
        id: 'split-pdf',
        title: 'Split PDF',
        description: 'Extract individual pages, split by range, or separate document into parts.',
        icon: <Scissors size={18} strokeWidth={2.4} />,
        iconBg: '#f3e8ff',
        iconColor: '#7e22ce',
      },
      {
        id: 'rotate-pdf',
        title: 'Rotate PDF',
        description: 'Rotate PDF pages permanently 90°, 180°, or 270° clockwise or counter-clockwise.',
        icon: <RotateCw size={18} strokeWidth={2.4} />,
        iconBg: '#e0f2fe',
        iconColor: '#0284c7',
      },
      {
        id: 'delete-pages',
        title: 'Delete Pages',
        description: 'Select and permanently remove unnecessary pages from your PDF.',
        icon: <Trash2 size={18} strokeWidth={2.4} />,
        iconBg: '#fee2e2',
        iconColor: '#dc2626',
      },
      {
        id: 'extract-pages',
        title: 'Extract Pages',
        description: 'Select desired pages and export them into a new lightweight PDF file.',
        icon: <FileText size={18} strokeWidth={2.4} />,
        iconBg: '#ecfdf5',
        iconColor: '#059669',
      },
    ],
  },

  edit: {
    id: 'edit',
    label: 'Edit',
    title: 'In-Place PDF Editor & Tools',
    subtitle: 'Edit text directly, add watermarks, insert page numbers, or crop margins',
    themeColor: '#b45309',
    icon: <Pencil size={16} strokeWidth={2.4} />,
    options: [
      {
        id: 'edit-pdf',
        title: 'In-Place PDF Editor',
        description: 'Click on any text inside the PDF to edit and replace words with matching fonts.',
        badge: 'Live Editor',
        badgeColor: '#b45309',
        icon: <Pencil size={18} strokeWidth={2.4} />,
        iconBg: '#fef3c7',
        iconColor: '#b45309',
      },
      {
        id: 'add-watermark',
        title: 'Add Watermark',
        description: 'Apply custom text or logo watermark with customizable opacity and position.',
        icon: <ShieldCheck size={18} strokeWidth={2.4} />,
        iconBg: '#e0e7ff',
        iconColor: '#4338ca',
      },
      {
        id: 'number-pages',
        title: 'Number Pages',
        description: 'Insert clear page numbers into headers or footers across the document.',
        icon: <Hash size={18} strokeWidth={2.4} />,
        iconBg: '#ecfdf5',
        iconColor: '#059669',
      },
      {
        id: 'crop-pdf',
        title: 'Crop PDF',
        description: 'Trim page margins and adjust visible document framing precisely.',
        icon: <Crop size={18} strokeWidth={2.4} />,
        iconBg: '#fce7f3',
        iconColor: '#db2777',
      },
    ],
  },

  sign: {
    id: 'sign',
    label: 'Sign',
    title: 'eSign & Document Protection',
    subtitle: 'Fill & sign documents, request signatures, or password-protect files',
    themeColor: '#0f172a',
    icon: <PenTool size={16} strokeWidth={2.4} />,
    options: [
      {
        id: 'fill-sign',
        title: 'eSign PDF',
        description: 'Draw, type, or upload your signature and initials directly onto the PDF.',
        badge: 'Digital Signature',
        badgeColor: '#0f172a',
        icon: <PenTool size={18} strokeWidth={2.4} />,
        iconBg: '#f1f5f9',
        iconColor: '#0f172a',
      },
      {
        id: 'request-signatures',
        title: 'Request Signatures',
        description: 'Send document to recipients to collect signatures securely online.',
        icon: <CheckCircle2 size={18} strokeWidth={2.4} />,
        iconBg: '#e0f2fe',
        iconColor: '#0284c7',
      },
      {
        id: 'protect-pdf',
        title: 'Protect PDF',
        description: 'Encrypt PDF with strong AES password protection against unauthorized viewing.',
        icon: <Lock size={18} strokeWidth={2.4} />,
        iconBg: '#fee2e2',
        iconColor: '#dc2626',
      },
      {
        id: 'unlock-pdf',
        title: 'Unlock PDF',
        description: 'Remove password restrictions and permissions from protected PDFs.',
        icon: <Unlock size={18} strokeWidth={2.4} />,
        iconBg: '#ecfdf5',
        iconColor: '#059669',
      },
      {
        id: 'flatten-pdf',
        title: 'Flatten PDF',
        description: 'Merge interactive form fields and annotations into static document layers.',
        icon: <Layers size={18} strokeWidth={2.4} />,
        iconBg: '#f3e8ff',
        iconColor: '#7e22ce',
      },
    ],
  },

  media: {
    id: 'media',
    label: 'Media',
    title: 'Universal Media Studio',
    subtitle: 'Transcode video & audio, convert image formats, and remove watermarks',
    themeColor: '#2563eb',
    icon: <Video size={16} strokeWidth={2.4} />,
    options: [
      {
        id: 'convert-video',
        title: 'Video Converter',
        description: 'Lossless video transcoding: MP4, MKV, AVI, WEBM, MOV with resolution presets.',
        badge: 'Universal',
        badgeColor: '#2563eb',
        icon: <Video size={18} strokeWidth={2.4} />,
        iconBg: '#dbeafe',
        iconColor: '#1d4ed8',
      },
      {
        id: 'convert-audio',
        title: 'Audio Converter',
        description: 'Studio audio transcode: MP3, WAV, AAC, FLAC, OGG with bitrate controls.',
        icon: <Music size={18} strokeWidth={2.4} />,
        iconBg: '#ede9fe',
        iconColor: '#6d28d9',
      },
      {
        id: 'image-converter',
        title: 'Image Converter',
        description: 'Convert between WebP, PNG, JPG, GIF with batch format processing.',
        icon: <ImageIcon size={18} strokeWidth={2.4} />,
        iconBg: '#fef3c7',
        iconColor: '#b45309',
      },
      {
        id: 'video-to-audio',
        title: 'Video to Audio',
        description: 'Extract MP3 or AAC high-fidelity audio tracks directly from video clips.',
        icon: <Music size={18} strokeWidth={2.4} />,
        iconBg: '#ecfdf5',
        iconColor: '#059669',
      },
      {
        id: 'remove-watermark-video',
        title: 'Remove Video Watermark',
        description: 'Clean logos, timestamps, and watermarks from video frames.',
        icon: <Sparkles size={18} strokeWidth={2.4} />,
        iconBg: '#fee2e2',
        iconColor: '#dc2626',
      },
      {
        id: 'remove-watermark-image',
        title: 'Remove Image Watermark',
        description: 'Erase watermarks, stamps, and signatures from graphics seamlessly.',
        icon: <Sparkles size={18} strokeWidth={2.4} />,
        iconBg: '#fae8ff',
        iconColor: '#c026d3',
      },
    ],
  },

  office: {
    id: 'office',
    label: 'Office',
    title: 'PDF to Office Converters',
    subtitle: 'Convert between PDF and Microsoft Office formats',
    themeColor: '#2563eb',
    icon: <FileText size={16} strokeWidth={2.4} />,
    options: [
      {
        id: 'pdf-to-word',
        title: 'PDF to Word',
        description: 'Convert PDF to editable DOCX format.',
        icon: <FileText size={18} strokeWidth={2.4} />,
        iconBg: '#dbeafe',
        iconColor: '#1d4ed8',
      },
      {
        id: 'pdf-to-excel',
        title: 'PDF to Excel',
        description: 'Convert PDF tables to XLSX spreadsheets.',
        icon: <FileSpreadsheet size={18} strokeWidth={2.4} />,
        iconBg: '#dcfce7',
        iconColor: '#15803d',
      },
      {
        id: 'pdf-to-ppt',
        title: 'PDF to PPT',
        description: 'Convert PDF to PPTX slides.',
        icon: <Presentation size={18} strokeWidth={2.4} />,
        iconBg: '#ffedd5',
        iconColor: '#c2410c',
      },
    ],
  },
};

interface CategoryActionModalProps {
  isOpen: boolean;
  file: File | null;
  activeCategory: HeroTabId;
  onClose: () => void;
  onExecuteTool: (toolId: string, file: File, extraData?: any) => void;
}

export const CategoryActionModal: React.FC<CategoryActionModalProps> = ({
  isOpen,
  file,
  activeCategory: initialCategory,
  onClose,
  onExecuteTool,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<HeroTabId>(initialCategory || 'convert');
  const [isProcessing, setIsProcessing] = useState(false);
  const [compressResult, setCompressResult] = useState<CompressionResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [qualityPercent, setQualityPercent] = useState<number>(70);
  const [previewMode, setPreviewMode] = useState<'compressed' | 'original'>('compressed');

  // Sync initialCategory when modal opens
  React.useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory === 'office' ? 'convert' : initialCategory);
    }
  }, [initialCategory, isOpen]);

  const estimatedSavings = useMemo(() => {
    const fileSize = file?.size || 0;
    const reductionFactor = Math.max(0.12, Math.min(0.88, (100 - qualityPercent * 0.9) / 100));
    const estimatedSizeBytes = Math.round(fileSize * (1 - reductionFactor));
    const percentReduction = Math.round(reductionFactor * 100);
    return { estimatedSizeBytes, percentReduction };
  }, [file?.size, qualityPercent]);

  const qualityInfo = useMemo(() => {
    if (qualityPercent >= 80) {
      return {
        level: 'Excellent Quality',
        color: '#059669',
        bgColor: '#ecfdf5',
        text: 'Text and image clarity preserved. Perfect for legal documents and portfolios.',
      };
    } else if (qualityPercent >= 60) {
      return {
        level: 'Good Quality (Balanced)',
        color: '#2563eb',
        bgColor: '#eff6ff',
        text: 'Optimal balance of sharpness and small file size. Recommended for email and web.',
      };
    } else if (qualityPercent >= 40) {
      return {
        level: 'Standard Compression',
        color: '#d97706',
        bgColor: '#fffbeb',
        text: 'Moderate image downsampling for tight portal uploads (< 5MB).',
      };
    } else {
      return {
        level: 'Maximum Compression',
        color: '#dc2626',
        bgColor: '#fef2f2',
        text: 'Deepest size reduction for strict email/portal limits.',
      };
    }
  }, [qualityPercent]);

  if (!isOpen || !file) return null;

  const handleCustomCompress = async () => {
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const res = await mediaApiClient.compressAsset(file, 'pdf', String(qualityPercent));
      setCompressResult(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Compression failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const currentGroup = CATEGORY_GROUPS[selectedCategory] || CATEGORY_GROUPS.convert;

  const formatBytes = (bytes: number): string => {
    if (!bytes || bytes <= 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleOptionClick = async (option: ActionOptionItem) => {
    if (option.isDirectCompress) {
      // Execute direct compression inside the modal
      setIsProcessing(true);
      setErrorMsg(null);
      try {
        const res = await mediaApiClient.compressAsset(file, 'pdf', option.isDirectCompress);
        setCompressResult(res);
      } catch (err: any) {
        setErrorMsg(err.message || 'Compression failed');
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    // Launch the specific tool
    onClose();
    onExecuteTool(option.id, file);
  };

  const handleDownload = () => {
    if (compressResult) {
      triggerDownload(compressResult.blob, compressResult.filename);
    }
  };

  const tabs: HeroTabId[] = ['compress', 'convert', 'merge', 'edit', 'sign', 'media'];

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
          maxWidth: '720px',
          maxHeight: '88vh',
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
        {/* Header with File Info */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #f1f5f9',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', overflow: 'hidden' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                backgroundColor: currentGroup.themeColor,
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: `0 4px 12px ${currentGroup.themeColor}35`,
              }}
            >
              {currentGroup.icon}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    color: currentGroup.themeColor,
                    backgroundColor: `${currentGroup.themeColor}12`,
                    padding: '2px 8px',
                    borderRadius: '6px',
                  }}
                >
                  Selected File
                </span>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  {formatBytes(file.size)}
                </span>
              </div>
              <h3
                style={{
                  margin: '3px 0 0 0',
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#0f172a',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '480px',
                }}
                title={file.name}
              >
                {file.name}
              </h3>
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
              padding: '8px',
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

        {/* Category Tabs: Compress, Convert, Organize, Edit, Sign, Media */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '12px 24px',
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            overflowX: 'auto',
          }}
        >
          {tabs.map((tabKey) => {
            const group = CATEGORY_GROUPS[tabKey];
            if (!group) return null;
            const isSelected = selectedCategory === tabKey;
            return (
              <button
                key={tabKey}
                type="button"
                onClick={() => {
                  setSelectedCategory(tabKey);
                  setCompressResult(null);
                  setErrorMsg(null);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  padding: '7px 14px',
                  borderRadius: '20px',
                  border: isSelected ? `1.5px solid ${group.themeColor}` : '1px solid #cbd5e1',
                  backgroundColor: isSelected ? group.themeColor : '#ffffff',
                  color: isSelected ? '#ffffff' : '#475569',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: isSelected ? `0 2px 8px ${group.themeColor}30` : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {group.icon}
                <span>{group.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          {/* Subtitle / Question */}
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
              {currentGroup.title}
            </h4>
            <p style={{ margin: '3px 0 0 0', fontSize: '13px', color: '#64748b' }}>
              {currentGroup.subtitle}
            </p>
          </div>

          {/* If Compression in Progress */}
          {isProcessing && (
            <div
              style={{
                textAlign: 'center',
                padding: '36px 20px',
                backgroundColor: '#f8fafc',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
              }}
            >
              <Loader2 size={36} className="animate-spin" style={{ color: currentGroup.themeColor, margin: '0 auto 12px auto' }} />
              <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                Processing Document...
              </h4>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                Please wait while we process your file.
              </p>
            </div>
          )}

          {/* If Compression Result Ready */}
          {compressResult && !isProcessing && (
            <div
              style={{
                textAlign: 'center',
                padding: '24px 20px',
                backgroundColor: '#f0fdf4',
                borderRadius: '14px',
                border: '1px solid #bbf7d0',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 10px auto',
                }}
              >
                <Check size={26} strokeWidth={2.8} />
              </div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '17px', fontWeight: 800, color: '#065f46' }}>
                Compression Complete!
              </h4>
              <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#047857' }}>
                Original: {formatBytes(compressResult.originalSize)} → Compressed: <strong>{formatBytes(compressResult.compressedSize)}</strong>
                {compressResult.percentSaved > 0 && ` (-${compressResult.percentSaved}%)`}
              </p>
              <button
                type="button"
                onClick={handleDownload}
                style={{
                  padding: '11px 24px',
                  borderRadius: '10px',
                  border: 'none',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(15, 23, 42, 0.25)',
                }}
              >
                <Download size={16} />
                <span>Download Compressed File</span>
              </button>
            </div>
          )}

          {/* If Category is Compress -> Custom Quality Slider, Metrics, and Quality Preview */}
          {!isProcessing && !compressResult && selectedCategory === 'compress' && (
            <div style={{ marginBottom: '24px' }}>
              {/* Metrics Header */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '12px',
                  marginBottom: '18px',
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
                  <span style={{ fontSize: '11.5px', color: '#64748b', display: 'block', fontWeight: 500 }}>
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
                  <span style={{ fontSize: '11.5px', color: '#64748b', display: 'block', fontWeight: 500 }}>
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
                  <span style={{ fontSize: '11.5px', color: '#64748b', display: 'block', fontWeight: 500 }}>
                    Est. Output Size
                  </span>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                    {formatBytes(estimatedSavings.estimatedSizeBytes)}
                  </span>
                </div>
              </div>

              {/* Quality Slider Control */}
              <div style={{ marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sliders size={15} />
                    <span>Compression Level & Quality Percentage</span>
                  </label>
                  <span
                    style={{
                      fontSize: '11.5px',
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

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>
                  <span>Max Compression (20% Quality)</span>
                  <span>Balanced (70%)</span>
                  <span>Max Quality (95%)</span>
                </div>

                {/* Presets */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                  {[
                    { label: 'Low (85%)', value: 85 },
                    { label: 'Balanced (70%)', value: 70 },
                    { label: 'High (45%)', value: 45 },
                    { label: 'Extreme (25%)', value: 25 },
                  ].map((p) => {
                    const isSelected = qualityPercent === p.value;
                    return (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => setQualityPercent(p.value)}
                        style={{
                          padding: '5px 12px',
                          borderRadius: '8px',
                          border: isSelected ? '1.5px solid #383431' : '1px solid #cbd5e1',
                          backgroundColor: isSelected ? '#383431' : '#ffffff',
                          color: isSelected ? '#ffffff' : '#475569',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Visual Quality Preview Section */}
              <div
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  backgroundColor: '#ffffff',
                  overflow: 'hidden',
                  marginBottom: '18px',
                }}
              >
                <div
                  style={{
                    padding: '8px 14px',
                    backgroundColor: '#f8fafc',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Eye size={14} color="#475569" />
                    <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155' }}>
                      Visual Quality Preview
                    </span>
                  </div>

                  <div style={{ display: 'flex', backgroundColor: '#e2e8f0', padding: '2px', borderRadius: '6px' }}>
                    <button
                      type="button"
                      onClick={() => setPreviewMode('original')}
                      style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        border: 'none',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        backgroundColor: previewMode === 'original' ? '#ffffff' : 'transparent',
                        color: previewMode === 'original' ? '#0f172a' : '#64748b',
                      }}
                    >
                      Original (100%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewMode('compressed')}
                      style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        border: 'none',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        backgroundColor: previewMode === 'compressed' ? '#383431' : 'transparent',
                        color: previewMode === 'compressed' ? '#ffffff' : '#64748b',
                      }}
                    >
                      Compressed ({qualityPercent}%)
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    padding: '16px',
                    backgroundColor: '#fcfcfc',
                    display: 'flex',
                    gap: '14px',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {/* Document Page Simulation Canvas */}
                  <div
                    style={{
                      width: '240px',
                      height: '160px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      boxShadow: '0 3px 10px rgba(0,0,0,0.06)',
                      padding: '12px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative',
                      overflow: 'hidden',
                      filter:
                        previewMode === 'compressed'
                          ? `contrast(${100 - (100 - qualityPercent) * 0.15}%) blur(${(100 - qualityPercent) > 50 ? ((100 - qualityPercent) - 50) * 0.015 : 0}px)`
                          : 'none',
                      transition: 'filter 0.15s ease',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <div style={{ height: '7px', width: '70px', backgroundColor: '#334155', borderRadius: '4px' }} />
                        <span style={{ fontSize: '8px', color: '#94a3b8', fontWeight: 600 }}>PAGE 1</span>
                      </div>
                      <div style={{ height: '4px', width: '150px', backgroundColor: '#94a3b8', borderRadius: '3px', marginBottom: '5px' }} />
                      <div style={{ height: '4px', width: '190px', backgroundColor: '#cbd5e1', borderRadius: '3px', marginBottom: '5px' }} />
                      <div style={{ height: '4px', width: '120px', backgroundColor: '#e2e8f0', borderRadius: '3px' }} />
                    </div>

                    <div
                      style={{
                        height: '52px',
                        backgroundColor: '#f1f5f9',
                        borderRadius: '6px',
                        border: '1px dashed #cbd5e1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        padding: '0 8px',
                      }}
                    >
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '6px',
                          backgroundColor: '#e0e7ff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#4338ca',
                        }}
                      >
                        <ImageIcon size={18} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ height: '5px', width: '75%', backgroundColor: '#a5b4fc', borderRadius: '3px', marginBottom: '4px' }} />
                        <div style={{ height: '4px', width: '55%', backgroundColor: '#cbd5e1', borderRadius: '2px' }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ height: '3.5px', width: '100%', backgroundColor: '#cbd5e1', borderRadius: '2px', marginBottom: '3px' }} />
                      <div style={{ height: '3.5px', width: '80%', backgroundColor: '#e2e8f0', borderRadius: '2px' }} />
                    </div>

                    <div
                      style={{
                        position: 'absolute',
                        right: '8px',
                        bottom: '5px',
                        fontSize: '8.5px',
                        fontWeight: 700,
                        color: previewMode === 'compressed' ? qualityInfo.color : '#64748b',
                      }}
                    >
                      {previewMode === 'compressed' ? `${qualityPercent}% Quality` : '100% Original'}
                    </div>
                  </div>

                  {/* Description & Action */}
                  <div style={{ flex: 1, fontSize: '12px' }}>
                    <span style={{ fontWeight: 700, color: '#0f172a', display: 'block', fontSize: '13px' }}>
                      {previewMode === 'compressed' ? `Compressed View (${qualityPercent}%)` : 'Original View (100%)'}
                    </span>
                    <p style={{ margin: '4px 0 10px 0', lineHeight: 1.4, color: '#64748b', fontSize: '12px' }}>
                      {qualityInfo.text}
                    </p>

                    <button
                      type="button"
                      onClick={handleCustomCompress}
                      style={{
                        width: '100%',
                        padding: '11px 18px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: '#383431',
                        color: '#ffffff',
                        fontSize: '13.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '7px',
                        boxShadow: '0 3px 10px rgba(56, 52, 49, 0.25)',
                      }}
                    >
                      <Zap size={15} />
                      <span>Compress at {qualityPercent}% Quality</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Options Grid */}
          {!isProcessing && (!compressResult || selectedCategory !== 'compress') && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
                gap: '12px',
              }}
            >
              {currentGroup.options.map((option) => (
                <div
                  key={option.id}
                  onClick={() => handleOptionClick(option)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '14px 16px',
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = currentGroup.themeColor;
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(15, 23, 42, 0.08)';
                    e.currentTarget.style.transform = 'translateY(-1.5px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: option.iconBg,
                      color: option.iconColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {option.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                      <span style={{ fontSize: '14.5px', fontWeight: 700, color: '#0f172a' }}>
                        {option.title}
                      </span>
                      {option.badge && (
                        <span
                          style={{
                            fontSize: '10.5px',
                            fontWeight: 700,
                            padding: '2px 7px',
                            borderRadius: '6px',
                            backgroundColor: option.badgeColor ? `${option.badgeColor}15` : '#f1f5f9',
                            color: option.badgeColor || '#475569',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {option.badge}
                        </span>
                      )}
                    </div>
                    <p
                      style={{
                        margin: '4px 0 0 0',
                        fontSize: '12px',
                        color: '#64748b',
                        lineHeight: 1.4,
                      }}
                    >
                      {option.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
