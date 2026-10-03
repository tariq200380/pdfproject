'use client';

import React, { useEffect, useState } from 'react';
import { StagedFile } from '@/lib/types';
import { detectCategory, indexedDBService } from '@/lib/indexedDbService';
import { ToolActionId } from '@/components/adobe/MegaMenu';
import { ToolsGrid, ToolsGridFilter } from '@/components/adobe/ToolsGrid';
import { AllConvertersGrid } from '@/components/converter/AllConvertersGrid';
import { AutoRecoveryBanner } from '@/components/AutoRecoveryBanner';
import { DragDropZone } from '@/components/DragDropZone';
import { DynamicHeroDropzone } from '@/components/DynamicHeroDropzone';
import { StagedFileCard } from '@/components/StagedFileCard';
import { PdfEditorWorkspace } from '@/components/pdf/PdfEditorWorkspace';
import { CompressPdfModal } from '@/components/compressor/CompressPdfModal';
import {
  Trash2,
  Sparkles,
  FolderUp,
  LayoutGrid,
  Layers,
  FileText,
  ShieldCheck,
  TrendingDown,
  Video,
} from 'lucide-react';
import { useHeroTab, HeroTabId } from '@/context/HeroTabContext';

export default function StudioHomePage() {
  const { activeTab, selectTab } = useHeroTab();
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [recoverableData, setRecoverableData] = useState<{ files: StagedFile[]; savedAt: number } | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [activeNotice, setActiveNotice] = useState<string | null>(null);
  const [activeEditingPdf, setActiveEditingPdf] = useState<File | null>(null);
  const [activeCompressPdf, setActiveCompressPdf] = useState<File | null>(null);
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
      selectTab(action === 'convert-to-pdf' ? 'convert' : 'media');
      setTimeout(() => {
        const elem = document.getElementById('adobe-tools-grid') || document.getElementById('all-converters-grid');
        if (elem) elem.scrollIntoView({ behavior: 'smooth' });
      }, 50);
      return;
    }
    if (action === 'compress' || action === 'compress-pdf') {
      if (file.category === 'pdf') {
        setActiveCompressPdf(file.file);
        return;
      }
    }
    if (action === 'compress-image' || action === 'compress-media') {
      setPreselectedFileId(file.id);
      selectTab('compress');
      setTimeout(() => {
        const elem = document.getElementById('adobe-tools-grid');
        if (elem) elem.scrollIntoView({ behavior: 'smooth' });
      }, 50);
      return;
    }

    setActiveNotice(`Selected '${action}' on '${file.name}'. Ready for processing.`);
    setTimeout(() => setActiveNotice(null), 5000);
  };

  const handleSelectTool = (toolId: any, explicitFile?: File) => {
    const fileToUse = explicitFile || stagedFiles.find((f) => f.category === 'pdf')?.file || stagedFiles[0]?.file;

    if (toolId === 'all-tools') {
      selectTab('convert');
      setTimeout(() => {
        const elem = document.getElementById('all-converters-grid') || document.getElementById('adobe-tools-grid');
        if (elem) elem.scrollIntoView({ behavior: 'smooth' });
      }, 50);
      return;
    }

    if (toolId === 'edit-pdf') {
      if (fileToUse) {
        setActiveEditingPdf(fileToUse);
      } else {
        selectTab('edit');
        setActiveNotice('Please choose or drop a PDF document above to launch the editor.');
        setTimeout(() => setActiveNotice(null), 5000);
      }
      return;
    }

    if (
      toolId === 'compress-pdf' ||
      (typeof toolId === 'string' && toolId.startsWith('compress') && fileToUse && fileToUse.name.toLowerCase().endsWith('.pdf'))
    ) {
      if (fileToUse) {
        setActiveCompressPdf(fileToUse);
      } else {
        selectTab('compress');
        setActiveNotice('Please choose or drop a PDF file above to compress.');
        setTimeout(() => setActiveNotice(null), 5000);
      }
      return;
    }

    // Trigger tool modal with file preloaded
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('creed-open-tool', {
          detail: { toolId, category: activeTab, file: fileToUse },
        })
      );
    }

    setTimeout(() => {
      const elem = document.getElementById('adobe-tools-grid');
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
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

      {/* Smallpdf Style Dynamic Hero Dropzone (Top-most hero) */}
      <DynamicHeroDropzone
        onFilesSelected={handleFilesSelected}
        onSelectTool={handleSelectTool}
        onOpenEditor={(file) => setActiveEditingPdf(file)}
      />

      {/* Studio Workspace Category Navigation */}
      <div
        style={{
          maxWidth: '1140px',
          margin: '40px auto 0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'convert', label: 'PDF Converters', icon: <FolderUp size={15} /> },
            { id: 'compress', label: 'Compress', icon: <TrendingDown size={15} /> },
            { id: 'merge', label: 'Merge & Organize', icon: <Layers size={15} /> },
            { id: 'edit', label: 'Edit PDF', icon: <FileText size={15} /> },
            { id: 'sign', label: 'Sign & Protect', icon: <ShieldCheck size={15} /> },
            { id: 'media', label: 'Media Engine', icon: <Video size={15} /> },
          ].map((item) => {
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => selectTab(item.id as HeroTabId)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 700,
                  border: isSelected ? '1px solid #0f172a' : '1px solid #e2e8f0',
                  backgroundColor: isSelected ? '#0f172a' : 'rgba(255, 255, 255, 0.8)',
                  color: isSelected ? '#ffffff' : '#475569',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: isSelected ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {item.icon} {item.label}
              </button>
            );
          })}
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

        {/* Staged Files Workspace Section */}
        {stagedFiles.length > 0 && (
          <section style={{ maxWidth: '1140px', margin: '36px auto 0 auto' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}>
              <div>
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
                <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
                  Your file is ready. Select an action below to convert, edit, or compress.
                </p>
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
        {(activeTab === 'convert' || activeTab === 'office') && <AllConvertersGrid />}

        {/* Adobe-Style Categorized Tools Grid */}
        <ToolsGrid
          categoryFilter={
            activeTab === 'convert' || activeTab === 'office'
              ? 'convert'
              : activeTab === 'compress'
              ? 'compress'
              : activeTab === 'merge'
              ? 'merge'
              : activeTab === 'edit'
              ? 'edit'
              : activeTab === 'sign'
              ? 'sign'
              : activeTab === 'media'
              ? 'media'
              : 'all'
          }
          onSelectTool={handleSelectTool}
          onOpenEditor={(file) => setActiveEditingPdf(file)}
          stagedPdfFile={stagedFiles.find((f) => f.category === 'pdf')?.file || stagedFiles[0]?.file || null}
        />

        {/* Global Compress PDF Modal with Basic vs Strong Options */}
        <CompressPdfModal
          isOpen={!!activeCompressPdf}
          file={activeCompressPdf}
          onClose={() => setActiveCompressPdf(null)}
        />
      </main>
  );
}
