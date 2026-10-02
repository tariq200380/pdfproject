'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Scale,
  FileCheck,
  ShieldCheck,
  AlertTriangle,
  Lock,
  ChevronRight,
  ShieldAlert,
  HardDrive,
  RefreshCw,
  Cpu,
  EyeOff,
  ChevronDown,
  ExternalLink,
  CheckCircle2,
  Mail,
  Zap,
} from 'lucide-react';

interface TermSection {
  id: string;
  number: string;
  title: string;
  badge: string;
  icon: React.ComponentType<{ size?: number; className?: string; color?: string; style?: React.CSSProperties }>;
  iconBg: string;
  iconColor: string;
  summary: string;
  content: React.ReactNode;
}

export default function TermsOfServicePage() {
  const [activeNav, setActiveNav] = useState<string>('acceptance');

  const scrollToSection = (id: string) => {
    setActiveNav(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -90;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const sections: TermSection[] = [
    {
      id: 'acceptance',
      number: '01',
      title: 'Acceptance of Terms',
      badge: 'Stateless Service Agreement',
      icon: Scale,
      iconBg: '#eff6ff',
      iconColor: '#2563eb',
      summary: 'Creed Tech Studio provides stateless web-based utilities. By accessing our platform, you agree to these Terms.',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '14px', color: '#334155', lineHeight: 1.65 }}>
          <p>
            Welcome to <strong>Creed Tech Studio</strong> (&ldquo;Creed Tech&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;the Service&rdquo;).
            By accessing, visiting, or utilizing any of our PDF converters, in-place PDF editor, media transcoders, or file compression utilities,
            you (&ldquo;User&rdquo;, &ldquo;you&rdquo;) acknowledge that you have read, understood, and agreed to be legally bound by these Terms of Service.
          </p>
          <p>
            Creed Tech operates on a <strong>100% stateless, zero-registration model</strong>. We do not require accounts, passwords, email verification, or tracking cookies.
            Your legal relationship with Creed Tech begins the moment you upload or process a document and terminates automatically upon completion of the ephemeral compute cycle,
            subject to ongoing survival of the intellectual property and liability limitation clauses herein.
          </p>
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <CheckCircle2 size={18} color="#059669" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '13px', color: '#0f172a', fontWeight: 500 }}>
              If you do not agree to every clause of these Terms, you must immediately discontinue use of all Creed Tech tools and services.
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 'permitted-use',
      number: '02',
      title: 'Permitted Use & Fair Consumption',
      badge: 'Fair Use Standards',
      icon: Cpu,
      iconBg: '#ecfdf5',
      iconColor: '#059669',
      summary: 'Permitted use covers legitimate document manipulation, file conversion, and media compression for individuals and enterprises.',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '14px', color: '#334155', lineHeight: 1.65 }}>
          <p>
            Creed Tech grants you a personal, non-exclusive, revocable, and non-transferable right to access and utilize our deterministic conversion and compression utilities
            for personal, academic, or commercial purposes under normal, human-interactive operating conditions.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', marginTop: '6px' }}>
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <CheckCircle2 size={16} color="#059669" />
                <span style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>Permitted Workflows</span>
              </div>
              <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '13px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li>Converting standard office documents, scans, and PDFs.</li>
                <li>In-place typographical font replacement and page curation.</li>
                <li>Transcoding high-resolution audio, video, and lossless images.</li>
                <li>Batch compression with balanced or lossless CRF presets.</li>
              </ul>
            </div>
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Zap size={16} color="#d97706" />
                <span style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>Operational Concurrency</span>
              </div>
              <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '13px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li>Max payload limit of 100MB per file submission.</li>
                <li>Standard human rate-limits to prevent queue exhaustion.</li>
                <li>Ephemeral session TTL of 15 minutes per sandbox UUID.</li>
                <li>Local client IndexedDB state auto-recovery up to 3 hours.</li>
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'as-is-warranty',
      number: '03',
      title: 'Zero-Liability & As-Is Warranty',
      badge: 'Strict Disclaimer',
      icon: AlertTriangle,
      iconBg: '#fffbeb',
      iconColor: '#d97706',
      summary: 'Services are rendered strictly &ldquo;AS IS&rdquo; without warranties of uptime, error-free conversion, or continuous availability.',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '14px', color: '#334155', lineHeight: 1.65 }}>
          <p>
            THE CREED TECH STUDIO SERVICE, ITS EMBEDDED CONVERSION ENGINES, SUBPROCESS SANDBOXES, CANVASES, AND RELATED APIS ARE PROVIDED
            ON AN <strong>&ldquo;AS IS&rdquo;</strong> AND <strong>&ldquo;AS AVAILABLE&rdquo;</strong> BASIS, WITHOUT ANY WARRANTIES OF ANY KIND,
            EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, OR NON-INFRINGEMENT.
          </p>
          <div
            style={{
              backgroundColor: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: '8px',
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} color="#b45309" />
              <span style={{ fontWeight: 700, fontSize: '14px', color: '#92400e' }}>
                Primary User Responsibility: Mandatory Local Backups
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#78350f', margin: 0, lineHeight: 1.6 }}>
              You are solely responsible for maintaining un-altered local backups of any original documents, master videos, or graphic files prior to submitting them to Creed Tech.
              In no event shall Creed Tech, its creators, maintainers, or affiliates be liable for any direct, indirect, incidental, special, consequential, or punitive damages,
              including but not limited to loss of data, document formatting discrepancies, font kerning variations, corruption during network stream interruptions,
              or operational downtime.
            </p>
          </div>
          <p>
            While our deterministic algorithms (PyMuPDF, FFmpeg 6+, Pillow) maintain industry-leading accuracy, Creed Tech does not guarantee that converted outputs will match
            pixel-for-pixel or byte-for-byte every proprietary formatting quirk of proprietary third-party software (such as legacy Adobe Illustrator INDD or complex Microsoft VBA macros).
          </p>
        </div>
      ),
    },
    {
      id: 'ephemeral-ip',
      number: '04',
      title: 'Ephemeral Processing & 100% IP Ownership',
      badge: 'Zero Claim Guarantee',
      icon: Lock,
      iconBg: '#eff6ff',
      iconColor: '#2563eb',
      summary: 'You retain 100% intellectual property ownership of your files. Creed Tech claims zero ownership, zero licenses, and zero rights.',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '14px', color: '#334155', lineHeight: 1.65 }}>
          <p>
            At Creed Tech, privacy is not merely a policy—it is enforced by system architecture. We assert <strong>zero ownership, title, copyright, or moral rights</strong>
            over any file, document, image, vector graphic, or media uploaded to our platform, as well as any output generated through our pipelines.
          </p>
          <div
            style={{
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '8px',
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} color="#15803d" />
              <span style={{ fontWeight: 700, fontSize: '14px', color: '#166534' }}>
                Our Ironclad Intellectual Property Pledge
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#14532d', margin: 0, lineHeight: 1.6 }}>
              You retain all existing intellectual property rights and copyright to your content. We only process your files for the brief ephemeral duration required
              to fulfill your immediate conversion request. We do not inspect, catalog, index, archive, license, or resell your content to any third party.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', marginTop: '4px' }}>
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <HardDrive size={16} color="#0284c7" />
                <span style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>Ephemeral Sandbox TTL</span>
              </div>
              <p style={{ fontSize: '12.5px', color: '#475569', margin: 0 }}>
                Files reside exclusively in isolated UUID OS directories (<code>/tmp/creedtech_sandbox</code>). The sandbox is purged immediately upon download completion,
                or automatically after 15 minutes by our asynchronous background reaper daemon.
              </p>
            </div>
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <EyeOff size={16} color="#e11d48" />
                <span style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>Zero AI Training</span>
              </div>
              <p style={{ fontSize: '12.5px', color: '#475569', margin: 0 }}>
                User files are never stored, parsed, or harvested to train or fine-tune artificial intelligence models or neural networks.
                Read our formal <Link href="/privacy/ai-training" style={{ color: '#e11d48', textDecoration: 'underline', fontWeight: 600 }}>AI Training Pledge</Link>.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'prohibited-activities',
      number: '05',
      title: 'Prohibited Activities & Abuse Prevention',
      badge: 'Zero-Tolerance Security',
      icon: ShieldAlert,
      iconBg: '#fef2f2',
      iconColor: '#dc2626',
      summary: 'Prohibited use includes malicious payloads, distributed denial of service, automated scraping, and unauthorized system penetration.',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '14px', color: '#334155', lineHeight: 1.65 }}>
          <p>
            To maintain service availability, integrity, and security for all global users, you agree not to engage in any of the following prohibited behaviors:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              {
                title: 'Malicious File Ingestion',
                desc: 'Uploading files containing malware, viruses, trojans, ransomware, zero-day exploit payloads, polyglot shells, or decompression bombs (zip bombs).',
              },
              {
                title: 'Automated Scraping & Denial of Service',
                desc: 'Deploying high-volume scraping bots, automated fuzzers, or distributed flooding scripts intended to disrupt or saturate our compute sandboxes.',
              },
              {
                title: 'Reverse Engineering & Sandbox Escapes',
                desc: 'Attempting directory traversal (../), command injection, subprocess privilege escalation, or container jailbreaking against our Linux execution nodes.',
              },
              {
                title: 'Unlawful & Infringing Content',
                desc: 'Processing materials that violate applicable local, national, or international laws, including copyright infringement without authorized license or fair use.',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #fee2e2',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: '#fef2f2',
                    color: '#dc2626',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: 700,
                    flexShrink: 0,
                    marginTop: '2px',
                  }}
                >
                  ✕
                </div>
                <div>
                  <span style={{ fontWeight: 700, fontSize: '13px', color: '#991b1b', display: 'block', marginBottom: '2px' }}>
                    {item.title}
                  </span>
                  <span style={{ fontSize: '12.5px', color: '#475569' }}>
                    {item.desc}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '13px', color: '#64748b' }}>
            Violations of these security provisions will result in immediate IP rate-limiting, termination of ephemeral sessions, and, where appropriate, referral to legal authorities.
          </p>
        </div>
      ),
    },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
      <main style={{ flex: 1, padding: '36px 24px 80px 24px', maxWidth: '1040px', margin: '0 auto', width: '100%' }}>
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            color: '#64748b',
            marginBottom: '28px',
          }}
        >
          <Link href="/" style={{ color: '#64748b', textDecoration: 'none' }}>
            Home
          </Link>
          <ChevronRight size={14} color="#94a3b8" />
          <span style={{ color: '#0f172a', fontWeight: 600 }}>
            Terms of Service
          </span>
        </nav>

        {/* Hero Section */}
        <div style={{ marginBottom: '40px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '9999px',
              color: '#1d4ed8',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}
          >
            <Scale size={13} color="#2563eb" />
            Legal Terms & Service Standards • Effective October 2026
          </div>

          <h1
            className="font-heading"
            style={{
              fontSize: '36px',
              fontWeight: 800,
              color: '#0f172a',
              letterSpacing: '-0.025em',
              lineHeight: 1.2,
              margin: '0 0 14px 0',
            }}
          >
            Terms of Service
          </h1>

          <p
            className="font-body"
            style={{
              fontSize: '16px',
              color: '#475569',
              lineHeight: 1.6,
              maxWidth: '820px',
              margin: 0,
            }}
          >
            These Terms govern your use of Creed Tech Studio&apos;s online document and media transformation platform.
            Our platform operates under a strictly stateless, privacy-first architecture—designed for friction-free utility without user accounts or tracking.
          </p>
        </div>

        {/* Quick Jump Bar */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            borderRadius: '12px',
            padding: '12px 18px',
            marginBottom: '36px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            overflowX: 'auto',
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Sections:
          </span>
          {sections.map((sec) => (
            <button
              key={sec.id}
              onClick={() => scrollToSection(sec.id)}
              style={{
                background: activeNav === sec.id ? '#0f172a' : '#f1f5f9',
                color: activeNav === sec.id ? '#ffffff' : '#475569',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{sec.number}.</span>
              <span>{sec.title}</span>
            </button>
          ))}
        </div>

        {/* Sections Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {sections.map((sec) => {
            const Icon = sec.icon;
            return (
              <section
                key={sec.id}
                id={sec.id}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid rgba(226, 232, 240, 0.8)',
                  borderRadius: '14px',
                  padding: '28px 32px',
                  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '18px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        backgroundColor: sec.iconBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={20} color={sec.iconColor} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 800, color: '#94a3b8' }}>{sec.number}</span>
                        <h2 className="font-heading" style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                          {sec.title}
                        </h2>
                      </div>
                      <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0 0' }}>
                        {sec.summary}
                      </p>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: sec.iconColor,
                      backgroundColor: sec.iconBg,
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {sec.badge}
                  </span>
                </div>

                {/* Body Content */}
                <div className="font-body">
                  {sec.content}
                </div>
              </section>
            );
          })}
        </div>

        {/* Footer Contact & Governance Banner */}
        <div
          style={{
            marginTop: '48px',
            backgroundColor: '#ffffff',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            borderRadius: '14px',
            padding: '24px 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px',
          }}
        >
          <div>
            <h3 className="font-heading" style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
              Questions Regarding Our Terms of Service?
            </h3>
            <p className="font-body" style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
              Reach out directly to our engineering and compliance teams for enterprise clarification or legal disclosures.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link
              href="/contact"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <Mail size={15} />
              <span>Contact Legal Support</span>
            </Link>
            <Link
              href="/privacy"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <span>Privacy Center</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
