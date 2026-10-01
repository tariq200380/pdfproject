'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ActiveStudioTab } from '@/lib/types';
import { MegaMenu, ToolActionId } from './adobe/MegaMenu';
import {
  FileText,
  RefreshCw,
  Minimize2,
  HardDrive,
  ShieldCheck,
  ChevronDown,
  LayoutGrid,
} from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveStudioTab;
  onTabChange: (tab: ActiveStudioTab) => void;
  onSelectTool?: (toolId: ToolActionId) => void;
  stagedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onSelectTool,
  stagedCount,
}) => {
  const [openMenu, setOpenMenu] = useState<'convert' | 'edit' | 'compress' | null>(null);
  const headerRef = useRef<HTMLElement>(null);

  // Close dropdown menu if user clicks outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToolDispatch = (toolId: ToolActionId) => {
    setOpenMenu(null);
    if (onSelectTool) {
      onSelectTool(toolId);
    } else {
      if (toolId.startsWith('compress')) {
        onTabChange('compressor');
      } else if (toolId.startsWith('convert') || toolId.includes('to-pdf')) {
        onTabChange('converter');
      } else {
        onTabChange('pdf');
      }
    }
  };

  return (
    <header
      ref={headerRef}
      style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '0 32px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.04)',
      }}
    >
      {/* Left side: Studio Logo, Name, Divider, and Acrobat Navigation Items */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Adobe-inspired Brand Emblem */}
        <div
          onClick={() => {
            setOpenMenu(null);
            onTabChange('pdf');
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <div style={{
            width: '36px',
            height: '36px',
            backgroundColor: '#e11d48',
            color: '#ffffff',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '18px',
            boxShadow: '0 2px 5px rgba(225, 29, 72, 0.3)',
          }}>
            Ω
          </div>
          <span style={{
            fontSize: '18px',
            fontWeight: 700,
            color: '#0f172a',
            letterSpacing: '-0.025em',
          }}>
            OmniMedia Studio
          </span>
        </div>

        {/* Clean Vertical Divider */}
        <div style={{ width: '1px', height: '24px', backgroundColor: '#e2e8f0' }} />

        {/* Acrobat Online Navigation Items */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {/* Tools button */}
          <button
            onClick={() => handleToolDispatch('all-tools')}
            className={`adobe-nav-item ${activeTab === 'pdf' && !openMenu ? 'active' : ''}`}
          >
            <LayoutGrid size={16} />
            Tools
          </button>

          {/* Convert with Mega Menu */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setOpenMenu(openMenu === 'convert' ? null : 'convert')}
              className={`adobe-nav-item ${openMenu === 'convert' || activeTab === 'converter' ? 'active' : ''}`}
            >
              Convert
              <ChevronDown
                size={14}
                style={{
                  transform: openMenu === 'convert' ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.15s ease',
                }}
              />
            </button>
            {openMenu === 'convert' && (
              <MegaMenu
                menuType="convert"
                onSelectTool={handleToolDispatch}
                onClose={() => setOpenMenu(null)}
              />
            )}
          </div>

          {/* Edit with Mega Menu */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setOpenMenu(openMenu === 'edit' ? null : 'edit')}
              className={`adobe-nav-item ${openMenu === 'edit' ? 'active' : ''}`}
            >
              Edit
              <ChevronDown
                size={14}
                style={{
                  transform: openMenu === 'edit' ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.15s ease',
                }}
              />
            </button>
            {openMenu === 'edit' && (
              <MegaMenu
                menuType="edit"
                onSelectTool={handleToolDispatch}
                onClose={() => setOpenMenu(null)}
              />
            )}
          </div>

          {/* Compress with Mega Menu */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setOpenMenu(openMenu === 'compress' ? null : 'compress')}
              className={`adobe-nav-item ${openMenu === 'compress' || activeTab === 'compressor' ? 'active' : ''}`}
            >
              Compress
              <ChevronDown
                size={14}
                style={{
                  transform: openMenu === 'compress' ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.15s ease',
                }}
              />
            </button>
            {openMenu === 'compress' && (
              <MegaMenu
                menuType="compress"
                onSelectTool={handleToolDispatch}
                onClose={() => setOpenMenu(null)}
              />
            )}
          </div>

          {/* Media Studio link */}
          <button
            onClick={() => {
              setOpenMenu(null);
              onTabChange('converter');
            }}
            className={`adobe-nav-item ${activeTab === 'converter' && !openMenu ? 'active' : ''}`}
          >
            <RefreshCw size={15} />
            Media Studio
          </button>
        </nav>
      </div>

      {/* Right side: NO sign in/registration. Strictly Frictionless & Stateless */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{
          fontSize: '11px',
          fontWeight: 600,
          padding: '4px 10px',
          backgroundColor: '#ecfdf5',
          color: '#047857',
          borderRadius: '6px',
          border: '1px solid #a7f3d0',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
        }}>
          <ShieldCheck size={13} color="#059669" />
          Stateless • Zero Storage
        </span>

        {/* Local Auto-Recovery Status Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '12px',
          fontWeight: 600,
          color: '#475569',
          backgroundColor: '#f8fafc',
          padding: '6px 12px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
        }}>
          <HardDrive size={14} color="#059669" />
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
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>0</span>
          )}
        </div>
      </div>
    </header>
  );
};
