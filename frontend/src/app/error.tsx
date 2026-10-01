'use client';

import React from 'react';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '70vh',
      textAlign: 'center',
      padding: '20px',
    }}>
      <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#b91c1c' }}>Something went wrong!</h2>
      <p style={{ color: '#64748b', marginTop: '8px', marginBottom: '24px' }}>
        {error.message || 'An unexpected error occurred in Creed-Tech Studio.'}
      </p>
      <button
        onClick={() => reset()}
        style={{
          padding: '10px 20px',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          borderRadius: '8px',
          border: 'none',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Try Again
      </button>
    </div>
  );
}
