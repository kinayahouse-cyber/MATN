'use client';

import { useState, useTransition } from 'react';
import { addMembreToProjet } from '@/app/(app)/projets/actions';

type Utilisateur = { id: string; nom: string | null; email: string };

export function AddProjetMembre({
  projetId,
  utilisateurs,
}: {
  projetId: string;
  utilisateurs: Utilisateur[];
}) {
  const [utilisateurId, setUtilisateurId] = useState('');
  const [pending, startTransition] = useTransition();

  const submit = () => {
    if (!utilisateurId || pending) return;
    startTransition(async () => {
      await addMembreToProjet(projetId, utilisateurId);
      setUtilisateurId('');
    });
  };

  if (utilisateurs.length === 0) return null;

  return (
    <div className="mt-3 flex items-center gap-2">
      <select
        value={utilisateurId}
        onChange={(e) => setUtilisateurId(e.target.value)}
        className="border border-line bg-bg px-1.5 py-1 text-sm text-fg focus:outline-none focus:border-accent"
      >
        <option value="">+ Ajouter un membre</option>
        {utilisateurs.map((u) => (
          <option key={u.id} value={u.id}>
            {u.nom ?? u.email}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={submit}
        disabled={!utilisateurId || pending}
        className="border border-line px-3 py-1.5 text-xs uppercase tracking-wide text-muted transition-colors duration-fast hover:border-accent hover:text-accent disabled:opacity-40"
      >
        Ajouter
      </button>
    </div>
  );
}
