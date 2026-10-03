'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { ToolsMegaMenu } from '@/components/adobe/ToolsMegaMenu';
import { useHeroTab, HeroTabId } from '@/context/HeroTabContext';

type DropdownType = 'tools' | null;

export const Header: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { activeTab, selectTab } = useHeroTab();
  const [activeDropdown, setActiveDropdown] = useState<DropdownType>(null);
  const headerRef = useRef<HTMLElement>(null);

  // Close dropdown on outside click or escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Handle category click directly from navbar
  const handleNavCategoryClick = (category: HeroTabId) => {
    setActiveDropdown(null);
    selectTab(category);

    if (pathname !== '/') {
      router.push(`/?category=${category}`);
    }
  };

  // Handle tool click from dropdown or nav
  const handleToolClick = (toolId: string) => {
    setActiveDropdown(null);

    // Map toolId to hero category
    let category: HeroTabId | null = null;
    if (
      toolId.includes('video') ||
      toolId.includes('audio') ||
      toolId === 'image-converter' ||
      toolId.includes('watermark-video') ||
      toolId.includes('watermark-image') ||
      toolId === 'media'
    ) {
      category = 'media';
    } else if (
      toolId.includes('word') ||
      toolId.includes('excel') ||
      toolId.includes('ppt') ||
      toolId.includes('odt') ||
      toolId.includes('ods') ||
      toolId.includes('odp') ||
      toolId.includes('hwp') ||
      toolId.includes('html') ||
      toolId.includes('epub') ||
      toolId.includes('zip') ||
      toolId.includes('csv') ||
      toolId.includes('pages') ||
      toolId.includes('pdfa') ||
      toolId.includes('convert') ||
      toolId.includes('jpg') ||
      toolId.includes('png') ||
      toolId.includes('text') ||
      toolId.includes('rtf') ||
      toolId.includes('image-to-pdf') ||
      toolId === 'smart-pdf'
    ) {
      category = 'convert';
    } else if (toolId.startsWith('compress')) {
      category = 'compress';
    } else if (
      toolId.includes('merge') ||
      toolId.includes('split') ||
      toolId.includes('rotate') ||
      toolId.includes('delete') ||
      toolId.includes('extract') ||
      toolId.includes('reorder') ||
      toolId.includes('organize')
    ) {
      category = 'merge';
    } else if (
      toolId.includes('edit') ||
      toolId.includes('crop') ||
      toolId.includes('number') ||
      toolId.includes('watermark') ||
      toolId.includes('annotator') ||
      toolId.includes('reader') ||
      toolId.includes('redact') ||
      toolId.includes('forms') ||
      toolId.includes('share')
    ) {
      category = 'edit';
    } else if (
      toolId.includes('sign') ||
      toolId.includes('protect') ||
      toolId.includes('unlock') ||
      toolId.includes('flatten') ||
      toolId.includes('scanner')
    ) {
      category = 'sign';
    }

    if (category) {
      selectTab(category);
    }

    if (pathname === '/') {
      window.dispatchEvent(new CustomEvent('creed-open-tool', { detail: { toolId } }));
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('tool', toolId);
        window.history.pushState(null, '', url.pathname + url.search);
      }
    } else {
      router.push(`/?tool=${encodeURIComponent(toolId)}`);
    }
  };

  const toggleDropdown = (type: DropdownType) => {
    setActiveDropdown((prev) => (prev === type ? null : type));
  };

  return (
    <header
      ref={headerRef}
      style={{
        backgroundColor: '#ffffff',
        borderBottom: '1px solid rgba(226, 232, 240, 0.9)',
        padding: '0 32px',
        height: '66px',
        display: 'grid',
        gridTemplateColumns: 'minmax(200px, 1fr) auto minmax(200px, 1fr)',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 3px 0 rgba(15, 23, 42, 0.04)',
      }}
    >
      {/* Left: Brand Identity */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
        <Link
          href="/"
          onClick={() => setActiveDropdown(null)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
        >
          {/* Logo Mark */}
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '7px',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '2.5px',
              padding: '2.5px',
              backgroundColor: '#f1f5f9',
            }}
          >
            <div style={{ backgroundColor: '#ef4444', borderRadius: '2px' }} />
            <div style={{ backgroundColor: '#3b82f6', borderRadius: '2px' }} />
            <div style={{ backgroundColor: '#10b981', borderRadius: '2px' }} />
            <div style={{ backgroundColor: '#f59e0b', borderRadius: '2px' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              Creed Tech
            </span>
            <span style={{ color: '#cbd5e1', fontWeight: 300, fontSize: '15px' }}>|</span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>
              Studio
            </span>
          </div>
        </Link>
      </div>

      {/* Center: Centered Smallpdf Style Navigation */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
        {/* 1. Tools Mega Dropdown Button */}
        <button
          type="button"
          id="tools-dropdown-btn"
          onClick={() => toggleDropdown('tools')}
          aria-expanded={activeDropdown === 'tools'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '7px 14px',
            borderRadius: '8px',
            border: activeDropdown === 'tools' ? '1px solid #bfdbfe' : '1px solid transparent',
            backgroundColor: activeDropdown === 'tools' ? '#eff6ff' : '#f8fafc',
            color: activeDropdown === 'tools' ? '#2563eb' : '#0f172a',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            boxShadow: activeDropdown === 'tools' ? '0 1px 2px rgba(37, 99, 235, 0.08)' : 'none',
          }}
          onMouseEnter={(e) => {
            if (activeDropdown !== 'tools') {
              e.currentTarget.style.backgroundColor = '#eff6ff';
              e.currentTarget.style.color = '#2563eb';
            }
          }}
          onMouseLeave={(e) => {
            if (activeDropdown !== 'tools') {
              e.currentTarget.style.backgroundColor = '#f8fafc';
              e.currentTarget.style.color = '#0f172a';
            }
          }}
        >
          {/* 3x3 App Grid Icon */}
          <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
            <rect x="1" y="1" width="3.5" height="3.5" rx="0.8" />
            <rect x="6.25" y="1" width="3.5" height="3.5" rx="0.8" />
            <rect x="11.5" y="1" width="3.5" height="3.5" rx="0.8" />
            <rect x="1" y="6.25" width="3.5" height="3.5" rx="0.8" />
            <rect x="6.25" y="6.25" width="3.5" height="3.5" rx="0.8" />
            <rect x="11.5" y="6.25" width="3.5" height="3.5" rx="0.8" />
            <rect x="1" y="11.5" width="3.5" height="3.5" rx="0.8" />
            <rect x="6.25" y="11.5" width="3.5" height="3.5" rx="0.8" />
            <rect x="11.5" y="11.5" width="3.5" height="3.5" rx="0.8" />
          </svg>
          <span>Tools</span>
          <ChevronDown
            size={14}
            style={{
              transform: activeDropdown === 'tools' ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.15s ease',
            }}
          />
        </button>

        {/* 2. Direct Quick Actions (Live switches Hero with dedicated color) */}
        <button
          type="button"
          onClick={() => handleNavCategoryClick('compress')}
          className={`adobe-nav-item ${activeTab === 'compress' ? 'active' : ''}`}
          style={{
            fontWeight: activeTab === 'compress' ? 700 : 500,
            fontSize: '14px',
            color: activeTab === 'compress' ? '#0f172a' : '#334155',
            backgroundColor: activeTab === 'compress' ? '#f1f5f9' : 'transparent',
          }}
        >
          Compress
        </button>

        <button
          type="button"
          onClick={() => handleNavCategoryClick('convert')}
          className={`adobe-nav-item ${activeTab === 'convert' ? 'active' : ''}`}
          style={{
            fontWeight: activeTab === 'convert' ? 700 : 500,
            fontSize: '14px',
            color: activeTab === 'convert' ? '#0f172a' : '#334155',
            backgroundColor: activeTab === 'convert' ? '#f1f5f9' : 'transparent',
          }}
        >
          Convert
        </button>

        <button
          type="button"
          onClick={() => handleNavCategoryClick('merge')}
          className={`adobe-nav-item ${activeTab === 'merge' ? 'active' : ''}`}
          style={{
            fontWeight: activeTab === 'merge' ? 700 : 500,
            fontSize: '14px',
            color: activeTab === 'merge' ? '#0f172a' : '#334155',
            backgroundColor: activeTab === 'merge' ? '#f1f5f9' : 'transparent',
          }}
        >
          Merge
        </button>

        <button
          type="button"
          onClick={() => handleNavCategoryClick('edit')}
          className={`adobe-nav-item ${activeTab === 'edit' ? 'active' : ''}`}
          style={{
            fontWeight: activeTab === 'edit' ? 700 : 500,
            fontSize: '14px',
            color: activeTab === 'edit' ? '#0f172a' : '#334155',
            backgroundColor: activeTab === 'edit' ? '#f1f5f9' : 'transparent',
          }}
        >
          Edit
        </button>

        <button
          type="button"
          onClick={() => handleNavCategoryClick('sign')}
          className={`adobe-nav-item ${activeTab === 'sign' ? 'active' : ''}`}
          style={{
            fontWeight: activeTab === 'sign' ? 700 : 500,
            fontSize: '14px',
            color: activeTab === 'sign' ? '#0f172a' : '#334155',
            backgroundColor: activeTab === 'sign' ? '#f1f5f9' : 'transparent',
          }}
        >
          Sign
        </button>

        <button
          type="button"
          onClick={() => handleNavCategoryClick('media')}
          className={`adobe-nav-item ${activeTab === 'media' ? 'active' : ''}`}
          style={{
            fontWeight: activeTab === 'media' ? 700 : 500,
            fontSize: '14px',
            color: activeTab === 'media' ? '#0f172a' : '#334155',
            backgroundColor: activeTab === 'media' ? '#f1f5f9' : 'transparent',
          }}
        >
          Media
        </button>
      </nav>

      {/* Far Right Action Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '14px' }}>
        <Link
          href="/security"
          style={{
            fontSize: '13.5px',
            fontWeight: 500,
            color: '#64748b',
            textDecoration: 'none',
            padding: '6px 10px',
            borderRadius: '6px',
            transition: 'color 0.12s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#0f172a')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
        >
          Security
        </Link>

        <Link
          href="/contact"
          style={{
            fontSize: '13px',
            fontWeight: 700,
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '9px 18px',
            borderRadius: '8px',
            textDecoration: 'none',
            transition: 'background-color 0.15s ease, transform 0.1s ease',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.1)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1e293b')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0f172a')}
        >
          Get in Touch
        </Link>
      </div>

      {/* Tools Mega Menu Dropdown */}
      {activeDropdown === 'tools' && (
        <ToolsMegaMenu
          onSelectTool={handleToolClick}
          onClose={() => setActiveDropdown(null)}
        />
      )}
    </header>
  );
};
