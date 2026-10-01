'use client';

import React from 'react';
import Link from 'next/link';

export default function NotFound() {
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
      <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a' }}>Page Not Found</h2>
      <p style={{ color: '#64748b', marginTop: '8px', marginBottom: '24px' }}>
        The requested Creed-Tech tool or page does not exist.
      </p>
      <Link
        href="/"
        style={{
          padding: '10px 20px',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          borderRadius: '8px',
          textDecoration: 'none',
          fontWeight: 600,
        }}
      >
        Return to Creed-Tech Studio
      </Link>
    </div>
  );
}
