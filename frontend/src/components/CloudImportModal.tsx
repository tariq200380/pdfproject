'use client';

import React, { useState } from 'react';
import { X, ExternalLink, Link2, Download, AlertCircle, Loader2, ClipboardCheck, Sparkles } from 'lucide-react';

export type CloudServiceType = 'google_drive' | 'dropbox' | 'onedrive';

interface CloudServiceConfig {
  id: CloudServiceType;
  name: string;
  brandColor: string;
  webUrl: string;
  placeholder: string;
  helpTip: string;
  sampleUrl: string;
  sampleName: string;
  icon: React.ReactNode;
}

const CLOUD_CONFIGS: Record<CloudServiceType, CloudServiceConfig> = {
  google_drive: {
    id: 'google_drive',
    name: 'Google Drive',
    brandColor: '#0066da',
    webUrl: 'https://drive.google.com',
    placeholder: 'https://drive.google.com/file/d/.../view?usp=sharing',
    helpTip: "Right-click file in Google Drive → Share → Copy link. Ensure access is set to 'Anyone with the link'.",
    sampleUrl: 'https://pdfobject.com/pdf/sample.pdf',
    sampleName: 'Sample-Report.pdf',
    icon: (
      <svg width="24" height="24" viewBox="0 0 87.3 78" fill="none">
        <path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
        <path d="M43.65 25L29.9 1.2c-1.35.8-2.5 1.9-3.3 3.3L1.2 49.35c-.8 1.4-1.2 2.95-1.2 4.5h27.5z" fill="#00ac47"/>
        <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5H59.8l5.85 10.15z" fill="#ea4335"/>
        <path d="M43.65 25L57.4 1.2C56.05.4 54.5 0 52.9 0H34.4c-1.6 0-3.15.4-4.5 1.2z" fill="#00832d"/>
        <path d="M59.8 49.95H27.5L13.75 73.75c1.35.8 2.9 1.25 4.5 1.25h50.8c1.6 0 3.15-.45 4.5-1.25z" fill="#2684fc"/>
        <path d="M73.4 26.5l-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25l16.15 24.95H87.3c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
      </svg>
    ),
  },
  dropbox: {
    id: 'dropbox',
    name: 'Dropbox',
    brandColor: '#0061ff',
    webUrl: 'https://www.dropbox.com',
    placeholder: 'https://www.dropbox.com/s/.../document.pdf?dl=0',
    helpTip: "Click 'Share' on your Dropbox document → Click 'Copy link'.",
    sampleUrl: 'https://pdfobject.com/pdf/sample.pdf',
    sampleName: 'Dropbox-Sample.pdf',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="#0061ff">
        <path d="M6 2l6 3.9-6 4-6-4zm12 0l6 3.9-6 4-6-4zm-12 11.9l6-4-6-3.9-6 3.9zm12 0l6-4-6-3.9-6 3.9zm-6 1.1l-6 4 6 4 6-4z"/>
      </svg>
    ),
  },
  onedrive: {
    id: 'onedrive',
    name: 'OneDrive',
    brandColor: '#0078d4',
    webUrl: 'https://onedrive.live.com',
    placeholder: 'https://1drv.ms/b/s!... or https://...onedrive.live.com/...',
    helpTip: "Select file in OneDrive → Click 'Share' → Click 'Copy link' with view access.",
    sampleUrl: 'https://pdfobject.com/pdf/sample.pdf',
    sampleName: 'OneDrive-Sample.pdf',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" fill="#0078d4"/>
      </svg>
    ),
  },
};

interface CloudImportModalProps {
  isOpen: boolean;
  service: CloudServiceType;
  onClose: () => void;
  onFileImported: (file: File) => void;
}

