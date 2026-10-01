'use client';

import React from 'react';
import { StagedFile } from '@/lib/types';
import { FileText, Image as ImageIcon, Video, Music, Trash2, ArrowRight } from 'lucide-react';

interface StagedFileCardProps {
  stagedFile: StagedFile;
  onRemove: (id: string) => void;
  onSelectAction: (file: StagedFile, action: string) => void;
}

function formatBytes(bytes: number, decimals = 1) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export const StagedFileCard: React.FC<StagedFileCardProps> = ({
  stagedFile,
  onRemove,
  onSelectAction,
}) => {
  const getIcon = () => {
    switch (stagedFile.category) {
      case 'pdf':
        return <FileText size={20} color="#b91c1c" />;
      case 'image':
        return <ImageIcon size={20} color="#047857" />;
      case 'video':
        return <Video size={20} color="#6d28d9" />;
      case 'audio':
        return <Music size={20} color="#0369a1" />;
      default:
        return <FileText size={20} color="#475569" />;
    }
  };

  const getBadgeClass = () => {
    switch (stagedFile.category) {
      case 'pdf':
        return 'badge-pdf';
      case 'image':
        return 'badge-image';
      case 'video':
        return 'badge-video';
      case 'audio':
        return 'badge-audio';
      default:
        return '';
    }
  };

  return (
    <div
      className="solid-card"
      style={{
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '10px',
      }}
    >
      {/* File Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
        {stagedFile.previewUrl ? (
          <img
            src={stagedFile.previewUrl}
            alt={stagedFile.name}
            style={{
              width: '40px',
              height: '40px',
              objectFit: 'cover',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
            }}
          />
        ) : (
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '6px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            {getIcon()}
          </div>
        )}

        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#0f172a',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {stagedFile.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
            <span className={`badge ${getBadgeClass()}`}>{stagedFile.category}</span>
            <span style={{ fontSize: '12px', color: '#64748b' }}>{formatBytes(stagedFile.size)}</span>
          </div>
        </div>
      </div>

      {/* Contextual Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {stagedFile.category === 'pdf' && (
          <>
            <button
              onClick={() => onSelectAction(stagedFile, 'edit-text')}
              className="btn btn-primary"
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              In-Place Editor
              <ArrowRight size={13} />
            </button>
            <button
              onClick={() => onSelectAction(stagedFile, 'split')}
              className="btn btn-secondary"
              style={{ padding: '6px 10px', fontSize: '12px' }}
            >
              Split / Burst
            </button>
          </>
        )}

        {stagedFile.category === 'image' && (
          <>
            <button
              onClick={() => onSelectAction(stagedFile, 'convert-to-pdf')}
              className="btn btn-primary"
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              Convert to PDF
            </button>
            <button
              onClick={() => onSelectAction(stagedFile, 'compress-image')}
              className="btn btn-secondary"
              style={{ padding: '6px 10px', fontSize: '12px' }}
            >
              Compress
            </button>
          </>
        )}

        {(stagedFile.category === 'video' || stagedFile.category === 'audio') && (
          <>
            <button
              onClick={() => onSelectAction(stagedFile, 'convert-media')}
              className="btn btn-primary"
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              Convert Format
            </button>
            <button
              onClick={() => onSelectAction(stagedFile, 'compress-media')}
              className="btn btn-secondary"
              style={{ padding: '6px 10px', fontSize: '12px' }}
            >
              Compress
            </button>
          </>
        )}

        <button
          onClick={() => onRemove(stagedFile.id)}
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            borderRadius: '4px',
            transition: 'color 0.15s ease',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#dc2626')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = '#94a3b8')}
          title="Remove file"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};
