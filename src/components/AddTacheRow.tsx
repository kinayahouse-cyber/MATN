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
    'w-full rounded border border-neutral-700 bg-neutral-950 px-1.5 py-1 text-sm focus:outline-none focus:border-neutral-500';

  if (!open) {
    return (
      <tr>
        <td colSpan={4} className="py-2">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="text-sm text-neutral-500 hover:text-neutral-300"
          >
            + Ajouter une tâche
          </button>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-neutral-900">
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
      <td className="py-1 text-xs text-neutral-600">À faire</td>
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
            className="whitespace-nowrap rounded bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-950 disabled:opacity-40"
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
