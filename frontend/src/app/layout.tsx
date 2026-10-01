import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Creed-Tech | PDF & Media Studio — Frictionless Document & Media Cloud',
  description: 'Enterprise online PDF editor with in-place font matching, universal media conversion, and lossless file compression. 100% stateless, zero login required.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
