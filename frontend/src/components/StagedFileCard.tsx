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
        return <FileText size={22} color="#b91c1c" />;
      case 'image':
        return <ImageIcon size={22} color="#047857" />;
      case 'video':
        return <Video size={22} color="#6d28d9" />;
      case 'audio':
        return <Music size={22} color="#0369a1" />;
      default:
        return <FileText size={22} color="#475569" />;
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
        padding: '16px 22px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '18px',
        marginBottom: '12px',
      }}
    >
      {/* File Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: 0 }}>
        {stagedFile.previewUrl ? (
          <img
            src={stagedFile.previewUrl}
            alt={stagedFile.name}
            style={{
              width: '46px',
              height: '46px',
              objectFit: 'cover',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              flexShrink: 0,
            }}
          />
        ) : (
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '8px',
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
            fontSize: '15px',
            fontWeight: 600,
            color: '#0f172a',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {stagedFile.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '3px' }}>
            <span className={`badge ${getBadgeClass()}`}>{stagedFile.category}</span>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>{formatBytes(stagedFile.size)}</span>
          </div>
        </div>
      </div>

      {/* Contextual Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {stagedFile.category === 'pdf' && (
          <>
            <button
              onClick={() => onSelectAction(stagedFile, 'edit-text')}
              className="btn btn-primary"
              style={{ padding: '8px 16px', fontSize: '13px' }}
            >
              In-Place Editor
              <ArrowRight size={14} />
            </button>
            <button
              onClick={() => onSelectAction(stagedFile, 'split')}
              className="btn btn-secondary"
              style={{ padding: '8px 14px', fontSize: '13px' }}
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
              style={{ padding: '8px 16px', fontSize: '13px' }}
            >
              Convert to PDF
            </button>
            <button
              onClick={() => onSelectAction(stagedFile, 'compress-image')}
              className="btn btn-secondary"
              style={{ padding: '8px 14px', fontSize: '13px' }}
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
              style={{ padding: '8px 16px', fontSize: '13px' }}
            >
              Convert Format
            </button>
            <button
              onClick={() => onSelectAction(stagedFile, 'compress-media')}
              className="btn btn-secondary"
              style={{ padding: '8px 14px', fontSize: '13px' }}
            >
              Compress
            </button>
          </>
        )}

        {stagedFile.category === 'other' && (
          <button
            onClick={() => onSelectAction(stagedFile, 'convert-to-pdf')}
            className="btn btn-primary"
            style={{ padding: '8px 16px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            Convert to PDF
            <ArrowRight size={14} />
          </button>
        )}

        <button
          onClick={() => onRemove(stagedFile.id)}
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            borderRadius: '6px',
            transition: 'color 0.15s ease',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#dc2626')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = '#94a3b8')}
          title="Remove file"
        >
          <Trash2 size={17} />
        </button>
      </div>
    </div>
  );
};
