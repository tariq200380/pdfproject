'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  FolderOpen,
  ChevronDown,
} from 'lucide-react';
import { useHeroTab, HeroTabId } from '@/context/HeroTabContext';
import { CloudImportModal, CloudServiceType } from './CloudImportModal';
import { CategoryActionModal } from './CategoryActionModal';
import { ChooseFilesToolsModal } from './ChooseFilesToolsModal';

export interface HeroThemeConfig {
  id: HeroTabId;
  breadcrumb: string;
  colorName: string;
  isLight: boolean;
  bgColor: string;
  hoverColor: string;
  borderColor: string;
  textColor: string;
  subtextColor: string;
  btnBg: string;
  btnText: string;
  title: string;
  description: string;
  benefits: [string, string, string];
  accept: string;
  targetToolId: string;
}

export const HERO_THEMES: Record<HeroTabId, HeroThemeConfig> = {
  // 1. Compress PDF — Dark Off-White (User: "compress ko dark offwhite kr dy")
  compress: {
    id: 'compress',
    breadcrumb: 'Compress PDF',
    colorName: 'Dark Off-White',
    isLight: false,
    bgColor: '#383431', // Dark Off-White / Charcoal Stone
    hoverColor: '#282523',
    borderColor: '2px dashed rgba(255, 255, 255, 0.45)',
    textColor: '#ffffff',
    subtextColor: 'rgba(255, 255, 255, 0.9)',
    btnBg: '#ffffff',
    btnText: '#0f172a',
    title: 'Compress PDF',
    description:
      'Reduce PDF file sizes dramatically while preserving crystal-clear text sharpness and image resolution. Perfect for email attachments and web uploads.',
    benefits: [
      'Balanced and maximum quality compression presets',
      'Instant file size reduction with visible savings',
      'TLS encryption and automatic ephemeral file cleanup',
    ],
    accept: '.pdf,application/pdf',
    targetToolId: 'compress-pdf',
  },

  // 2. PDF Converter — Bright Orange (Creed Tech Brand Orange)
  convert: {
    id: 'convert',
    breadcrumb: 'PDF Converter',
    colorName: 'Bright Orange',
    isLight: false,
    bgColor: '#ea580c', // Bright Orange
    hoverColor: '#c2410c',
    borderColor: '2px dashed rgba(255, 255, 255, 0.55)',
    textColor: '#ffffff',
    subtextColor: 'rgba(255, 255, 255, 0.9)',
    btnBg: '#ffffff',
    btnText: '#0f172a',
    title: 'Free PDF Converter',
    description:
      'Convert any file into a high-quality PDF or convert PDFs to Word, Excel, PowerPoint, images, and other formats. Free and secure conversion without installation or account creation.',
    benefits: [
      'Free PDF converter trusted by over 1 billion users worldwide',
      'Convert to and from Word, Excel, PowerPoint, and images',
      'Convert PDFs on any device: Mac, Windows, iOS, or Android',
    ],
    accept: '*/*',
    targetToolId: 'smart-pdf',
  },

  // 3. Merge PDF — Dark Gray (Deep Midnight Slate)
  merge: {
    id: 'merge',
    breadcrumb: 'Merge PDF',
    colorName: 'Dark Gray',
    isLight: false,
    bgColor: '#0f172a', // Dark Gray
    hoverColor: '#1e293b',
    borderColor: '2px dashed rgba(255, 255, 255, 0.45)',
    textColor: '#ffffff',
    subtextColor: 'rgba(255, 255, 255, 0.9)',
    btnBg: '#ffffff',
    btnText: '#0f172a',
    title: 'Merge PDF',
    description:
      'Merge PDF files into a single document for free. Need to make changes to your combined PDF? Continue in any of our secure PDF tools.',
    benefits: [
      'Combine PDFs for free in seconds',
      'Browser-based PDF combiner with no installation needed',
      'Trusted by over 1 billion users since 2013',
    ],
    accept: '.pdf,application/pdf',
    targetToolId: 'merge-pdf',
  },

  // 4. Edit PDF — Bright Brown (User: "brown bi bright ho")
  edit: {
    id: 'edit',
    breadcrumb: 'Edit PDF',
    colorName: 'Bright Brown',
    isLight: false,
    bgColor: '#b45309', // Bright Warm Amber / Bronze Caramel Brown
    hoverColor: '#92400e',
    borderColor: '2px dashed rgba(255, 255, 255, 0.5)',
    textColor: '#ffffff',
    subtextColor: 'rgba(255, 255, 255, 0.9)',
    btnBg: '#ffffff',
    btnText: '#0f172a',
    title: 'Free Online PDF Editor',
    description:
      'Edit your PDFs for free on any device. Easily add text, shapes, images, highlights, sticky notes, and more with one of the world’s most used online PDF editors.',
    benefits: [
      'Free PDF editing across Mac, Windows, and mobile',
      'No installation required',
      'TLS encryption ensures your PDFs are safe',
    ],
    accept: '.pdf,application/pdf',
    targetToolId: 'edit-pdf',
  },

  // 5. Sign PDF — Warm Off-White (User: "offwhite")
  sign: {
    id: 'sign',
    breadcrumb: 'Sign PDF',
    colorName: 'Warm Off-White',
    isLight: true,
    bgColor: '#faf8f2', // Soft Luxury Off-White / Ivory Parchment
    hoverColor: '#f3ede2',
    borderColor: '2px dashed #cbd5e1',
    textColor: '#1c1917',
    subtextColor: '#57534e',
    btnBg: '#1c1917', // Elegant Charcoal Dark Button
    btnText: '#ffffff',
    title: 'eSign PDF for Free',
    description:
      'Sign PDF documents online in just a few clicks. No account creation or installation required. Simply add a signature and download your PDF, share it, or save it directly.',
    benefits: [
      'E-sign PDFs on Mac, Windows, iOS, Android, and Linux',
      'PDF signer trusted by over 1 billion users since 2013',
      'ISO/IEC 27001 certification and Swiss security included',
    ],
    accept: '.pdf,application/pdf',
    targetToolId: 'fill-sign',
  },

  // 6. Media Studio & Converter — Bright Blue (User: "opr menu ma office ki jaga bi media wla kr dy")
  media: {
    id: 'media',
    breadcrumb: 'Media Studio',
    colorName: 'Bright Blue',
    isLight: false,
    bgColor: '#2563eb', // Bright Blue
    hoverColor: '#1d4ed8',
    borderColor: '2px dashed rgba(255, 255, 255, 0.45)',
    textColor: '#ffffff',
    subtextColor: 'rgba(255, 255, 255, 0.9)',
    btnBg: '#ffffff',
    btnText: '#0f172a',
    title: 'Universal Media Converter',
    description:
      'Transcode, optimize, and convert Video (MP4, MKV, AVI, MOV), Audio (MP3, WAV, AAC, FLAC), and Images with lossless quality and watermark removal.',
    benefits: [
      'Fast lossless video transcoding: MP4, MKV, AVI, WEBM, MOV',
      'Studio audio converter: MP3, WAV, AAC, FLAC, OGG & extraction',
      'Smart image conversion, compression, and watermark cleaner',
    ],
    accept: 'video/*,audio/*,image/*,.mp4,.mkv,.avi,.mov,.webm,.mp3,.wav,.aac,.flac,.ogg,.m4a,.jpg,.png,.webp,.gif',
    targetToolId: 'convert-video',
  },

  // 7. PDF to Office — Fallback & compatibility
  office: {
    id: 'office',
    breadcrumb: 'PDF to Office',
    colorName: 'Bright Blue',
    isLight: false,
    bgColor: '#2563eb', // Bright Blue
    hoverColor: '#1d4ed8',
    borderColor: '2px dashed rgba(255, 255, 255, 0.45)',
    textColor: '#ffffff',
    subtextColor: 'rgba(255, 255, 255, 0.9)',
    btnBg: '#ffffff',
    btnText: '#0f172a',
    title: 'PDF to Office Converter',
    description:
      'Convert PDF documents to editable Microsoft Word, Excel, and PowerPoint files with high-fidelity formatting, table recognition, and zero data loss.',
    benefits: [
      'Extract text, tables, and slides with formatting intact',
      'Two-way conversion: Office files to standard PDF',
      'No email required, 100% private and instant',
    ],
    accept: '.pdf,.docx,.doc,.xlsx,.xls,.pptx,.ppt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.*',
    targetToolId: 'word-to-pdf',
  },
};

