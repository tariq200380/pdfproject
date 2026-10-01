'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  EyeOff,
  Cpu,
  Lock,
  Server,
  FileCheck,
  Trash2,
  ChevronRight,
  Mail,
  CheckCircle2,
  Binary,
  Layers,
  ArrowRight,
  Database,
  Fingerprint,
} from 'lucide-react';

export default function AiTrainingPledgePage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '36px 24px 80px 24px', maxWidth: '1020px', margin: '0 auto', width: '100%' }}>
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            color: '#64748b',
            marginBottom: '32px',
          }}
        >
          <Link href="/" style={{ color: '#64748b', textDecoration: 'none' }}>
            Home
          </Link>
          <ChevronRight size={14} color="#94a3b8" />
          <Link href="/privacy" style={{ color: '#64748b', textDecoration: 'none' }}>
            Privacy Center
          </Link>
          <ChevronRight size={14} color="#94a3b8" />
          <span style={{ color: '#0f172a', fontWeight: 600 }}>
            AI Non-Training Commitment
          </span>
        </nav>

        {/* Hero Section */}
        <div style={{ marginBottom: '48px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 14px',
              backgroundColor: '#fff1f2',
              border: '1px solid #fecdd3',
              borderRadius: '9999px',
              color: '#be123c',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '18px',
            }}
          >
            <EyeOff size={14} color="#e11d48" />
            Zero AI Training Covenant • Enterprise Guaranteed
          </div>

          <h1
            style={{
              fontSize: '38px',
              fontWeight: 800,
              color: '#0f172a',
              letterSpacing: '-0.025em',
              lineHeight: 1.2,
              margin: '0 0 16px 0',
            }}
          >
            AI Ethics & Non-Training Commitment
          </h1>

          <p style={{ fontSize: '16px', color: '#475569', lineHeight: 1.6, margin: 0 }}>
            In an era where consumer web tools secretly monetize user content as machine learning training fuel, 
            Creed Tech provides an ironclad, auditable guarantee: your data is strictly yours, and it will never be used for AI training.
          </p>
        </div>

        {/* The Core Non-Training Pledge Box */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            borderLeft: '4px solid #e11d48',
            borderRadius: '12px',
            padding: '28px 32px',
            marginBottom: '48px',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <ShieldCheck size={20} color="#e11d48" />
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              The Creed Tech Non-Training Covenant
            </h2>
          </div>
          <p
            style={{
              fontSize: '15px',
              fontWeight: 500,
              color: '#1e293b',
              lineHeight: 1.7,
              margin: 0,
              backgroundColor: '#fafbfd',
              padding: '16px 20px',
              borderRadius: '8px',
              border: '1px solid rgba(226, 232, 240, 0.6)',
            }}
          >
            &ldquo;Your content is never our training data. Creed Tech explicitly commits that user files, uploaded media, parsed text, and converted assets are <strong>NEVER used, sold, scraped, or ingested</strong> to train, fine-tune, benchmark, or improve artificial intelligence, neural networks, or large language models (LLMs).&rdquo;
          </p>
        </div>

        {/* 5 Comprehensive Commitment Sections */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', marginBottom: '56px' }}>
          {/* Section 1: Strict Ingestion Isolation */}
          <section
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              borderRadius: '14px',
              padding: '32px',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: '#f1f5f9',
                  color: '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Cpu size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  1. Strict Ingestion Isolation & Deterministic Pipelines
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Pure programmatic algorithms without generative AI intermediaries
                </span>
              </div>
            </div>

            <div style={{ fontSize: '14px', color: '#475569', lineHeight: 1.7 }}>
              <p style={{ marginTop: 0 }}>
                Every tool in Creed Tech Studio—whether replacing text in a PDF, transcoding video, or compressing imagery—operates via vetted, deterministic binaries:
              </p>
              <ul style={{ paddingLeft: '22px', margin: '14px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>
                  <strong>Deterministic Native Engines:</strong> We utilize native C-based <code style={{ backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>PyMuPDF</code>, <code style={{ backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>FFmpeg 6.0+</code>, and <code style={{ backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>Pillow</code>. These utilities do not have generative capabilities and cannot retain or generalize training patterns.
                </li>
                <li>
                  <strong>Zero Third-Party Model Training Loops:</strong> Your files never travel to third-party generative AI endpoints (e.g. OpenAI, Anthropic, or Google Gemini) for processing.
                </li>
                <li>
                  <strong>No Human-In-The-Loop Review:</strong> We employ zero crowd-workers, quality annotators, or human reviewers to evaluate your documents or conversions.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 2: No Data Scraping & No Derivative Datasets */}
          <section
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              borderRadius: '14px',
              padding: '32px',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: '#ecfdf5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Binary size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  2. No Data Scraping & No Derivative Datasets
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Zero tokenization, vectorization, or corpora generation
                </span>
              </div>
            </div>

            <div style={{ fontSize: '14px', color: '#475569', lineHeight: 1.7 }}>
              <p style={{ marginTop: 0 }}>
                When you execute operations that extract or analyze text—such as in-place PDF editing, text extraction, or OCR formatting—we explicitly guarantee:
              </p>
              <ul style={{ paddingLeft: '22px', margin: '14px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>
                  <strong>No Text Vectorization:</strong> We do not generate semantic embeddings, vector databases, or embedding index matrices of your documents.
                </li>
                <li>
                  <strong>No Corpora Caching:</strong> Extracted strings, typography baselines, and font metrics exist exclusively in RAM during coordinate replacement and are destroyed when the document stream closes.
                </li>
                <li>
                  <strong>No Secondary Derivative Datasets:</strong> Creed Tech creates no derived datasets, synthetic data pairs, or fine-tuning weights from user files.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 3: Enterprise & IP Ownership Protection */}
          <section
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              borderRadius: '14px',
              padding: '32px',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: '#eff6ff',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FileCheck size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  3. Enterprise & Intellectual Property (IP) Protection
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  100% intellectual property ownership remains with you
                </span>
              </div>
            </div>

            <div style={{ fontSize: '14px', color: '#475569', lineHeight: 1.7 }}>
              <p style={{ marginTop: 0 }}>
                Many online terms of service contain subtle clauses asserting broad licenses to user content for &ldquo;service improvement.&rdquo; Creed Tech takes the exact opposite stance:
              </p>
              <ul style={{ paddingLeft: '22px', margin: '14px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>
                  <strong>Zero Rights Transferred:</strong> Uploading a document or media file to Creed Tech conveys zero license, title, or intellectual property rights to Creed Tech.
                </li>
                <li>
                  <strong>Confidentiality Preserved:</strong> Trade secrets, proprietary financials, confidential legal filings, and personal media remain strictly confidential.
                </li>
                <li>
                  <strong>Safe for Regulated Enterprises:</strong> Legal, healthcare, and financial institutions can utilize Creed Tech knowing that no attorney-client privilege or HIPAA/GDPR confidential boundary is compromised.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 4: Third-Party AI Isolation */}
          <section
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              borderRadius: '14px',
              padding: '32px',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: '#fef3c7',
                  color: '#d97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Database size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  4. Third-Party AI Isolation & No Data Brokering
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  No monetization, data partnerships, or syndication
                </span>
              </div>
            </div>

            <div style={{ fontSize: '14px', color: '#475569', lineHeight: 1.7 }}>
              <p style={{ marginTop: 0 }}>
                Creed Tech does not partner with or sell telemetry, file hashes, or contents to artificial intelligence data aggregators or brokers:
              </p>
              <ul style={{ paddingLeft: '22px', margin: '14px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>
                  <strong>No API Data Feeds:</strong> There are no outbound data pipes or webhook syncs dispatching user uploads to external entities.
                </li>
                <li>
                  <strong>No Data Monetization:</strong> We earn no revenue from selling training datasets or user behavior logs.
                </li>
              </ul>
            </div>
          </section>

          {/* Section 5: Technical Enforcement Mechanisms */}
          <section
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              borderRadius: '14px',
              padding: '32px',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: '#f5f3ff',
                  color: '#7c3aed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Lock size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  5. Technical Enforcement Mechanisms
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Architectural safeguards that make retention physically impossible
                </span>
              </div>
            </div>

            <div style={{ fontSize: '14px', color: '#475569', lineHeight: 1.7 }}>
              <p style={{ marginTop: 0 }}>
                Our commitment is backed by strict engineering constraints, not just policy words:
              </p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '16px',
                  marginTop: '16px',
                }}
              >
                <div style={{ backgroundColor: '#fafbfd', border: '1px solid rgba(226, 232, 240, 0.8)', padding: '16px', borderRadius: '10px' }}>
                  <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>Ephemeral Memory Jail</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>UUID-isolated directory in /tmp/creedtech_sandbox isolated from root systems.</div>
                </div>

                <div style={{ backgroundColor: '#fafbfd', border: '1px solid rgba(226, 232, 240, 0.8)', padding: '16px', borderRadius: '10px' }}>
                  <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>Zero Permanent Databases</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>No database schemas or document storage buckets exist on our backend servers.</div>
                </div>

                <div style={{ backgroundColor: '#fafbfd', border: '1px solid rgba(226, 232, 240, 0.8)', padding: '16px', borderRadius: '10px' }}>
                  <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>15-Minute Reaper Sweep</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Autonomous daemon purges any abandoned session within 300s to 15m.</div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Enterprise Compliance Callout Banner */}
        <section
          style={{
            backgroundColor: '#0f172a',
            borderRadius: '16px',
            padding: '36px 32px',
            color: '#ffffff',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '24px',
            boxShadow: '0 4px 12px -2px rgba(15, 23, 42, 0.16)',
          }}
        >
          <div style={{ maxWidth: '640px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700,
                color: '#38bdf8',
                marginBottom: '12px',
              }}
            >
              Enterprise Compliance
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 8px 0', color: '#ffffff' }}>
              Have Enterprise Compliance or DPA Questions?
            </h3>
            <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
              Need a formal Data Protection Addendum (DPA) or security architecture validation for your enterprise? Contact our security and compliance team directly.
            </p>
          </div>

          <a
            href="mailto:security@creedtech.studio"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              backgroundColor: '#e11d48',
              color: '#ffffff',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 700,
              textDecoration: 'none',
              transition: 'background-color 0.15s ease',
              whiteSpace: 'nowrap',
            }}
          >
            <Mail size={16} /> Contact Security Team
          </a>
        </section>
      </main>

    </div>
  );
}
