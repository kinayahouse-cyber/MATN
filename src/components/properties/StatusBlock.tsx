'use client';

import { useState, useTransition } from 'react';
import { STADE_PROJET_LABELS } from '@/lib/labels';

const STADE_VALUES = Object.keys(STADE_PROJET_LABELS);

// Le stade courant est le seul endroit du workspace où l'accent est utilisé en aplat :
// c'est l'information d'état la plus importante de la page.
export function StatusBlock({
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
        className="w-full bg-accent px-4 py-3 text-sm uppercase tracking-wide text-bg focus:outline-none"
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
      className={`w-full bg-accent px-4 py-3 text-sm uppercase tracking-wide text-bg transition-opacity duration-fast hover:opacity-90 ${
        pending ? 'opacity-50' : ''
      }`}
    >
      {STADE_PROJET_LABELS[value] ?? value}
    </button>
  );
}
