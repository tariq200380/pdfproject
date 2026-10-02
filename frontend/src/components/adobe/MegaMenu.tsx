'use client';

import React from 'react';
import {
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Scissors,
  RotateCw,
  Copy,
  Zap,
  Layers,
  ArrowRight,
  ExternalLink,
  Crop,
  Trash2,
  Lock,
  Unlock,
  PenTool,
  EyeOff,
  GitCompare,
  Camera,
  Globe,
  FileSearch,
  Archive,
} from 'lucide-react';

export type ToolActionId =
  | 'edit-pdf'
  | 'merge-pdf'
  | 'split-pdf'
  | 'rotate-pdf'
  | 'crop-pdf'
  | 'delete-pages'
  | 'reorder-pages'
  | 'extract-pages'
  | 'insert-pages'
  | 'number-pages'
  | 'fill-sign'
  | 'request-signatures'
  | 'protect-pdf'
  | 'add-watermark'
  | 'remove-watermark'
  | 'remove-watermark-pdf'
  | 'remove-watermark-video'
  | 'remove-watermark-image'
  | 'images-to-pdf'
  | 'pdf-to-images'
  | 'pdf-to-svg'
  | 'convert-audio'
  | 'convert-video'
  | 'video-to-audio'
  | 'image-converter'
  | 'compress-pdf'
  | 'compress-video'
  | 'compress-audio'
  | 'compress-image'
  | 'all-tools'
  | 'summarize-doc'
  | 'translate-doc'
  | 'pdf-to-markdown'
  | 'scan-to-pdf'
  | 'ocr-pdf'
  | 'html-to-pdf'
  | 'pdf-to-pdfa'
  | 'pdf-forms'
  | 'unlock-pdf'
  | 'redact-pdf'
  | 'compare-pdf';

interface MegaMenuProps {
  menuType: 'convert' | 'edit' | 'compress';
  onSelectTool: (toolId: ToolActionId) => void;
  onClose: () => void;
}

