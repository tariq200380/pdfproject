'use client';

import React from 'react';
import { ArrowLeft, ZoomIn, ZoomOut, RotateCw, Download, FileText } from 'lucide-react';

interface EditorToolbarProps {
  documentTitle: string;
  pageCount: number;
  currentPage: number;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onRotatePage: () => void;
  onDownload: () => void;
  onBack: () => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  documentTitle,
  pageCount,
  currentPage,
  zoom,
  onZoomChange,
  onRotatePage,
  onDownload,
  onBack,
}) => {
  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '10px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}
    >
      {/* Left: Back button & Document Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button
          onClick={onBack}
          className="btn btn-secondary"
          style={{ padding: '6px 12px', fontSize: '13px' }}
        >
          <ArrowLeft size={14} />
          Workspace
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={16} color="#b91c1c" />
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
            {documentTitle}
          </span>
          <span style={{
            fontSize: '12px',
            color: '#64748b',
            backgroundColor: '#f1f5f9',
            padding: '2px 8px',
            borderRadius: '4px',
            border: '1px solid #e2e8f0',
          }}>
            Page {currentPage} of {pageCount}
          </span>
        </div>
      </div>

      {/* Center: Zoom & Page Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#f1f5f9',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          padding: '2px',
        }}>
          <button
            onClick={() => onZoomChange(Math.max(0.6, zoom - 0.15))}
            style={{
              background: 'none',
              border: 'none',
              padding: '4px 8px',
              cursor: 'pointer',
              color: '#475569',
              display: 'flex',
              alignItems: 'center',
            }}
            title="Zoom out"
          >
            <ZoomOut size={14} />
          </button>
          <span style={{ fontSize: '12px', fontWeight: 500, minWidth: '42px', textAlign: 'center', color: '#0f172a' }}>
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => onZoomChange(Math.min(1.6, zoom + 0.15))}
            style={{
              background: 'none',
              border: 'none',
              padding: '4px 8px',
              cursor: 'pointer',
              color: '#475569',
              display: 'flex',
              alignItems: 'center',
            }}
            title="Zoom in"
          >
            <ZoomIn size={14} />
          </button>
        </div>

        <button
          onClick={onRotatePage}
          className="btn btn-secondary"
          style={{ padding: '6px 12px', fontSize: '13px' }}
          title="Rotate page 90 degrees clockwise"
        >
          <RotateCw size={14} />
          Rotate 90°
        </button>
      </div>

      {/* Right: Download Action */}
      <div>
        <button
          onClick={onDownload}
          className="btn btn-primary"
          style={{ padding: '7px 16px', fontSize: '13px' }}
        >
          <Download size={14} />
          Download PDF
        </button>
      </div>
    </div>
  );
};
