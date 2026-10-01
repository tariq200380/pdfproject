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
      padding: '14px 28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 40,
    }}>
      {/* Brand & Stateless Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '36px',
          height: '36px',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: '18px',
        }}>
          Ω
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '17px', fontWeight: 600, color: '#0f172a', letterSpacing: '-0.02em' }}>
              OmniMedia & PDF Studio
            </h1>
            <span style={{
              fontSize: '11px',
              fontWeight: 500,
              padding: '2px 8px',
              backgroundColor: '#f1f5f9',
              color: '#475569',
              borderRadius: '4px',
              border: '1px solid #e2e8f0',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}>
              <ShieldCheck size={12} color="#059669" />
              Stateless • No Login
            </span>
          </div>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        backgroundColor: '#f1f5f9',
        padding: '4px',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
      }}>
        <button
          onClick={() => onTabChange('pdf')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '7px 16px',
            fontSize: '13px',
            fontWeight: 500,
            borderRadius: '6px',
            border: activeTab === 'pdf' ? '1px solid #cbd5e1' : '1px solid transparent',
            backgroundColor: activeTab === 'pdf' ? '#ffffff' : 'transparent',
            color: activeTab === 'pdf' ? '#0f172a' : '#64748b',
            boxShadow: activeTab === 'pdf' ? '0 1px 2px rgba(0,0,0,0.04)' : 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <FileText size={15} />
          PDF Studio
        </button>

        <button
          onClick={() => onTabChange('converter')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '7px 16px',
            fontSize: '13px',
            fontWeight: 500,
            borderRadius: '6px',
            border: activeTab === 'converter' ? '1px solid #cbd5e1' : '1px solid transparent',
            backgroundColor: activeTab === 'converter' ? '#ffffff' : 'transparent',
            color: activeTab === 'converter' ? '#0f172a' : '#64748b',
            boxShadow: activeTab === 'converter' ? '0 1px 2px rgba(0,0,0,0.04)' : 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <RefreshCw size={15} />
          Media Converter
        </button>

        <button
          onClick={() => onTabChange('compressor')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '7px 16px',
            fontSize: '13px',
            fontWeight: 500,
            borderRadius: '6px',
            border: activeTab === 'compressor' ? '1px solid #cbd5e1' : '1px solid transparent',
            backgroundColor: activeTab === 'compressor' ? '#ffffff' : 'transparent',
            color: activeTab === 'compressor' ? '#0f172a' : '#64748b',
            boxShadow: activeTab === 'compressor' ? '0 1px 2px rgba(0,0,0,0.04)' : 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <Minimize2 size={15} />
          Smart Compressor
        </button>
      </nav>

      {/* Local Auto-Recovery Status */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '12px',
        color: '#64748b',
      }}>
        <HardDrive size={14} color="#059669" />
        <span>IndexedDB Cache ({stagedCount} active)</span>
      </div>
    </header>
  );
};
