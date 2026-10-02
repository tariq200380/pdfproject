'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Languages,
  FileCode,
  X,
  Upload,
  Copy,
  Check,
  Download,
  Loader2,
  ShieldCheck,
  FileText,
  RefreshCw,
  Sliders,
  ArrowRight,
  Eye,
  AlertCircle,
  Globe,
  Search,
  ChevronDown,
  Lock,
  ArrowUpDown,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import {
  intelligenceApiClient,
  SummaryResult,
  TranslationResult,
  MarkdownResult,
} from '@/lib/intelligenceApiClient';

export type IntelligenceTab = 'summarize' | 'translate' | 'markdown';

interface DocumentIntelligenceModalProps {
  isOpen: boolean;
  initialTab?: IntelligenceTab;
  initialFile?: File | null;
  onClose: () => void;
}

interface LanguageOption {
  code: string;
  label: string;
  native?: string;
  isRtl?: boolean;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'ur', label: 'Urdu (اردو)', native: 'اردو', isRtl: true },
  { code: 'bn', label: 'Bengali (বাংলা)', native: 'বাংলা' },
  { code: 'ar', label: 'Arabic (العربية)', native: 'العربية', isRtl: true },
  { code: 'bg', label: 'Bulgarian', native: 'Български' },
  { code: 'ca', label: 'Catalan', native: 'Català' },
  { code: 'zh-CN', label: 'Chinese Simplified', native: '简体中文' },
  { code: 'da', label: 'Danish', native: 'Dansk' },
  { code: 'nl', label: 'Dutch / Flemish', native: 'Nederlands' },
  { code: 'en', label: 'English', native: 'English' },
  { code: 'fi', label: 'Finnish', native: 'Suomi' },
  { code: 'fr', label: 'French', native: 'Français' },
  { code: 'de', label: 'German', native: 'Deutsch' },
  { code: 'el', label: 'Greek', native: 'Ελληνικά' },
  { code: 'hi', label: 'Hindi (हिन्दी)', native: 'हिन्दी' },
  { code: 'hu', label: 'Hungarian', native: 'Magyar' },
  { code: 'it', label: 'Italian', native: 'Italiano' },
  { code: 'ja', label: 'Japanese (日本語)', native: '日本語' },
  { code: 'ko', label: 'Korean (한국어)', native: '한국어' },
  { code: 'fa', label: 'Persian (فارسی)', native: 'فارسی', isRtl: true },
  { code: 'pl', label: 'Polish', native: 'Polski' },
  { code: 'pt', label: 'Portuguese', native: 'Português' },
  { code: 'ro', label: 'Romanian / Moldavian', native: 'Română' },
  { code: 'ru', label: 'Russian', native: 'Русский' },
  { code: 'es', label: 'Spanish', native: 'Español' },
  { code: 'sw', label: 'Swahili', native: 'Kiswahili' },
  { code: 'sv', label: 'Swedish', native: 'Svenska' },
  { code: 'th', label: 'Thai (ไทย)', native: 'ไทย' },
  { code: 'tr', label: 'Turkish', native: 'Türkçe' },
  { code: 'uk', label: 'Ukrainian', native: 'Українська' },
  { code: 'vi', label: 'Vietnamese', native: 'Tiếng Việt' },
];

