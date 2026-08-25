import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

// `icons/` et `manifest.json` doivent rester accessibles sans session : ce sont les fichiers que
// le téléphone va chercher pour installer ou mettre à jour l'icône d'écran d'accueil, avant même
// qu'un utilisateur ne soit connecté. Absents de cette liste, ils étaient redirigés vers /login —
// silencieusement pour un humain, mais un client PWA qui reçoit une page de login à la place d'un
// PNG abandonne et garde l'icône déjà installée. C'est ce qui faisait qu'une nouvelle icône ne se
// propageait jamais sur les téléphones.
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons/|manifest.json).*)'],
};