export const MegaMenu: React.FC<MegaMenuProps> = ({ menuType, onSelectTool, onClose }) => {
  const handleItemClick = (toolId: ToolActionId) => {
    onSelectTool(toolId);
    onClose();
  };

  if (menuType === 'convert') {
    return (
      <div
        className="adobe-mega-menu"
        style={{ width: '680px', left: '-80px' }}
        onMouseLeave={onClose}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Column 1: Convert to PDF */}
          <div>
            <div style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#64748b',
              marginBottom: '12px',
              paddingLeft: '12px',
            }}>
              Convert to PDF
            </div>

            <button
              onClick={() => handleItemClick('images-to-pdf')}
              className="adobe-mega-item"
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#ecfdf5',
                color: '#047857',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <ImageIcon size={18} />
              </div>
              <div>
                <div className="item-title" style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                  JPG, PNG, WEBP to PDF
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                  Combine single or multiple images into a document
                </div>
              </div>
            </button>

            <button
              onClick={() => handleItemClick('images-to-pdf')}
              className="adobe-mega-item"
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <FileText size={18} color="#b91c1c" />
              </div>
              <div>
                <div className="item-title" style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                  HEIC / Vector to PDF
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                  High-efficiency photo formats to standard PDF
                </div>
              </div>
            </button>

            <button
              onClick={() => handleItemClick('scan-to-pdf')}
              className="adobe-mega-item"
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Camera size={18} />
              </div>
              <div>
                <div className="item-title" style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                  Scan to PDF
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                  Direct image / camera snapshot capture to PDF
                </div>
              </div>
            </button>

            <button
              onClick={() => handleItemClick('html-to-pdf')}
              className="adobe-mega-item"
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#f0fdf4',
                color: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Globe size={18} />
              </div>
              <div>
                <div className="item-title" style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                  HTML to PDF
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                  Render clean HTML or URL directly to PDF
                </div>
              </div>
            </button>
          </div>

          {/* Column 2: Convert from PDF & Media Transcoding */}
          <div>
            <div style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#64748b',
              marginBottom: '12px',
              paddingLeft: '12px',
            }}>
              Convert from PDF & Media
            </div>

            <button
              onClick={() => handleItemClick('pdf-to-images')}
              className="adobe-mega-item"
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#fee2e2',
                color: '#b91c1c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <FileText size={18} />
              </div>
              <div>
                <div className="item-title" style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                  PDF to JPG / PNG
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                  Extract pages at 150 DPI raster fidelity (ZIP)
                </div>
              </div>
            </button>

            <button
              onClick={() => handleItemClick('convert-video')}
              className="adobe-mega-item"
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#f5f3ff',
                color: '#6d28d9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Video size={18} />
              </div>
              <div>
                <div className="item-title" style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                  Universal Video Transcoder
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                  MP4, MKV, AVI, WEBM, MOV with 1080p/720p scaling
                </div>
              </div>
            </button>

            <button
              onClick={() => handleItemClick('convert-audio')}
              className="adobe-mega-item"
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#f0f9ff',
                color: '#0369a1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Music size={18} />
              </div>
              <div>
                <div className="item-title" style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                  Universal Audio Converter
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                  MP3, WAV, AAC, FLAC, OGG, M4A with bitrate control
                </div>
              </div>
            </button>

            <button
              onClick={() => handleItemClick('pdf-to-pdfa')}
              className="adobe-mega-item"
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#faf5ff',
                color: '#7c3aed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Archive size={18} />
              </div>
              <div>
                <div className="item-title" style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                  PDF to PDF/A
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                  ISO 19005 compliant archival PDF export
                </div>
              </div>
            </button>

            <button
              onClick={() => handleItemClick('remove-watermark-video')}
              className="adobe-mega-item"
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#ede9fe',
                color: '#7c3aed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Video size={18} />
              </div>
              <div>
                <div className="item-title" style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                  Remove Video Watermark
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                  TikTok, Reels, Shorts (16:9 & 9:16)
                </div>
              </div>
            </button>

            <button
              onClick={() => handleItemClick('remove-watermark-image')}
              className="adobe-mega-item"
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <ImageIcon size={18} />
              </div>
              <div>
                <div className="item-title" style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                  Remove Image Watermark
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                  JPG, PNG, WebP AI inpainting
                </div>
              </div>
            </button>
          </div>
        </div>

        <div style={{
          marginTop: '16px',
          paddingTop: '14px',
          borderTop: '1px solid #f1f5f9',
          display: 'flex',
          justifyContent: 'flex-end',
        }}>
          <button
            onClick={() => handleItemClick('all-tools')}
            style={{
              background: 'none',
              border: 'none',
              color: '#0284c7',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            Explore all conversion tools
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    );
  }

  if (menuType === 'edit') {
    return (
      <div
        className="adobe-mega-menu"
        style={{ width: '560px', left: '-120px' }}
        onMouseLeave={onClose}
      >
        <div style={{
          fontSize: '11px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: '#64748b',
          marginBottom: '12px',
          paddingLeft: '12px',
        }}>
          PDF Editing & Page Organization
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <button
            onClick={() => handleItemClick('edit-pdf')}
            className="adobe-mega-item"
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#fee2e2',
              color: '#b91c1c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <FileText size={18} />
            </div>
            <div>
              <div className="item-title" style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                Edit PDF Text
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                Direct in-place text & font replacement
              </div>
            </div>
          </button>

          <button
            onClick={() => handleItemClick('merge-pdf')}
            className="adobe-mega-item"
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              color: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Copy size={18} />
            </div>
            <div>
              <div className="item-title" style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                Merge PDFs
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                Combine multiple PDFs in sequence
              </div>
            </div>
          </button>

          <button
            onClick={() => handleItemClick('split-pdf')}
            className="adobe-mega-item"
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              color: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Scissors size={18} />
            </div>
            <div>
              <div className="item-title" style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                Split & Burst PDF
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                Extract page ranges or separate all pages
              </div>
            </div>
          </button>

          <button
            onClick={() => handleItemClick('rotate-pdf')}
            className="adobe-mega-item"
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              color: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <RotateCw size={18} />
            </div>
            <div>
              <div className="item-title" style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                Rotate Pages
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                Rotate 90°, 180°, or 270° orientation
              </div>
            </div>
          </button>

          <button
            onClick={() => handleItemClick('crop-pdf')}
            className="adobe-mega-item"
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              color: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Crop size={18} />
            </div>
            <div>
              <div className="item-title" style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                Crop PDF
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                Adjust visible boundaries & margins
              </div>
            </div>
          </button>

          <button
            onClick={() => handleItemClick('delete-pages')}
            className="adobe-mega-item"
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              color: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Trash2 size={18} />
            </div>
            <div>
              <div className="item-title" style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                Delete Pages
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                Remove selected unwanted pages
              </div>
            </div>
          </button>

          <button
            onClick={() => handleItemClick('fill-sign')}
            className="adobe-mega-item"
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <PenTool size={18} />
            </div>
            <div>
              <div className="item-title" style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                Fill & Sign
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                Sign documents & draw signature
              </div>
            </div>
          </button>

          <button
            onClick={() => handleItemClick('protect-pdf')}
            className="adobe-mega-item"
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecdd3',
              color: '#e11d48',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Lock size={18} />
            </div>
            <div>
              <div className="item-title" style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                Protect PDF
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                Encrypt with AES-256 password
              </div>
            </div>
          </button>

          <button
            onClick={() => handleItemClick('remove-watermark-pdf')}
            className="adobe-mega-item"
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#e0f2fe',
              border: '1px solid #bae6fd',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <EyeOff size={18} />
            </div>
            <div>
              <div className="item-title" style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                Remove PDF Watermark
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                PDF, Word, Excel & PowerPoint
              </div>
            </div>
          </button>

          <button
            onClick={() => handleItemClick('pdf-forms')}
            className="adobe-mega-item"
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <FileSearch size={18} />
            </div>
            <div>
              <div className="item-title" style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                PDF Forms
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                Inspect, populate & flatten form fields
              </div>
            </div>
          </button>

          <button
            onClick={() => handleItemClick('unlock-pdf')}
            className="adobe-mega-item"
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Unlock size={18} />
            </div>
            <div>
              <div className="item-title" style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                Unlock PDF
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                Decrypt and remove password security
              </div>
            </div>
          </button>

          <button
            onClick={() => handleItemClick('redact-pdf')}
            className="adobe-mega-item"
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecdd3',
              color: '#e11d48',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <EyeOff size={18} />
            </div>
            <div>
              <div className="item-title" style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                Redact PDF
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                Permanent black-box masking
              </div>
            </div>
          </button>

          <button
            onClick={() => handleItemClick('compare-pdf')}
            className="adobe-mega-item"
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#faf5ff',
              border: '1px solid #e9d5ff',
              color: '#7c3aed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <GitCompare size={18} />
            </div>
            <div>
              <div className="item-title" style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                Compare PDF
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                Side-by-side visual diff analysis
              </div>
            </div>
          </button>
        </div>

        <div style={{
          marginTop: '16px',
          paddingTop: '14px',
          borderTop: '1px solid #f1f5f9',
          display: 'flex',
          justifyContent: 'flex-end',
        }}>
          <button
            onClick={() => handleItemClick('all-tools')}
            style={{
              background: 'none',
              border: 'none',
              color: '#0284c7',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            Explore all editing tools
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    );
  }

  if (menuType === 'compress') {
    return (
      <div
        className="adobe-mega-menu"
        style={{ width: '560px', left: '-180px' }}
        onMouseLeave={onClose}
      >
        <div style={{
          fontSize: '11px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: '#64748b',
          marginBottom: '12px',
          paddingLeft: '12px',
        }}>
          Smart Media Compression
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <button
            onClick={() => handleItemClick('compress-image')}
            className="adobe-mega-item"
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#ecfdf5',
              color: '#047857',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <ImageIcon size={18} />
            </div>
            <div>
              <div className="item-title" style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                Compress Images
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                Lossless & WebP reduction up to 85%
              </div>
            </div>
          </button>

          <button
            onClick={() => handleItemClick('compress-video')}
            className="adobe-mega-item"
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#f5f3ff',
              color: '#6d28d9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Video size={18} />
            </div>
            <div>
              <div className="item-title" style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                Compress Video
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                FFmpeg CRF rate control & 720p scaling
              </div>
            </div>
          </button>

          <button
            onClick={() => handleItemClick('compress-audio')}
            className="adobe-mega-item"
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#f0f9ff',
              color: '#0369a1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Music size={18} />
            </div>
            <div>
              <div className="item-title" style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                Compress Audio
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                Bitrate optimization (128k / 96k AAC)
              </div>
            </div>
          </button>

          <button
            onClick={() => handleItemClick('compress-pdf')}
            className="adobe-mega-item"
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#fee2e2',
              color: '#b91c1c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Zap size={18} />
            </div>
            <div>
              <div className="item-title" style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                Compress PDF
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                Stream optimization and raster downsampling
              </div>
            </div>
          </button>

          <button
            onClick={() => handleItemClick('ocr-pdf')}
            className="adobe-mega-item"
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#fef3c7',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <FileSearch size={18} />
            </div>
            <div>
              <div className="item-title" style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                OCR PDF
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                Searchable text layer extraction via OCR
              </div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  return null;
};
