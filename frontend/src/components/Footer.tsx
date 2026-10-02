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
    <footer
      className="creed-footer flex flex-col md:flex-row items-center justify-between w-full py-3.5 px-6 md:px-12 text-xs text-slate-500 border-t border-slate-200/80 bg-white/50 backdrop-blur-sm gap-4"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderTop: '1px solid rgba(226, 232, 240, 0.8)',
        color: '#64748b',
        fontSize: '12px',
        boxSizing: 'border-box',
        marginTop: 'auto',
      }}
    >
      {/* Left Side: Creed Tech Logo + Social Media Icons */}
      <div
        className="flex items-center gap-4 flex-shrink-0"
        style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}
      >
        <Link
          href="/"
          className="flex items-center"
          style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
          aria-label="Creed Tech Home"
        >
          <img
            src="/images/creed-tech-logo.png"
            alt="Creed Tech"
            className="h-7 w-auto object-contain"
            style={{ height: '30px', width: 'auto', display: 'block' }}
          />
        </Link>

        <div
          className="flex items-center gap-1.5"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          aria-label="Social media links"
        >
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="creed-footer-social-btn text-slate-400 hover:text-slate-900 transition-colors"
            aria-label="Facebook"
          >
            <Facebook size={15} strokeWidth={1.8} />
          </a>

          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="creed-footer-social-btn text-slate-400 hover:text-slate-900 transition-colors"
            aria-label="Instagram"
          >
            <Instagram size={15} strokeWidth={1.8} />
          </a>

          <a
            href="https://x.com"
            target="_blank"
            rel="noopener noreferrer"
            className="creed-footer-social-btn text-slate-400 hover:text-slate-900 transition-colors"
            aria-label="X (Twitter)"
          >
            <XIcon size={14} />
          </a>

          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="creed-footer-social-btn text-slate-400 hover:text-slate-900 transition-colors"
            aria-label="LinkedIn"
          >
            <Linkedin size={15} strokeWidth={1.8} />
          </a>
        </div>
      </div>

      {/* Right Side: Inline Single-Line Copyright & Slash-Separated Links */}
      <div
        className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-slate-500 text-xs"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          columnGap: '10px',
          rowGap: '4px',
          color: '#64748b',
          fontSize: '12px',
        }}
      >
        <span className="whitespace-nowrap" style={{ whiteSpace: 'nowrap' }}>
          Copyright © 2026 Creed Tech. All rights reserved.
        </span>
        <span
          className="text-slate-300 select-none"
          style={{ color: '#cbd5e1', userSelect: 'none' }}
          aria-hidden="true"
        >
          /
        </span>

        <Link
          href="/privacy"
          className="whitespace-nowrap text-slate-500 hover:text-slate-900 transition-colors"
          style={{ whiteSpace: 'nowrap', textDecoration: 'none' }}
        >
          Privacy Center
        </Link>
        <span
          className="text-slate-300 select-none"
          style={{ color: '#cbd5e1', userSelect: 'none' }}
          aria-hidden="true"
        >
          /
        </span>

        <Link
          href="/security"
          className="whitespace-nowrap text-slate-500 hover:text-slate-900 transition-colors"
          style={{ whiteSpace: 'nowrap', textDecoration: 'none' }}
        >
          Security
        </Link>
        <span
          className="text-slate-300 select-none"
          style={{ color: '#cbd5e1', userSelect: 'none' }}
          aria-hidden="true"
        >
          /
        </span>

        <Link
          href="/privacy/ai-training"
          className="whitespace-nowrap text-slate-500 hover:text-slate-900 transition-colors"
          style={{ whiteSpace: 'nowrap', textDecoration: 'none' }}
        >
          AI Training Pledge
        </Link>
        <span
          className="text-slate-300 select-none"
          style={{ color: '#cbd5e1', userSelect: 'none' }}
          aria-hidden="true"
        >
          /
        </span>

        <Link
          href="/privacy/cookies"
          className="whitespace-nowrap text-slate-500 hover:text-slate-900 transition-colors"
          style={{ whiteSpace: 'nowrap', textDecoration: 'none' }}
        >
          Cookies & Storage
        </Link>
        <span
          className="text-slate-300 select-none"
          style={{ color: '#cbd5e1', userSelect: 'none' }}
          aria-hidden="true"
        >
          /
        </span>

        <Link
          href="/contact"
          className="whitespace-nowrap text-slate-500 hover:text-slate-900 transition-colors"
          style={{ whiteSpace: 'nowrap', textDecoration: 'none' }}
        >
          Contact
        </Link>
        <span
          className="text-slate-300 select-none"
          style={{ color: '#cbd5e1', userSelect: 'none' }}
          aria-hidden="true"
        >
          /
        </span>

        <Link
          href="/terms"
          className="whitespace-nowrap text-slate-500 hover:text-slate-900 transition-colors"
          style={{ whiteSpace: 'nowrap', textDecoration: 'none' }}
        >
          Terms of Service
        </Link>
      </div>
    </footer>
  );
};
