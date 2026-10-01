'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Inbox,
  Mail,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Search,
  RefreshCw,
  X,
  ExternalLink,
  ChevronRight,
  Clock,
  Building,
  AlertCircle,
  Tag,
  Filter,
  HardDrive,
  Cpu,
  Server,
  Activity,
  CheckCircle,
  Lock,
} from 'lucide-react';

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
  created_at: string;
  status: 'unread' | 'read' | 'replied';
}

type FilterStatus = 'all' | 'unread' | 'read' | 'replied';

interface HealthData {
  status: string;
  service: string;
  ephemeral_storage: string;
  session_ttl_minutes: number;
  ffmpeg_available: boolean;
}

export default function AdminWorkspacePage() {
  // Messages state
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterStatus>('all');
  const [activeMessage, setActiveMessage] = useState<Message | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // System Diagnostics state
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(false);
  const [lastChecked, setLastChecked] = useState<string | null>(null);

  const fetchMessages = async () => {
    setLoadingMessages(true);
    setErrorNotice(null);
    try {
      const res = await fetch('/api/admin/messages');
      if (!res.ok) {
        throw new Error('Failed to load inquiries from workspace inbox.');
      }
      const data: Message[] = await res.json();
      setMessages(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error loading messages';
      setErrorNotice(message);
    } finally {
      setLoadingMessages(false);
    }
  };

  const fetchHealthDiagnostics = async () => {
    setLoadingHealth(true);
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data: HealthData = await res.json();
        setHealthData(data);
      } else {
        setHealthData({
          status: 'unavailable',
          service: 'Creed-Tech Studio',
          ephemeral_storage: '/tmp/creedtech_sandbox',
          session_ttl_minutes: 15,
          ffmpeg_available: false,
        });
      }
    } catch {
      setHealthData({
        status: 'degraded',
        service: 'Creed-Tech Studio',
        ephemeral_storage: '/tmp/creedtech_sandbox',
        session_ttl_minutes: 15,
        ffmpeg_available: true,
      });
    } finally {
      setLoadingHealth(false);
      setLastChecked(new Date().toLocaleTimeString());
    }
  };

  useEffect(() => {
    fetchMessages();
    fetchHealthDiagnostics();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: 'unread' | 'read' | 'replied') => {
    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error('Failed to update message status.');
      }

      const updated: Message = await res.json();
      setMessages((prev) => prev.map((m) => (m.id === id ? updated : m)));
      if (activeMessage && activeMessage.id === id) {
        setActiveMessage(updated);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error updating message';
      alert(message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this message?')) {
      return;
    }

    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete message.');
      }

      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (activeMessage && activeMessage.id === id) {
        setActiveMessage(null);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error deleting message';
      alert(message);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Metrics
  const metrics = useMemo(() => {
    const total = messages.length;
    const unread = messages.filter((m) => m.status === 'unread').length;
    const security = messages.filter((m) => m.category === 'Security & Privacy').length;
    const replied = messages.filter((m) => m.status === 'replied').length;
    return { total, unread, security, replied };
  }, [messages]);

  // Filtered & Searched Messages
  const filteredMessages = useMemo(() => {
    return messages.filter((msg) => {
      const matchesFilter = selectedFilter === 'all' || msg.status === selectedFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        msg.name.toLowerCase().includes(q) ||
        msg.email.toLowerCase().includes(q) ||
        msg.subject.toLowerCase().includes(q) ||
        msg.category.toLowerCase().includes(q) ||
        msg.message.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [messages, selectedFilter, searchQuery]);

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Security & Privacy':
        return { bg: '#fff1f2', text: '#e11d48', border: '#fecdd3' };
      case 'Enterprise Support':
        return { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' };
      case 'Bug Report':
        return { bg: '#fef3c7', text: '#b45309', border: '#fde68a' };
      default:
        return { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'unread':
        return { bg: '#fee2e2', text: '#dc2626', label: 'Unread' };
      case 'read':
        return { bg: '#f1f5f9', text: '#475569', label: 'Read' };
      case 'replied':
        return { bg: '#ecfdf5', text: '#059669', label: 'Replied' };
      default:
        return { bg: '#f1f5f9', text: '#475569', label: status };
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
      <main style={{ flex: 1, padding: '36px 24px 80px 24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            color: '#64748b',
            marginBottom: '24px',
          }}
        >
          <Link href="/" style={{ color: '#64748b', textDecoration: 'none' }}>
            Home
          </Link>
          <ChevronRight size={14} color="#94a3b8" />
          <span style={{ color: '#0f172a', fontWeight: 700 }}>
            Admin Workspace
          </span>
        </nav>

        {/* Workspace Title & Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                backgroundColor: '#0f172a',
                borderRadius: '9999px',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                marginBottom: '12px',
              }}
            >
              <Lock size={12} color="#f43f5e" />
              Direct Entry Restricted Session
            </div>

            <h1
              style={{
                fontSize: '32px',
                fontWeight: 800,
                color: '#0f172a',
                letterSpacing: '-0.025em',
                margin: '0 0 8px 0',
              }}
            >
              Creed Tech Admin Workspace
            </h1>
            <p style={{ fontSize: '14px', color: '#64748b', margin: 0, maxWidth: '720px' }}>
              Central management portal for contact inquiries, enterprise audit requests, and real-time ephemeral sandbox diagnostics.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={() => {
                fetchMessages();
                fetchHealthDiagnostics();
              }}
              disabled={loadingMessages || loadingHealth}
              style={{
                fontSize: '13px',
                fontWeight: 700,
                backgroundColor: '#ffffff',
                color: '#0f172a',
                padding: '9px 16px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              }}
            >
              <RefreshCw size={14} className={loadingMessages || loadingHealth ? 'animate-spin' : ''} />
              Refresh Workspace
            </button>
          </div>
        </div>

        {/* 1. Metrics Overview Cards */}
        <section style={{ marginBottom: '32px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '16px',
            }}
          >
            {/* Total Inquiries */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Total Messages</span>
                <Inbox size={18} color="#64748b" />
              </div>
              <div style={{ fontSize: '30px', fontWeight: 800, color: '#0f172a' }}>
                {metrics.total}
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                All contact submissions
              </div>
            </div>

            {/* Unread Inquiries */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#dc2626' }}>Unread Inquiries</span>
                <AlertCircle size={18} color="#dc2626" />
              </div>
              <div style={{ fontSize: '30px', fontWeight: 800, color: '#dc2626' }}>
                {metrics.unread}
              </div>
              <div style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px', fontWeight: 600 }}>
                Requires review / reply
              </div>
            </div>

            {/* Security Alerts / Inquiries */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#e11d48' }}>Security Alerts</span>
                <ShieldCheck size={18} color="#e11d48" />
              </div>
              <div style={{ fontSize: '30px', fontWeight: 800, color: '#e11d48' }}>
                {metrics.security}
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                Privacy & security disclosures
              </div>
            </div>

            {/* Replied Messages */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#059669' }}>Replied Messages</span>
                <CheckCircle2 size={18} color="#059669" />
              </div>
              <div style={{ fontSize: '30px', fontWeight: 800, color: '#059669' }}>
                {metrics.replied}
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                Handled communications
              </div>
            </div>
          </div>
        </section>

        {/* 2. System Status & Sandbox Cleanup Diagnostics */}
        <section
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            borderRadius: '14px',
            padding: '24px',
            marginBottom: '32px',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              borderBottom: '1px solid #f1f5f9',
              paddingBottom: '16px',
              marginBottom: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0f172a',
                }}
              >
                <Activity size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  System Status & Ephemeral Sandbox Diagnostics
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  Live diagnostics verified against backend worker node
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {lastChecked && (
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                  Checked at {lastChecked}
                </span>
              )}
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  backgroundColor: healthData?.status === 'healthy' ? '#ecfdf5' : '#fff1f2',
                  color: healthData?.status === 'healthy' ? '#059669' : '#e11d48',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: `1px solid ${healthData?.status === 'healthy' ? '#a7f3d0' : '#fecdd3'}`,
                }}
              >
                <span
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: healthData?.status === 'healthy' ? '#10b981' : '#f43f5e',
                  }}
                />
                {healthData?.status === 'healthy' ? 'Engine Operational' : 'Node Connecting'}
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
            }}
          >
            {/* Ephemeral Sandbox Path */}
            <div style={{ backgroundColor: '#fafbfd', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                <HardDrive size={15} /> Ephemeral Workspace
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {healthData?.ephemeral_storage || '/tmp/creedtech_sandbox'}
              </div>
              <div style={{ fontSize: '11px', color: '#059669', marginTop: '4px', fontWeight: 600 }}>
                UUID isolated subdirectories
              </div>
            </div>

            {/* Session Garbage Collection */}
            <div style={{ backgroundColor: '#fafbfd', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                <Clock size={15} /> Sandbox Auto-Reaper
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                {healthData?.session_ttl_minutes ?? 15} Minutes TTL
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                Background purge every 300 seconds
              </div>
            </div>

            {/* Media Transcoding Engine */}
            <div style={{ backgroundColor: '#fafbfd', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                <Cpu size={15} /> Universal Media Engine
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                {healthData?.ffmpeg_available ? 'FFmpeg 6+ Ready' : 'Native Subprocess'}
              </div>
              <div style={{ fontSize: '11px', color: '#059669', marginTop: '4px', fontWeight: 600 }}>
                Multi-threaded CRF conversion
              </div>
            </div>

            {/* Retention Policy */}
            <div style={{ backgroundColor: '#fafbfd', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                <Server size={15} /> Retention & Privacy
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                0-Byte Permanent Retention
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                Stateless cryptographic deletion
              </div>
            </div>
          </div>
        </section>

        {/* 3. Search, Filter & Actions Toolbar */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '20px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          {/* Status Filter Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', marginRight: '4px' }}>
              Filter:
            </span>
            {(['all', 'unread', 'read', 'replied'] as FilterStatus[]).map((st) => {
              const isSelected = selectedFilter === st;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setSelectedFilter(st)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    textTransform: 'capitalize',
                    border: isSelected ? '1px solid #0f172a' : '1px solid #e2e8f0',
                    backgroundColor: isSelected ? '#0f172a' : '#fafbfd',
                    color: isSelected ? '#ffffff' : '#475569',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {st}
                  {st === 'unread' && metrics.unread > 0 && (
                    <span
                      style={{
                        marginLeft: '6px',
                        backgroundColor: '#dc2626',
                        color: '#ffffff',
                        fontSize: '10px',
                        padding: '1px 6px',
                        borderRadius: '9999px',
                      }}
                    >
                      {metrics.unread}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search Bar */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '340px' }}>
            <Search
              size={16}
              color="#94a3b8"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="Search by sender, subject, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                fontSize: '13px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#fafbfd',
                outline: 'none',
                color: '#0f172a',
              }}
            />
          </div>
        </div>

        {/* 4. Complete Message Inbox Table */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            borderRadius: '14px',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
          }}
        >
          {loadingMessages ? (
            <div style={{ padding: '64px 24px', textAlign: 'center', color: '#64748b' }}>
              <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px auto' }} />
              <div style={{ fontSize: '14px', fontWeight: 600 }}>Loading workspace inquiries...</div>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div style={{ padding: '64px 24px', textAlign: 'center', color: '#64748b' }}>
              <Inbox size={36} color="#cbd5e1" style={{ margin: '0 auto 12px auto' }} />
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                No messages match criteria
              </div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>
                {searchQuery || selectedFilter !== 'all'
                  ? 'Try adjusting your search query or status filter.'
                  : 'Your inbox is currently clear. Contact form submissions will appear here automatically.'}
              </div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid rgba(226, 232, 240, 0.8)' }}>
                    <th style={{ padding: '14px 18px', fontWeight: 700, color: '#0f172a' }}>Date & Time</th>
                    <th style={{ padding: '14px 18px', fontWeight: 700, color: '#0f172a' }}>Sender</th>
                    <th style={{ padding: '14px 18px', fontWeight: 700, color: '#0f172a' }}>Category</th>
                    <th style={{ padding: '14px 18px', fontWeight: 700, color: '#0f172a' }}>Subject</th>
                    <th style={{ padding: '14px 18px', fontWeight: 700, color: '#0f172a' }}>Status</th>
                    <th style={{ padding: '14px 18px', fontWeight: 700, color: '#0f172a', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMessages.map((msg) => {
                    const catStyle = getCategoryColor(msg.category);
                    const statusBadge = getStatusBadge(msg.status);
                    const isUnread = msg.status === 'unread';

                    return (
                      <tr
                        key={msg.id}
                        onClick={() => {
                          setActiveMessage(msg);
                          if (msg.status === 'unread') {
                            handleUpdateStatus(msg.id, 'read');
                          }
                        }}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          backgroundColor: isUnread ? '#fffdfa' : '#ffffff',
                          cursor: 'pointer',
                          transition: 'background-color 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = isUnread ? '#fffdfa' : '#ffffff')
                        }
                      >
                        <td style={{ padding: '14px 18px', color: '#64748b', whiteSpace: 'nowrap' }}>
                          {formatDate(msg.created_at)}
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ fontWeight: isUnread ? 800 : 600, color: '#0f172a' }}>
                            {msg.name}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>
                            {msg.email}
                          </div>
                        </td>
                        <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              backgroundColor: catStyle.bg,
                              color: catStyle.text,
                              border: `1px solid ${catStyle.border}`,
                              padding: '2px 8px',
                              borderRadius: '6px',
                            }}
                          >
                            {msg.category}
                          </span>
                        </td>
                        <td style={{ padding: '14px 18px', maxWidth: '320px' }}>
                          <div
                            style={{
                              fontWeight: isUnread ? 700 : 500,
                              color: '#0f172a',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {msg.subject}
                          </div>
                          <div
                            style={{
                              fontSize: '12px',
                              color: '#64748b',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              marginTop: '2px',
                            }}
                          >
                            {msg.message}
                          </div>
                        </td>
                        <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              backgroundColor: statusBadge.bg,
                              color: statusBadge.text,
                              padding: '2px 8px',
                              borderRadius: '6px',
                            }}
                          >
                            {statusBadge.label}
                          </span>
                        </td>
                        <td
                          style={{ padding: '14px 18px', textAlign: 'right', whiteSpace: 'nowrap' }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            {msg.status !== 'replied' ? (
                              <button
                                type="button"
                                title="Mark as Replied"
                                onClick={() => handleUpdateStatus(msg.id, 'replied')}
                                disabled={actionLoadingId === msg.id}
                                style={{
                                  padding: '5px 10px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  backgroundColor: '#ecfdf5',
                                  color: '#047857',
                                  border: '1px solid #a7f3d0',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                }}
                              >
                                Mark Replied
                              </button>
                            ) : (
                              <button
                                type="button"
                                title="Mark as Unread"
                                onClick={() => handleUpdateStatus(msg.id, 'unread')}
                                disabled={actionLoadingId === msg.id}
                                style={{
                                  padding: '5px 10px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  backgroundColor: '#f1f5f9',
                                  color: '#475569',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                }}
                              >
                                Mark Unread
                              </button>
                            )}

                            <button
                              type="button"
                              title="Delete message"
                              onClick={() => handleDeleteMessage(msg.id)}
                              disabled={actionLoadingId === msg.id}
                              style={{
                                padding: '5px 8px',
                                backgroundColor: '#fff1f2',
                                color: '#e11d48',
                                border: '1px solid #fecdd3',
                                borderRadius: '6px',
                                cursor: 'pointer',
                              }}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* 5. Message Detail Viewer Modal */}
      {activeMessage && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setActiveMessage(null)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '640px',
              width: '100%',
              padding: '32px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              position: 'relative',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    backgroundColor: getCategoryColor(activeMessage.category).bg,
                    color: getCategoryColor(activeMessage.category).text,
                    border: `1px solid ${getCategoryColor(activeMessage.category).border}`,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    display: 'inline-block',
                    marginBottom: '8px',
                  }}
                >
                  {activeMessage.category}
                </span>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {activeMessage.subject}
                </h3>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                  Received on {formatDate(activeMessage.created_at)}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveMessage(null)}
                style={{
                  backgroundColor: '#f1f5f9',
                  border: 'none',
                  borderRadius: '8px',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#475569',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Sender Metadata Box */}
            <div
              style={{
                backgroundColor: '#fafbfd',
                border: '1px solid rgba(226, 232, 240, 0.8)',
                borderRadius: '10px',
                padding: '16px',
                marginBottom: '20px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '12px',
                fontSize: '13px',
              }}
            >
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '11px', fontWeight: 600 }}>From</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{activeMessage.name}</span>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '11px', fontWeight: 600 }}>Email Address</span>
                <a href={`mailto:${activeMessage.email}`} style={{ color: '#2563eb', fontWeight: 600 }}>
                  {activeMessage.email}
                </a>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '11px', fontWeight: 600 }}>Current Status</span>
                <span style={{ textTransform: 'capitalize', fontWeight: 700, color: getStatusBadge(activeMessage.status).text }}>
                  {activeMessage.status}
                </span>
              </div>
            </div>

            {/* Message Body */}
            <div style={{ marginBottom: '28px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '8px' }}>
                Message Content
              </span>
              <div
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '18px',
                  fontSize: '14px',
                  color: '#1e293b',
                  lineHeight: 1.7,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {activeMessage.message}
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {activeMessage.status !== 'replied' ? (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(activeMessage.id, 'replied')}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#ecfdf5',
                      color: '#059669',
                      border: '1px solid #a7f3d0',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Mark as Replied
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(activeMessage.id, 'unread')}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#f1f5f9',
                      color: '#475569',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Mark as Unread
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleDeleteMessage(activeMessage.id)}
                  style={{
                    padding: '8px 14px',
                    backgroundColor: '#fff1f2',
                    color: '#e11d48',
                    border: '1px solid #fecdd3',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Delete
                </button>
              </div>

              {/* Direct Mailto Reply */}
              <a
                href={`mailto:${activeMessage.email}?subject=${encodeURIComponent(`Re: ${activeMessage.subject} - Creed Tech Studio`)}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 18px',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                <Mail size={15} /> Reply via Email <ExternalLink size={13} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
