'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  Cpu,
  Trash2,
  FileCheck,
  EyeOff,
  Clock,
  DatabaseZap,
  GlobeLock,
  ChevronDown,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Server,
  Layers,
  Fingerprint,
  Mail,
  Zap,
} from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'Who owns the files and content processed on Creed Tech Studio?',
    answer:
      'You retain 100% full legal ownership, copyright, and intellectual property rights over all files, text, images, fonts, and media uploaded to or transformed by Creed Tech. We claim zero rights, licenses, or title to your content.',
  },
  {
    question: 'Do Creed Tech engineers or staff ever inspect user documents?',
    answer:
      'No. All transformation workflows are completely automated and executed by deterministic backend engines (PyMuPDF, FFmpeg, Pillow) inside ephemeral operating system jail directories. No Creed Tech employee or automated crawler has access to view or inspect user files.',
  },
  {
    question: 'Can Creed Tech comply with government or third-party subpoenas for user documents?',
    answer:
      'Because of our 100% stateless architecture, we do not store, index, or archive any user documents or media files on our servers. When a request completes (or at the 15-minute TTL threshold), the data is cryptographically unlinked and deleted. As a technical reality, we cannot produce files that do not exist.',
  },
  {
    question: 'Is Creed Tech Studio compliant with GDPR, CCPA, and enterprise confidentiality?',
    answer:
      'Yes. By adhering to radical data minimization (GDPR Article 5) and automatic storage limitation (GDPR Article 17), we offer an enterprise-ready environment where sensitive corporate contracts, financial statements, and personal assets are never exposed to persistent disk retention or data brokers.',
  },
  {
    question: 'How do I report a security vulnerability or ask a privacy question?',
    answer:
      'We welcome coordinated security disclosures and privacy inquiries. You can reach our engineering team directly at security@creedtech.studio. We respond to all verified security reports within 24 hours.',
  },
];

interface CategoryCard {
  id: string;
  title: string;
  badge: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string; color?: string; style?: React.CSSProperties }>;
  iconBg: string;
  iconColor: string;
  href?: string;
}

const CATEGORY_CARDS: CategoryCard[] = [
  {
    id: 'privacy-policy',
    title: 'Privacy Policy',
    badge: 'Zero Tracking',
    description: 'How connection data is handled with radical data minimization and zero identity profiling.',
    icon: ShieldCheck,
    iconBg: '#ecfdf5',
    iconColor: '#059669',
  },
  {
    id: 'security-architecture',
    title: 'File Security Architecture',
    badge: 'Isolated Jails',
    description: 'In-memory processing, UUID-isolated operating system sandboxes, and instant zero-residue wipes.',
    icon: Lock,
    iconBg: '#eff6ff',
    iconColor: '#2563eb',
  },
  {
    id: 'no-ai-training',
    title: 'AI Data Ethics & Zero-Training Pledge',
    badge: 'Enterprise Covenant',
    description: 'Explicit guarantee that user documents, media, or images are NEVER ingested to train AI models.',
    icon: EyeOff,
    iconBg: '#fff1f2',
    iconColor: '#e11d48',
    href: '/privacy/ai-training',
  },
  {
    id: 'data-retention',
    title: 'Data Retention & Auto-Deletion',
    badge: '15m Max TTL',
    description: 'Automated garbage collection daemon runs every 300s to purge any abandoned sandbox payloads.',
    icon: Clock,
    iconBg: '#fef3c7',
    iconColor: '#d97706',
  },
  {
    id: 'gdpr-compliance',
    title: 'GDPR & Subject Rights',
    badge: 'Articles 5 & 17',
    description: 'Built-in privacy by design with automatic right to erasure and zero commercial profiling.',
    icon: GlobeLock,
    iconBg: '#f5f3ff',
    iconColor: '#7c3aed',
  },
  {
    id: 'processing-integrity',
    title: 'Processing Integrity',
    badge: 'Deterministic',
    description: 'Native PyMuPDF, FFmpeg 6.0+, and Pillow pipelines running strictly within pre-validated allowlists.',
    icon: Cpu,
    iconBg: '#f0fdf4',
    iconColor: '#16a34a',
  },
  {
    id: 'cookie-preferences',
    title: 'Cookie & Telemetry Policy',
    badge: 'Essential Only',
    description: 'Strictly zero advertising cookies, no tracking pixels, and client-side IndexedDB session recovery.',
    icon: Fingerprint,
    iconBg: '#f8fafc',
    iconColor: '#475569',
  },
  {
    id: 'faqs-contact',
    title: 'Security FAQs & Disclosure',
    badge: 'Direct Channel',
    description: 'Coordinated vulnerability disclosure and direct communication with Creed Tech security engineers.',
    icon: Mail,
    iconBg: '#f1f5f9',
    iconColor: '#0f172a',
  },
];

export default function TrustAndPrivacyCenterPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [activeCategory, setActiveCategory] = useState<string>('privacy-policy');

  const scrollToSection = (sectionId: string) => {
    setActiveCategory(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>

      {/* Main Container */}
      <main style={{ flex: 1, padding: '48px 24px 80px 24px', maxWidth: '1180px', margin: '0 auto', width: '100%' }}>
        {/* Section 1: Hero Banner (Adobe Privacy Center Style) */}
        <section
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            borderRadius: '16px',
            padding: '56px 40px',
            marginBottom: '48px',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: '9999px',
              color: '#047857',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '20px',
            }}
          >
            <ShieldCheck size={16} color="#059669" />
            Enterprise Privacy & Data Governance
          </div>

          <h1
            style={{
              fontSize: '42px',
              fontWeight: 800,
              color: '#0f172a',
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              margin: '0 auto 16px auto',
              maxWidth: '860px',
            }}
          >
            Creed Tech Trust & Privacy Center
          </h1>

          <p
            style={{
              fontSize: '17px',
              color: '#475569',
              lineHeight: 1.6,
              maxWidth: '740px',
              margin: '0 auto 32px auto',
            }}
          >
            Your files belong to you. We engineer zero-retention, cryptographically secure media and document workflows designed from first principles for complete confidentiality.
          </p>

          {/* 4 Trust Badges */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: '#fafbfd',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#334155',
              }}
            >
              <Server size={15} color="#059669" />
              Stateless Processing
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: '#fafbfd',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#334155',
              }}
            >
              <Trash2 size={15} color="#0284c7" />
              Zero Data Retention
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: '#fafbfd',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#334155',
              }}
            >
              <EyeOff size={15} color="#e11d48" />
              No AI Model Training
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: '#fafbfd',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#334155',
              }}
            >
              <Lock size={15} color="#7c3aed" />
              TLS 1.3 In-Transit
            </div>
          </div>
        </section>

        {/* Section 2: Quick-Access Category Grid (8 Icon Cards with active deep-links) */}
        <section style={{ marginBottom: '56px' }}>
          <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                Privacy & Trust Pillars
              </h2>
              <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                Select a topic to navigate directly to its policy commitments and architecture documentation.
              </p>
            </div>
            <Link
              href="/security"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: 700,
                color: '#0f172a',
                textDecoration: 'none',
              }}
            >
              Technical Architecture <ArrowRight size={14} />
            </Link>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '18px',
            }}
          >
            {CATEGORY_CARDS.map((card) => {
              const IconComp = card.icon;
              const isSelected = activeCategory === card.id;

              return (
                <div
                  key={card.id}
                  onClick={() => scrollToSection(card.id)}
                  style={{
                    backgroundColor: '#ffffff',
                    border: isSelected ? '1px solid #0f172a' : '1px solid rgba(226, 232, 240, 0.8)',
                    borderRadius: '12px',
                    padding: '22px',
                    cursor: 'pointer',
                    boxShadow: isSelected
                      ? '0 4px 12px -2px rgba(15, 23, 42, 0.08)'
                      : '0 1px 3px rgba(15, 23, 42, 0.04)',
                    transition: 'all 0.18s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = '#cbd5e1';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = 'rgba(226, 232, 240, 0.8)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                      <div
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '8px',
                          backgroundColor: card.iconBg,
                          color: card.iconColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <IconComp size={18} />
                      </div>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          backgroundColor: '#f1f5f9',
                          color: '#475569',
                          padding: '3px 8px',
                          borderRadius: '6px',
                        }}
                      >
                        {card.badge}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0' }}>
                      {card.title}
                    </h3>
                    <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                      {card.description}
                    </p>
                  </div>

                  {card.href ? (
                    <div
                      style={{
                        marginTop: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Link
                        href={card.href}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '12px',
                          fontWeight: 700,
                          color: '#e11d48',
                          textDecoration: 'none',
                        }}
                      >
                        Read Dedicated Pledge <ArrowRight size={13} />
                      </Link>
                    </div>
                  ) : (
                    <div
                      style={{
                        marginTop: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: isSelected ? '#0f172a' : '#64748b',
                      }}
                    >
                      View Details <ArrowRight size={13} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 3: The Lifecycle & What We Do With Your Files */}
        <section
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            borderRadius: '16px',
            padding: '40px 32px',
            marginBottom: '56px',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#64748b',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Auditable Confidentiality Pipeline
            </span>
            <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', margin: '8px 0 0 0' }}>
              How Creed Tech Protects Your Files (The Lifecycle)
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '20px',
              marginBottom: '48px',
            }}
          >
            {/* Step 1 */}
            <div
              style={{
                backgroundColor: '#fafbfd',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                borderRadius: '12px',
                padding: '24px 20px',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#64748b',
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: '#e2e8f0',
                    color: '#0f172a',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                  }}
                >
                  1
                </span>
                STEP 1
              </div>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0' }}>
                Encrypted Upload (TLS 1.3)
              </h4>
              <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                Data transfers utilize secure TLS 1.3 tunnels with HTTP Strict Transport Security. No plain text transmission.
              </p>
            </div>

            {/* Step 2 */}
            <div
              style={{
                backgroundColor: '#fafbfd',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                borderRadius: '12px',
                padding: '24px 20px',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#64748b',
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: '#e2e8f0',
                    color: '#0f172a',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                  }}
                >
                  2
                </span>
                STEP 2
              </div>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0' }}>
                Isolated Sandbox Transcoding
              </h4>
              <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                Processed inside <code style={{ backgroundColor: '#f1f5f9', padding: '2px 4px', borderRadius: '4px', fontSize: '11px' }}>/tmp/creedtech_sandbox/&lt;uuid&gt;</code> without persistent database logging.
              </p>
            </div>

            {/* Step 3 */}
            <div
              style={{
                backgroundColor: '#fafbfd',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                borderRadius: '12px',
                padding: '24px 20px',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#64748b',
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: '#e2e8f0',
                    color: '#0f172a',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                  }}
                >
                  3
                </span>
                STEP 3
              </div>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0' }}>
                Direct Stream Delivery
              </h4>
              <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                Processed output buffers stream straight to the browser client with immediate memory dereferencing.
              </p>
            </div>

            {/* Step 4 */}
            <div
              style={{
                backgroundColor: '#fafbfd',
                border: '1px solid #a7f3d0',
                borderRadius: '12px',
                padding: '24px 20px',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#059669',
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: '#ecfdf5',
                    color: '#059669',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                  }}
                >
                  4
                </span>
                STEP 4
              </div>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0' }}>
                Cryptographic File Purge
              </h4>
              <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                Folder destroyed immediately post-download or via the automated 300s / 15m TTL reaper sweep.
              </p>
            </div>
          </div>

          {/* Transparent Comparison Table: "What We Do With Your Files" */}
          <div style={{ marginTop: '32px' }}>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0' }}>
                What We Process vs. What We Store (Zero-Retention Matrix)
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                Explicit breakdown comparing operational computation vs permanent server retention.
              </p>
            </div>

            <div style={{ overflowX: 'auto', border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: '12px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid rgba(226, 232, 240, 0.8)' }}>
                    <th style={{ padding: '14px 18px', fontWeight: 700, color: '#0f172a' }}>Data Category</th>
                    <th style={{ padding: '14px 18px', fontWeight: 700, color: '#0f172a' }}>What We Process</th>
                    <th style={{ padding: '14px 18px', fontWeight: 700, color: '#0f172a' }}>What We Store (Server)</th>
                    <th style={{ padding: '14px 18px', fontWeight: 700, color: '#0f172a' }}>Retention Window</th>
                    <th style={{ padding: '14px 18px', fontWeight: 700, color: '#0f172a' }}>AI Model Usage</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 18px', fontWeight: 600, color: '#0f172a' }}>Document Text & Fonts</td>
                    <td style={{ padding: '14px 18px', color: '#475569' }}>PyMuPDF coordinate replacement in memory</td>
                    <td style={{ padding: '14px 18px', color: '#059669', fontWeight: 700 }}>ZERO (Nothing stored)</td>
                    <td style={{ padding: '14px 18px', color: '#64748b' }}>Ephemeral (seconds)</td>
                    <td style={{ padding: '14px 18px', color: '#dc2626', fontWeight: 700 }}>NEVER</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#fafbfd' }}>
                    <td style={{ padding: '14px 18px', fontWeight: 600, color: '#0f172a' }}>Images, Video, & Audio</td>
                    <td style={{ padding: '14px 18px', color: '#475569' }}>FFmpeg / Pillow encoding & transcoding</td>
                    <td style={{ padding: '14px 18px', color: '#059669', fontWeight: 700 }}>ZERO (Nothing stored)</td>
                    <td style={{ padding: '14px 18px', color: '#64748b' }}>Ephemeral (seconds)</td>
                    <td style={{ padding: '14px 18px', color: '#dc2626', fontWeight: 700 }}>NEVER</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 18px', fontWeight: 600, color: '#0f172a' }}>User Identity & Accounts</td>
                    <td style={{ padding: '14px 18px', color: '#475569' }}>No registration required (Anonymous)</td>
                    <td style={{ padding: '14px 18px', color: '#059669', fontWeight: 700 }}>ZERO (No user database)</td>
                    <td style={{ padding: '14px 18px', color: '#64748b' }}>Zero retention</td>
                    <td style={{ padding: '14px 18px', color: '#dc2626', fontWeight: 700 }}>NEVER</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#fafbfd' }}>
                    <td style={{ padding: '14px 18px', fontWeight: 600, color: '#0f172a' }}>Session Recovery Cache</td>
                    <td style={{ padding: '14px 18px', color: '#475569' }}>Browser IndexedDB local stage</td>
                    <td style={{ padding: '14px 18px', color: '#059669', fontWeight: 700 }}>ZERO (Stays in your browser)</td>
                    <td style={{ padding: '14px 18px', color: '#64748b' }}>3-Hour Client TTL</td>
                    <td style={{ padding: '14px 18px', color: '#dc2626', fontWeight: 700 }}>NEVER</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '14px 18px', fontWeight: 600, color: '#0f172a' }}>File Names & Metadata</td>
                    <td style={{ padding: '14px 18px', color: '#475569' }}>Sanitized Content-Disposition header</td>
                    <td style={{ padding: '14px 18px', color: '#059669', fontWeight: 700 }}>ZERO (No query logging)</td>
                    <td style={{ padding: '14px 18px', color: '#64748b' }}>Wiped with sandbox</td>
                    <td style={{ padding: '14px 18px', color: '#dc2626', fontWeight: 700 }}>NEVER</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Detailed Sections for the 8 Pillars */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginBottom: '56px' }}>
          {/* Pillar 1: Privacy Policy */}
          <div
            id="privacy-policy"
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              borderRadius: '14px',
              padding: '32px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#ecfdf5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ShieldCheck size={18} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                1. Privacy Policy & Minimal Data Scope
              </h3>
            </div>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.65, margin: '0 0 12px 0' }}>
              Creed Tech Studio is an un-monetized document utility. We do not require registration, login profiles, credit cards, or identity verification. When you establish a connection to our endpoints, we process only the bare transport-level headers required to serve HTTP responses, which are discarded upon session close.
            </p>
          </div>

          {/* Pillar 2: File Security Architecture */}
          <div
            id="security-architecture"
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              borderRadius: '14px',
              padding: '32px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#eff6ff',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Lock size={18} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                2. File Security Architecture
              </h3>
            </div>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.65, margin: '0 0 12px 0' }}>
              Files uploaded to the studio exist in temporary RAM buffers or UUID-isolated jail folders under <code style={{ backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>/tmp/creedtech_sandbox</code>. Process isolation ensures that concurrent conversions for other users cannot inspect, leak into, or interfere with your data.
            </p>
            <Link
              href="/security"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: 700,
                color: '#2563eb',
                textDecoration: 'none',
              }}
            >
              Read full technical security whitepaper <ExternalLink size={13} />
            </Link>
          </div>

          {/* Pillar 3: No AI Training Guarantee */}
          <div
            id="no-ai-training"
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              borderRadius: '14px',
              padding: '32px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: '#fff1f2',
                    color: '#e11d48',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <EyeOff size={18} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  3. Strict No AI Training Guarantee
                </h3>
              </div>
              <Link
                href="/privacy/ai-training"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#e11d48',
                  backgroundColor: '#fff1f2',
                  border: '1px solid #fecdd3',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                }}
              >
                Dedicated AI Protection Page <ArrowRight size={13} />
              </Link>
            </div>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.65, margin: 0 }}>
              Many modern online converters secretly aggregate user text, images, and audio into machine learning data sets. Creed Tech explicitly promises and certifies that <strong>no user data is ever parsed, scraped, vectorized, or fed into any AI model, LLM, or neural training corpus</strong>.
            </p>
          </div>

          {/* Pillar 4: Data Retention & Auto-Deletion */}
          <div
            id="data-retention"
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              borderRadius: '14px',
              padding: '32px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#fef3c7',
                  color: '#d97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Clock size={18} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                4. Data Retention & Auto-Deletion Lifecycle
              </h3>
            </div>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.65, margin: 0 }}>
              Our server hosts an autonomous garbage collection reaper running on an asynchronous loop with a 300-second interval. Any temporary sandbox workspace older than 15 minutes is forcefully purged. Furthermore, client-side staged files cached in browser IndexedDB expire after 3 hours and never leave your machine.
            </p>
          </div>

          {/* Pillar 5: GDPR & Data Subject Rights */}
          <div
            id="gdpr-compliance"
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              borderRadius: '14px',
              padding: '32px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#f5f3ff',
                  color: '#7c3aed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <GlobeLock size={18} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                5. GDPR & Data Subject Rights
              </h3>
            </div>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.65, margin: 0 }}>
              Under GDPR Articles 5 and 17, privacy must be proactive. Because we do not store customer records or retain files, your right to erasure is satisfied automatically in real time. We do not engage in automated decision-making, profiling, or behavioral scoring.
            </p>
          </div>

          {/* Pillar 6: Media & Document Processing Integrity */}
          <div
            id="processing-integrity"
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              borderRadius: '14px',
              padding: '32px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#f0fdf4',
                  color: '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Cpu size={18} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                6. Media & Document Processing Integrity
              </h3>
            </div>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.65, margin: 0 }}>
              All PDF Online converters and media transcoding utilities run via vetted binaries (native C-based PyMuPDF, FFmpeg 6.0+, and Pillow). All subprocess invocations use strict argument allowlists with <code style={{ backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>shell=False</code>, neutralizing injection attacks and arbitrary command execution.
            </p>
          </div>

          {/* Pillar 7: Cookie & Telemetry Preferences */}
          <div
            id="cookie-preferences"
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              borderRadius: '14px',
              padding: '32px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#f8fafc',
                  color: '#475569',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Fingerprint size={18} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                7. Cookie & Telemetry Policy
              </h3>
            </div>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.65, margin: 0 }}>
              We do not deploy marketing cookies, ad pixels, or third-party telemetry tools. The only state maintained is client-side in your own browser through IndexedDB for auto-recovery if your browser window accidentally closes.
            </p>
          </div>

          {/* Pillar 8: Security FAQs & Contact */}
          <div
            id="faqs-contact"
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              borderRadius: '14px',
              padding: '32px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#f1f5f9',
                  color: '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Mail size={18} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                8. Security Inquiries & Vulnerability Disclosure
              </h3>
            </div>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.65, margin: 0 }}>
              If you identify a security anomaly or have specific compliance requirements for your organization, contact our security team at <span style={{ fontWeight: 700, color: '#0f172a' }}>security@creedtech.studio</span>. We adhere to responsible disclosure practices and acknowledge verified submissions promptly.
            </p>
          </div>
        </section>

        {/* FAQ Accordion */}
        <section style={{ maxWidth: '840px', margin: '0 auto 40px auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Trust & Privacy FAQs
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', marginTop: '8px' }}>
              Clear, unambiguous responses regarding document confidentiality and enterprise protection.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid rgba(226, 232, 240, 0.8)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    style={{
                      width: '100%',
                      padding: '20px 24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <span style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                      {item.question}
                    </span>
                    <ChevronDown
                      size={18}
                      color="#64748b"
                      style={{
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                        flexShrink: 0,
                        marginLeft: '12px',
                      }}
                    />
                  </button>
                  {isOpen && (
                    <div
                      style={{
                        padding: '0 24px 20px 24px',
                        fontSize: '14px',
                        color: '#475569',
                        lineHeight: 1.6,
                        borderTop: '1px solid #f1f5f9',
                        paddingTop: '16px',
                      }}
                    >
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

    </div>
  );
}
