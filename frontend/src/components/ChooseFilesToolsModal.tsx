'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Search,
  Sparkles,
  Layers,
  ArrowRight,
  Minimize2,
  FileText,
  Copy,
  Pencil,
  PenTool,
  Video,
  FileCheck,
  FolderOpen,
} from 'lucide-react';
import { MEGA_MENU_COLUMNS, ToolItemDef } from './adobe/ToolsMegaMenu';

export interface ChooseFilesToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (toolId: string) => void;
  initialCategory?: string;
}

interface ToolWithCategory extends ToolItemDef {
  categoryKey: string;
  categoryLabel: string;
  groupTitle: string;
}

const CATEGORY_TABS = [
  { id: 'all', label: 'All Tools', icon: <Layers size={14} strokeWidth={2.2} /> },
  { id: 'to-pdf', label: 'Convert to PDF', icon: <FileText size={14} strokeWidth={2.2} /> },
  { id: 'from-pdf', label: 'Convert from PDF', icon: <FileCheck size={14} strokeWidth={2.2} /> },
  { id: 'compress', label: 'Compress', icon: <Minimize2 size={14} strokeWidth={2.2} /> },
  { id: 'organize', label: 'Merge & Organize', icon: <Copy size={14} strokeWidth={2.2} /> },
  { id: 'edit', label: 'Edit & Annotate', icon: <Pencil size={14} strokeWidth={2.2} /> },
  { id: 'sign', label: 'Sign & Protect', icon: <PenTool size={14} strokeWidth={2.2} /> },
  { id: 'media', label: 'Media Studio', icon: <Video size={14} strokeWidth={2.2} /> },
];