interface DynamicHeroDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  onSelectTool?: (toolId: any, file?: File) => void;
  onOpenEditor?: (file: File) => void;
}

export const DynamicHeroDropzone: React.FC<DynamicHeroDropzoneProps> = ({
  onFilesSelected,
  onSelectTool,
  onOpenEditor,
}) => {
  const { activeTab, setActiveTab } = useHeroTab();
  const [isDragOver, setIsDragOver] = useState(false);
  const [actionModalFile, setActionModalFile] = useState<File | null>(null);
  const [cloudModalState, setCloudModalState] = useState<{
    isOpen: boolean;
    service: CloudServiceType;
  }>({
    isOpen: false,
    service: 'google_drive',
  });
  const [isToolsModalOpen, setIsToolsModalOpen] = useState(false);
  const [pendingToolId, setPendingToolId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleCloudUploadClick = (service: CloudServiceType) => {
    setCloudModalState({
      isOpen: true,
      service,
    });
  };

  const handleCloudFileImported = (file: File) => {
    processSelectedFiles([file]);
  };

  const handleExecuteOption = (toolId: string, file: File) => {
    setActionModalFile(null);
    if (toolId === 'edit-pdf' && onOpenEditor) {
      onOpenEditor(file);
      return;
    }
    if (onSelectTool) {
      onSelectTool(toolId, file);
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('creed-open-tool', {
          detail: { toolId, category: activeTab, file },
        })
      );
    }
  };

  const handleSelectToolFromModal = (toolId: string) => {
    setIsToolsModalOpen(false);
    setPendingToolId(toolId);

    // Sync active category if the selected tool maps to a hero category
    if (
      toolId === 'convert-video' ||
      toolId === 'convert-audio' ||
      toolId === 'image-converter' ||
      toolId === 'video-to-audio' ||
      toolId.includes('watermark') ||
      toolId === 'media'
    ) {
      setActiveTab('media');
    } else if (
      toolId === 'word-to-pdf' ||
      toolId === 'excel-to-pdf' ||
      toolId === 'ppt-to-pdf' ||
      toolId === 'pdf-to-word' ||
      toolId === 'pdf-to-excel' ||
      toolId === 'pdf-to-ppt' ||
      toolId === 'smart-pdf' ||
      toolId === 'ocr-pdf' ||
      toolId === 'pdf-to-pdfa' ||
      toolId.includes('to-pdf') ||
      toolId.includes('pdf-to') ||
      toolId === 'office'
    ) {
      setActiveTab('convert');
    } else if (toolId.startsWith('compress')) {
      setActiveTab('compress');
    } else if (
      toolId === 'merge-pdf' ||
      toolId === 'split-pdf' ||
      toolId === 'rotate-pdf' ||
      toolId === 'reorder-pages' ||
      toolId === 'delete-pages' ||
      toolId === 'extract-pages' ||
      toolId === 'organize'
    ) {
      setActiveTab('merge');
    } else if (
      toolId === 'edit-pdf' ||
      toolId === 'crop-pdf' ||
      toolId === 'number-pages' ||
      toolId === 'pdf-annotator' ||
      toolId === 'pdf-reader' ||
      toolId === 'edit'
    ) {
      setActiveTab('edit');
    } else if (
      toolId === 'fill-sign' ||
      toolId === 'request-signatures' ||
      toolId === 'protect-pdf' ||
      toolId === 'unlock-pdf' ||
      toolId === 'flatten-pdf' ||
      toolId === 'sign'
    ) {
      setActiveTab('sign');
    }

    // Immediately open native file picker so user can select their file!
    setTimeout(() => {
      inputRef.current?.click();
    }, 60);
  };

  const currentTheme = HERO_THEMES[activeTab] || HERO_THEMES.convert;

  // Listen for tool triggers that map to hero categories
  useEffect(() => {
    const handleSwitchCategory = (e: Event) => {
      const customEvent = e as CustomEvent<{ category?: string; toolId?: string }>;
      const cat = customEvent.detail?.category;
      const toolId = customEvent.detail?.toolId;

      if (cat && HERO_THEMES[cat as HeroTabId]) {
        setActiveTab(cat as HeroTabId);
      } else if (toolId) {
        if (
          toolId === 'convert-video' ||
          toolId === 'convert-audio' ||
          toolId === 'image-converter' ||
          toolId === 'video-to-audio' ||
          toolId.includes('watermark') ||
          toolId === 'media'
        ) {
          setActiveTab('media');
        } else if (
          toolId === 'word-to-pdf' ||
          toolId === 'excel-to-pdf' ||
          toolId === 'ppt-to-pdf' ||
          toolId === 'pdf-to-word' ||
          toolId === 'pdf-to-excel' ||
          toolId === 'pdf-to-ppt' ||
          toolId === 'office'
        ) {
          setActiveTab('office');
        } else if (toolId === 'smart-pdf' || toolId === 'universal-converter' || toolId === 'convert') {
          setActiveTab('convert');
        } else if (toolId.startsWith('compress')) {
          setActiveTab('compress');
        } else if (
          toolId === 'merge-pdf' ||
          toolId === 'split-pdf' ||
          toolId === 'rotate-pdf' ||
          toolId === 'reorder-pages' ||
          toolId === 'delete-pages' ||
          toolId === 'extract-pages' ||
          toolId === 'merge' ||
          toolId === 'organize'
        ) {
          setActiveTab('merge');
        } else if (
          toolId === 'edit-pdf' ||
          toolId === 'crop-pdf' ||
          toolId === 'number-pages' ||
          toolId === 'watermark-pdf' ||
          toolId === 'pdf-annotator' ||
          toolId === 'pdf-reader' ||
          toolId === 'edit'
        ) {
          setActiveTab('edit');
        } else if (
          toolId === 'fill-sign' ||
          toolId === 'request-signatures' ||
          toolId === 'protect-pdf' ||
          toolId === 'unlock-pdf' ||
          toolId === 'flatten-pdf' ||
          toolId === 'sign'
        ) {
          setActiveTab('sign');
        }
      }
    };

    window.addEventListener('creed-open-tool', handleSwitchCategory);
    return () => {
      window.removeEventListener('creed-open-tool', handleSwitchCategory);
    };
  }, [setActiveTab]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const processSelectedFiles = (files: File[]) => {
    if (files.length === 0) return;
    onFilesSelected(files);
    setActionModalFile(files[0]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processSelectedFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const targetTool = pendingToolId;
      setPendingToolId(null);

      if (targetTool) {
        onFilesSelected(files);
        if (targetTool === 'edit-pdf' && onOpenEditor) {
          onOpenEditor(files[0]);
          e.target.value = '';
          return;
        }
        if (onSelectTool) {
          onSelectTool(targetTool, files[0]);
        }
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('creed-open-tool', {
              detail: { toolId: targetTool, category: activeTab, file: files[0] },
            })
          );
        }
      } else {
        processSelectedFiles(files);
      }
      e.target.value = '';
    }
  };

  const handleChooseFilesClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPendingToolId(null);
    setIsToolsModalOpen(true);
  };

  return (
    <section
      id="creed-hero-section"
      ref={containerRef}
      style={{
        maxWidth: '1140px',
        margin: '24px auto 0 auto',
        padding: '0 12px',
        scrollMarginTop: '80px',
      }}
    >
      {/* Smallpdf Style Breadcrumb Navigation */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '13px',
          color: '#64748b',
          marginBottom: '18px',
        }}
      >
        <Link href="/" style={{ color: '#64748b', textDecoration: 'none' }}>
          Home
        </Link>
        <span>&rsaquo;</span>
        <span style={{ color: '#0f172a', fontWeight: 600 }}>
          {currentTheme.breadcrumb}
        </span>
      </div>

      {/* Main Hero Title (Matching Smallpdf Screenshot) */}
      <h1
        style={{
          fontSize: '44px',
          fontWeight: 800,
          color: '#0f172a',
          textAlign: 'center',
          letterSpacing: '-0.035em',
          lineHeight: 1.18,
          marginBottom: '32px',
          transition: 'color 0.2s ease',
        }}
      >
        {currentTheme.title}
      </h1>

      {/* Dynamic Colored Dropzone Box (Exact Smallpdf Layout) */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        style={{
          backgroundColor: currentTheme.bgColor,
          borderRadius: '16px',
          padding: '64px 24px',
          textAlign: 'center',
          cursor: 'pointer',
          position: 'relative',
          border: currentTheme.borderColor,
          transition: 'background-color 0.25s ease, border-color 0.25s ease, transform 0.15s ease, box-shadow 0.2s ease',
          boxShadow: isDragOver
            ? '0 20px 35px -5px rgba(0, 0, 0, 0.22)'
            : currentTheme.isLight
            ? '0 8px 24px -4px rgba(15, 23, 42, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.6)'
            : '0 12px 28px -6px rgba(0, 0, 0, 0.15)',
          transform: isDragOver ? 'scale(1.008)' : 'scale(1)',
        }}
      >
        {/* Hidden File Input allowing all files in OS dialog without Folder is Empty filter */}
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="*/*"
          style={{ display: 'none' }}
          onChange={handleInputChange}
        />

        {/* Smallpdf Document Illustration (Table, Chart & PDF Badge) */}
        <div style={{ marginBottom: '22px' }}>
          <svg
            width="72"
            height="72"
            viewBox="0 0 68 68"
            fill="none"
            style={{ margin: '0 auto', display: 'block' }}
          >
            {/* Back sheet */}
            <rect
              x="18"
              y="8"
              width="36"
              height="46"
              rx="4"
              stroke={currentTheme.isLight ? '#94a3b8' : 'rgba(255, 255, 255, 0.55)'}
              strokeWidth="2"
              fill={currentTheme.isLight ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.1)'}
            />
            {/* Front sheet */}
            <rect
              x="12"
              y="14"
              width="38"
              height="48"
              rx="4"
              stroke={currentTheme.isLight ? '#475569' : '#ffffff'}
              strokeWidth="2.2"
              fill={currentTheme.isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.18)'}
            />
            {/* Inner table grid lines */}
            <rect
              x="18"
              y="22"
              width="12"
              height="10"
              rx="1.5"
              stroke={currentTheme.isLight ? '#64748b' : 'rgba(255, 255, 255, 0.9)'}
              strokeWidth="1.5"
            />
            <line
              x1="24"
              y1="22"
              x2="24"
              y2="32"
              stroke={currentTheme.isLight ? '#64748b' : 'rgba(255, 255, 255, 0.9)'}
              strokeWidth="1.5"
            />
            <line
              x1="18"
              y1="27"
              x2="30"
              y2="27"
              stroke={currentTheme.isLight ? '#64748b' : 'rgba(255, 255, 255, 0.9)'}
              strokeWidth="1.5"
            />
            {/* Pie chart graphic */}
            <circle
              cx="38"
              cy="27"
              r="5"
              stroke={currentTheme.isLight ? '#2563eb' : 'rgba(255, 255, 255, 0.9)'}
              strokeWidth="1.5"
            />
            <line
              x1="38"
              y1="27"
              x2="38"
              y2="22"
              stroke={currentTheme.isLight ? '#2563eb' : 'rgba(255, 255, 255, 0.9)'}
              strokeWidth="1.5"
            />
            <line
              x1="38"
              y1="27"
              x2="42"
              y2="29"
              stroke={currentTheme.isLight ? '#2563eb' : 'rgba(255, 255, 255, 0.9)'}
              strokeWidth="1.5"
            />
            {/* PDF badge */}
            <rect
              x="18"
              y="44"
              width="26"
              height="11"
              rx="2"
              fill={currentTheme.isLight ? '#ef4444' : '#ffffff'}
            />
            <text
              x="31"
              y="52.5"
              fill={currentTheme.isLight ? '#ffffff' : '#0f172a'}
              fontSize="7.5"
              fontWeight="900"
              textAnchor="middle"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              PDF
            </text>
          </svg>
        </div>

        {/* Big "CHOOSE FILES ▾" Button (Contrasting) */}
        <div style={{ display: 'inline-flex', alignItems: 'center' }}>
          <button
            type="button"
            onClick={handleChooseFilesClick}
            style={{
              backgroundColor: currentTheme.btnBg,
              color: currentTheme.btnText,
              border: currentTheme.isLight ? '1px solid rgba(0, 0, 0, 0.08)' : 'none',
              borderRadius: '8px',
              padding: '14px 28px',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: currentTheme.isLight
                ? '0 4px 14px rgba(15, 23, 42, 0.25)'
                : '0 4px 14px rgba(0, 0, 0, 0.18)',
              transition: 'transform 0.1s ease, box-shadow 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = currentTheme.isLight
                ? '0 6px 18px rgba(15, 23, 42, 0.32)'
                : '0 6px 18px rgba(0, 0, 0, 0.24)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = currentTheme.isLight
                ? '0 4px 14px rgba(15, 23, 42, 0.25)'
                : '0 4px 14px rgba(0, 0, 0, 0.18)';
            }}
          >
            <FolderOpen size={18} strokeWidth={2.4} />
            <span>CHOOSE FILES</span>
            <ChevronDown size={17} strokeWidth={2.4} />
          </button>
        </div>

        {/* Subtitle: "or drop files here" */}
        <p
          style={{
            fontSize: '14px',
            color: currentTheme.subtextColor,
            marginTop: '16px',
            marginBottom: 0,
            fontWeight: 500,
            letterSpacing: '0.01em',
          }}
        >
          or drop files here
        </p>

        {/* Cloud Upload Row: Google Drive, Dropbox, OneDrive */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            marginTop: '18px',
            flexWrap: 'wrap',
          }}
        >
          {/* Google Drive Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleCloudUploadClick('google_drive');
            }}
            title="Upload from Google Drive"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              padding: '7px 15px',
              borderRadius: '20px',
              backgroundColor: currentTheme.isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.94)',
              color: '#1e293b',
              fontSize: '12.5px',
              fontWeight: 600,
              border: currentTheme.isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.45)',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.16)';
              e.currentTarget.style.backgroundColor = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.08)';
              e.currentTarget.style.backgroundColor = currentTheme.isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.94)';
            }}
          >
            {/* Google Drive Official 3-Color Triangle Icon */}
            <svg width="15" height="15" viewBox="0 0 87.3 78" fill="none">
              <path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
              <path d="M43.65 25L29.9 1.2c-1.35.8-2.5 1.9-3.3 3.3L1.2 49.35c-.8 1.4-1.2 2.95-1.2 4.5h27.5z" fill="#00ac47"/>
              <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5H59.8l5.85 10.15z" fill="#ea4335"/>
              <path d="M43.65 25L57.4 1.2C56.05.4 54.5 0 52.9 0H34.4c-1.6 0-3.15.4-4.5 1.2z" fill="#00832d"/>
              <path d="M59.8 49.95H27.5L13.75 73.75c1.35.8 2.9 1.25 4.5 1.25h50.8c1.6 0 3.15-.45 4.5-1.25z" fill="#2684fc"/>
              <path d="M73.4 26.5l-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25l16.15 24.95H87.3c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
            </svg>
            <span>Google Drive</span>
          </button>

          {/* Dropbox Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleCloudUploadClick('dropbox');
            }}
            title="Upload from Dropbox"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              padding: '7px 15px',
              borderRadius: '20px',
              backgroundColor: currentTheme.isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.94)',
              color: '#1e293b',
              fontSize: '12.5px',
              fontWeight: 600,
              border: currentTheme.isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.45)',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.16)';
              e.currentTarget.style.backgroundColor = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.08)';
              e.currentTarget.style.backgroundColor = currentTheme.isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.94)';
            }}
          >
            {/* Dropbox Official Icon */}
            <svg width="15" height="15" viewBox="0 0 24 24" fill="#0061ff">
              <path d="M6 2l6 3.9-6 4-6-4zm12 0l6 3.9-6 4-6-4zm-12 11.9l6-4-6-3.9-6 3.9zm12 0l6-4-6-3.9-6 3.9zm-6 1.1l-6 4 6 4 6-4z"/>
            </svg>
            <span>Dropbox</span>
          </button>

          {/* OneDrive Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleCloudUploadClick('onedrive');
            }}
            title="Upload from OneDrive"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              padding: '7px 15px',
              borderRadius: '20px',
              backgroundColor: currentTheme.isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.94)',
              color: '#1e293b',
              fontSize: '12.5px',
              fontWeight: 600,
              border: currentTheme.isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.45)',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.16)';
              e.currentTarget.style.backgroundColor = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.08)';
              e.currentTarget.style.backgroundColor = currentTheme.isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.94)';
            }}
          >
            {/* OneDrive Official Icon */}
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" fill="#0078d4"/>
            </svg>
            <span>OneDrive</span>
          </button>
        </div>
      </div>

      {/* 2-Column Info Section Below Dropzone (Matching Smallpdf Screenshot) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '36px',
          marginTop: '32px',
          padding: '0 4px',
        }}
      >
        {/* Left Column: Tool Description */}
        <div>
          <p
            style={{
              fontSize: '15px',
              color: '#475569',
              lineHeight: 1.65,
              margin: 0,
            }}
          >
            {currentTheme.description}
          </p>
        </div>

        {/* Right Column: 3 Benefit Bullet Points with Green Checkmarks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {currentTheme.benefits.map((benefit, idx) => (
            <div
              key={`benefit-${idx}`}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                fontSize: '14px',
                color: '#1e293b',
                fontWeight: 500,
                lineHeight: 1.5,
              }}
            >
              <CheckCircle2
                size={18}
                color="#10b981"
                strokeWidth={2.4}
                style={{ flexShrink: 0, marginTop: '2px' }}
              />
              <span>{benefit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Cloud Import Modal for Google Drive, Dropbox, OneDrive */}
      <CloudImportModal
        isOpen={cloudModalState.isOpen}
        service={cloudModalState.service}
        onClose={() => setCloudModalState((prev) => ({ ...prev, isOpen: false }))}
        onFileImported={handleCloudFileImported}
      />

      {/* Category Action Popup Modal with all options of the selected top menu */}
      <CategoryActionModal
        isOpen={!!actionModalFile}
        file={actionModalFile}
        activeCategory={activeTab}
        onClose={() => setActionModalFile(null)}
        onExecuteTool={handleExecuteOption}
      />

      {/* Category-wise Tools Popup Modal when Choose Files is clicked */}
      <ChooseFilesToolsModal
        isOpen={isToolsModalOpen}
        initialCategory={activeTab}
        onClose={() => setIsToolsModalOpen(false)}
        onSelectTool={handleSelectToolFromModal}
      />
    </section>
  );
};
