'use client';

import { useRef, useState, useTransition } from 'react';
import { createDepenseInline } from '@/app/(app)/projets/actions';

export function AddDepenseRow({ projetId }: { projetId: string }) {
  const [open, setOpen] = useState(false);
  const [categorie, setCategorie] = useState('');
  const [montant, setMontant] = useState('');
  const [pending, startTransition] = useTransition();
  const categorieRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setCategorie('');
    setMontant('');
  };

  const submit = () => {
    if (!categorie.trim() || !montant.trim() || pending) return;
    startTransition(async () => {
      await createDepenseInline(projetId, categorie, montant);
      reset();
      categorieRef.current?.focus();
    });
  };

  const cellInputClass =
    'w-full rounded border border-line bg-bg px-1.5 py-1 text-sm focus:outline-none focus:border-accent';

  if (!open) {
    return (
      <tr>
        <td colSpan={4} className="py-2">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="text-sm text-muted hover:text-fg"
          >
            + Ajouter une dépense
          </button>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-line">
      <td className="py-1">
        <input
          ref={categorieRef}
          value={categorie}
          onChange={(e) => setCategorie(e.target.value)}
          placeholder="Catégorie"
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
            if (e.key === 'Escape') {
              setOpen(false);
              reset();
            }
          }}
          className={cellInputClass}
        />
      </td>
      <td className="py-1">
        <input
          type="number"
          value={montant}
          onChange={(e) => setMontant(e.target.value)}
          placeholder="Montant"
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          className={cellInputClass}
        />
      </td>
      <td className="py-1">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={submit}
            disabled={pending || !categorie.trim() || !montant.trim()}
            className="rounded bg-fg px-2 py-1 text-xs font-medium text-bg disabled:opacity-40"
          >
            Ajouter
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              reset();
            }}
            className="text-xs text-muted hover:text-fg"
          >
            Annuler
          </button>
        </div>
      </td>
      <td />
    </tr>
  );
}
