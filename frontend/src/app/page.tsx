'use client';

import React, { useEffect, useState } from 'react';
import { ActiveStudioTab, StagedFile } from '@/lib/types';
import { detectCategory, indexedDBService } from '@/lib/indexedDbService';
import { Header } from '@/components/Header';
import { AutoRecoveryBanner } from '@/components/AutoRecoveryBanner';
import { DragDropZone } from '@/components/DragDropZone';
import { StagedFileCard } from '@/components/StagedFileCard';
import { PdfEditorWorkspace } from '@/components/pdf/PdfEditorWorkspace';
import { MediaConverterWorkspace } from '@/components/converter/MediaConverterWorkspace';
import { SmartCompressorWorkspace } from '@/components/compressor/SmartCompressorWorkspace';
import { Trash2, Sparkles, Shield, RefreshCw, FileText } from 'lucide-react';

export default function StudioHomePage() {
  const [activeTab, setActiveTab] = useState<ActiveStudioTab>('pdf');
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
      setActiveTab('converter');
      return;
    }
    if (action === 'compress-image' || action === 'compress-media') {
      setPreselectedFileId(file.id);
      setActiveTab('compressor');
      return;
    }

    setActiveNotice(`Selected '${action}' on '${file.name}'. Ready for processing.`);
    setTimeout(() => setActiveNotice(null), 5000);
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
        }}
        stagedCount={stagedFiles.length}
      />

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
            maxWidth: '1100px',
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

        {/* Tab-driven View */}
        {activeTab === 'converter' && (
          <MediaConverterWorkspace
            stagedFiles={stagedFiles}
            initialFileId={preselectedFileId}
            onBack={() => setActiveTab('pdf')}
          />
        )}

        {activeTab === 'compressor' && (
          <SmartCompressorWorkspace
            stagedFiles={stagedFiles}
            initialFileId={preselectedFileId}
            onBack={() => setActiveTab('pdf')}
          />
        )}

        {activeTab === 'pdf' && (
          <>
            {/* Drag & Drop Staging Area */}
            <DragDropZone onFilesSelected={handleFilesSelected} />

            {/* Staged Files Section */}
            {stagedFiles.length > 0 && (
              <section style={{ maxWidth: '1100px', margin: '32px auto 0 auto' }}>
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

            {/* Feature Highlights Grid */}
            {stagedFiles.length === 0 && (
              <section style={{
                maxWidth: '1100px',
                margin: '48px auto 0 auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '24px',
              }}>
                <div className="solid-card" style={{ padding: '32px' }}>
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '10px',
                    backgroundColor: '#fee2e2',
                    color: '#b91c1c',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '18px',
                    boxShadow: '0 2px 4px rgba(185, 28, 28, 0.08)',
                  }}>
                    <FileText size={22} />
                  </div>
                  <h4 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', marginBottom: '8px', letterSpacing: '-0.015em' }}>
                    Seamless In-Place PDF Editor
                  </h4>
                  <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', margin: 0 }}>
                    Click directly on PDF text to edit in-place. Automatically extracts original font family, size, baseline, and color so edits blend imperceptibly.
                  </p>
                </div>

                <div className="solid-card" style={{ padding: '32px' }}>
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '10px',
                    backgroundColor: '#e0f2fe',
                    color: '#0369a1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '18px',
                    boxShadow: '0 2px 4px rgba(3, 105, 161, 0.08)',
                  }}>
                    <RefreshCw size={22} />
                  </div>
                  <h4 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', marginBottom: '8px', letterSpacing: '-0.015em' }}>
                    Universal Media Converters
                  </h4>
                  <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', margin: 0 }}>
                    Convert across MP3, WAV, AAC, FLAC, OGG, and transcode video containers (MP4, MKV, AVI, WEBM, MOV) with hardware-accelerated FFmpeg.
                  </p>
                </div>

                <div className="solid-card" style={{ padding: '32px' }}>
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '10px',
                    backgroundColor: '#ecfdf5',
                    color: '#047857',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '18px',
                    boxShadow: '0 2px 4px rgba(4, 120, 87, 0.08)',
                  }}>
                    <Shield size={22} />
                  </div>
                  <h4 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', marginBottom: '8px', letterSpacing: '-0.015em' }}>
                    Stateless & Auto-Recoverable
                  </h4>
                  <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', margin: 0 }}>
                    Zero registration or tracking. Active files are cached in your browser IndexedDB with a 3-hour auto-recovery TTL so accidental closes never lose your work.
                  </p>
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
