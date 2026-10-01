'use client';

import React, { useState } from 'react';
import { ToolActionId } from './MegaMenu';
import {
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Scissors,
  RotateCw,
  Copy,
  Zap,
  ArrowRight,
} from 'lucide-react';

interface ToolItem {
  id: ToolActionId;
  title: string;
  description: string;
  section: 'edit' | 'convert' | 'compress';
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}

const SECTIONS_DATA = [
  {
    key: 'edit',
    title: 'Edit',
    subtitle: 'Direct in-place text editing, page organization, and document manipulation',
    tools: [
      {
        id: 'edit-pdf' as ToolActionId,
        title: 'Edit PDF',
        description: 'Edit text directly on existing PDF pages with automatic font, size, and color matching.',
        section: 'edit',
        icon: <FileText size={22} />,
        iconBg: '#fee2e2',
        iconColor: '#b91c1c',
      },
      {
        id: 'merge-pdf' as ToolActionId,
        title: 'Merge PDFs',
        description: 'Combine multiple PDF documents into a single, organized file in seconds.',
        section: 'edit',
        icon: <Copy size={22} />,
        iconBg: '#f8fafc',
        iconColor: '#0f172a',
      },
      {
        id: 'split-pdf' as ToolActionId,
        title: 'Split PDF',
        description: 'Extract specific page ranges (e.g. 1-3, 5) or burst all pages into individual files.',
        section: 'edit',
        icon: <Scissors size={22} />,
        iconBg: '#f8fafc',
        iconColor: '#0f172a',
      },
      {
        id: 'rotate-pdf' as ToolActionId,
        title: 'Rotate PDF pages',
        description: 'Rotate document pages 90°, 180°, or 270° orientation and save permanently.',
        section: 'edit',
        icon: <RotateCw size={22} />,
        iconBg: '#f8fafc',
        iconColor: '#0f172a',
      },
    ],
  },
  {
    key: 'convert',
    title: 'Convert',
    subtitle: 'High-fidelity document conversion and universal audio/video transcoding',
    tools: [
      {
        id: 'pdf-to-images' as ToolActionId,
        title: 'PDF to Images',
        description: 'Export PDF pages into crisp 150 DPI JPG, PNG, WEBP, or SVG images in a ZIP.',
        section: 'convert',
        icon: <FileText size={22} />,
        iconBg: '#fee2e2',
        iconColor: '#b91c1c',
      },
      {
        id: 'images-to-pdf' as ToolActionId,
        title: 'Images to PDF',
        description: 'Convert JPG, PNG, WEBP, and HEIC photos into a unified multi-page PDF.',
        section: 'convert',
        icon: <ImageIcon size={22} />,
        iconBg: '#ecfdf5',
        iconColor: '#047857',
      },
      {
        id: 'convert-video' as ToolActionId,
        title: 'Universal Video Converter',
        description: 'Transcode across MP4, MKV, AVI, WEBM, and MOV with 1080p/720p scaling.',
        section: 'convert',
        icon: <Video size={22} />,
        iconBg: '#f5f3ff',
        iconColor: '#6d28d9',
      },
      {
        id: 'convert-audio' as ToolActionId,
        title: 'Universal Audio Converter',
        description: 'Transcode across MP3, WAV, AAC, FLAC, OGG, and M4A with bitrate controls.',
        section: 'convert',
        icon: <Music size={22} />,
        iconBg: '#f0f9ff',
        iconColor: '#0369a1',
      },
    ],
  },
  {
    key: 'compress',
    title: 'Reduce file size',
    subtitle: 'Lossless and rate-controlled compression for documents, video, audio, and images',
    tools: [
      {
        id: 'compress-pdf' as ToolActionId,
        title: 'Compress PDF',
        description: 'Optimize internal streams and raster images to reduce document weight.',
        section: 'compress',
        icon: <Zap size={22} />,
        iconBg: '#fee2e2',
        iconColor: '#b91c1c',
      },
      {
        id: 'compress-video' as ToolActionId,
        title: 'Compress Video',
        description: 'Multi-pass CRF rate control with optional 1080p, 720p, or 480p scaling.',
        section: 'compress',
        icon: <Video size={22} />,
        iconBg: '#f5f3ff',
        iconColor: '#6d28d9',
      },
      {
        id: 'compress-audio' as ToolActionId,
        title: 'Compress Audio',
        description: 'Smart AAC/Opus bitrate normalization reducing audio size without audible loss.',
        section: 'compress',
        icon: <Music size={22} />,
        iconBg: '#f0f9ff',
        iconColor: '#0369a1',
      },
      {
        id: 'compress-image' as ToolActionId,
        title: 'Compress Images',
        description: 'Modern WebP and lossless image reduction up to 85% with balanced presets.',
        section: 'compress',
        icon: <ImageIcon size={22} />,
        iconBg: '#ecfdf5',
        iconColor: '#047857',
      },
    ],
  },
];

