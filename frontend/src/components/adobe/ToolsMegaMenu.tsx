'use client';

import React from 'react';
import {
  Minimize2,
  FileText,
  FileSearch,
  FileCheck,
  Image as ImageIcon,
  Copy,
  Scissors,
  RotateCw,
  Trash2,
  ExternalLink,
  LayoutGrid,
  Pencil,
  Highlighter,
  Eye,
  Hash,
  Crop,
  EyeOff,
  Sparkles,
  ClipboardList,
  Share2,
  PenTool,
  ShieldCheck,
  Unlock,
  Lock,
  Layers,
  Camera,
  Video,
  Music,
} from 'lucide-react';

export interface ToolItemDef {
  id: string;
  name: string;
  badgeText?: string;
  badgeFontSize?: string;
  icon?: React.ReactNode;
  iconBg?: string;
  iconColor?: string;
  subText?: string;
}

export interface ToolCategoryGroup {
  title: string;
  tools: ToolItemDef[];
}

export interface MegaMenuColumn {
  groups: ToolCategoryGroup[];
}

export const MEGA_MENU_COLUMNS: MegaMenuColumn[] = [
  // Column 1: Compress, Convert, PDF to Image, Image to PDF
  {
    groups: [
      {
        title: 'Compress',
        tools: [
          {
            id: 'compress-pdf',
            name: 'Compress PDF',
            icon: <Minimize2 size={16} strokeWidth={2.3} />,
            iconBg: '#fee2e2',
            iconColor: '#ef4444',
          },
        ],
      },
      {
        title: 'Convert',
        tools: [
          {
            id: 'smart-pdf',
            name: 'PDF Converter',
            icon: <FileText size={16} strokeWidth={2.3} />,
            iconBg: '#fee2e2',
            iconColor: '#ef4444',
          },
          {
            id: 'ocr-pdf',
            name: 'PDF OCR',
            badgeText: 'OCR',
            badgeFontSize: '8px',
            iconBg: '#ef4444',
          },
          {
            id: 'pdf-to-pdfa',
            name: 'PDF to PDF/A',
            badgeText: 'A/1b',
            badgeFontSize: '7.5px',
            iconBg: '#ef4444',
          },
        ],
      },
      {
        title: 'PDF to Image',
        tools: [
          {
            id: 'pdf-to-jpg',
            name: 'PDF to JPG',
            icon: <ImageIcon size={16} strokeWidth={2.3} />,
            iconBg: '#fef3c7',
            iconColor: '#f59e0b',
          },
          {
            id: 'pdf-to-png',
            name: 'PDF to PNG',
            icon: <ImageIcon size={16} strokeWidth={2.3} />,
            iconBg: '#fef3c7',
            iconColor: '#f59e0b',
          },
        ],
      },
      {
        title: 'Image to PDF',
        tools: [
          {
            id: 'jpg-to-pdf',
            name: 'JPG to PDF',
            icon: <ImageIcon size={16} strokeWidth={2.3} />,
            iconBg: '#fef3c7',
            iconColor: '#f59e0b',
          },
        ],
      },
    ],
  },

  // Column 2: PDF to Office, Office to PDF, OpenOffice to PDF
  {
    groups: [
      {
        title: 'PDF to Office',
        tools: [
          {
            id: 'pdf-to-word',
            name: 'PDF to Word',
            badgeText: 'W',
            iconBg: '#2563eb',
          },
          {
            id: 'pdf-to-excel',
            name: 'PDF to Excel',
            badgeText: 'X',
            iconBg: '#16a34a',
          },
          {
            id: 'pdf-to-ppt',
            name: 'PDF to PPT',
            badgeText: 'P',
            iconBg: '#ea580c',
          },
        ],
      },
      {
        title: 'Office to PDF',
        tools: [
          {
            id: 'word-to-pdf',
            name: 'Word to PDF',
            badgeText: 'W',
            iconBg: '#2563eb',
          },
          {
            id: 'excel-to-pdf',
            name: 'Excel to PDF',
            badgeText: 'X',
            iconBg: '#16a34a',
          },
          {
            id: 'ppt-to-pdf',
            name: 'PPT to PDF',
            badgeText: 'P',
            iconBg: '#ea580c',
          },
        ],
      },
      {
        title: 'OpenOffice to PDF',
        tools: [
          {
            id: 'odt-to-pdf',
            name: 'ODT to PDF',
            badgeText: 'ODT',
            badgeFontSize: '8px',
            iconBg: '#2563eb',
          },
          {
            id: 'ods-to-pdf',
            name: 'ODS to PDF',
            badgeText: 'ODS',
            badgeFontSize: '8px',
            iconBg: '#16a34a',
          },
          {
            id: 'odp-to-pdf',
            name: 'ODP to PDF',
            badgeText: 'ODP',
            badgeFontSize: '8px',
            iconBg: '#ea580c',
          },
        ],
      },
    ],
  },

  // Column 3: Convert to PDF, iWork to PDF
  {
    groups: [
      {
        title: 'Convert to PDF',
        tools: [
          {
            id: 'text-to-pdf',
            name: 'TXT to PDF',
            badgeText: 'TXT',
            badgeFontSize: '8px',
            iconBg: '#2563eb',
          },
          {
            id: 'rtf-to-pdf',
            name: 'RTF to PDF',
            badgeText: 'RTF',
            badgeFontSize: '8px',
            iconBg: '#2563eb',
          },
          {
            id: 'hwp-to-pdf',
            name: 'HWP to PDF',
            badgeText: 'HWP',
            badgeFontSize: '7.5px',
            iconBg: '#2563eb',
          },
          {
            id: 'html-to-pdf',
            name: 'HTML to PDF',
            badgeText: 'HTML',
            badgeFontSize: '7px',
            iconBg: '#2563eb',
          },
          {
            id: 'epub-to-pdf',
            name: 'EPUB to PDF',
            badgeText: 'EPUB',
            badgeFontSize: '7px',
            iconBg: '#2563eb',
          },
          {
            id: 'zip-to-pdf',
            name: 'ZIP to PDF',
            badgeText: 'ZIP',
            badgeFontSize: '8px',
            iconBg: '#2563eb',
          },
          {
            id: 'csv-to-pdf',
            name: 'CSV to PDF',
            badgeText: 'CSV',
            badgeFontSize: '8px',
            iconBg: '#16a34a',
          },
        ],
      },
      {
        title: 'iWork to PDF',
        tools: [
          {
            id: 'pages-to-pdf',
            name: 'Pages to PDF',
            badgeText: 'Pages',
            badgeFontSize: '6.5px',
            iconBg: '#2563eb',
          },
        ],
      },
    ],
  },

  // Column 4: Organize
  {
    groups: [
      {
        title: 'Organize',
        tools: [
          {
            id: 'merge-pdf',
            name: 'Merge PDF',
            icon: <Copy size={16} strokeWidth={2.3} />,
            iconBg: '#ede9fe',
            iconColor: '#7c3aed',
          },
          {
            id: 'split-pdf',
            name: 'Split PDF',
            icon: <Scissors size={16} strokeWidth={2.3} />,
            iconBg: '#ede9fe',
            iconColor: '#7c3aed',
          },
          {
            id: 'rotate-pdf',
            name: 'Rotate PDF',
            icon: <RotateCw size={16} strokeWidth={2.3} />,
            iconBg: '#ede9fe',
            iconColor: '#7c3aed',
          },
          {
            id: 'delete-pages',
            name: 'Delete PDF Pages',
            icon: <Trash2 size={16} strokeWidth={2.3} />,
            iconBg: '#ede9fe',
            iconColor: '#7c3aed',
          },
          {
            id: 'extract-pages',
            name: 'Extract PDF Pages',
            icon: <ExternalLink size={16} strokeWidth={2.3} />,
            iconBg: '#ede9fe',
            iconColor: '#7c3aed',
          },
          {
            id: 'reorder-pages',
            name: 'Organize PDF',
            icon: <LayoutGrid size={16} strokeWidth={2.3} />,
            iconBg: '#ede9fe',
            iconColor: '#7c3aed',
          },
        ],
      },
    ],
  },

  // Column 5: Edit
  {
    groups: [
      {
        title: 'Edit',
        tools: [
          {
            id: 'edit-pdf',
            name: 'Edit PDF',
            icon: <Pencil size={16} strokeWidth={2.3} />,
            iconBg: '#ccfbf1',
            iconColor: '#0d9488',
          },
          {
            id: 'pdf-annotator',
            name: 'PDF Annotator',
            icon: <Highlighter size={16} strokeWidth={2.3} />,
            iconBg: '#ccfbf1',
            iconColor: '#0d9488',
          },
          {
            id: 'pdf-reader',
            name: 'PDF Reader',
            icon: <Eye size={16} strokeWidth={2.3} />,
            iconBg: '#ccfbf1',
            iconColor: '#0d9488',
          },
          {
            id: 'number-pages',
            name: 'Number Pages',
            icon: <Hash size={16} strokeWidth={2.3} />,
            iconBg: '#ccfbf1',
            iconColor: '#0d9488',
          },
          {
            id: 'crop-pdf',
            name: 'Crop PDF',
            icon: <Crop size={16} strokeWidth={2.3} />,
            iconBg: '#ccfbf1',
            iconColor: '#0d9488',
          },
          {
            id: 'redact-pdf',
            name: 'Redact PDF',
            icon: <EyeOff size={16} strokeWidth={2.3} />,
            iconBg: '#ccfbf1',
            iconColor: '#0d9488',
          },
          {
            id: 'watermark-pdf',
            name: 'Watermark PDF',
            icon: <Sparkles size={16} strokeWidth={2.3} />,
            iconBg: '#ccfbf1',
            iconColor: '#0d9488',
          },
          {
            id: 'pdf-forms',
            name: 'PDF Form Filler',
            icon: <ClipboardList size={16} strokeWidth={2.3} />,
            iconBg: '#ccfbf1',
            iconColor: '#0d9488',
          },
          {
            id: 'share-pdf',
            name: 'Share PDF',
            icon: <Share2 size={16} strokeWidth={2.3} />,
            iconBg: '#ccfbf1',
            iconColor: '#0d9488',
          },
        ],
      },
    ],
  },

  // Column 6: Media Tools, Fill & Sign, Protect & Scan
  {
    groups: [
      {
        title: 'Media Tools',
        tools: [
          {
            id: 'convert-video',
            name: 'Video Converter',
            icon: <Video size={16} strokeWidth={2.3} />,
            iconBg: '#ede9fe',
            iconColor: '#7c3aed',
          },
          {
            id: 'convert-audio',
            name: 'Audio Converter',
            icon: <Music size={16} strokeWidth={2.3} />,
            iconBg: '#f0f9ff',
            iconColor: '#0284c7',
          },
          {
            id: 'image-converter',
            name: 'Image Converter',
            icon: <ImageIcon size={16} strokeWidth={2.3} />,
            iconBg: '#ecfdf5',
            iconColor: '#059669',
          },
          {
            id: 'video-to-audio',
            name: 'Video to Audio',
            icon: <Music size={16} strokeWidth={2.3} />,
            iconBg: '#fef3c7',
            iconColor: '#d97706',
          },
          {
            id: 'remove-watermark-video',
            name: 'Remove Video Watermark',
            icon: <Video size={16} strokeWidth={2.3} />,
            iconBg: '#fce7f3',
            iconColor: '#db2777',
          },
          {
            id: 'remove-watermark-image',
            name: 'Remove Image Watermark',
            icon: <ImageIcon size={16} strokeWidth={2.3} />,
            iconBg: '#f0fdf4',
            iconColor: '#16a34a',
          },
        ],
      },
      {
        title: 'Fill & Sign',
        tools: [
          {
            id: 'fill-sign',
            name: 'Sign PDF',
            icon: <PenTool size={16} strokeWidth={2.3} />,
            iconBg: '#fce7f3',
            iconColor: '#ec4899',
          },
          {
            id: 'request-signatures',
            name: 'Request Signatures',
            icon: <ShieldCheck size={16} strokeWidth={2.3} />,
            iconBg: '#fef3c7',
            iconColor: '#d97706',
            subText: '(Sign.com)',
          },
        ],
      },
      {
        title: 'Protect & Scan',
        tools: [
          {
            id: 'unlock-pdf',
            name: 'Unlock PDF',
            icon: <Unlock size={16} strokeWidth={2.3} />,
            iconBg: '#fce7f3',
            iconColor: '#ec4899',
          },
          {
            id: 'protect-pdf',
            name: 'Protect PDF',
            icon: <Lock size={16} strokeWidth={2.3} />,
            iconBg: '#fce7f3',
            iconColor: '#ec4899',
          },
          {
            id: 'flatten-pdf',
            name: 'Flatten PDF',
            icon: <Layers size={16} strokeWidth={2.3} />,
            iconBg: '#fce7f3',
            iconColor: '#ec4899',
          },
          {
            id: 'pdf-scanner',
            name: 'PDF Scanner',
            icon: <Camera size={16} strokeWidth={2.3} />,
            iconBg: '#dbeafe',
            iconColor: '#2563eb',
          },
        ],
      },
    ],
  },
];

