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
        height: '66px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.04)',
      }}
    >
      {/* Left side: Creed-Tech Logo, Vertical Divider, Studio Subtitle, and Adobe-style Nav items */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '22px' }}>
        {/* Creed-Tech Brand Emblem & Name */}
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
            borderRadius: '9px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900,
            fontSize: '18px',
            boxShadow: '0 2px 5px rgba(225, 29, 72, 0.28)',
            letterSpacing: '-0.02em',
          }}>
            C
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              fontSize: '19px',
              fontWeight: 800,
              color: '#0f172a',
              letterSpacing: '-0.03em',
            }}>
              Creed-Tech
            </span>

            {/* Subtle Vertical Divider */}
            <span style={{ color: '#cbd5e1', fontWeight: 300, fontSize: '18px', margin: '0 2px' }}>
              |
            </span>

            <span style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#64748b',
              letterSpacing: '-0.01em',
            }}>
              PDF & Media Studio
            </span>
          </div>
        </div>

        {/* Vertical Divider */}
        <div style={{ width: '1px', height: '22px', backgroundColor: '#e2e8f0' }} />

        {/* Adobe-Style Navigation Menu Bar */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {/* Tools */}
          <button
            onClick={() => handleToolDispatch('all-tools')}
            className={`adobe-nav-item ${activeTab === 'pdf' && !openMenu ? 'active' : ''}`}
          >
            <LayoutGrid size={15} />
            Tools
          </button>

          {/* Convert (Mega-Menu) */}
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

          {/* Edit (Dropdown) */}
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

          {/* Compress (Dropdown) */}
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

          {/* Media Engine */}
          <button
            onClick={() => {
              setOpenMenu(null);
              onTabChange('converter');
            }}
            className={`adobe-nav-item ${activeTab === 'converter' && !openMenu ? 'active' : ''}`}
          >
            <RefreshCw size={15} />
            Media Engine
          </button>
        </nav>
      </div>

      {/* Right Side: NO login/registration. Stateless Badge & IndexedDB Auto-Recovery */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <span style={{
          fontSize: '12px',
          fontWeight: 600,
          padding: '5px 12px',
          backgroundColor: '#ecfdf5',
          color: '#047857',
          borderRadius: '7px',
          border: '1px solid #a7f3d0',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          userSelect: 'none',
        }}>
          <ShieldCheck size={14} color="#059669" />
          Stateless • No Login Required
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
