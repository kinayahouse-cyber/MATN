import type { Metadata } from 'next';
import { spectral, archivo } from '@/lib/fonts';
import './globals.css';

export const metadata: Metadata = {
  title: 'Matn — Kinaya',
  description: "Outil de gestion interne de Kinaya.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" data-theme="dark" className={`${spectral.variable} ${archivo.variable}`}>
      <body>{children}</body>
    </html>
  );
}
