'use client';

import React, { useEffect, useState } from 'react';
import { StagedFile } from '@/lib/types';
import { detectCategory, indexedDBService } from '@/lib/indexedDbService';
import { ToolActionId } from '@/components/adobe/MegaMenu';
import { ToolsGrid } from '@/components/adobe/ToolsGrid';
import { AllConvertersGrid } from '@/components/converter/AllConvertersGrid';
import { AutoRecoveryBanner } from '@/components/AutoRecoveryBanner';
import { DragDropZone } from '@/components/DragDropZone';
import { StagedFileCard } from '@/components/StagedFileCard';
import { PdfEditorWorkspace } from '@/components/pdf/PdfEditorWorkspace';
import { Trash2, Sparkles, FolderUp, LayoutGrid } from 'lucide-react';

export default function StudioHomePage() {
  const [activeCategory, setActiveCategory] = useState<'pdf' | 'media' | 'compressor'>('pdf');
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [recoverableData, setRecoverableData] = useState<{ files: StagedFile[]; savedAt: number } | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [activeNotice, setActiveNotice] = useState<string | null>(null);
  const [activeEditingPdf, setActiveEditingPdf] = useState<File | null>(null);
  const [preselectedFileId, setPreselectedFileId] = useState<string | undefined>(undefined);

  // Check for IndexedDB auto-recovery on mount
  useEffect(() => {
    async function checkRecovery() {
      try {
        const result = await indexedDBService.getRecoverableFiles();
        if (result.files.length > 0) {
          setRecoverableData({ files: result.files, savedAt: result.lastSavedAt });
        }
      } catch (err) {
        console.warn('IndexedDB check error:', err);
      }
    }
    checkRecovery();
  }, []);

  const handleFilesSelected = async (newFiles: File[]) => {
    const updated = [...stagedFiles];

    for (const f of newFiles) {
      const category = detectCategory(f);
      try {
        const id = await indexedDBService.saveFile(f, category);
        const previewUrl = category === 'image' || f.type.startsWith('image/')
          ? URL.createObjectURL(f)
          : undefined;

        updated.push({
          id,
          name: f.name,
          size: f.size,
          type: f.type,
          category,
          file: f,
          previewUrl,
          updatedAt: Date.now(),
        });
      } catch (err) {
        console.error('Failed to save file to IndexedDB:', err);
      }
    }

    setStagedFiles(updated);
  };

  const handleRemove = async (id: string) => {
    try {
      await indexedDBService.removeFile(id);
    } catch (err) {
      console.warn('Failed to remove file from IndexedDB:', err);
    }
    setStagedFiles((prev) => prev.filter((item) => item.id !== id));
    if (preselectedFileId === id) {
      setPreselectedFileId(undefined);
    }
  };

  const handleClearAll = async () => {
    try {
      await indexedDBService.clearWorkspace();
    } catch (err) {
      console.warn('Failed to clear workspace:', err);
    }
    setStagedFiles([]);
    setRecoverableData(null);
    setPreselectedFileId(undefined);
  };

  const handleRestoreSession = () => {
    if (recoverableData && recoverableData.files.length > 0) {
      setStagedFiles(recoverableData.files);
      setRecoverableData(null);
    }
  };

  const handleSelectAction = (file: StagedFile, action: string) => {
    if (action === 'edit-text' && file.category === 'pdf') {
      setActiveEditingPdf(file.file);
      return;
    }
    if (action === 'split' && file.category === 'pdf') {
      setActiveEditingPdf(file.file);
      return;
    }
    if (action === 'convert-to-pdf' || action === 'convert-media') {
      setPreselectedFileId(file.id);
      setActiveCategory(action === 'convert-to-pdf' ? 'pdf' : 'media');
      setTimeout(() => {
        const elem = document.getElementById('adobe-tools-grid') || document.getElementById('all-converters-grid');
        if (elem) elem.scrollIntoView({ behavior: 'smooth' });
      }, 50);
      return;
    }
    if (action === 'compress-image' || action === 'compress-media') {
      setPreselectedFileId(file.id);
      setActiveCategory('compressor');
      setTimeout(() => {
        const elem = document.getElementById('adobe-tools-grid');
        if (elem) elem.scrollIntoView({ behavior: 'smooth' });
      }, 50);
      return;
    }

    setActiveNotice(`Selected '${action}' on '${file.name}'. Ready for processing.`);
    setTimeout(() => setActiveNotice(null), 5000);
  };

  const handleSelectTool = (toolId: ToolActionId) => {
    if (toolId === 'all-tools') {
      setActiveCategory('pdf');
      setTimeout(() => {
        const elem = document.getElementById('all-converters-grid') || document.getElementById('adobe-tools-grid');
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
      return;
    }

    if (toolId === 'edit-pdf') {
      const pdfFile = stagedFiles.find((f) => f.category === 'pdf');
      if (pdfFile) {
        setActiveEditingPdf(pdfFile.file);
      } else {
        setActiveCategory('pdf');
        setActiveNotice('Please drag & drop or choose a PDF document above to launch the in-place editor.');
        setTimeout(() => setActiveNotice(null), 5000);
      }
      return;
    }

    if (
      toolId === 'merge-pdf' ||
      toolId === 'split-pdf' ||
      toolId === 'rotate-pdf' ||
      toolId === 'crop-pdf' ||
      toolId === 'delete-pages' ||
      toolId === 'reorder-pages' ||
      toolId === 'extract-pages' ||
      toolId === 'insert-pages' ||
      toolId === 'number-pages' ||
      toolId === 'fill-sign' ||
      toolId === 'request-signatures' ||
      toolId === 'protect-pdf' ||
      toolId === 'add-watermark'
    ) {
      setActiveCategory('pdf');
      setTimeout(() => {
        const elem = document.getElementById('adobe-tools-grid');
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
      return;
    }

    if (
      toolId === 'images-to-pdf' ||
      toolId === 'pdf-to-images' ||
      toolId === 'pdf-to-svg' ||
      toolId === 'convert-audio' ||
      toolId === 'convert-video' ||
      toolId === 'image-converter' ||
      toolId === 'video-to-audio'
    ) {
      const candidate = stagedFiles.find((f) => {
        if (toolId === 'images-to-pdf') return f.category === 'image';
        if (toolId === 'pdf-to-images' || toolId === 'pdf-to-svg') return f.category === 'pdf';
        if (toolId === 'convert-audio') return f.category === 'audio';
        if (toolId === 'convert-video') return f.category === 'video';
        if (toolId === 'image-converter') return f.category === 'image';
        if (toolId === 'video-to-audio') return f.category === 'video';
        return false;
      });
      if (candidate) {
        setPreselectedFileId(candidate.id);
      }
      setActiveCategory(toolId === 'images-to-pdf' || toolId === 'pdf-to-images' || toolId === 'pdf-to-svg' ? 'pdf' : 'media');
      setTimeout(() => {
        const elem = document.getElementById('adobe-tools-grid');
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
      return;
    }

    if (toolId.startsWith('compress')) {
      const candidate = stagedFiles.find((f) => {
        if (toolId === 'compress-image') return f.category === 'image';
        if (toolId === 'compress-video') return f.category === 'video';
        if (toolId === 'compress-audio') return f.category === 'audio';
        return f.category !== 'pdf';
      });
      if (candidate) {
        setPreselectedFileId(candidate.id);
      }
      setActiveCategory('compressor');
      setTimeout(() => {
        const elem = document.getElementById('adobe-tools-grid');
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
      return;
    }
  };

  if (activeEditingPdf) {
    return (
      <PdfEditorWorkspace
        file={activeEditingPdf}
        onBack={() => setActiveEditingPdf(null)}
      />
    );
  }

  return (
    <main style={{ flex: 1, padding: '0 32px 80px 32px' }}>
      {/* Studio Workspace Mode Selector */}
      <div
        style={{
          maxWidth: '1140px',
          margin: '24px auto 0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setActiveCategory('pdf')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 inline-flex items-center gap-1.5 ${
              activeCategory === 'pdf'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white/80 text-slate-600 hover:bg-slate-100'
            }`}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              border: activeCategory === 'pdf' ? '1px solid #0f172a' : '1px solid #e2e8f0',
              backgroundColor: activeCategory === 'pdf' ? '#0f172a' : 'rgba(255, 255, 255, 0.8)',
              color: activeCategory === 'pdf' ? '#ffffff' : '#475569',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: activeCategory === 'pdf' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            <LayoutGrid size={15} /> PDF Solutions
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('media')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 inline-flex items-center gap-1.5 ${
              activeCategory === 'media'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white/80 text-slate-600 hover:bg-slate-100'
            }`}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              border: activeCategory === 'media' ? '1px solid #0f172a' : '1px solid #e2e8f0',
              backgroundColor: activeCategory === 'media' ? '#0f172a' : 'rgba(255, 255, 255, 0.8)',
              color: activeCategory === 'media' ? '#ffffff' : '#475569',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: activeCategory === 'media' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            <FolderUp size={15} /> Media Engine
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('compressor')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 inline-flex items-center gap-1.5 ${
              activeCategory === 'compressor'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white/80 text-slate-600 hover:bg-slate-100'
            }`}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              border: activeCategory === 'compressor' ? '1px solid #0f172a' : '1px solid #e2e8f0',
              backgroundColor: activeCategory === 'compressor' ? '#0f172a' : 'rgba(255, 255, 255, 0.8)',
              color: activeCategory === 'compressor' ? '#ffffff' : '#475569',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: activeCategory === 'compressor' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            <Sparkles size={15} /> Smart Compressor
          </button>
        </div>

        {stagedFiles.length > 0 && (
          <div
            style={{
              fontSize: '12px',
              color: '#0f172a',
              backgroundColor: '#f1f5f9',
              border: '1px solid #cbd5e1',
              padding: '4px 10px',
              borderRadius: '12px',
              fontWeight: 700,
            }}
          >
            {stagedFiles.length} staged file{stagedFiles.length > 1 ? 's' : ''}
          </div>
        )}
      </div>
        {/* Floating Auto-Recovery Banner */}
        {recoverableData && !bannerDismissed && stagedFiles.length === 0 && (
          <AutoRecoveryBanner
            count={recoverableData.files.length}
            lastSavedAt={recoverableData.savedAt}
            onRestore={handleRestoreSession}
            onClear={handleClearAll}
            onDismiss={() => setBannerDismissed(true)}
          />
        )}

        {/* Transient Notice Toast */}
        {activeNotice && (
          <div style={{
            maxWidth: '1140px',
            margin: '20px auto 0 auto',
            padding: '12px 20px',
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            color: '#166534',
            fontSize: '14px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <Sparkles size={18} />
            {activeNotice}
          </div>
        )}

        {/* Adobe Acrobat Online Hero Banner (Creed-Tech Branded) */}
        <section style={{ maxWidth: '1140px', margin: '48px auto 20px auto', textAlign: 'center' }}>
          <h2 style={{
            fontSize: '38px',
            fontWeight: 800,
            color: '#0f172a',
            letterSpacing: '-0.035em',
            lineHeight: 1.2,
            marginBottom: '14px',
          }}>
            Do your best work online with Creed-Tech Studio
          </h2>
          <p style={{
            fontSize: '17px',
            color: '#475569',
            maxWidth: '720px',
            margin: '0 auto',
            lineHeight: 1.6,
          }}>
            Instant in-place PDF editing, universal media conversion, and lossless compression without registration. 100% stateless and private.
          </p>
        </section>

        {/* Drag & Drop Staging Launcher */}
        <DragDropZone onFilesSelected={handleFilesSelected} />

        {/* Staged Files Workspace Section */}
        {stagedFiles.length > 0 && (
          <section style={{ maxWidth: '1140px', margin: '36px auto 0 auto' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
                  Staged Workspace Files
                </h3>
                <span style={{
                  fontSize: '12px',
                  color: '#0f172a',
                  backgroundColor: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  padding: '3px 10px',
                  borderRadius: '12px',
                  fontWeight: 700,
                }}>
                  {stagedFiles.length}
                </span>
              </div>

              <button
                onClick={handleClearAll}
                className="btn btn-secondary"
                style={{ padding: '8px 16px', fontSize: '13px' }}
              >
                <Trash2 size={14} />
                Clear Workspace
              </button>
            </div>

            <div>
              {stagedFiles.map((file) => (
                <StagedFileCard
                  key={file.id}
                  stagedFile={file}
                  onRemove={handleRemove}
                  onSelectAction={handleSelectAction}
                />
              ))}
            </div>
          </section>
        )}

        {/* 23 Adobe Acrobat Online Converters (Creed-Tech) */}
        {activeCategory === 'pdf' && <AllConvertersGrid />}

        {/* Adobe-Style Categorized Tools Grid */}
        <ToolsGrid
          categoryFilter={activeCategory}
          onSelectTool={handleSelectTool}
          onOpenEditor={(file) => setActiveEditingPdf(file)}
          stagedPdfFile={stagedFiles.find((f) => f.category === 'pdf')?.file || null}
        />
      </main>
  );
}
