'use client';

import React, { useState } from 'react';
import { TextSpan } from '@/lib/pdfApiClient';
import { Check, X, Type, Palette, Loader2 } from 'lucide-react';

interface InPlaceEditPopoverProps {
  span: TextSpan;
  onApply: (replacementText: string, fontSize?: number, colorHex?: string) => Promise<void>;
  onClose: () => void;
}

export const InPlaceEditPopover: React.FC<InPlaceEditPopoverProps> = ({
  span,
  onApply,
  onClose,
}) => {
  const [replacementText, setReplacementText] = useState(span.text);
  const [fontSize, setFontSize] = useState<number>(span.font_size);
  const [colorHex, setColorHex] = useState<string>(span.color_hex);
  const [isApplying, setIsApplying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replacementText.trim()) return;

    setIsApplying(true);
    setErrorMsg(null);
    try {
      await onApply(replacementText, fontSize, colorHex);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to replace text in place');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '380px',
        backgroundColor: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: '10px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
        zIndex: 100,
        padding: '18px',
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '14px',
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '10px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Type size={16} color="#0f172a" />
          <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
            Seamless In-Place Text Editor
          </h4>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
        >
          <X size={16} />
        </button>
      </div>

      {errorMsg && (
        <div style={{
          padding: '8px 12px',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '6px',
          color: '#b91c1c',
          fontSize: '12px',
          marginBottom: '12px',
        }}>
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Original Text Reference */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Original Text (Matched)
          </label>
          <div style={{
            padding: '6px 10px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#475569',
            marginTop: '4px',
            wordBreak: 'break-word',
          }}>
            "{span.text}"
          </div>
        </div>

        {/* Replacement Text Field */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '11px', fontWeight: 600, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Replacement Text
          </label>
          <input
            type="text"
            value={replacementText}
            onChange={(e) => setReplacementText(e.target.value)}
            autoFocus
            style={{
              width: '100%',
              padding: '8px 10px',
              fontSize: '13px',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              marginTop: '4px',
              outline: 'none',
              color: '#0f172a',
            }}
          />
        </div>

        {/* Matched Typography Controls */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
          marginBottom: '16px',
          padding: '10px',
          backgroundColor: '#f8fafc',
          borderRadius: '6px',
          border: '1px solid #e2e8f0',
        }}>
          <div>
            <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>
              Font Size (pt)
            </label>
            <input
              type="number"
              step="0.5"
              value={fontSize}
              onChange={(e) => setFontSize(parseFloat(e.target.value) || span.font_size)}
              style={{
                width: '100%',
                padding: '5px 8px',
                fontSize: '12px',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                backgroundColor: '#ffffff',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '4px' }}>
              Color
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input
                type="color"
                value={colorHex}
                onChange={(e) => setColorHex(e.target.value)}
                style={{
                  width: '28px',
                  height: '28px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  padding: '1px',
                  cursor: 'pointer',
                }}
              />
              <span style={{ fontSize: '11px', color: '#475569', fontFamily: 'monospace' }}>
                {colorHex}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isApplying || !replacementText.trim()}
            className="btn btn-primary"
            style={{ padding: '6px 14px', fontSize: '12px' }}
          >
            {isApplying ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                Applying...
              </>
            ) : (
              <>
                <Check size={13} />
                Apply In-Place
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