export const DocumentIntelligenceModal: React.FC<DocumentIntelligenceModalProps> = ({
  isOpen,
  initialTab = 'summarize',
  initialFile = null,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<IntelligenceTab>(initialTab);
  const [currentFile, setCurrentFile] = useState<File | null>(initialFile);
  const [rawText, setRawText] = useState<string>('');

  // Tab 1: Summarize State
  const [summaryMode, setSummaryMode] = useState<'bullets' | 'executive' | 'digest'>('bullets');
  const [summaryResult, setSummaryResult] = useState<SummaryResult | null>(null);

  // Tab 2: Translate State
  const [targetLang, setTargetLang] = useState<string>('ur');
  const [sourceLang, setSourceLang] = useState<string>('auto');
  const [translationResult, setTranslationResult] = useState<TranslationResult | null>(null);

  // Tab 3: Markdown State
  const [markdownResult, setMarkdownResult] = useState<MarkdownResult | null>(null);

  // Common UI states
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [processingStage, setProcessingStage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const executionIdRef = useRef(0);
  const [pdfPassword, setPdfPassword] = useState('');

  // Searchable language combobox state
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [langSearchQuery, setLangSearchQuery] = useState('');
  const langDropdownRef = useRef<HTMLDivElement>(null);
  const langSearchInputRef = useRef<HTMLInputElement>(null);

  const handleSwapLanguages = () => {
    if (sourceLang === 'auto') {
      const prevTarget = targetLang;
      setSourceLang(prevTarget);
      setTargetLang('en');
    } else {
      const prevSource = sourceLang;
      const prevTarget = targetLang;
      setSourceLang(prevTarget);
      setTargetLang(prevSource);
    }
    setTranslationResult(null);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(e.target as Node)) {
        setIsLangDropdownOpen(false);
      }
    };
    if (isLangDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isLangDropdownOpen]);

  const pinnedLanguage = LANGUAGES.find((l) => l.code === 'ur')!;
  const otherLanguages = LANGUAGES.filter((l) => l.code !== 'ur').sort((a, b) => a.label.localeCompare(b.label));

  const query = langSearchQuery.trim().toLowerCase();
  const matchesQuery = (l: (typeof LANGUAGES)[0]) =>
    !query ||
    l.label.toLowerCase().includes(query) ||
    (l.native && l.native.toLowerCase().includes(query)) ||
    l.code.toLowerCase().includes(query);

  const filteredPinned = matchesQuery(pinnedLanguage) ? [pinnedLanguage] : [];
  const filteredOthers = otherLanguages.filter(matchesQuery);
  const currentLangObj = LANGUAGES.find((l) => l.code === targetLang);

  const handleSelectLanguage = (code: string) => {
    setTargetLang(code);
    setIsLangDropdownOpen(false);
    setLangSearchQuery('');
    setTranslationResult(null);
    handleExecuteAction({ tab: 'translate', targetLangOverride: code });
  };

  // Sync initial props
  useEffect(() => {
    if (isOpen) {
      if (initialTab) setActiveTab(initialTab);
      if (initialFile) setCurrentFile(initialFile);
    }
  }, [isOpen, initialTab, initialFile]);

  // Auto-execute when a file is loaded or modal opens without existing result
  useEffect(() => {
    if (isOpen && (currentFile || rawText.trim())) {
      const hasResult =
        (activeTab === 'summarize' && summaryResult) ||
        (activeTab === 'translate' && translationResult) ||
        (activeTab === 'markdown' && markdownResult);

      if (!hasResult) {
        handleExecuteAction({ tab: activeTab });
      }
    }
  }, [currentFile, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCurrentFile(file);
      setRawText('');
      setPdfPassword('');
      setErrorMessage(null);
      setSummaryResult(null);
      setTranslationResult(null);
      setMarkdownResult(null);
    }
  };

  const handleExecuteAction = async (override?: {
    tab?: IntelligenceTab;
    mode?: 'bullets' | 'executive' | 'digest';
    targetLangOverride?: string;
    passwordOverride?: string;
  }) => {
    const runTab = override?.tab || activeTab;
    const runMode = override?.mode || summaryMode;
    const runLang = override?.targetLangOverride || targetLang;
    const runPassword = override?.passwordOverride ?? pdfPassword;

    if (!currentFile && !rawText.trim()) {
      return;
    }

    const execId = ++executionIdRef.current;
    setIsProcessing(true);
    setErrorMessage(null);
    setProgressPercent(12);
    setElapsedSeconds(0);
    setProcessingStage(
      runTab === 'translate'
        ? 'Reading document structure & text blocks...'
        : runTab === 'summarize'
        ? 'Analyzing sentence frequencies & extracting key concepts...'
        : 'Parsing typography, tables & heading hierarchy...'
    );

    const startTime = Date.now();
    const timerInterval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      setElapsedSeconds(+elapsed.toFixed(1));

      setProgressPercent((prev) => {
        if (prev < 35) {
          if (runTab === 'translate') {
            setProcessingStage('Extracting text blocks & document paragraphs...');
          }
          return Math.min(prev + 4, 35);
        } else if (prev < 75) {
          if (runTab === 'translate') {
            const tName = LANGUAGES.find((l) => l.code === runLang)?.label || runLang;
            setProcessingStage(`Neural AI translating content into ${tName}...`);
          }
          return Math.min(prev + 2.5, 75);
        } else if (prev < 92) {
          if (runTab === 'translate') {
            setProcessingStage('Aligning document structure, key-values & RTL layout...');
          }
          return Math.min(prev + 1.2, 92);
        }
        return prev;
      });
    }, 120);

    try {
      if (runTab === 'summarize') {
        const res = await intelligenceApiClient.summarize({
          file: currentFile || undefined,
          text: !currentFile ? rawText.trim() : undefined,
          mode: runMode,
          password: runPassword || undefined,
        });
        if (execId !== executionIdRef.current) {
          clearInterval(timerInterval);
          return;
        }
        clearInterval(timerInterval);
        setProgressPercent(100);
        setProcessingStage('Document insights extracted successfully!');
        await new Promise((r) => setTimeout(r, 220));
        setSummaryResult(res);
      } else if (runTab === 'translate') {
        const res = await intelligenceApiClient.translate({
          file: currentFile || undefined,
          text: !currentFile ? rawText.trim() : undefined,
          targetLang: runLang,
          sourceLang: sourceLang !== 'auto' ? sourceLang : undefined,
          password: runPassword || undefined,
        });
        if (execId !== executionIdRef.current) {
          clearInterval(timerInterval);
          return;
        }
        clearInterval(timerInterval);
        setProgressPercent(100);
        setProcessingStage('Translation completed successfully!');
        await new Promise((r) => setTimeout(r, 260));
        setTranslationResult(res);
      } else if (runTab === 'markdown') {
        if (!currentFile) {
          throw new Error('Please select a PDF or DOCX file to extract Markdown structure.');
        }
        const res = await intelligenceApiClient.toMarkdown(currentFile, runPassword || undefined);
        if (execId !== executionIdRef.current) {
          clearInterval(timerInterval);
          return;
        }
        clearInterval(timerInterval);
        setProgressPercent(100);
        setProcessingStage('Markdown extracted successfully!');
        await new Promise((r) => setTimeout(r, 220));
        setMarkdownResult(res);
      }
    } catch (err: any) {
      clearInterval(timerInterval);
      if (execId !== executionIdRef.current) return;
      console.error('Document intelligence execution error:', err);
      setErrorMessage(err.message || 'Processing failed. Please check document formatting and network.');
    } finally {
      clearInterval(timerInterval);
      if (execId === executionIdRef.current) {
        setIsProcessing(false);
      }
    }
  };

  const handleCopyText = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadOutput = () => {
    const stem = currentFile?.name.replace(/\.[^/.]+$/, '') || 'document';
    if (activeTab === 'summarize' && summaryResult) {
      intelligenceApiClient.downloadText(summaryResult.summary, `${stem}_summary.txt`);
    } else if (activeTab === 'translate' && translationResult) {
      intelligenceApiClient.downloadText(
        translationResult.translated_text,
        `${stem}_translated_${targetLang}.txt`
      );
    } else if (activeTab === 'markdown' && markdownResult) {
      intelligenceApiClient.downloadText(
        markdownResult.markdown,
        `${stem}.md`,
        'text/markdown;charset=utf-8'
      );
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isProcessing) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '920px',
          maxHeight: '92vh',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#fafbfd',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563eb',
              }}
            >
              <Sparkles size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2
                  style={{
                    fontSize: '19px',
                    fontWeight: 800,
                    color: '#0f172a',
                    margin: 0,
                    letterSpacing: '-0.02em',
                  }}
                >
                  Document Intelligence Suite
                </h2>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    backgroundColor: '#ecfdf5',
                    color: '#047857',
                    border: '1px solid #a7f3d0',
                  }}
                >
                  Pure Sovereign
                </span>
              </div>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '2px 0 0 0' }}>
                Extractive summarization, structure-preserving translation & Markdown extraction.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          {[
            { id: 'summarize', label: 'Document Summarizer', icon: <Sparkles size={16} /> },
            { id: 'translate', label: 'Document Translator', icon: <Languages size={16} /> },
            { id: 'markdown', label: 'PDF to Markdown', icon: <FileCode size={16} /> },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  const nextTab = tab.id as IntelligenceTab;
                  setActiveTab(nextTab);
                  setErrorMessage(null);
                  const hasResult =
                    (nextTab === 'summarize' && summaryResult) ||
                    (nextTab === 'translate' && translationResult) ||
                    (nextTab === 'markdown' && markdownResult);
                  if (!hasResult && (currentFile || rawText.trim())) {
                    handleExecuteAction({ tab: nextTab });
                  }
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: isActive ? 700 : 500,
                  backgroundColor: isActive ? '#0f172a' : '#ffffff',
                  color: isActive ? '#ffffff' : '#475569',
                  border: isActive ? '1px solid #0f172a' : '1px solid #cbd5e1',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {/* File Selector Banner */}
          <div
            style={{
              padding: '12px 18px',
              backgroundColor: '#f1f5f9',
              borderRadius: '10px',
              border: '1px dashed #cbd5e1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileText size={20} color="#0f172a" />
              <div>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                  {currentFile ? currentFile.name : (rawText.trim() ? 'Raw Text Input' : 'No document selected')}
                </span>
                {currentFile && (
                  <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '8px' }}>
                    ({(currentFile.size / 1024).toFixed(1)} KB)
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.txt,.md"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  color: '#1e293b',
                }}
              >
                <Upload size={13} />
                <span>{currentFile ? 'Change File' : 'Select Document'}</span>
              </button>
            </div>
          </div>

          {/* Tab 1: Summarizer Controls */}
          {activeTab === 'summarize' && (
            <div
              style={{
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                  Depth:
                </span>
                {[
                  { id: 'bullets', label: 'Key Bullets (Takeaways)' },
                  { id: 'executive', label: 'Executive Summary' },
                  { id: 'digest', label: 'Full Section Digest' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => {
                      setSummaryMode(mode.id as any);
                      handleExecuteAction({ mode: mode.id as any });
                    }}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: summaryMode === mode.id ? 700 : 500,
                      backgroundColor: summaryMode === mode.id ? '#eff6ff' : '#ffffff',
                      color: summaryMode === mode.id ? '#1d4ed8' : '#64748b',
                      border: summaryMode === mode.id ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                      cursor: 'pointer',
                    }}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => handleExecuteAction({ tab: 'summarize' })}
                disabled={isProcessing || (!currentFile && !rawText.trim())}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  opacity: isProcessing ? 0.7 : 1,
                }}
              >
                {isProcessing ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                <span>Summarize Document</span>
              </button>
            </div>
          )}

          {/* Tab 2: Translator Controls */}
          {activeTab === 'translate' && (
            <div style={{ marginBottom: '16px' }}>
              {/* iLovePDF-style Accuracy Info Banner */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  backgroundColor: '#eff6ff',
                  borderRadius: '8px',
                  border: '1px solid #bfdbfe',
                  marginBottom: '14px',
                }}
              >
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  i
                </div>
                <span style={{ fontSize: '13px', color: '#1e40af', lineHeight: '1.4' }}>
                  The accuracy of translation is increased by correctly selecting the document language.
                </span>
              </div>

              {/* Language Selection Grid: From ➔ Swap ➔ To */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(180px, 1fr) auto minmax(200px, 1fr)',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '14px',
                  backgroundColor: '#f8fafc',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                }}
              >
                {/* From: Source Language */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#64748b',
                      textTransform: 'uppercase',
                      marginBottom: '6px',
                      letterSpacing: '0.05em',
                    }}
                  >
                    From:
                  </label>
                  <select
                    value={sourceLang}
                    onChange={(e) => {
                      setSourceLang(e.target.value);
                      setTranslationResult(null);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#0f172a',
                      backgroundColor: '#ffffff',
                      cursor: 'pointer',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    }}
                  >
                    <option value="auto">🌐 Auto-detect</option>
                    <option value="en">English</option>
                    <option value="ur">Urdu (اردو)</option>
                    <option value="ar">Arabic (العربية)</option>
                    {LANGUAGES.filter((l) => !['en', 'ur', 'ar'].includes(l.code)).map((l) => (
                      <option key={l.code} value={l.code}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Swap Button (⇅) */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '20px' }}>
                  <button
                    type="button"
                    title="Swap source and target languages"
                    onClick={handleSwapLanguages}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                      color: '#2563eb',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#eff6ff';
                      e.currentTarget.style.borderColor = '#93c5fd';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#ffffff';
                      e.currentTarget.style.borderColor = '#cbd5e1';
                    }}
                  >
                    <ArrowUpDown size={16} />
                  </button>
                </div>

                {/* To: Target Language */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#64748b',
                      textTransform: 'uppercase',
                      marginBottom: '6px',
                      letterSpacing: '0.05em',
                    }}
                  >
                    To:
                  </label>
                  <div ref={langDropdownRef} style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => {
                      const nextOpen = !isLangDropdownOpen;
                      setIsLangDropdownOpen(nextOpen);
                      if (nextOpen) {
                        setTimeout(() => langSearchInputRef.current?.focus(), 60);
                      }
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '7px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#0f172a',
                      backgroundColor: '#ffffff',
                      cursor: 'pointer',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                      minWidth: '210px',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Globe size={15} color="#2563eb" />
                      <span>{currentLangObj?.label || targetLang}</span>
                    </div>
                    <ChevronDown
                      size={14}
                      color="#64748b"
                      style={{
                        transform: isLangDropdownOpen ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.15s ease',
                      }}
                    />
                  </button>

                  {isLangDropdownOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 6px)',
                        left: 0,
                        width: '290px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        boxShadow: '0 12px 28px -4px rgba(0,0,0,0.12), 0 6px 12px -4px rgba(0,0,0,0.08)',
                        zIndex: 60,
                        overflow: 'hidden',
                      }}
                    >
                      {/* Top Search Input */}
                      <div
                        style={{
                          padding: '8px 12px',
                          borderBottom: '1px solid #f1f5f9',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          backgroundColor: '#f8fafc',
                        }}
                      >
                        <Search size={14} color="#94a3b8" />
                        <input
                          ref={langSearchInputRef}
                          type="text"
                          value={langSearchQuery}
                          onChange={(e) => setLangSearchQuery(e.target.value)}
                          placeholder="Search..."
                          style={{
                            border: 'none',
                            outline: 'none',
                            fontSize: '13px',
                            width: '100%',
                            backgroundColor: 'transparent',
                            color: '#0f172a',
                          }}
                        />
                        {langSearchQuery && (
                          <button
                            type="button"
                            onClick={() => setLangSearchQuery('')}
                            style={{
                              border: 'none',
                              background: 'none',
                              cursor: 'pointer',
                              color: '#94a3b8',
                              padding: 0,
                              display: 'flex',
                            }}
                          >
                            <X size={13} />
                          </button>
                        )}
                      </div>

                      {/* Languages List */}
                      <div
                        style={{
                          maxHeight: '260px',
                          overflowY: 'auto',
                          padding: '6px',
                        }}
                      >
                        {/* Pinned Urdu */}
                        {filteredPinned.length > 0 && (
                          <div>
                            <div
                              style={{
                                fontSize: '11px',
                                fontWeight: 700,
                                color: '#64748b',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                padding: '6px 8px 4px',
                              }}
                            >
                              Default / Pinned
                            </div>
                            {filteredPinned.map((lang) => {
                              const isSelected = targetLang === lang.code;
                              return (
                                <button
                                  key={lang.code}
                                  type="button"
                                  onClick={() => handleSelectLanguage(lang.code)}
                                  style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '8px 10px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    backgroundColor: isSelected ? '#eff6ff' : 'transparent',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'background-color 0.12s ease',
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!isSelected) e.currentTarget.style.backgroundColor = '#f8fafc';
                                  }}
                                  onMouseLeave={(e) => {
                                    if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span
                                      style={{
                                        fontSize: '13px',
                                        fontWeight: isSelected ? 700 : 500,
                                        color: isSelected ? '#1d4ed8' : '#0f172a',
                                      }}
                                    >
                                      {lang.label}
                                    </span>
                                    <span
                                      style={{
                                        fontSize: '10px',
                                        backgroundColor: '#dbeafe',
                                        color: '#1e40af',
                                        padding: '1px 6px',
                                        borderRadius: '4px',
                                        fontWeight: 600,
                                      }}
                                    >
                                      Pinned
                                    </span>
                                  </div>
                                  {isSelected && <Check size={14} color="#2563eb" />}
                                </button>
                              );
                            })}
                            <div style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '4px 6px' }} />
                          </div>
                        )}

                        {/* All Other Languages */}
                        {filteredOthers.length > 0 && (
                          <div>
                            <div
                              style={{
                                fontSize: '11px',
                                fontWeight: 700,
                                color: '#64748b',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                padding: '6px 8px 4px',
                              }}
                            >
                              All Languages (A–Z)
                            </div>
                            {filteredOthers.map((lang) => {
                              const isSelected = targetLang === lang.code;
                              return (
                                <button
                                  key={lang.code}
                                  type="button"
                                  onClick={() => handleSelectLanguage(lang.code)}
                                  style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '8px 10px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    backgroundColor: isSelected ? '#eff6ff' : 'transparent',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'background-color 0.12s ease',
                                  }}
                                  onMouseEnter={(e) => {
                                    if (!isSelected) e.currentTarget.style.backgroundColor = '#f8fafc';
                                  }}
                                  onMouseLeave={(e) => {
                                    if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span
                                      style={{
                                        fontSize: '13px',
                                        fontWeight: isSelected ? 700 : 500,
                                        color: isSelected ? '#1d4ed8' : '#0f172a',
                                      }}
                                    >
                                      {lang.label}
                                    </span>
                                    {lang.native && lang.native !== lang.label && (
                                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                                        {lang.native}
                                      </span>
                                    )}
                                  </div>
                                  {isSelected && <Check size={14} color="#2563eb" />}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {filteredPinned.length === 0 && filteredOthers.length === 0 && (
                          <div
                            style={{
                              padding: '16px',
                              textAlign: 'center',
                              color: '#94a3b8',
                              fontSize: '13px',
                            }}
                          >
                            No language matching &quot;{langSearchQuery}&quot;
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action row with Translate Document button */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                marginTop: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Check size={14} color="#10b981" /> Preserves document structure, key-values & layout
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleExecuteAction({ tab: 'translate', targetLangOverride: targetLang })}
                disabled={isProcessing || (!currentFile && !rawText.trim())}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 22px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 700,
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  opacity: isProcessing ? 0.75 : 1,
                  boxShadow: '0 2px 8px rgba(37, 99, 235, 0.28)',
                  transition: 'all 0.15s ease',
                }}
              >
                {isProcessing ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                <span>Translate Document ✨</span>
              </button>
            </div>
          </div>
        )}

          {/* Tab 3: Markdown Controls */}
          {activeTab === 'markdown' && (
            <div
              style={{
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Converts headings, bold highlights, lists, and tables cleanly to Markdown.
              </span>
              <button
                type="button"
                onClick={() => handleExecuteAction({ tab: 'markdown' })}
                disabled={isProcessing || !currentFile}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  backgroundColor: '#7c3aed',
                  color: '#ffffff',
                  border: 'none',
                  cursor: isProcessing || !currentFile ? 'not-allowed' : 'pointer',
                  opacity: isProcessing || !currentFile ? 0.7 : 1,
                }}
              >
                {isProcessing ? <Loader2 size={13} className="animate-spin" /> : <FileCode size={13} />}
                <span>Extract Markdown</span>
              </button>
            </div>
          )}

          {/* Error Notice with Retry or Password Unlock */}
          {errorMessage && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#991b1b',
                fontSize: '13px',
                marginBottom: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {Boolean(
                    errorMessage.toLowerCase().includes('password') ||
                      errorMessage.toLowerCase().includes('encrypted')
                  ) ? (
                    <Lock size={16} color="#991b1b" />
                  ) : (
                    <AlertCircle size={16} />
                  )}
                  <span
                    style={{
                      fontWeight:
                        errorMessage.toLowerCase().includes('password') ||
                        errorMessage.toLowerCase().includes('encrypted')
                          ? 600
                          : 400,
                    }}
                  >
                    {errorMessage}
                  </span>
                </div>
                {!Boolean(
                  errorMessage.toLowerCase().includes('password') ||
                    errorMessage.toLowerCase().includes('encrypted')
                ) && (
                  <button
                    type="button"
                    onClick={() => handleExecuteAction()}
                    style={{
                      background: 'none',
                      border: '1px solid #f87171',
                      borderRadius: '4px',
                      color: '#991b1b',
                      fontSize: '12px',
                      padding: '2px 8px',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    Retry
                  </button>
                )}
              </div>

              {/* Inline Password Unlock field for password-protected / encrypted PDFs */}
              {Boolean(
                errorMessage.toLowerCase().includes('password') ||
                  errorMessage.toLowerCase().includes('encrypted')
              ) && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    paddingTop: '6px',
                    borderTop: '1px dashed #fca5a5',
                  }}
                >
                  <input
                    type="password"
                    value={pdfPassword}
                    onChange={(e) => setPdfPassword(e.target.value)}
                    placeholder="Enter document password..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && pdfPassword.trim()) {
                        handleExecuteAction({ passwordOverride: pdfPassword });
                      }
                    }}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: '1px solid #f87171',
                      fontSize: '12px',
                      outline: 'none',
                      backgroundColor: '#ffffff',
                      color: '#0f172a',
                      flex: 1,
                      maxWidth: '260px',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleExecuteAction({ passwordOverride: pdfPassword })}
                    disabled={isProcessing || !pdfPassword.trim()}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '6px 14px',
                      borderRadius: '6px',
                      backgroundColor: '#991b1b',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: isProcessing || !pdfPassword.trim() ? 'not-allowed' : 'pointer',
                      opacity: isProcessing || !pdfPassword.trim() ? 0.6 : 1,
                    }}
                  >
                    {isProcessing ? <Loader2 size={13} className="animate-spin" /> : <Lock size={13} />}
                    <span>Unlock & Process</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Output Display Container */}
          <div
            style={{
              position: 'relative',
              minHeight: '260px',
              backgroundColor: '#fafbfd',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '18px 20px',
              fontFamily: activeTab === 'markdown' ? 'monospace' : 'inherit',
            }}
          >
            {isProcessing ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '28px 20px',
                  minHeight: '260px',
                  gap: '18px',
                  backgroundColor: '#ffffff',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                }}
              >
                {/* Header status with dynamic icon */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '50%',
                      backgroundColor: '#eff6ff',
                      border: '2px solid #bfdbfe',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 16px rgba(59, 130, 246, 0.2)',
                    }}
                  >
                    <Loader2 size={22} className="animate-spin" color="#2563eb" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                      {activeTab === 'translate'
                        ? `Translating into ${LANGUAGES.find((l) => l.code === targetLang)?.label || targetLang}`
                        : activeTab === 'summarize'
                        ? 'Extracting Document Insights'
                        : 'Converting Document to Markdown'}
                    </h3>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
                      {processingStage || 'Processing document...'}
                    </p>
                  </div>
                </div>

                {/* Progress bar container */}
                <div style={{ width: '100%', maxWidth: '520px' }}>
                  {/* Progress meta row (Percentage + Elapsed Time) */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '8px',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}
                  >
                    <span style={{ color: '#2563eb', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: '#2563eb',
                          boxShadow: '0 0 8px #2563eb',
                        }}
                      />
                      {Math.round(progressPercent)}% Processed
                    </span>
                    <span
                      style={{
                        color: '#334155',
                        backgroundColor: '#f1f5f9',
                        border: '1px solid #e2e8f0',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      <Clock size={12} color="#2563eb" />
                      Time: {elapsedSeconds < 10 ? `0${elapsedSeconds.toFixed(1)}s` : `${elapsedSeconds.toFixed(1)}s`}
                    </span>
                  </div>

                  {/* Outer Progress Track */}
                  <div
                    style={{
                      width: '100%',
                      height: '10px',
                      backgroundColor: '#e2e8f0',
                      borderRadius: '9999px',
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${progressPercent}%`,
                        background: 'linear-gradient(90deg, #2563eb 0%, #7c3aed 50%, #3b82f6 100%)',
                        borderRadius: '9999px',
                        transition: 'width 0.22s ease-out',
                        boxShadow: '0 0 12px rgba(37, 99, 235, 0.4)',
                      }}
                    />
                  </div>

                  {/* Progress 3-step pills */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 1fr',
                      gap: '8px',
                      marginTop: '14px',
                    }}
                  >
                    <div
                      style={{
                        padding: '8px 10px',
                        borderRadius: '8px',
                        backgroundColor: progressPercent >= 15 ? '#eff6ff' : '#f8fafc',
                        border: progressPercent >= 15 ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                        fontSize: '11px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: progressPercent >= 15 ? '#1d4ed8' : '#94a3b8',
                        fontWeight: 600,
                      }}
                    >
                      {progressPercent >= 35 ? (
                        <CheckCircle2 size={13} color="#2563eb" />
                      ) : (
                        <span style={{ width: '13px', textAlign: 'center' }}>1</span>
                      )}
                      <span>Parse File</span>
                    </div>

                    <div
                      style={{
                        padding: '8px 10px',
                        borderRadius: '8px',
                        backgroundColor: progressPercent >= 35 ? '#eff6ff' : '#f8fafc',
                        border: progressPercent >= 35 ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                        fontSize: '11px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: progressPercent >= 35 ? '#1d4ed8' : '#94a3b8',
                        fontWeight: 600,
                      }}
                    >
                      {progressPercent >= 90 ? (
                        <CheckCircle2 size={13} color="#2563eb" />
                      ) : progressPercent >= 35 ? (
                        <Loader2 size={13} className="animate-spin" color="#2563eb" />
                      ) : (
                        <span style={{ width: '13px', textAlign: 'center' }}>2</span>
                      )}
                      <span>AI Engine</span>
                    </div>

                    <div
                      style={{
                        padding: '8px 10px',
                        borderRadius: '8px',
                        backgroundColor: progressPercent >= 90 ? '#eff6ff' : '#f8fafc',
                        border: progressPercent >= 90 ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                        fontSize: '11px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: progressPercent >= 90 ? '#1d4ed8' : '#94a3b8',
                        fontWeight: 600,
                      }}
                    >
                      {progressPercent >= 100 ? (
                        <CheckCircle2 size={13} color="#10b981" />
                      ) : (
                        <span style={{ width: '13px', textAlign: 'center' }}>3</span>
                      )}
                      <span>Format Output</span>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    fontSize: '11px',
                    color: '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <ShieldCheck size={14} color="#10b981" />
                  <span>100% ephemeral in-memory processing • Zero AI training pledge</span>
                </div>
              </div>
            ) : !currentFile && !rawText.trim() ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '220px',
                  color: '#94a3b8',
                  gap: '12px',
                  textAlign: 'center',
                }}
              >
                <Upload size={36} color="#cbd5e1" />
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>
                  Select a document to begin
                </span>
                <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', maxWidth: '380px' }}>
                  Choose a PDF, Word (DOCX), or Text file to generate an extractive summary, translate, or extract clean Markdown.
                </p>
              </div>
            ) : (
              <>
                {/* Result header / stats bar */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '14px',
                    borderBottom: '1px solid #e2e8f0',
                    paddingBottom: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {activeTab === 'summarize' && summaryResult && (
                      <span
                        style={{
                          fontSize: '12px',
                          color: '#047857',
                          fontWeight: 600,
                          backgroundColor: '#ecfdf5',
                          padding: '2px 8px',
                          borderRadius: '6px',
                        }}
                      >
                        {summaryResult.compression_ratio}% Reduction • {summaryResult.sentence_count} Sentences
                      </span>
                    )}
                    {activeTab === 'translate' && translationResult && (
                      <span
                        style={{
                          fontSize: '12px',
                          color: '#2563eb',
                          fontWeight: 600,
                          backgroundColor: '#eff6ff',
                          padding: '2px 8px',
                          borderRadius: '6px',
                        }}
                      >
                        {translationResult.target_lang_name} • {translationResult.word_count} Words
                      </span>
                    )}
                    {activeTab === 'markdown' && markdownResult && (
                      <span
                        style={{
                          fontSize: '12px',
                          color: '#7c3aed',
                          fontWeight: 600,
                          backgroundColor: '#faf5ff',
                          padding: '2px 8px',
                          borderRadius: '6px',
                        }}
                      >
                        {markdownResult.heading_count} Headings • {markdownResult.word_count} Words
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        const content =
                          activeTab === 'summarize'
                            ? summaryResult?.summary
                            : activeTab === 'translate'
                            ? translationResult?.translated_text
                            : markdownResult?.markdown;
                        if (content) handleCopyText(content);
                      }}
                      style={{
                        padding: '5px 10px',
                        borderRadius: '6px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #cbd5e1',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#334155',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        cursor: 'pointer',
                      }}
                    >
                      {copied ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
                      <span>{copied ? 'Copied!' : 'Copy'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadOutput}
                      style={{
                        padding: '5px 12px',
                        borderRadius: '6px',
                        backgroundColor: '#0f172a',
                        border: '1px solid #0f172a',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#ffffff',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        cursor: 'pointer',
                      }}
                    >
                      <Download size={13} />
                      <span>{activeTab === 'markdown' ? 'Download .md' : 'Download'}</span>
                    </button>
                  </div>
                </div>

                {/* Content body with RTL support */}
                <div
                  dir={activeTab === 'translate' && translationResult?.is_rtl ? 'rtl' : 'ltr'}
                  className={activeTab === 'translate' && translationResult?.is_rtl ? 'font-sans' : ''}
                  style={{
                    fontSize: '14px',
                    lineHeight: 1.7,
                    color: '#1e293b',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    maxHeight: '380px',
                    overflowY: 'auto',
                    textAlign: activeTab === 'translate' && translationResult?.is_rtl ? 'right' : 'left',
                  }}
                >
                  {activeTab === 'summarize' && (summaryResult?.summary || 'No summary available.')}
                  {activeTab === 'translate' &&
                    (translationResult?.translated_text || 'No translation available.')}
                  {activeTab === 'markdown' && (markdownResult?.markdown || 'No markdown available.')}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Modal Footer: Trust & Privacy Pledge Badge */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={16} color="#059669" />
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#047857' }}>
              100% Ephemeral Processing • Aligned with Zero AI Training Pledge
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '6px 16px',
              fontSize: '13px',
              fontWeight: 600,
              backgroundColor: '#f1f5f9',
              color: '#475569',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
