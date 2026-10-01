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
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface ToolItem {
  id: ToolActionId;
  title: string;
  description: string;
  category: 'popular' | 'convert' | 'edit' | 'compress' | 'media';
  categoryLabel: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}

const TOOLS: ToolItem[] = [
  // Popular Tools
  {
    id: 'edit-pdf',
    title: 'Edit PDF Text',
    description: 'Edit text directly on existing PDF pages matching exact font, size, baseline, and color.',
    category: 'popular',
    categoryLabel: 'PDF Studio',
    icon: <FileText size={22} />,
    iconBg: '#fee2e2',
    iconColor: '#b91c1c',
  },
  {
    id: 'images-to-pdf',
    title: 'Images to PDF',
    description: 'Convert JPG, PNG, WEBP, and HEIC photos into a unified multi-page PDF document.',
    category: 'popular',
    categoryLabel: 'Convert',
    icon: <ImageIcon size={22} />,
    iconBg: '#ecfdf5',
    iconColor: '#047857',
  },
  {
    id: 'compress-video',
    title: 'Compress Video',
    description: 'Reduce MP4, MKV, and MOV file size with high visual fidelity via CRF rate control.',
    category: 'popular',
    categoryLabel: 'Compress',
    icon: <Video size={22} />,
    iconBg: '#f5f3ff',
    iconColor: '#6d28d9',
  },
  {
    id: 'merge-pdf',
    title: 'Merge PDFs',
    description: 'Combine two or more PDF files into a single, organized document in seconds.',
    category: 'popular',
    categoryLabel: 'Edit',
    icon: <Copy size={22} />,
    iconBg: '#f1f5f9',
    iconColor: '#0f172a',
  },

  // Convert
  {
    id: 'images-to-pdf',
    title: 'Convert to PDF',
    description: 'Turn single or multiple JPG, PNG, WEBP, and HEIC files into high-resolution PDFs.',
    category: 'convert',
    categoryLabel: 'Convert',
    icon: <ImageIcon size={22} />,
    iconBg: '#ecfdf5',
    iconColor: '#047857',
  },
  {
    id: 'pdf-to-images',
    title: 'PDF to JPG / PNG',
    description: 'Export pages from your PDF into crisp 150 DPI raster images packaged in a ZIP.',
    category: 'convert',
    categoryLabel: 'Convert',
    icon: <FileText size={22} />,
    iconBg: '#fee2e2',
    iconColor: '#b91c1c',
  },
  {
    id: 'pdf-to-svg',
    title: 'PDF to SVG Vector',
    description: 'Convert PDF document pages into scalable SVG vector graphics for design workflows.',
    category: 'convert',
    categoryLabel: 'Convert',
    icon: <Layers size={22} />,
    iconBg: '#fffbeb',
    iconColor: '#d97706',
  },

  // Edit
  {
    id: 'edit-pdf',
    title: 'In-Place Text Editor',
    description: 'Click directly on PDF text to redact and replace text with automatic font matching.',
    category: 'edit',
    categoryLabel: 'Edit',
    icon: <FileText size={22} />,
    iconBg: '#fee2e2',
    iconColor: '#b91c1c',
  },
  {
    id: 'merge-pdf',
    title: 'Merge Multiple PDFs',
    description: 'Sequentially combine documents with drag-and-drop ordering and instant download.',
    category: 'edit',
    categoryLabel: 'Edit',
    icon: <Copy size={22} />,
    iconBg: '#f1f5f9',
    iconColor: '#0f172a',
  },
  {
    id: 'split-pdf',
    title: 'Split & Burst PDF',
    description: 'Extract specific page ranges (e.g. 1-3, 5) or burst every page into individual PDFs.',
    category: 'edit',
    categoryLabel: 'Edit',
    icon: <Scissors size={22} />,
    iconBg: '#f1f5f9',
    iconColor: '#0f172a',
  },
  {
    id: 'rotate-pdf',
    title: 'Rotate PDF Pages',
    description: 'Rotate clockwise or counter-clockwise (90°, 180°, 270°) and save permanently.',
    category: 'edit',
    categoryLabel: 'Edit',
    icon: <RotateCw size={22} />,
    iconBg: '#f1f5f9',
    iconColor: '#0f172a',
  },

  // Reduce File Size (Compress)
  {
    id: 'compress-image',
    title: 'Compress Images',
    description: 'Reduce PNG, JPG, and WEBP storage by up to 85% with balanced quality presets.',
    category: 'compress',
    categoryLabel: 'Compress',
    icon: <ImageIcon size={22} />,
    iconBg: '#ecfdf5',
    iconColor: '#047857',
  },
  {
    id: 'compress-video',
    title: 'Compress Video Files',
    description: 'Multi-pass CRF rate control with optional 1080p, 720p, or 480p resolution scaling.',
    category: 'compress',
    categoryLabel: 'Compress',
    icon: <Video size={22} />,
    iconBg: '#f5f3ff',
    iconColor: '#6d28d9',
  },
  {
    id: 'compress-audio',
    title: 'Compress Audio Tracks',
    description: 'Smart AAC/Opus bitrate normalization reducing audio file size without audible loss.',
    category: 'compress',
    categoryLabel: 'Compress',
    icon: <Music size={22} />,
    iconBg: '#f0f9ff',
    iconColor: '#0369a1',
  },
  {
    id: 'compress-pdf',
    title: 'Compress PDF Files',
    description: 'Optimize internal streams and raster images to reduce document transfer weight.',
    category: 'compress',
    categoryLabel: 'Compress',
    icon: <Zap size={22} />,
    iconBg: '#fee2e2',
    iconColor: '#b91c1c',
  },

  // Universal Media Engine
  {
    id: 'convert-video',
    title: 'Video Container Transcoder',
    description: 'Transcode across MP4, MKV, AVI, WEBM, and MOV with hardware-accelerated FFmpeg.',
    category: 'media',
    categoryLabel: 'Media',
    icon: <Video size={22} />,
    iconBg: '#f5f3ff',
    iconColor: '#6d28d9',
  },
  {
    id: 'convert-audio',
    title: 'Universal Audio Transcoder',
    description: 'Transcode across MP3, WAV, AAC, FLAC, OGG, and M4A with configurable bitrates.',
    category: 'media',
    categoryLabel: 'Media',
    icon: <Music size={22} />,
    iconBg: '#f0f9ff',
    iconColor: '#0369a1',
  },
];