export const ChooseFilesToolsModal: React.FC<ChooseFilesToolsModalProps> = ({
  isOpen,
  onClose,
  onSelectTool,
  initialCategory = 'all',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');

  // Sync initialCategory if opened with a specific top category
  useEffect(() => {
    if (isOpen) {
      if (initialCategory === 'compress') setSelectedCategory('compress');
      else if (initialCategory === 'merge') setSelectedCategory('organize');
      else if (initialCategory === 'edit') setSelectedCategory('edit');
      else if (initialCategory === 'sign') setSelectedCategory('sign');
      else if (initialCategory === 'media') setSelectedCategory('media');
      else if (initialCategory === 'office' || initialCategory === 'convert') setSelectedCategory('all');
      else setSelectedCategory('all');
      setSearchQuery('');
    }
  }, [isOpen, initialCategory]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Flatten and categorize all tools from MEGA_MENU_COLUMNS
  const allTools = useMemo<ToolWithCategory[]>(() => {
    const tools: ToolWithCategory[] = [];
    const seenIds = new Set<string>();

    MEGA_MENU_COLUMNS.forEach((col) => {
      col.groups.forEach((group) => {
        let catKey = 'to-pdf';
        let catLabel = 'Convert to PDF';

        const title = group.title.toLowerCase();
        if (title.includes('compress')) {
          catKey = 'compress';
          catLabel = 'Compress';
        } else if (title.includes('pdf to') || title.includes('convert from')) {
          catKey = 'from-pdf';
          catLabel = 'Convert from PDF';
        } else if (title.includes('organize')) {
          catKey = 'organize';
          catLabel = 'Merge & Organize';
        } else if (title.includes('edit')) {
          catKey = 'edit';
          catLabel = 'Edit & Annotate';
        } else if (title.includes('sign') || title.includes('protect')) {
          catKey = 'sign';
          catLabel = 'Sign & Protect';
        } else if (title.includes('media')) {
          catKey = 'media';
          catLabel = 'Media Studio';
        } else {
          catKey = 'to-pdf';
          catLabel = 'Convert to PDF';
        }

        group.tools.forEach((t) => {
          if (!seenIds.has(t.id)) {
            seenIds.add(t.id);
            tools.push({
              ...t,
              categoryKey: catKey,
              categoryLabel: catLabel,
              groupTitle: group.title,
            });
          }
        });
      });
    });

    return tools;
  }, []);

  // Filter tools based on selected category tab and search query
  const filteredTools = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return allTools.filter((t) => {
      const matchesCategory =
        selectedCategory === 'all' || t.categoryKey === selectedCategory;
      const searchable = `${t.name} ${t.badgeText || ''} ${t.groupTitle} ${t.id}`.toLowerCase();
      const matchesQuery = !q || searchable.includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [allTools, selectedCategory, searchQuery]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Choose a PDF or Media Tool"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.15s ease-out',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '1020px',
          maxHeight: '88vh',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(15, 23, 42, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#fafafa',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#ef4444',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(239, 68, 68, 0.25)',
              }}
            >
              <Sparkles size={18} />
            </div>
            <div>
              <h2
                style={{
                  fontSize: '18px',
                  fontWeight: 800,
                  color: '#0f172a',
                  letterSpacing: '-0.02em',
                  margin: 0,
                }}
              >
                Choose a Tool or Action
              </h2>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0 0' }}>
                Select any tool below to convert, compress, organize, edit, or process your files
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => {
                onSelectTool(initialCategory === 'media' ? 'convert-video' : 'smart-pdf');
                onClose();
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1d4ed8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#2563eb';
              }}
            >
              <FolderOpen size={15} />
              <span>Direct File Upload</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close tools popup"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                color: '#64748b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f1f5f9';
                e.currentTarget.style.color = '#0f172a';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.color = '#64748b';
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Search Bar & Subheader */}
        <div
          style={{
            padding: '16px 24px 12px 24px',
            borderBottom: '1px solid #f1f5f9',
            backgroundColor: '#ffffff',
          }}
        >
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '12px',
                color: '#94a3b8',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tools (e.g., Word to PDF, Merge, Compress, Watermark)..."
              style={{
                width: '100%',
                padding: '10px 14px 10px 38px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                fontSize: '14px',
                color: '#0f172a',
                outline: 'none',
                backgroundColor: '#f8fafc',
                transition: 'all 0.15s ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#2563eb';
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.12)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#cbd5e1';
                e.currentTarget.style.backgroundColor = '#f8fafc';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '10px',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category Tabs Buttons ("jis btn py select kry aus ky tool a jy") */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              overflowX: 'auto',
              paddingTop: '12px',
              paddingBottom: '2px',
              scrollbarWidth: 'none',
            }}
          >
            {CATEGORY_TABS.map((tab) => {
              const isSelected = selectedCategory === tab.id;
              const count =
                tab.id === 'all'
                  ? allTools.length
                  : allTools.filter((t) => t.categoryKey === tab.id).length;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedCategory(tab.id)}
                  style={{
                    padding: '7px 13px',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    fontWeight: isSelected ? 700 : 600,
                    border: isSelected ? '1px solid #0f172a' : '1px solid #e2e8f0',
                    backgroundColor: isSelected ? '#0f172a' : '#f8fafc',
                    color: isSelected ? '#ffffff' : '#475569',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.12s ease',
                    boxShadow: isSelected ? '0 2px 6px rgba(15, 23, 42, 0.15)' : 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = '#f1f5f9';
                      e.currentTarget.style.color = '#0f172a';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                      e.currentTarget.style.color = '#475569';
                    }
                  }}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  <span
                    style={{
                      fontSize: '10.5px',
                      fontWeight: 700,
                      padding: '1px 6px',
                      borderRadius: '10px',
                      backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.22)' : '#e2e8f0',
                      color: isSelected ? '#ffffff' : '#64748b',
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tools Grid Body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 24px',
            backgroundColor: '#ffffff',
          }}
        >
          {filteredTools.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '48px 20px',
                color: '#64748b',
              }}
            >
              <Search size={36} style={{ margin: '0 auto 12px auto', opacity: 0.4 }} />
              <p style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', margin: '0 0 4px 0' }}>
                No tools found
              </p>
              <p style={{ fontSize: '13px', margin: 0 }}>
                Try adjusting your search query or select another category button above.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
                gap: '12px',
              }}
            >
              {filteredTools.map((tool) => (
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
                    gap: '12px',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    backgroundColor: '#ffffff',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    transition: 'all 0.15s ease',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                    e.currentTarget.style.borderColor = '#2563eb';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 6px 14px -3px rgba(37, 99, 235, 0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.02)';
                  }}
                >
                  {/* Tool Icon / Badge */}
                  {tool.badgeText ? (
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        backgroundColor: tool.iconBg || '#2563eb',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: tool.badgeFontSize || '11px',
                        fontWeight: 800,
                        flexShrink: 0,
                      }}
                    >
                      {tool.badgeText}
                    </div>
                  ) : (
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        backgroundColor: tool.iconBg || '#eff6ff',
                        color: tool.iconColor || '#2563eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {tool.icon || <FileText size={16} />}
                    </div>
                  )}

                  {/* Tool Information */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '13.5px',
                        fontWeight: 700,
                        color: '#0f172a',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {tool.name}
                    </div>
                    <div
                      style={{
                        fontSize: '11.5px',
                        color: '#64748b',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        marginTop: '1px',
                      }}
                    >
                      {tool.groupTitle} {tool.subText || ''}
                    </div>
                  </div>

                  <ArrowRight size={14} style={{ color: '#cbd5e1', flexShrink: 0 }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '12px 24px',
            borderTop: '1px solid #f1f5f9',
            backgroundColor: '#fafafa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: '#64748b',
          }}
        >
          <span>
            Showing <strong style={{ color: '#0f172a' }}>{filteredTools.length}</strong> tools
          </span>
          <span>Tip: Click any tool card to launch it directly</span>
        </div>
      </div>
    </div>
  );
};
