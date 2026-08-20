'use client';

import { useState, useTransition } from 'react';
import { generatePortailToken, revokePortailToken } from '@/app/(app)/projets/actions';
import { Card } from '@/components/ui/Card';

// Lien magique, pas de compte client : la présence d'un jeton est le seul état à gérer ici.
// Régénérer change le jeton (l'ancien lien cesse de fonctionner) ; désactiver le met à NULL.
export function ClientPortalCard({
  projetId,
  initialToken,
}: {
  projetId: string;
  initialToken: string | null;
}) {
  const [token, setToken] = useState(initialToken);
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  const url = token && typeof window !== 'undefined' ? `${window.location.origin}/portail/${token}` : '';

  const generate = () =>
    startTransition(async () => {
      const next = await generatePortailToken(projetId);
      setToken(next);
    });

  const revoke = () => {
    if (!window.confirm('Désactiver le portail ? Le lien actuel cessera de fonctionner.')) return;
    startTransition(async () => {
      await revokePortailToken(projetId);
      setToken(null);
    });
  };

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Card padded={false} className={`mt-6 p-5 ${pending ? 'opacity-70' : ''}`}>
      <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Portail client</p>

      {token ? (
        <>
          <p className="mt-2 truncate font-mono text-[11px] text-fg" title={url}>
            {url}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
            <button
              type="button"
              onClick={copy}
              disabled={pending}
              className="text-accent transition-opacity duration-fast hover:opacity-80 disabled:opacity-40"
            >
              {copied ? 'Copié !' : 'Copier le lien'}
            </button>
            <button
              type="button"
              onClick={generate}
              disabled={pending}
              className="text-muted transition-colors duration-fast hover:text-fg disabled:opacity-40"
            >
              Régénérer
            </button>
            <button
              type="button"
              onClick={revoke}
              disabled={pending}
              className="text-muted transition-colors duration-fast hover:text-accent disabled:opacity-40"
            >
              Désactiver
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="mt-2 text-[11px] leading-snug text-muted">
            Statut, brief et livrables — sans compte à créer, via un lien à partager.
          </p>
          <button
            type="button"
            onClick={generate}
            disabled={pending}
            className="mt-3 border border-line px-3 py-1.5 text-xs uppercase tracking-wide text-muted transition-colors duration-fast hover:border-accent hover:text-accent disabled:opacity-40"
          >
            Activer le portail
          </button>
        </>
      )}
    </Card>
  );
}
