'use client';

import React, { useEffect, useState } from 'react';
import { PageInfo, PDFMetadata, TextSpan, pdfApiClient } from '@/lib/pdfApiClient';
import { EditorToolbar } from './EditorToolbar';
import { PageSidebar } from './PageSidebar';
import { PdfCanvas } from './PdfCanvas';
import { InPlaceEditPopover } from './InPlaceEditPopover';
import { Loader2, Sparkles } from 'lucide-react';

interface PdfEditorWorkspaceProps {
  file: File;
  onBack: () => void;
}

export const PdfEditorWorkspace: React.FC<PdfEditorWorkspaceProps> = ({ file, onBack }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<PDFMetadata | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [spans, setSpans] = useState<TextSpan[]>([]);
  const [selectedSpan, setSelectedSpan] = useState<TextSpan | null>(null);
  const [zoom, setZoom] = useState(1.0);
  const [timestamp, setTimestamp] = useState(Date.now());
  const [notice, setNotice] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize session by inspecting PDF
  useEffect(() => {
    async function initSession() {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const inspectRes = await pdfApiClient.inspectPdf(file);
        setSessionId(inspectRes.session_id);
        setMetadata(inspectRes.metadata);

        // Load spans for page 0
        if (inspectRes.metadata.page_count > 0) {
          const spansRes = await pdfApiClient.getPageSpans(inspectRes.session_id, 0);
          setSpans(spansRes.spans);
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to initialize PDF session');
      } finally {
        setIsLoading(false);
      }
    }
    initSession();
  }, [file]);

  // Load spans when page changes
  const handleSelectPage = async (pageIdx: number) => {
    if (!sessionId) return;
    setCurrentPageIndex(pageIdx);
    setSelectedSpan(null);
    try {
      const spansRes = await pdfApiClient.getPageSpans(sessionId, pageIdx);
      setSpans(spansRes.spans);
    } catch (err) {
      console.warn('Failed to load spans for page', pageIdx, err);
    }
  };

  // Apply in-place text edit
  const handleApplyEdit = async (replacementText: string, fontSize?: number, colorHex?: string) => {
    if (!sessionId || !selectedSpan) return;

    await pdfApiClient.editTextInPlace({
      session_id: sessionId,
      page_index: currentPageIndex,
      span_id: selectedSpan.span_id,
      replacement_text: replacementText,
      font_size: fontSize,
      color_hex: colorHex,
    });

    // Refresh page canvas and span map
    setTimestamp(Date.now());
    const spansRes = await pdfApiClient.getPageSpans(sessionId, currentPageIndex);
    setSpans(spansRes.spans);

    setNotice(`Replaced "${selectedSpan.text}" with "${replacementText}" seamlessly in-place.`);
    setTimeout(() => setNotice(null), 5000);
  };

  // Rotate current page 90 degrees
  const handleRotatePage = async () => {
    if (!metadata) return;
    // Client-side rotation state update
    const updatedPages = [...metadata.pages];
    updatedPages[currentPageIndex].rotation = (updatedPages[currentPageIndex].rotation + 90) % 360;
    setMetadata({ ...metadata, pages: updatedPages });
    setTimestamp(Date.now());
    setNotice(`Page ${currentPageIndex + 1} rotated 90°`);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleDownload = () => {
    if (!sessionId) return;
    const downloadUrl = pdfApiClient.getDownloadUrl(sessionId);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `edited_${file.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        gap: '14px',
      }}>
        <Loader2 size={32} color="#0f172a" className="animate-spin" />
        <div style={{ fontSize: '15px', fontWeight: 500, color: '#0f172a' }}>
          Parsing document geometry & extracting typography...
        </div>
      </div>
    );
  }

  if (errorMsg || !sessionId || !metadata) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        gap: '14px',
        padding: '24px',
      }}>
        <div style={{ color: '#b91c1c', fontSize: '16px', fontWeight: 600 }}>
          {errorMsg || 'Failed to load PDF document'}
        </div>
        <button onClick={onBack} className="btn btn-secondary">
          Return to Workspace
        </button>
      </div>
    );
  }

  const currentPageInfo = metadata.pages[currentPageIndex];

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
      {/* Top Toolbar */}
      <EditorToolbar
        documentTitle={file.name}
        pageCount={metadata.page_count}
        currentPage={currentPageIndex + 1}
        zoom={zoom}
        onZoomChange={setZoom}
        onRotatePage={handleRotatePage}
        onDownload={handleDownload}
        onBack={onBack}
      />

      {/* Main Workspace Layout */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Page Thumbnail Sidebar */}
        <PageSidebar
          sessionId={sessionId}
          pages={metadata.pages}
          currentPageIndex={currentPageIndex}
          timestamp={timestamp}
          onSelectPage={handleSelectPage}
        />

        {/* Canvas Area */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
        }}>
          {notice && (
            <div style={{
              position: 'sticky',
              top: '0',
              padding: '8px 16px',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '6px',
              color: '#166534',
              fontSize: '13px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px',
              zIndex: 50,
            }}>
              <Sparkles size={14} />
              {notice}
            </div>
          )}

          <PdfCanvas
            sessionId={sessionId}
            pageInfo={currentPageInfo}
            spans={spans}
            zoom={zoom}
            timestamp={timestamp}
            selectedSpan={selectedSpan}
            onSelectSpan={(span) => setSelectedSpan(span)}
          />
        </div>
      </div>

      {/* In-Place Editing Popover */}
      {selectedSpan && (
        <InPlaceEditPopover
          span={selectedSpan}
          onApply={handleApplyEdit}
          onClose={() => setSelectedSpan(null)}
        />
      )}
    </div>
  );
};
