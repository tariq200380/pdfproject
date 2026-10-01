'use client';

import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, Video, Music } from 'lucide-react';

interface DragDropZoneProps {
  onFilesSelected: (files: File[]) => void;
}

export const DragDropZone: React.FC<DragDropZoneProps> = ({ onFilesSelected }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(Array.from(e.dataTransfer.files));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      style={{
        backgroundColor: isDragOver ? '#f1f5f9' : '#ffffff',
        border: `2px dashed ${isDragOver ? '#0f172a' : '#cbd5e1'}`,
        borderRadius: '12px',
        padding: '48px 24px',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        boxShadow: isDragOver ? '0 4px 12px rgba(0, 0, 0, 0.05)' : '0 1px 3px rgba(0, 0, 0, 0.03)',
        maxWidth: '1100px',
        margin: '24px auto',
      }}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        style={{ display: 'none' }}
        onChange={handleInputChange}
      />

      <div style={{
        width: '52px',
        height: '52px',
        borderRadius: '10px',
        backgroundColor: '#f1f5f9',
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 16px auto',
        color: '#0f172a',
      }}>
        <UploadCloud size={26} />
      </div>

      <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
        Drag & drop files here, or click to browse
      </h2>

      <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
        Instant in-place PDF editing, universal media conversion, and lossless file compression.
      </p>

      {/* Format Category Pills */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
      }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#475569',
        }}>
          <FileText size={14} color="#dc2626" />
          PDF Document
        </span>

        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#475569',
        }}>
          <ImageIcon size={14} color="#059669" />
          PNG, JPG, WEBP, SVG, HEIC
        </span>

        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#475569',
        }}>
          <Video size={14} color="#7c3aed" />
          MP4, MKV, AVI, WEBM, MOV
        </span>

        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#475569',
        }}>
          <Music size={14} color="#0284c7" />
          MP3, WAV, AAC, FLAC, OGG, M4A
        </span>
      </div>
    </div>
  );
};
