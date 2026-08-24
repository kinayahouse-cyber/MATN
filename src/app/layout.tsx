import type { Metadata, Viewport } from 'next';
import { Space_Grotesk, Bricolage_Grotesque } from 'next/font/google';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
  display: 'swap',
});

// PWA installable ("Ajouter à l'écran d'accueil") : ouvre en standalone, sans chrome navigateur,
// sans passer par un signet/onglet à chaque fois — pas de review Play Store puisqu'il n'y a pas
// d'app native, juste ce manifest + les icônes dans public/icons.
export const metadata: Metadata = {
  title: 'Matn',
  description: 'Outil de gestion interne de Kinaya',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'MATN',
  },
  icons: {
    // La 32×32 en premier : c'est celle que retiennent les onglets de navigateur, et sans elle le
    // navigateur redimensionne la 192 — la marque y perd sa lisibilité à cette échelle.
    icon: [
      { url: '/icons/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icons/apple-touch-icon.png',
  },
};

// Absent jusqu'ici (aucun export `viewport` dans ce layout) : un mobile sans
// `width=device-width` retombe sur un viewport virtuel ~980px et zoome tout le site en
// miniature — la nav du bas ("Plus" compris) se retrouvait hors écran à droite. Bug préexistant
// à ce chantier mobile, révélé par lui.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0A0A0B',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`dark ${spaceGrotesk.variable} ${bricolage.variable}`}>
      <body>{children}</body>
    </html>
  );
}