interface ToolsGridProps {
  onSelectTool: (toolId: ToolActionId) => void;
}

export const ToolsGrid: React.FC<ToolsGridProps> = ({ onSelectTool }) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'popular' | 'convert' | 'edit' | 'compress' | 'media'>('all');

  const filteredTools = activeFilter === 'all'
    ? TOOLS
    : TOOLS.filter((t) => t.category === activeFilter);

  // Group tools by category for structured sections when "all" is selected
  const sections = [
    { key: 'popular', title: 'Popular Tools' },
    { key: 'convert', title: 'Convert' },
    { key: 'edit', title: 'Edit PDF' },
    { key: 'compress', title: 'Reduce File Size' },
    { key: 'media', title: 'Universal Media Engine' },
  ];

  return (
    <section id="adobe-tools-grid" style={{ maxWidth: '1140px', margin: '48px auto 0 auto' }}>
      {/* Category Filter Pills (Adobe Acrobat Online Style) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '28px',
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '16px',
      }}>
        <div>
          <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
            Adobe Acrobat Tools Catalog
          </h3>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px', margin: 0 }}>
            Instant frictionless access — zero login, zero credit card, zero installation.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Tools' },
            { id: 'popular', label: 'Popular' },
            { id: 'convert', label: 'Convert' },
            { id: 'edit', label: 'Edit' },
            { id: 'compress', label: 'Compress' },
            { id: 'media', label: 'Media' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveFilter(cat.id as any)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: activeFilter === cat.id ? 700 : 500,
                border: activeFilter === cat.id ? '1px solid #0f172a' : '1px solid #e2e8f0',
                backgroundColor: activeFilter === cat.id ? '#0f172a' : '#ffffff',
                color: activeFilter === cat.id ? '#ffffff' : '#475569',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Render Structured Sections */}
      {activeFilter === 'all' ? (
        sections.map((sec) => {
          const secTools = TOOLS.filter((t) => t.category === sec.key);
          if (secTools.length === 0) return null;

          return (
            <div key={sec.key} style={{ marginBottom: '40px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px',
              }}>
                <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  {sec.title}
                </h4>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  backgroundColor: '#f1f5f9',
                  color: '#64748b',
                  padding: '2px 8px',
                  borderRadius: '10px',
                }}>
                  {secTools.length}
                </span>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '16px',
              }}>
                {secTools.map((tool, idx) => (
                  <div
                    key={`${tool.id}-${idx}`}
                    onClick={() => onSelectTool(tool.id)}
                    className="adobe-tool-card"
                  >
                    <div>
                      {/* Outlined Icon Box */}
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
                        border: '1px solid rgba(0,0,0,0.04)',
                      }}>
                        {tool.icon}
                      </div>

                      {/* Tool Title */}
                      <h5 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                        {tool.title}
                      </h5>

                      {/* Description */}
                      <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                        {tool.description}
                      </p>
                    </div>

                    {/* Bottom Action Pill */}
                    <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-start' }}>
                      <span
                        className="tool-action-btn"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 14px',
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
          );
        })
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '16px',
          marginBottom: '40px',
        }}>
          {filteredTools.map((tool, idx) => (
            <div
              key={`${tool.id}-${idx}`}
              onClick={() => onSelectTool(tool.id)}
              className="adobe-tool-card"
            >
              <div>
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
                  border: '1px solid rgba(0,0,0,0.04)',
                }}>
                  {tool.icon}
                </div>

                <h5 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  {tool.title}
                </h5>

                <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                  {tool.description}
                </p>
              </div>

              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-start' }}>
                <span
                  className="tool-action-btn"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
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
      )}
    </section>
  );
};
