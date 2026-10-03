import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { HeroTabProvider } from '@/context/HeroTabContext';

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
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <HeroTabProvider>
          <Header />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {children}
          </div>
          <Footer />
        </HeroTabProvider>
      </body>
    </html>
  );
}
