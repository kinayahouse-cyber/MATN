'use client';

import { useRef, useState, useTransition } from 'react';
import { createTacheInline } from '@/app/(app)/projets/actions';
import type { StatutTache } from '@prisma/client';

// Le "+" en pied de colonne Kanban : crée directement une tâche dans le statut de cette colonne,
// sans repasser par la vue List. Champ minimal (libellé seul) — le reste s'édite ensuite en place.
export function KanbanQuickAdd({ projetId, statut }: { projetId: string; statut: StatutTache }) {
  const [open, setOpen] = useState(false);
  const [libelle, setLibelle] = useState('');
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    if (!libelle.trim() || pending) return;
    startTransition(async () => {
      await createTacheInline(projetId, libelle, '', '', statut);
      setLibelle('');
      inputRef.current?.focus();
    });
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Ajouter une tâche — ${statut}`}
        className="flex w-full items-center justify-center rounded-lg border border-line bg-bg/60 py-2 text-muted transition-colors duration-fast hover:border-line-strong hover:text-fg"
      >
        +
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-line-strong bg-bg p-2">
      <input
        ref={inputRef}
        autoFocus
        value={libelle}
        onChange={(e) => setLibelle(e.target.value)}
        placeholder="Libellé…"
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit();
          if (e.key === 'Escape') {
            setOpen(false);
            setLibelle('');
          }
        }}
        onBlur={() => {
          if (!libelle.trim()) setOpen(false);
        }}
        className="w-full bg-transparent text-sm text-fg placeholder:text-muted focus:outline-none"
      />
    </div>
  );
}