interface ToolsGridProps {
  onSelectTool: (toolId: ToolActionId) => void;
}

export const ToolsGrid: React.FC<ToolsGridProps> = ({ onSelectTool }) => {
  const [activeSection, setActiveSection] = useState<'all' | 'edit' | 'convert' | 'compress'>('all');

  const visibleSections = activeSection === 'all'
    ? SECTIONS_DATA
    : SECTIONS_DATA.filter((s) => s.key === activeSection);

  return (
    <section id="adobe-tools-grid" style={{ maxWidth: '1140px', margin: '48px auto 0 auto' }}>
      {/* Category Section Filter Bar (Adobe Acrobat Online Navigation Style) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '32px',
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '16px',
      }}>
        <div>
          <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.025em', margin: 0 }}>
            Creed-Tech Online Tools
          </h3>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '3px', margin: 0 }}>
            Standard Adobe Acrobat Online tool suite — frictionless, stateless, zero sign-in required.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Tools' },
            { id: 'edit', label: 'Edit' },
            { id: 'convert', label: 'Convert' },
            { id: 'compress', label: 'Reduce file size' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveSection(cat.id as any)}
              style={{
                padding: '7px 16px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: activeSection === cat.id ? 700 : 500,
                border: activeSection === cat.id ? '1px solid #0f172a' : '1px solid #e2e8f0',
                backgroundColor: activeSection === cat.id ? '#0f172a' : '#ffffff',
                color: activeSection === cat.id ? '#ffffff' : '#475569',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Render Structured Adobe-Style Sections */}
      {visibleSections.map((sec) => (
        <div key={sec.key} style={{ marginBottom: '44px' }}>
          <div style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                {sec.title}
              </h4>
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                backgroundColor: '#f1f5f9',
                color: '#475569',
                border: '1px solid #e2e8f0',
                padding: '2px 8px',
                borderRadius: '10px',
              }}>
                {sec.tools.length}
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px', margin: 0 }}>
              {sec.subtitle}
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '18px',
          }}>
            {sec.tools.map((tool) => (
              <div
                key={tool.title}
                onClick={() => onSelectTool(tool.id)}
                className="adobe-tool-card"
              >
                <div>
                  {/* Distinct Category Outlined Icon */}
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '10px',
                    backgroundColor: tool.iconBg,
                    color: tool.iconColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                    border: '1px solid rgba(0,0,0,0.06)',
                  }}>
                    {tool.icon}
                  </div>

                  {/* Bold Tool Title */}
                  <h5 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                    {tool.title}
                  </h5>

                  {/* 1-Line Description */}
                  <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                    {tool.description}
                  </p>
                </div>

                {/* Bottom Action Pill Button */}
                <div style={{ marginTop: '22px', display: 'flex', justifyContent: 'flex-start' }}>
                  <span
                    className="tool-action-btn"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '7px 16px',
                      fontSize: '12px',
                      fontWeight: 600,
                      borderRadius: '20px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      color: '#0f172a',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    Open Tool
                    <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
};
