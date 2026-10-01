'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Mail,
  Clock,
  ShieldCheck,
  Send,
  CheckCircle2,
  AlertCircle,
  Building,
  MessageSquare,
  HelpCircle,
  RefreshCw,
  Lock,
  ChevronRight,
} from 'lucide-react';

type CategoryType = 'General Inquiry' | 'Security & Privacy' | 'Enterprise Support' | 'Bug Report';

interface FormState {
  name: string;
  email: string;
  category: CategoryType;
  subject: string;
  message: string;
}

const INITIAL_FORM: FormState = {
  name: '',
  email: '',
  category: 'General Inquiry',
  subject: '',
  message: '',
};

export default function ContactPage() {
  const [formData, setFormData] = useState<FormState>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Basic frontend validations
    if (formData.name.trim().length < 2) {
      setErrorMsg('Please enter your full name (minimum 2 characters).');
      return;
    }
    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      setErrorMsg('Please provide a valid work or personal email address.');
      return;
    }
    if (formData.subject.trim().length < 3) {
      setErrorMsg('Please enter a descriptive subject line.');
      return;
    }
    if (formData.message.trim().length < 10) {
      setErrorMsg('Please provide a message with at least 10 characters.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/contact/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Failed to submit inquiry. Please try again.');
      }

      setSuccessId(data.message_id || 'CONFIRMED');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.';
      setErrorMsg(message);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM);
    setSuccessId(null);
    setErrorMsg(null);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>

      {/* Main Container */}
      <main style={{ flex: 1, padding: '40px 24px 80px 24px', maxWidth: '1140px', margin: '0 auto', width: '100%' }}>
        {/* Header Breadcrumb */}
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
          <span style={{ color: '#0f172a', fontWeight: 600 }}>
            Contact Us
          </span>
        </nav>

        {/* Hero Title */}
        <div style={{ marginBottom: '44px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              backgroundColor: '#f1f5f9',
              border: '1px solid #e2e8f0',
              borderRadius: '9999px',
              color: '#475569',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}
          >
            <MessageSquare size={13} color="#0f172a" />
            Direct Communications & Enterprise Support
          </div>

          <h1
            style={{
              fontSize: '38px',
              fontWeight: 800,
              color: '#0f172a',
              letterSpacing: '-0.025em',
              lineHeight: 1.2,
              margin: '0 0 12px 0',
            }}
          >
            Get in Touch with Creed Tech
          </h1>

          <p style={{ fontSize: '16px', color: '#475569', lineHeight: 1.6, maxWidth: '720px', margin: 0 }}>
            Have a question regarding document pipelines, custom enterprise deployments, security audits, or bug reports? Our engineering and compliance team is here to assist.
          </p>
        </div>

        {/* 2-Column Responsive Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '36px',
            alignItems: 'start',
          }}
        >
          {/* Left Column: Direct Contact & Guarantees */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Contact Card 1 */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                borderRadius: '14px',
                padding: '28px',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
              }}
            >
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: '0 0 18px 0' }}>
                Direct Channels
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
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
                      flexShrink: 0,
                    }}
                  >
                    <Mail size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>General Inquiries</div>
                    <a
                      href="mailto:contact@creedtech.studio"
                      style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', textDecoration: 'none' }}
                    >
                      contact@creedtech.studio
                    </a>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: '#fff1f2',
                      color: '#e11d48',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Security & Privacy DPA</div>
                    <a
                      href="mailto:security@creedtech.studio"
                      style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', textDecoration: 'none' }}
                    >
                      security@creedtech.studio
                    </a>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: '#f0fdf4',
                      color: '#16a34a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Building size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Enterprise Support</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                      enterprise@creedtech.studio
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Commitments Card */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                borderRadius: '14px',
                padding: '24px 28px',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
              }}
            >
              <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: '0 0 14px 0' }}>
                Service Response Standards
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', color: '#475569' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={16} color="#059669" />
                  <span><strong>&lt; 24h Response Time:</strong> Guaranteed response on business days.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building size={16} color="#0284c7" />
                  <span><strong>Operational Hours:</strong> Monday – Friday, 9:00 AM – 6:00 PM EST.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Lock size={16} color="#7c3aed" />
                  <span><strong>Confidentiality:</strong> Communications remain non-public and protected.</span>
                </div>
              </div>
            </div>

            {/* Trust Center Banner */}
            <div
              style={{
                backgroundColor: '#fafbfd',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                borderRadius: '14px',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                  Looking for our Trust & Privacy Center?
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                  Review our 8 privacy pillars and AI non-training covenant.
                </div>
              </div>
              <Link
                href="/privacy"
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#0f172a',
                  textDecoration: 'none',
                  backgroundColor: '#ffffff',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  whiteSpace: 'nowrap',
                }}
              >
                Visit Center →
              </Link>
            </div>
          </div>

          {/* Right Column: Premium Contact Form */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              borderRadius: '16px',
              padding: '36px',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
            }}
          >
            {successId ? (
              <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    backgroundColor: '#ecfdf5',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px auto',
                  }}
                >
                  <CheckCircle2 size={32} />
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
                  Message Received Successfully
                </h3>
                <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6, maxWidth: '440px', margin: '0 auto 24px auto' }}>
                  Thank you for contacting Creed Tech Studio. Your inquiry has been routed to our technical support desk with Ticket ID:
                </p>
                <div
                  style={{
                    display: 'inline-block',
                    backgroundColor: '#f1f5f9',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontFamily: 'monospace',
                    fontSize: '13px',
                    color: '#0f172a',
                    fontWeight: 700,
                    marginBottom: '28px',
                  }}
                >
                  {successId}
                </div>
                <div>
                  <button
                    type="button"
                    onClick={resetForm}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#0f172a',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <RefreshCw size={14} /> Send Another Message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Send an Inquiry
                </h3>

                {errorMsg && (
                  <div
                    style={{
                      backgroundColor: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      color: '#dc2626',
                      fontSize: '13px',
                    }}
                  >
                    <AlertCircle size={18} style={{ flexShrink: 0 }} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Name & Email Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sarah Jenkins"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        fontSize: '14px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#fafbfd',
                        outline: 'none',
                        color: '#0f172a',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                      Work Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. s.jenkins@enterprise.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        fontSize: '14px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#fafbfd',
                        outline: 'none',
                        color: '#0f172a',
                      }}
                    />
                  </div>
                </div>

                {/* Category & Subject */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                      Inquiry Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as CategoryType })}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        fontSize: '14px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#fafbfd',
                        outline: 'none',
                        color: '#0f172a',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Security & Privacy">Security & Privacy / DPA</option>
                      <option value="Enterprise Support">Enterprise Support</option>
                      <option value="Bug Report">Technical Bug Report</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                      Subject *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Brief topic summary"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        fontSize: '14px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#fafbfd',
                        outline: 'none',
                        color: '#0f172a',
                      }}
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                    Detailed Message *
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Provide details regarding your question or requirements..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      fontSize: '14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#fafbfd',
                      outline: 'none',
                      color: '#0f172a',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      lineHeight: 1.5,
                    }}
                  />
                  <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
                    Minimum 10 characters. Your message is encrypted in transit via TLS 1.3.
                  </span>
                </div>

                {/* Submit Button */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      padding: '12px 28px',
                      backgroundColor: submitting ? '#64748b' : '#0f172a',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 700,
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    {submitting ? (
                      <>
                        <RefreshCw size={16} className="animate-spin" /> Submitting...
                      </>
                    ) : (
                      <>
                        <Send size={16} /> Send Message
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

    </div>
  );
}
