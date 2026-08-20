import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import type { Role } from '@prisma/client';

// Le compte Supabase Auth est l'identité de connexion ; Utilisateur (le roster interne, qui ne
// servait jusqu'ici qu'aux assignations de tâches) est maintenant aussi la source du rôle —
// relié par email plutôt que d'ajouter un identifiant Supabase dédié, l'email étant déjà unique
// des deux côtés. `cache()` : un seul aller-retour Supabase+DB par requête, quel que soit le
// nombre d'appels (layout + page + composants imbriqués partagent le même résultat).
export const getCurrentUtilisateur = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return null;
  return prisma.utilisateur.findUnique({ where: { email: user.email } });
});

// Absent des deux côtés (dev sans auth, ou session Supabase sans Utilisateur correspondant) =>
// ADMIN par défaut, pour ne pas restreindre silencieusement l'usage mono-utilisateur actuel tant
// que les comptes Collaborateur n'ont pas été créés explicitement.
export async function getCurrentRole(): Promise<Role> {
  const u = await getCurrentUtilisateur();
  return u?.role ?? 'ADMIN';
}

export async function requireAdmin() {
  const role = await getCurrentRole();
  if (role !== 'ADMIN') redirect('/projets');
}
