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
    'w-full rounded border border-neutral-700 bg-neutral-950 px-1.5 py-1 text-sm focus:outline-none focus:border-neutral-500';

  if (!open) {
    return (
      <tr>
        <td colSpan={3} className="py-2">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="text-sm text-neutral-500 hover:text-neutral-300"
          >
            + Ajouter une dépense
          </button>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-neutral-900">
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
            className="rounded bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-950 disabled:opacity-40"
          >
            Ajouter
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              reset();
            }}
            className="text-xs text-neutral-500 hover:text-neutral-300"
          >
            Annuler
          </button>
        </div>
      </td>
    </tr>
  );
}
