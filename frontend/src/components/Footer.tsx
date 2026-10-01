'use client';

import React from 'react';
import { Globe, ShieldCheck, HardDrive, Lock, ExternalLink, Cpu } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer style={{
      backgroundColor: '#ffffff',
      borderTop: '1px solid #e2e8f0',
      padding: '48px 32px 32px 32px',
      color: '#475569',
      fontSize: '13px',
      marginTop: 'auto',
    }}>
      <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
        {/* Top Multi-Column Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '36px',
          paddingBottom: '36px',
          borderBottom: '1px solid #f1f5f9',
        }}>
          {/* Column 1: Creed-Tech Identity */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#e11d48',
                color: '#ffffff',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '16px',
                boxShadow: '0 2px 4px rgba(225, 29, 72, 0.25)',
              }}>
                C
              </div>
              <span style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.025em' }}>
                Creed-Tech
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6, margin: 0, marginBottom: '14px' }}>
              Enterprise-grade document editing, universal media transcoding, and smart compression running on a 100% stateless architecture.
            </p>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              backgroundColor: '#ecfdf5',
              color: '#047857',
              border: '1px solid #a7f3d0',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 600,
            }}>
              <ShieldCheck size={13} color="#059669" />
              Zero Cloud Storage • Frictionless
            </div>
          </div>

          {/* Column 2: Document Tools */}
          <div>
            <h5 style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '14px' }}>
              PDF Solutions
            </h5>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><span style={{ color: '#64748b' }}>In-Place Text Editor</span></li>
              <li><span style={{ color: '#64748b' }}>Merge PDF Documents</span></li>
              <li><span style={{ color: '#64748b' }}>Split & Burst Pages</span></li>
              <li><span style={{ color: '#64748b' }}>Rotate Document Pages</span></li>
              <li><span style={{ color: '#64748b' }}>Images to PDF Converter</span></li>
            </ul>
          </div>

          {/* Column 3: Media Engine */}
          <div>
            <h5 style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '14px' }}>
              Media Engine
            </h5>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><span style={{ color: '#64748b' }}>Universal Video Transcoding</span></li>
              <li><span style={{ color: '#64748b' }}>Universal Audio Converter</span></li>
              <li><span style={{ color: '#64748b' }}>WebP & Lossless Image Optimizer</span></li>
              <li><span style={{ color: '#64748b' }}>CRF Multi-Pass Video Compression</span></li>
              <li><span style={{ color: '#64748b' }}>PDF Page Rasterization (ZIP)</span></li>
            </ul>
          </div>

          {/* Column 4: Architecture & Trust */}
          <div>
            <h5 style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '14px' }}>
              Architecture
            </h5>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <HardDrive size={13} color="#059669" />
                <span>IndexedDB 3h Auto-Recovery</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock size={13} color="#059669" />
                <span>Ephemeral UUID Sandboxing</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Cpu size={13} color="#0284c7" />
                <span>PyMuPDF Native Engine</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Cpu size={13} color="#6d28d9" />
                <span>FFmpeg Asynchronous Transcoder</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Regional & Legal Bar (Adobe Style) */}
        <div style={{
          paddingTop: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}>
          {/* Regional Selector */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            fontWeight: 600,
            color: '#334155',
            cursor: 'pointer',
          }}>
            <Globe size={15} color="#64748b" />
            <span>Region / English (US)</span>
          </div>

          {/* Legal / Policy Navigation */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '18px',
            fontSize: '12px',
            color: '#64748b',
          }}>
            <span style={{ cursor: 'pointer', transition: 'color 0.15s ease' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#0f172a')} onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}>
              Creed-Tech Trust Center
            </span>
            <span>•</span>
            <span style={{ cursor: 'pointer', transition: 'color 0.15s ease' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#0f172a')} onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}>
              Privacy Policy
            </span>
            <span>•</span>
            <span style={{ cursor: 'pointer', transition: 'color 0.15s ease' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#0f172a')} onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}>
              Terms of Use
            </span>
            <span>•</span>
            <span style={{ cursor: 'pointer', transition: 'color 0.15s ease' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#0f172a')} onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}>
              Cookie Preferences
            </span>
            <span>•</span>
            <span style={{ cursor: 'pointer', transition: 'color 0.15s ease' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#0f172a')} onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}>
              Security Notes
            </span>
          </div>
        </div>

        {/* Copyright Notice */}
        <div style={{
          marginTop: '16px',
          fontSize: '12px',
          color: '#94a3b8',
          textAlign: 'left',
        }}>
          Copyright © 2026 Creed-Tech. All rights reserved. Frictionless, stateless processing.
        </div>
      </div>
    </footer>
  );
};
