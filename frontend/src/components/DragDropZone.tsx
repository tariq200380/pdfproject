'use client';

import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, Video, Music, FolderUp } from 'lucide-react';

const UNIVERSAL_ACCEPT =
  '.pdf,.docx,.doc,.xlsx,.xls,.pptx,.ppt,.txt,.rtf,.jpg,.jpeg,.png,.webp,.svg,.heic,.heif,.bmp,.tiff,.tif,.gif,.psd,.ai,.indd,.idml,.mp4,.mov,.mkv,.avi,.webm,.mp3,.wav,.aac,.flac,.ogg,.m4a,image/*,video/*,audio/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.*';

interface DragDropZoneProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
}

export const DragDropZone: React.FC<DragDropZoneProps> = ({ onFilesSelected, accept = UNIVERSAL_ACCEPT }) => {
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

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    inputRef.current?.click();
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      style={{
        backgroundColor: isDragOver ? '#f8fafc' : '#ffffff',
        border: `2px dashed ${isDragOver ? '#0f172a' : '#cbd5e1'}`,
        borderRadius: '16px',
        padding: '56px 32px',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: isDragOver
          ? '0 10px 25px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.03)'
          : '0 2px 6px -1px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.02)',
        maxWidth: '1100px',
        margin: '32px auto 24px auto',
      }}
      onMouseEnter={(e) => {
        if (!isDragOver) {
          e.currentTarget.style.borderColor = '#94a3b8';
          e.currentTarget.style.boxShadow = '0 6px 16px -2px rgba(15, 23, 42, 0.06)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isDragOver) {
          e.currentTarget.style.borderColor = '#cbd5e1';
          e.currentTarget.style.boxShadow = '0 2px 6px -1px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.02)';
        }
      }}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept}
        style={{ display: 'none' }}
        onChange={handleInputChange}
      />

      {/* Confident Icon Hero Badge */}
      <div style={{
        width: '68px',
        height: '68px',
        borderRadius: '14px',
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 20px auto',
        color: '#0f172a',
        boxShadow: '0 2px 5px rgba(15, 23, 42, 0.05)',
      }}>
        <UploadCloud size={34} strokeWidth={1.8} />
      </div>

      {/* Prominent Headlines */}
      <h2 style={{
        fontSize: '24px',
        fontWeight: 700,
        color: '#0f172a',
        letterSpacing: '-0.025em',
        marginBottom: '8px',
      }}>
        Drag and drop files to get started
      </h2>

      <p style={{
        fontSize: '15px',
        color: '#475569',
        maxWidth: '560px',
        margin: '0 auto 24px auto',
        lineHeight: 1.5,
      }}>
        Zero upload waiting. Documents and media load directly into your ephemeral workspace with automatic client-side backup.
      </p>

      {/* Tactile Full-Sized Primary Action Button */}
      <div style={{ marginBottom: '14px' }}>
        <button
          type="button"
          onClick={handleButtonClick}
          className="btn btn-primary"
          style={{
            height: '48px',
            padding: '0 32px',
            fontSize: '15px',
            fontWeight: 600,
            borderRadius: '10px',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.18)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <FolderUp size={18} />
          Choose Files to Upload
        </button>
      </div>

      <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '28px' }}>
        or drag & drop files anywhere onto this area
      </div>

      {/* Format Category Pills with Icons */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
      }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: 600,
          color: '#b91c1c',
          boxShadow: '0 1px 2px rgba(185, 28, 28, 0.05)',
        }}>
          <FileText size={15} color="#b91c1c" />
          PDF Document
        </span>

        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: 600,
          color: '#1d4ed8',
          boxShadow: '0 1px 2px rgba(29, 78, 216, 0.05)',
        }}>
          <FileText size={15} color="#1d4ed8" />
          Word, Excel, PPT (.docx, .xlsx, .pptx)
        </span>

        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          backgroundColor: '#ecfdf5',
          border: '1px solid #a7f3d0',
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: 600,
          color: '#047857',
          boxShadow: '0 1px 2px rgba(4, 120, 87, 0.05)',
        }}>
          <ImageIcon size={15} color="#047857" />
          PNG, JPG, WEBP, SVG, HEIC
        </span>

        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          backgroundColor: '#f5f3ff',
          border: '1px solid #ddd6fe',
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: 600,
          color: '#6d28d9',
          boxShadow: '0 1px 2px rgba(109, 40, 217, 0.05)',
        }}>
          <Video size={15} color="#6d28d9" />
          MP4, MKV, AVI, WEBM, MOV
        </span>

        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          backgroundColor: '#f0f9ff',
          border: '1px solid #bae6fd',
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: 600,
          color: '#0369a1',
          boxShadow: '0 1px 2px rgba(3, 105, 161, 0.05)',
        }}>
          <Music size={15} color="#0369a1" />
          MP3, WAV, AAC, FLAC, OGG, M4A
        </span>
      </div>
    </div>
  );
};