export const CloudImportModal: React.FC<CloudImportModalProps> = ({
  isOpen,
  service,
  onClose,
  onFileImported,
}) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const config = CLOUD_CONFIGS[service] || CLOUD_CONFIGS.google_drive;

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text.trim());
        setErrorMessage(null);
      }
    } catch {
      // Clipboard permissions may fail in some browsers
    }
  };

  const handleImport = async (targetUrl?: string) => {
    const importUrl = (targetUrl || url).trim();
    if (!importUrl) {
      setErrorMessage('Please enter or paste a valid file link.');
      return;
    }

    if (!importUrl.startsWith('http://') && !importUrl.startsWith('https://')) {
      setErrorMessage('Link must start with http:// or https://');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/cloud/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: importUrl,
          service: config.id,
        }),
      });

      if (!res.ok) {
        let errDetail = 'Failed to download file from cloud provider.';
        try {
          const errData = await res.json();
          if (errData && errData.detail) errDetail = errData.detail;
        } catch {
          // Response was not JSON
        }
        throw new Error(errDetail);
      }

      // Extract filename from header
      let filename = res.headers.get('x-imported-filename');
      if (!filename) {
        const disposition = res.headers.get('content-disposition');
        if (disposition && disposition.includes('filename=')) {
          const parts = disposition.split('filename=');
          filename = parts[1].replace(/["']/g, '').trim();
        }
      }
      if (!filename) {
        filename = `${config.name.toLowerCase().replace(/\s+/g, '-')}-file.pdf`;
      }

      const blob = await res.blob();
      const file = new File([blob], filename, {
        type: blob.type || 'application/pdf',
        lastModified: Date.now(),
      });

      onFileImported(file);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to import file. Please check link permissions.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '540px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: '1px solid #f1f5f9',
            backgroundColor: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {config.icon}
            </div>
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#0f172a',
                  lineHeight: 1.2,
                }}
              >
                Import from {config.name}
              </h3>
              <p
                style={{
                  margin: '4px 0 0 0',
                  fontSize: '13px',
                  color: '#64748b',
                }}
              >
                Upload directly from your {config.name} account
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px' }}>
          {/* Quick link to open web drive in new tab */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              backgroundColor: '#f8fafc',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              marginBottom: '20px',
            }}
          >
            <span style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}>
              Need to grab your file link?
            </span>
            <a
              href={config.webUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '13px',
                fontWeight: 600,
                color: config.brandColor,
                textDecoration: 'none',
              }}
            >
              <span>Open {config.name}</span>
              <ExternalLink size={14} />
            </a>
          </div>

          {/* Help Tip */}
          <div
            style={{
              fontSize: '12.5px',
              color: '#64748b',
              marginBottom: '10px',
              lineHeight: 1.5,
              display: 'flex',
              alignItems: 'flex-start',
              gap: '6px',
            }}
          >
            <span style={{ color: config.brandColor, fontWeight: 700 }}>•</span>
            <span>{config.helpTip}</span>
          </div>

          {/* URL Input Box */}
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <div
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Link2 size={18} />
            </div>
            <input
              type="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setErrorMessage(null);
              }}
              placeholder={config.placeholder}
              style={{
                width: '100%',
                padding: '12px 90px 12px 42px',
                fontSize: '14px',
                borderRadius: '10px',
                border: errorMessage ? '1px solid #ef4444' : '1px solid #cbd5e1',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.15s ease',
              }}
              onFocus={(e) => (e.target.style.borderColor = config.brandColor)}
              onBlur={(e) => (e.target.style.borderColor = errorMessage ? '#ef4444' : '#cbd5e1')}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleImport();
                }
              }}
            />
            <button
              type="button"
              onClick={handlePasteClipboard}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: '#f1f5f9',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                padding: '5px 10px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#475569',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <ClipboardCheck size={13} />
              <span>Paste</span>
            </button>
          </div>

          {/* Error message */}
          {errorMessage && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                color: '#b91c1c',
                fontSize: '13px',
                marginBottom: '16px',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Actions */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              marginTop: '20px',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setUrl(config.sampleUrl);
                handleImport(config.sampleUrl);
              }}
              disabled={isLoading}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '13px',
                color: '#64748b',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 0',
              }}
              title="Test the flow with a sample document"
            >
              <Sparkles size={14} color="#f59e0b" />
              <span>Try with sample file</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                style={{
                  padding: '10px 18px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#475569',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleImport()}
                disabled={isLoading}
                style={{
                  padding: '10px 22px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: config.brandColor,
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.75 : 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: `0 4px 12px ${config.brandColor}40`,
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Importing...</span>
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    <span>Import & Load File</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
