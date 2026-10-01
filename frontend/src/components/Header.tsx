'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ChevronDown,
  FileText,
  FileSpreadsheet,
  Presentation,
  Image as ImageIcon,
  FileCode,
  Video,
  Music,
  Scissors,
  RotateCw,
  Crop,
  Copy,
  ArrowUpDown,
  ExternalLink,
  Trash2,
  PenTool,
  Lock,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';

type DropdownType = 'convert' | 'edit' | 'sign-protect' | null;

export const Header: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [activeDropdown, setActiveDropdown] = useState<DropdownType>(null);
  const navRef = useRef<HTMLDivElement>(null);

  const isHome = pathname === '/';

  // Close dropdown on outside click or escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Handle tool click from dropdown
  const handleToolClick = (toolId: string) => {
    setActiveDropdown(null);

    if (pathname === '/') {
      // Dispatch event to active grids
      window.dispatchEvent(new CustomEvent('creed-open-tool', { detail: { toolId } }));
      // Keep URL clean / in sync
      if (typeof window !== 'undefined') {
        window.history.pushState(null, '', `/?tool=${encodeURIComponent(toolId)}`);
      }
    } else {
      router.push(`/?tool=${encodeURIComponent(toolId)}`);
    }
  };

  const toggleDropdown = (type: DropdownType) => {
    setActiveDropdown((prev) => (prev === type ? null : type));
  };

  return (
    <header
      style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
        padding: '0 32px',
        height: '66px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.04)',
      }}
    >
      {/* Brand Identity (Left) */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
        <div
          style={{
            width: '34px',
            height: '34px',
            backgroundColor: '#e11d48',
            color: '#ffffff',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '16px',
            boxShadow: '0 2px 4px rgba(225, 29, 72, 0.25)',
          }}
        >
          C
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Creed Tech
          </span>
          <span style={{ color: '#cbd5e1', fontWeight: 300, fontSize: '16px' }}>|</span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>
            Studio
          </span>
        </div>
      </Link>

      {/* Navigation Menu (Adobe Acrobat Style) */}
      <div ref={navRef} style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
        {/* Tools Link (Active link with solid active underline indicator) */}
        <Link
          href="/"
          className={`adobe-nav-item ${isHome ? 'active' : ''}`}
          style={{ textDecoration: 'none' }}
          onClick={() => setActiveDropdown(null)}
        >
          Tools
        </Link>

        {/* 1. Convert ▾ Mega Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className={`adobe-nav-item ${activeDropdown === 'convert' ? 'active' : ''}`}
            onClick={() => toggleDropdown('convert')}
            aria-expanded={activeDropdown === 'convert'}
          >
            <span>Convert</span>
            <ChevronDown
              size={14}
              style={{
                transform: activeDropdown === 'convert' ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.15s ease',
              }}
            />
          </button>

          {activeDropdown === 'convert' && (
            <div
              className="adobe-mega-menu"
              style={{
                width: '780px',
                left: '-120px',
                padding: '24px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '24px',
              }}
            >
              {/* Column 1: Convert to PDF */}
              <div>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: '#64748b',
                    marginBottom: '12px',
                    paddingLeft: '10px',
                  }}
                >
                  Convert to PDF
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <button
                    type="button"
                    onClick={() => handleToolClick('word-to-pdf')}
                    className="adobe-mega-item"
                  >
                    <div style={{ width: '32px', height: '32px', borderRadius: '7px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FileText size={17} />
                    </div>
                    <div>
                      <div className="item-title" style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>Word to PDF</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>DOCX document format</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToolClick('image-to-pdf')}
                    className="adobe-mega-item"
                  >
                    <div style={{ width: '32px', height: '32px', borderRadius: '7px', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <ImageIcon size={17} />
                    </div>
                    <div>
                      <div className="item-title" style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>Image to PDF</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Multi-image documents</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToolClick('text-to-pdf')}
                    className="adobe-mega-item"
                  >
                    <div style={{ width: '32px', height: '32px', borderRadius: '7px', backgroundColor: '#f1f5f9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FileCode size={17} />
                    </div>
                    <div>
                      <div className="item-title" style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>Text to PDF</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Plain text and code files</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToolClick('excel-to-pdf')}
                    className="adobe-mega-item"
                  >
                    <div style={{ width: '32px', height: '32px', borderRadius: '7px', backgroundColor: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FileSpreadsheet size={17} />
                    </div>
                    <div>
                      <div className="item-title" style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>Excel to PDF</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>XLSX spreadsheet tables</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToolClick('ppt-to-pdf')}
                    className="adobe-mega-item"
                  >
                    <div style={{ width: '32px', height: '32px', borderRadius: '7px', backgroundColor: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Presentation size={17} />
                    </div>
                    <div>
                      <div className="item-title" style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>PPT to PDF</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>PowerPoint presentations</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToolClick('jpg-to-pdf')}
                    className="adobe-mega-item"
                  >
                    <div style={{ width: '32px', height: '32px', borderRadius: '7px', backgroundColor: '#ecfeff', color: '#0891b2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <ImageIcon size={17} />
                    </div>
                    <div>
                      <div className="item-title" style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>JPG/PNG to PDF</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Raster graphic photos</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Column 2: Convert from PDF */}
              <div>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: '#64748b',
                    marginBottom: '12px',
                    paddingLeft: '10px',
                  }}
                >
                  Convert from PDF
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <button
                    type="button"
                    onClick={() => handleToolClick('pdf-to-word')}
                    className="adobe-mega-item"
                  >
                    <div style={{ width: '32px', height: '32px', borderRadius: '7px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FileText size={17} />
                    </div>
                    <div>
                      <div className="item-title" style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>PDF to Word</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Editable DOCX documents</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToolClick('pdf-to-excel')}
                    className="adobe-mega-item"
                  >
                    <div style={{ width: '32px', height: '32px', borderRadius: '7px', backgroundColor: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FileSpreadsheet size={17} />
                    </div>
                    <div>
                      <div className="item-title" style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>PDF to Excel</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Extract tables into XLSX</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToolClick('pdf-to-ppt')}
                    className="adobe-mega-item"
                  >
                    <div style={{ width: '32px', height: '32px', borderRadius: '7px', backgroundColor: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Presentation size={17} />
                    </div>
                    <div>
                      <div className="item-title" style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>PDF to PPT</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Slide presentations</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToolClick('pdf-to-jpg')}
                    className="adobe-mega-item"
                  >
                    <div style={{ width: '32px', height: '32px', borderRadius: '7px', backgroundColor: '#fff1f2', color: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <ImageIcon size={17} />
                    </div>
                    <div>
                      <div className="item-title" style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>PDF to JPG</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>150 DPI page images</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToolClick('pdf-to-png')}
                    className="adobe-mega-item"
                  >
                    <div style={{ width: '32px', height: '32px', borderRadius: '7px', backgroundColor: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <ImageIcon size={17} />
                    </div>
                    <div>
                      <div className="item-title" style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>PDF to PNG</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Lossless raster graphics</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Column 3: Media & Universal Converters */}
              <div>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: '#64748b',
                    marginBottom: '12px',
                    paddingLeft: '10px',
                  }}
                >
                  Media & Universal
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <button
                    type="button"
                    onClick={() => handleToolClick('convert-video')}
                    className="adobe-mega-item"
                  >
                    <div style={{ width: '32px', height: '32px', borderRadius: '7px', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Video size={17} />
                    </div>
                    <div>
                      <div className="item-title" style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>Video Converter</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>MP4, MKV, WebM, MOV</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToolClick('convert-audio')}
                    className="adobe-mega-item"
                  >
                    <div style={{ width: '32px', height: '32px', borderRadius: '7px', backgroundColor: '#e0e7ff', color: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Music size={17} />
                    </div>
                    <div>
                      <div className="item-title" style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>Audio Converter</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>MP3, WAV, AAC, FLAC</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToolClick('compress-image')}
                    className="adobe-mega-item"
                  >
                    <div style={{ width: '32px', height: '32px', borderRadius: '7px', backgroundColor: '#ccfbf1', color: '#0f766e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <ImageIcon size={17} />
                    </div>
                    <div>
                      <div className="item-title" style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>Image Converter</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Universal raster & SVG</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToolClick('compress-pdf')}
                    className="adobe-mega-item"
                  >
                    <div style={{ width: '32px', height: '32px', borderRadius: '7px', backgroundColor: '#fee2e2', color: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FileText size={17} />
                    </div>
                    <div>
                      <div className="item-title" style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>Compress Media & Files</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Smart lossless compression</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2. Edit ▾ Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className={`adobe-nav-item ${activeDropdown === 'edit' ? 'active' : ''}`}
            onClick={() => toggleDropdown('edit')}
            aria-expanded={activeDropdown === 'edit'}
          >
            <span>Edit</span>
            <ChevronDown
              size={14}
              style={{
                transform: activeDropdown === 'edit' ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.15s ease',
              }}
            />
          </button>

          {activeDropdown === 'edit' && (
            <div
              className="adobe-mega-menu"
              style={{
                width: '340px',
                left: '-40px',
                padding: '20px',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: '#64748b',
                  marginBottom: '10px',
                  paddingLeft: '10px',
                }}
              >
                Edit PDF Tools
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <button
                  type="button"
                  onClick={() => handleToolClick('edit-pdf')}
                  className="adobe-mega-item"
                >
                  <div style={{ width: '30px', height: '30px', borderRadius: '6px', backgroundColor: '#fee2e2', color: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <FileText size={16} />
                  </div>
                  <div>
                    <div className="item-title" style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>Edit PDF</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>In-place text editing & fonts</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleToolClick('merge-pdf')}
                  className="adobe-mega-item"
                >
                  <div style={{ width: '30px', height: '30px', borderRadius: '6px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Copy size={16} />
                  </div>
                  <div>
                    <div className="item-title" style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>Merge PDFs</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Combine multiple documents</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleToolClick('split-pdf')}
                  className="adobe-mega-item"
                >
                  <div style={{ width: '30px', height: '30px', borderRadius: '6px', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Scissors size={16} />
                  </div>
                  <div>
                    <div className="item-title" style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>Split PDF</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Separate into page ranges</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleToolClick('crop-pdf')}
                  className="adobe-mega-item"
                >
                  <div style={{ width: '30px', height: '30px', borderRadius: '6px', backgroundColor: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Crop size={16} />
                  </div>
                  <div>
                    <div className="item-title" style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>Crop PDF</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Trim page margins</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleToolClick('rotate-pdf')}
                  className="adobe-mega-item"
                >
                  <div style={{ width: '30px', height: '30px', borderRadius: '6px', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <RotateCw size={16} />
                  </div>
                  <div>
                    <div className="item-title" style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>Rotate PDF</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>90° / 180° page rotation</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleToolClick('reorder-pages')}
                  className="adobe-mega-item"
                >
                  <div style={{ width: '30px', height: '30px', borderRadius: '6px', backgroundColor: '#e0e7ff', color: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ArrowUpDown size={16} />
                  </div>
                  <div>
                    <div className="item-title" style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>Reorder Pages</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Rearrange document sequence</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleToolClick('extract-pages')}
                  className="adobe-mega-item"
                >
                  <div style={{ width: '30px', height: '30px', borderRadius: '6px', backgroundColor: '#f1f5f9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ExternalLink size={16} />
                  </div>
                  <div>
                    <div className="item-title" style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>Extract Pages</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Save select pages to new file</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleToolClick('delete-pages')}
                  className="adobe-mega-item"
                >
                  <div style={{ width: '30px', height: '30px', borderRadius: '6px', backgroundColor: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Trash2 size={16} />
                  </div>
                  <div>
                    <div className="item-title" style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>Delete Pages</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Remove unwanted pages</div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 3. Sign & Protect ▾ Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className={`adobe-nav-item ${activeDropdown === 'sign-protect' ? 'active' : ''}`}
            onClick={() => toggleDropdown('sign-protect')}
            aria-expanded={activeDropdown === 'sign-protect'}
          >
            <span>Sign & Protect</span>
            <ChevronDown
              size={14}
              style={{
                transform: activeDropdown === 'sign-protect' ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.15s ease',
              }}
            />
          </button>

          {activeDropdown === 'sign-protect' && (
            <div
              className="adobe-mega-menu"
              style={{
                width: '320px',
                left: '-40px',
                padding: '20px',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: '#64748b',
                  marginBottom: '10px',
                  paddingLeft: '10px',
                }}
              >
                Sign & Security
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <button
                  type="button"
                  onClick={() => handleToolClick('fill-sign')}
                  className="adobe-mega-item"
                >
                  <div style={{ width: '32px', height: '32px', borderRadius: '7px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <PenTool size={17} />
                  </div>
                  <div>
                    <div className="item-title" style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>Fill & Sign</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Canvas signature & form filling</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleToolClick('protect-pdf')}
                  className="adobe-mega-item"
                >
                  <div style={{ width: '32px', height: '32px', borderRadius: '7px', backgroundColor: '#fee2e2', color: '#e11d48', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Lock size={17} />
                  </div>
                  <div>
                    <div className="item-title" style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>Protect PDF</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>AES-256 password encryption</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleToolClick('add-watermark')}
                  className="adobe-mega-item"
                >
                  <div style={{ width: '32px', height: '32px', borderRadius: '7px', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Sparkles size={17} />
                  </div>
                  <div>
                    <div className="item-title" style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>Add Watermark</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Stamp text watermark overlays</div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Far Right Action Button: "Get in Touch" CTA */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Link
          href="/contact"
          style={{
            fontSize: '13px',
            fontWeight: 700,
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '9px 18px',
            borderRadius: '8px',
            textDecoration: 'none',
            transition: 'background-color 0.15s ease, transform 0.1s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.1)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1e293b')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0f172a')}
        >
          Get in Touch
        </Link>
      </div>
    </header>
  );
};
