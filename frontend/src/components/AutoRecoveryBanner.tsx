'use client';

import React from 'react';
import { History, X, Check, Trash2 } from 'lucide-react';

interface AutoRecoveryBannerProps {
  count: number;
  lastSavedAt: number;
  onRestore: () => void;
  onClear: () => void;
  onDismiss: () => void;
}

export const AutoRecoveryBanner: React.FC<AutoRecoveryBannerProps> = ({
  count,
  lastSavedAt,
  onRestore,
  onClear,
  onDismiss,
}) => {
  if (count === 0) return null;

  const minutesAgo = Math.max(1, Math.round((Date.now() - lastSavedAt) / 60000));
  const timeText = minutesAgo < 60 ? `${minutesAgo}m ago` : `${Math.round(minutesAgo / 60)}h ago`;

  return (
    <div style={{
      maxWidth: '1100px',
      margin: '16px auto 0 auto',
      padding: '12px 18px',
      backgroundColor: '#ffffff',
      border: '1px solid #cbd5e1',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '6px',
          backgroundColor: '#eff6ff',
          color: '#2563eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <History size={18} />
        </div>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
            Previous workspace session found
          </div>
          <div style={{ fontSize: '12px', color: '#64748b' }}>
            {count} {count === 1 ? 'file' : 'files'} cached locally in browser IndexedDB ({timeText}) • Auto-purges after 3 hours
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={onRestore}
          className="btn btn-primary"
          style={{ padding: '6px 14px', fontSize: '13px' }}
        >
          <Check size={14} />
          Restore Session
        </button>

        <button
          onClick={onClear}
          className="btn btn-secondary"
          style={{ padding: '6px 12px', fontSize: '13px' }}
        >
          <Trash2 size={13} />
          Clear
        </button>

        <button
          onClick={onDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
          }}
          title="Dismiss banner"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
