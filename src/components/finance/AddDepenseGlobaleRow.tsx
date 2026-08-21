'use client';

import { useRef, useState, useTransition } from 'react';
import { createDepenseGlobale } from '@/app/(app)/projets/actions';

// Saisie de dépense depuis la page Finance : le projet est facultatif (dépense générale, non
// imputée), contrairement à AddDepenseRow qui vit déjà dans un projet donné.
export function AddDepenseGlobaleRow({
  projets,
}: {
  projets: { id: string; code: string; nom: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [categorie, setCategorie] = useState('');
  const [montant, setMontant] = useState('');
  const [projetId, setProjetId] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [pending, startTransition] = useTransition();
  const categorieRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setCategorie('');
    setMontant('');
    setProjetId('');
    setDate(new Date().toISOString().slice(0, 10));
  };

  const submit = () => {
    if (!categorie.trim() || !montant.trim() || pending) return;
    startTransition(async () => {
      await createDepenseGlobale(projetId, categorie, montant, date);
      reset();
      categorieRef.current?.focus();
    });
  };

  const cellInputClass =
    'w-full rounded border border-line bg-bg px-1.5 py-1 text-sm focus:outline-none focus:border-accent';

  if (!open) {
    return (
      <tr>
        <td colSpan={5} className="py-2">
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
      <td className="py-1 pr-2">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          className={cellInputClass}
        />
      </td>
      <td className="py-1 pr-2">
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
      <td className="py-1 pr-2">
        <select
          value={projetId}
          onChange={(e) => setProjetId(e.target.value)}
          className={cellInputClass}
        >
          <option value="">Générale</option>
          {projets.map((p) => (
            <option key={p.id} value={p.id}>
              {p.code} — {p.nom}
            </option>
          ))}
        </select>
      </td>
      <td className="py-1 pr-2">
        <input
          type="number"
          value={montant}
          onChange={(e) => setMontant(e.target.value)}
          placeholder="Montant"
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          className={`${cellInputClass} text-right`}
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
            OK
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
    </tr>
  );
}
