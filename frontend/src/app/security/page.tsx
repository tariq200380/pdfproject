'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  EyeOff,
  Cpu,
  Trash2,
  CheckCircle,
  Server,
  Zap,
  ChevronDown,
  ArrowRight,
  FileCheck,
  HardDrive,
  RefreshCw,
} from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_DATA: FaqItem[] = [
  {
    question: 'Do you retain, store, or view my uploaded files?',
    answer:
      'Never. Creed Tech is built on a 100% stateless architecture. Your files exist only in isolated ephemeral memory/disk sandboxes for the few seconds required to process the transformation. The moment your download completes—or at our strict 15-minute garbage collection threshold—all files and temporary buffers are cryptographically deleted.',
  },
  {
    question: 'Are my documents, media, or images used to train AI models?',
    answer:
      'Absolute zero training. We guarantee that no user content—text, spreadsheets, slides, photos, audio, or video—is ever fed into, reviewed by, or used to train any artificial intelligence, machine learning, or neural network models. We operate strictly as a deterministic compute utility.',
  },
  {
    question: 'How does UUID ephemeral isolation work?',
    answer:
      'Every upload session generates a cryptographically random UUID workspace in an isolated operating system sandbox (/tmp/creedtech_sandbox/<uuid>). Cross-tenant access is physically impossible. When the task is finalized or aborted, an asynchronous reaper executes a filesystem purge that leaves zero residual artifacts.',
  },
  {
    question: 'What encryption protocols protect data in transit?',
    answer:
      'All traffic between your browser and our processing nodes is enforced via TLS 1.3 encryption with strict HTTP Strict Transport Security (HSTS) headers. Your files cannot be intercepted, snooped, or tampered with in transit.',
  },
  {
    question: 'What happens client-side versus server-side?',
    answer:
      'Where supported, operations like canvas rendering, local IndexedDB caching, and image rasterization happen directly inside your browser memory without transmitting unneeded data. When high-performance compute is required (such as PyMuPDF font replacement or FFmpeg multi-pass CRF transcoding), data is handled by our ephemeral worker pool.',
  },
];

export default function SecurityPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '40px 24px 80px 24px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        {/* Navigation Breadcrumb / Back Link */}
        <div style={{ marginBottom: '28px' }}>
          <Link
            href="/privacy"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#64748b',
              textDecoration: 'none',
              padding: '6px 12px',
              backgroundColor: '#ffffff',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              borderRadius: '8px',
              transition: 'all 0.15s ease',
            }}
          >
            ← Back to Trust & Privacy Center
          </Link>
        </div>

        {/* Hero Header */}
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
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
            Enterprise-Grade File Security
          </div>

          <h1
            style={{
              fontSize: '40px',
              fontWeight: 800,
              color: '#0f172a',
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              margin: '0 auto 16px auto',
              maxWidth: '820px',
            }}
          >
            Stateless, Zero-Retention Security Architecture
          </h1>

          <p
            style={{
              fontSize: '16px',
              color: '#64748b',
              lineHeight: 1.6,
              maxWidth: '680px',
              margin: '0 auto',
            }}
          >
            Creed Tech Studio is architected with a non-negotiable confidentiality covenant: 
            zero file storage, strict sandbox isolation, memory-only execution, and immediate cryptographic data destruction.
          </p>
        </div>

        {/* 4-Grid Core Guarantees */}
        <section style={{ marginBottom: '64px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '24px',
            }}
          >
            {/* Card 1 */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '28px',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#f1f5f9',
                  color: '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '18px',
                }}
              >
                <Server size={20} />
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', margin: '0 0 10px 0' }}>
                Ephemeral Sandbox Processing
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                Operations run inside isolated temporary UUID jail directories. No file is ever written to persistent databases or long-term disk storage.
              </p>
            </div>

            {/* Card 2 */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '28px',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#ecfdf5',
                  color: '#047857',
                  border: '1px solid #a7f3d0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '18px',
                }}
              >
                <Lock size={20} />
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', margin: '0 0 10px 0' }}>
                TLS 1.3 In-Transit Encryption
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                All document uploads and streams are protected using enterprise-grade TLS 1.3 ciphers, stopping eavesdropping, MITM attacks, or inspection.
              </p>
            </div>

            {/* Card 3 */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '28px',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    backgroundColor: '#fff1f2',
                    color: '#e11d48',
                    border: '1px solid #fecdd3',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '18px',
                  }}
                >
                  <EyeOff size={20} />
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', margin: '0 0 10px 0' }}>
                  Zero AI Model Training
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                  We strictly guarantee user files are never used to train, fine-tune, or benchmark artificial intelligence or large language models. Your IP remains yours.
                </p>
              </div>

              <div style={{ marginTop: '16px' }}>
                <Link
                  href="/privacy/ai-training"
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
                  AI Non-Training Pledge <ArrowRight size={13} />
                </Link>
              </div>
            </div>

            {/* Card 4 */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '28px',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  backgroundColor: '#f0f9ff',
                  color: '#0284c7',
                  border: '1px solid #bae6fd',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '18px',
                }}
              >
                <Zap size={20} />
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', margin: '0 0 10px 0' }}>
                Client-Side Acceleration
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
                Where feasible, computations run directly inside your local browser runtime via WebAssembly and Canvas APIs without unnecessary network transfers.
              </p>
            </div>
          </div>
        </section>

        {/* Technical Workflow Diagram / Visual Lifecycle */}
        <section
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '40px 32px',
            marginBottom: '64px',
            boxShadow: '0 1px 4px rgba(15, 23, 42, 0.03)',
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
              Cryptographic Execution Pipeline
            </span>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '8px 0 0 0' }}>
              The 4-Stage Ephemeral Lifecycle
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              position: 'relative',
            }}
          >
            {/* Step 1 */}
            <div
              style={{
                backgroundColor: '#fafbfd',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '24px 20px',
                position: 'relative',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#64748b',
                  marginBottom: '12px',
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
                STAGE 1
              </div>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0' }}>
                Secure TLS Ingestion
              </h4>
              <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                Stream payload encrypted via TLS 1.3 directly into a RAM-backed temporary stream.
              </p>
            </div>

            {/* Step 2 */}
            <div
              style={{
                backgroundColor: '#fafbfd',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '24px 20px',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#64748b',
                  marginBottom: '12px',
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
                STAGE 2
              </div>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0' }}>
                Jailed Transformation
              </h4>
              <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                Isolated sandbox execution via PyMuPDF or FFmpeg with strict argument validation allowlists.
              </p>
            </div>

            {/* Step 3 */}
            <div
              style={{
                backgroundColor: '#fafbfd',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '24px 20px',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#64748b',
                  marginBottom: '12px',
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
                STAGE 3
              </div>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0' }}>
                Instant Stream Delivery
              </h4>
              <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                Result is pushed to user client with automatic Content-Disposition headers for immediate browser download.
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
                  marginBottom: '12px',
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
                STAGE 4
              </div>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: '0 0 8px 0' }}>
                Cryptographic Wipe
              </h4>
              <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                Ephemeral sandbox folder purged immediately upon transfer completion or 15-minute background sweep.
              </p>
            </div>
          </div>
        </section>

        {/* Security FAQ Section */}
        <section style={{ maxWidth: '840px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Security & Privacy FAQ
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', marginTop: '8px' }}>
              Clear answers regarding document ownership, confidentiality, and data handling.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {FAQ_DATA.map((item, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    transition: 'border-color 0.15s ease',
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
