import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Matn',
  description: 'Outil de gestion interne de Kinaya',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <body>{children}</body>
    </html>
  );
}
