'use client';

import { useRef, useState, useTransition } from 'react';
import { createTacheInline } from '@/app/(app)/projets/actions';

type Utilisateur = { id: string; nom: string | null; email: string };

export function AddTacheRow({
  projetId,
  utilisateurs,
}: {
  projetId: string;
  utilisateurs: Utilisateur[];
}) {
  const [open, setOpen] = useState(false);
  const [libelle, setLibelle] = useState('');
  const [echeance, setEcheance] = useState('');
  const [assigneAId, setAssigneAId] = useState('');
  const [pending, startTransition] = useTransition();
  const libelleRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setLibelle('');
    setEcheance('');
    setAssigneAId('');
  };

  const submit = () => {
    if (!libelle.trim() || pending) return;
    startTransition(async () => {
      await createTacheInline(projetId, libelle, echeance, assigneAId);
      reset();
      libelleRef.current?.focus();
    });
  };

  const cellInputClass =
    'w-full rounded border border-line bg-bg px-1.5 py-1 text-sm focus:outline-none focus:border-accent';

  if (!open) {
    return (
      <tr>
        <td colSpan={6} className="py-2">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="text-sm text-muted hover:text-fg"
          >
            + Ajouter une tâche
          </button>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-line">
      <td />
      <td className="py-1">
        <input
          ref={libelleRef}
          value={libelle}
          onChange={(e) => setLibelle(e.target.value)}
          placeholder="Libellé"
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
      <td className="py-1 text-xs text-muted">À faire</td>
      <td className="py-1">
        <input
          type="date"
          value={echeance}
          onChange={(e) => setEcheance(e.target.value)}
          className={cellInputClass}
        />
      </td>
      <td className="py-1">
        <div className="flex items-center gap-2">
          <select
            value={assigneAId}
            onChange={(e) => setAssigneAId(e.target.value)}
            className={cellInputClass}
          >
            <option value="">—</option>
            {utilisateurs.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nom ?? u.email}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={submit}
            disabled={pending || !libelle.trim()}
            className="whitespace-nowrap rounded bg-fg px-2 py-1 text-xs font-medium text-bg disabled:opacity-40"
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
