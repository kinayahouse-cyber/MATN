'use client';

import { useState, useTransition } from 'react';
import { STADE_PROJET_LABELS } from '@/lib/labels';

const STADE_VALUES = Object.keys(STADE_PROJET_LABELS);

// Pastille de stade éditable en place — variante pill de l'ancien StatusBlock (aplat plein
// largeur), pour s'intégrer à la ligne de tags de ProjectInfoCard plutôt que comme bloc à part.
export function StadeTag({
  value,
  onSave,
}: {
  value: string;
  onSave: (value: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();

  if (editing) {
    return (
      <select
        autoFocus
        defaultValue={value}
        onBlur={() => setEditing(false)}
        onChange={(e) => {
          const next = e.target.value;
          setEditing(false);
          if (next !== value) startTransition(async () => await onSave(next));
        }}
        className="rounded-full border border-accent/30 bg-accent/15 px-2 py-0.5 text-[11px] font-medium text-accent focus:outline-none"
      >
        {STADE_VALUES.map((s) => (
          <option key={s} value={s}>
            {STADE_PROJET_LABELS[s]}
          </option>
        ))}
      </select>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className={`inline-flex items-center rounded-full border border-accent/30 bg-accent/15 px-2 py-0.5 text-[11px] font-medium text-accent transition-opacity duration-fast hover:opacity-80 ${
        pending ? 'opacity-50' : ''
      }`}
    >
      {STADE_PROJET_LABELS[value] ?? value}
    </button>
  );
}
