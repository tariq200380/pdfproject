'use client';

import React from 'react';
import { PageInfo, pdfApiClient } from '@/lib/pdfApiClient';

interface PageSidebarProps {
  sessionId: string;
  pages: PageInfo[];
  currentPageIndex: number;
  timestamp: number;
  onSelectPage: (index: number) => void;
}

export const PageSidebar: React.FC<PageSidebarProps> = ({
  sessionId,
  pages,
  currentPageIndex,
  timestamp,
  onSelectPage,
}) => {
  return (
    <aside
      style={{
        width: '180px',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e2e8f0',
        padding: '16px 12px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        height: 'calc(100vh - 57px)',
      }}
    >
      <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', paddingLeft: '4px' }}>
        Pages ({pages.length})
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {pages.map((p, idx) => {
          const isActive = idx === currentPageIndex;
          return (
            <div
              key={p.page_index}
              onClick={() => onSelectPage(idx)}
              style={{
                cursor: 'pointer',
                borderRadius: '6px',
                border: isActive ? '2px solid #0f172a' : '1px solid #e2e8f0',
                padding: '6px',
                backgroundColor: isActive ? '#f8fafc' : '#ffffff',
                boxShadow: isActive ? '0 2px 4px rgba(0, 0, 0, 0.05)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{
                position: 'relative',
                backgroundColor: '#f1f5f9',
                borderRadius: '4px',
                overflow: 'hidden',
                aspectRatio: `${p.width} / ${p.height}`,
              }}>
                <img
                  src={pdfApiClient.getThumbnailUrl(sessionId, idx, timestamp)}
                  alt={`Thumb ${p.page_number}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
              </div>

              <div style={{
                textAlign: 'center',
                fontSize: '11px',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#0f172a' : '#64748b',
                marginTop: '4px',
              }}>
                {p.page_number}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
