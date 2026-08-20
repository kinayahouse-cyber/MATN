'use client';

import { useState, useTransition } from 'react';

import { TAG_TONES, type TagTone } from './Tag';

/**
 * Pastille éditable au clic : rendu identique à `Tag`, mais bascule en `<select>` à l'activation.
 * Utilisée là où l'état doit rester modifiable sans passer par un formulaire (cartes, kanban).
 */
export function TagSelect({
  value,
  options,
  onSave,
  tone = 'neutral',
  ariaLabel,
}: {
  value: string;
  options: { value: string; label: string }[];
  onSave: (value: string) => Promise<void>;
  tone?: TagTone;
  ariaLabel?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const base = `inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium leading-tight ${TAG_TONES[tone]}`;

  if (editing) {
    return (
      <select
        autoFocus
        aria-label={ariaLabel}
        defaultValue={value}
        onBlur={() => setEditing(false)}
        onChange={(e) => {
          const next = e.target.value;
          setEditing(false);
          if (next !== value) startTransition(async () => await onSave(next));
        }}
        className={`${base} focus:outline-none`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  }

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={() => setEditing(true)}
      className={`${base} transition-opacity duration-fast hover:opacity-75 ${
        pending ? 'opacity-50' : ''
      }`}
    >
      {options.find((o) => o.value === value)?.label ?? value}
    </button>
  );
}
