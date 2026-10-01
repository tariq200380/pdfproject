'use client';

import React from 'react';
import { ActiveStudioTab } from '@/lib/types';
import { FileText, RefreshCw, Minimize2, HardDrive, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveStudioTab;
  onTabChange: (tab: ActiveStudioTab) => void;
  stagedCount: number;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange, stagedCount }) => {
  return (
    <header style={{
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      padding: '16px 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.03)',
    }}>
      {/* Brand & Stateless Security Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          fontSize: '20px',
          boxShadow: '0 2px 5px rgba(15, 23, 42, 0.2)',
          userSelect: 'none',
        }}>
          Ω
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.025em', margin: 0 }}>
              OmniMedia & PDF Studio
            </h1>
            <span style={{
              fontSize: '11px',
              fontWeight: 600,
              padding: '3px 9px',
              backgroundColor: '#ecfdf5',
              color: '#047857',
              borderRadius: '6px',
              border: '1px solid #a7f3d0',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              letterSpacing: '0.01em',
            }}>
              <ShieldCheck size={13} color="#059669" />
              Stateless • No Login
            </span>
          </div>
        </div>
      </div>

      {/* Prominent Studio Navigation Tabs */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        backgroundColor: '#f1f5f9',
        padding: '5px',
        borderRadius: '12px',
        border: '1px solid #cbd5e1',
        boxShadow: 'inset 0 1px 2px rgba(15, 23, 42, 0.04)',
      }}>
        {/* PDF Studio Tab */}
        <button
          onClick={() => onTabChange('pdf')}
          style={{
            height: '46px',
            padding: '0 24px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '9px',
            fontSize: '14px',
            fontWeight: activeTab === 'pdf' ? 700 : 600,
            borderRadius: '8px',
            border: activeTab === 'pdf' ? '1px solid #cbd5e1' : '1px solid transparent',
            backgroundColor: activeTab === 'pdf' ? '#ffffff' : 'transparent',
            color: activeTab === 'pdf' ? '#0f172a' : '#475569',
            boxShadow: activeTab === 'pdf' ? '0 2px 5px rgba(15, 23, 42, 0.08), 0 1px 2px rgba(15, 23, 42, 0.04)' : 'none',
            cursor: 'pointer',
            transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
            outline: 'none',
          }}
          onMouseEnter={(e) => {
            if (activeTab !== 'pdf') {
              e.currentTarget.style.color = '#0f172a';
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'pdf') {
              e.currentTarget.style.color = '#475569';
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          <FileText size={17} color={activeTab === 'pdf' ? '#b91c1c' : '#64748b'} />
          PDF Studio
        </button>

        {/* Universal Converter Tab */}
        <button
          onClick={() => onTabChange('converter')}
          style={{
            height: '46px',
            padding: '0 24px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '9px',
            fontSize: '14px',
            fontWeight: activeTab === 'converter' ? 700 : 600,
            borderRadius: '8px',
            border: activeTab === 'converter' ? '1px solid #cbd5e1' : '1px solid transparent',
            backgroundColor: activeTab === 'converter' ? '#ffffff' : 'transparent',
            color: activeTab === 'converter' ? '#0f172a' : '#475569',
            boxShadow: activeTab === 'converter' ? '0 2px 5px rgba(15, 23, 42, 0.08), 0 1px 2px rgba(15, 23, 42, 0.04)' : 'none',
            cursor: 'pointer',
            transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
            outline: 'none',
          }}
          onMouseEnter={(e) => {
            if (activeTab !== 'converter') {
              e.currentTarget.style.color = '#0f172a';
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'converter') {
              e.currentTarget.style.color = '#475569';
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          <RefreshCw size={17} color={activeTab === 'converter' ? '#0284c7' : '#64748b'} />
          Media Converter
        </button>

        {/* Smart Compressor Tab */}
        <button
          onClick={() => onTabChange('compressor')}
          style={{
            height: '46px',
            padding: '0 24px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '9px',
            fontSize: '14px',
            fontWeight: activeTab === 'compressor' ? 700 : 600,
            borderRadius: '8px',
            border: activeTab === 'compressor' ? '1px solid #cbd5e1' : '1px solid transparent',
            backgroundColor: activeTab === 'compressor' ? '#ffffff' : 'transparent',
            color: activeTab === 'compressor' ? '#0f172a' : '#475569',
            boxShadow: activeTab === 'compressor' ? '0 2px 5px rgba(15, 23, 42, 0.08), 0 1px 2px rgba(15, 23, 42, 0.04)' : 'none',
            cursor: 'pointer',
            transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
            outline: 'none',
          }}
          onMouseEnter={(e) => {
            if (activeTab !== 'compressor') {
              e.currentTarget.style.color = '#0f172a';
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'compressor') {
              e.currentTarget.style.color = '#475569';
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          <Minimize2 size={17} color={activeTab === 'compressor' ? '#7c3aed' : '#64748b'} />
          Smart Compressor
        </button>
      </nav>

      {/* Local Auto-Recovery Status Pill */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '12px',
        fontWeight: 500,
        color: '#475569',
        backgroundColor: '#f8fafc',
        padding: '6px 14px',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
      }}>
        <HardDrive size={15} color="#059669" />
        <span>IndexedDB Cache</span>
        {stagedCount > 0 ? (
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '1px 6px',
            borderRadius: '10px',
          }}>
            {stagedCount}
          </span>
        ) : (
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>idle</span>
        )}
      </div>
    </header>
  );
};
