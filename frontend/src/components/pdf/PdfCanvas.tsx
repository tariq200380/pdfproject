'use client';

import React, { useRef, useState, useEffect } from 'react';
import { PageInfo, TextSpan, pdfApiClient } from '@/lib/pdfApiClient';

interface PdfCanvasProps {
  sessionId: string;
  pageInfo: PageInfo;
  spans: TextSpan[];
  zoom: number;
  timestamp: number;
  selectedSpan: TextSpan | null;
  onSelectSpan: (span: TextSpan) => void;
}

export const PdfCanvas: React.FC<PdfCanvasProps> = ({
  sessionId,
  pageInfo,
  spans,
  zoom,
  timestamp,
  selectedSpan,
  onSelectSpan,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [scale, setScale] = useState<number>(1.0);
  const [hoveredSpan, setHoveredSpan] = useState<TextSpan | null>(null);

  // Compute displayed scale when image or zoom changes
  const updateScale = () => {
    if (imgRef.current && pageInfo.width > 0) {
      const displayedWidth = imgRef.current.clientWidth;
      setScale(displayedWidth / pageInfo.width);
    }
  };

  useEffect(() => {
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [pageInfo, zoom]);

  const baseWidth = Math.min(800, pageInfo.width);
  const canvasWidth = baseWidth * zoom;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: `${canvasWidth}px`,
        margin: '0 auto',
        backgroundColor: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: '4px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
        userSelect: 'none',
      }}
    >
      {/* High-Resolution Rendered PDF Page Background */}
      <img
        ref={imgRef}
        src={pdfApiClient.getThumbnailUrl(sessionId, pageInfo.page_index, timestamp)}
        alt={`Page ${pageInfo.page_number}`}
        onLoad={updateScale}
        style={{
          width: '100%',
          display: 'block',
          borderRadius: '4px',
        }}
      />

      {/* Coordinate-Matched Text Span Interactive Overlay */}
      {spans.map((span) => {
        const isSelected = selectedSpan?.span_id === span.span_id;
        const isHovered = hoveredSpan?.span_id === span.span_id;

        const left = span.bbox[0] * scale;
        const top = span.bbox[1] * scale;
        const width = (span.bbox[2] - span.bbox[0]) * scale;
        const height = (span.bbox[3] - span.bbox[1]) * scale;

        return (
          <div
            key={span.span_id}
            onClick={() => onSelectSpan(span)}
            onMouseEnter={() => setHoveredSpan(span)}
            onMouseLeave={() => setHoveredSpan(null)}
            title={`Click to edit: "${span.text}" (${span.font_name}, ${span.font_size}pt)`}
            style={{
              position: 'absolute',
              left: `${left}px`,
              top: `${top}px`,
              width: `${Math.max(width, 10)}px`,
              height: `${Math.max(height, 12)}px`,
              cursor: 'pointer',
              border: isSelected
                ? '2px solid #0f172a'
                : isHovered
                ? '1.5px solid #2563eb'
                : '1px solid transparent',
              backgroundColor: isSelected
                ? 'rgba(15, 23, 42, 0.1)'
                : isHovered
                ? 'rgba(37, 99, 235, 0.08)'
                : 'transparent',
              borderRadius: '2px',
              transition: 'all 0.1s ease',
              zIndex: isSelected ? 20 : isHovered ? 15 : 10,
            }}
          >
            {/* Minimal Daylight Typography Tooltip on Hover */}
            {isHovered && !isSelected && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: '0',
                  transform: 'translateY(-4px)',
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                  zIndex: 30,
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>{span.font_name}</span>
                <span>•</span>
                <span>{span.font_size}pt</span>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: span.color_hex,
                    border: '1px solid #ffffff',
                    display: 'inline-block',
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
