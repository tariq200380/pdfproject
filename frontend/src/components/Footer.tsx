'use client';

import React from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Linkedin } from 'lucide-react';

const XIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export const Footer: React.FC = () => {
  return (
    <footer className="creed-footer">
      <div className="creed-footer-inner">
        {/* Left: Creed Tech branding & copyright notice */}
        <div className="creed-footer-left">
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              textDecoration: 'none',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                backgroundColor: '#e11d48',
                color: '#ffffff',
                borderRadius: '7px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '14px',
                boxShadow: '0 2px 4px rgba(225, 29, 72, 0.22)',
                flexShrink: 0,
              }}
            >
              C
            </div>
            <div className="creed-footer-brand-text">
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>
                Creed Tech
              </span>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Copyright © 2026 Creed Tech. All rights reserved.
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Clean policy, security, cookies, cache, and contact links */}
        <nav className="creed-footer-center" aria-label="Footer Navigation">
          <Link href="/privacy" className="creed-footer-link">
            Privacy Center
          </Link>
          <Link href="/security" className="creed-footer-link">
            Security Architecture
          </Link>
          <Link href="/privacy/ai-training" className="creed-footer-link">
            AI Training Pledge
          </Link>
          <Link href="/privacy#cookie-preferences" className="creed-footer-link">
            Cookies
          </Link>
          <Link href="/security#sandbox" className="creed-footer-link">
            Cache & Sandbox
          </Link>
          <Link href="/contact" className="creed-footer-link">
            Contact
          </Link>
          <a
            href="#terms"
            className="creed-footer-link"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            Terms of Service
          </a>
        </nav>

        {/* Right: Social icons (Facebook, Instagram, X, LinkedIn) */}
        <div className="creed-footer-right" aria-label="Social media links">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="creed-footer-social-btn"
            aria-label="Facebook"
          >
            <Facebook size={17} strokeWidth={1.9} />
          </a>

          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="creed-footer-social-btn"
            aria-label="Instagram"
          >
            <Instagram size={17} strokeWidth={1.9} />
          </a>

          <a
            href="https://x.com"
            target="_blank"
            rel="noopener noreferrer"
            className="creed-footer-social-btn"
            aria-label="X (Twitter)"
          >
            <XIcon size={16} />
          </a>

          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="creed-footer-social-btn"
            aria-label="LinkedIn"
          >
            <Linkedin size={17} strokeWidth={1.9} />
          </a>
        </div>
      </div>
    </footer>
  );
};
