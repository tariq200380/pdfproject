import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'OmniMedia & PDF Studio — Stateless Document & Media Toolkit',
  description: 'Seamless in-place PDF editing with exact font matching, universal audio/video transcoding, and lossless media compression. No login required.',
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