interface ToolsMegaMenuProps {
  onSelectTool: (toolId: string) => void;
  onClose: () => void;
}

export const ToolsMegaMenu: React.FC<ToolsMegaMenuProps> = ({ onSelectTool, onClose }) => {
  return (
    <div
      role="dialog"
      aria-label="All PDF Tools and Categories"
      style={{
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        borderBottom: '1px solid #e2e8f0',
        boxShadow: '0 20px 35px -8px rgba(15, 23, 42, 0.12), 0 4px 6px -2px rgba(15, 23, 42, 0.04)',
        zIndex: 1000,
        padding: '24px 32px 32px 32px',
        maxHeight: 'calc(100vh - 66px)',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: '1380px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
          gap: '24px',
        }}
      >
        {MEGA_MENU_COLUMNS.map((column, colIdx) => (
          <div key={`col-${colIdx}`} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {column.groups.map((group, grpIdx) => (
              <div key={`grp-${colIdx}-${grpIdx}`}>
                {/* Category Header */}
                <h3
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#64748b',
                    margin: '0 0 8px 6px',
                    letterSpacing: '0.02em',
                    textTransform: 'none',
                  }}
                >
                  {group.title}
                </h3>

                {/* Tools List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {group.tools.map((tool) => (
                    <button
                      key={tool.id}
                      type="button"
                      onClick={() => {
                        onSelectTool(tool.id);
                        onClose();
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '9px',
                        padding: '6px 8px',
                        borderRadius: '6px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        width: '100%',
                        transition: 'background-color 0.12s ease, transform 0.05s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f1f5f9';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      {/* Icon Container */}
                      {tool.badgeText ? (
                        <div
                          style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '4px',
                            backgroundColor: tool.iconBg || '#2563eb',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: tool.badgeFontSize || '11px',
                            fontWeight: 800,
                            flexShrink: 0,
                            letterSpacing: '-0.02em',
                            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.08)',
                          }}
                        >
                          {tool.badgeText}
                        </div>
                      ) : (
                        <div
                          style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '4px',
                            backgroundColor: tool.iconBg || '#f1f5f9',
                            color: tool.iconColor || '#0f172a',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {tool.icon}
                        </div>
                      )}

                      {/* Tool Name and optional subtext */}
                      <span
                        style={{
                          fontSize: '13px',
                          fontWeight: 500,
                          color: '#1e293b',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {tool.name}
                        {tool.subText && (
                          <span
                            style={{
                              display: 'block',
                              fontSize: '10px',
                              fontWeight: 400,
                              color: '#64748b',
                            }}
                          >
                            {tool.subText}
                          </span>
                        )}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
