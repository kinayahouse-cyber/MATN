'use client';

import { useEffect, useRef, useState, useTransition } from 'react';

type Option = { value: string; label: string };

type Props = {
  value: string;
  onSave: (value: string) => Promise<void>;
  type?: 'text' | 'textarea' | 'select' | 'number' | 'date';
  options?: Option[];
  placeholder?: string;
  className?: string;
  displayValue?: string;
};

export function EditableField({
  value,
  onSave,
  type = 'text',
  options,
  placeholder = '—',
  className = '',
  displayValue,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const save = (next: string) => {
    setEditing(false);
    if (next !== value) {
      startTransition(async () => {
        await onSave(next);
      });
    }
  };

  // `className` est porté par un wrapper, jamais par le contrôle lui-même : les classes de
  // largeur passées par l'appelant (w-24, flex-1…) entreraient sinon en conflit avec le w-full
  // interne, que Tailwind arbitre par ordre de source CSS et non par ordre dans la chaîne.
  const baseInputClass =
    'block w-full min-w-0 border border-line bg-bg px-1.5 py-1 text-sm text-fg focus:outline-none focus:border-accent transition-colors duration-fast';

  const wrapper = (children: React.ReactNode) => (
    <span className={`block min-w-0 ${className}`}>{children}</span>
  );

  if (!editing) {
    const display =
      displayValue ??
      (type === 'select'
        ? (options?.find((o) => o.value === value)?.label ?? placeholder)
        : value || placeholder);
    return wrapper(
      <button
        type="button"
        onClick={() => setEditing(true)}
        className={`block w-full min-w-0 break-words px-1.5 py-1 text-left transition-colors duration-fast hover:bg-line/40 ${
          pending ? 'opacity-50' : ''
        } ${!value ? 'text-muted' : ''}`}
      >
        {display}
      </button>
    );
  }

  if (type === 'select') {
    return wrapper(
      <select
        ref={inputRef as React.RefObject<HTMLSelectElement>}
        defaultValue={draft}
        onChange={(e) => save(e.target.value)}
        onBlur={() => setEditing(false)}
        className={baseInputClass}
      >
        <option value="">—</option>
        {options?.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    );
  }

  if (type === 'textarea') {
    return wrapper(
      <textarea
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        defaultValue={draft}
        rows={3}
        onBlur={(e) => save(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setEditing(false);
        }}
        className={baseInputClass}
      />
    );
  }

  return wrapper(
    <input
      ref={inputRef as React.RefObject<HTMLInputElement>}
      type={type === 'number' ? 'number' : type === 'date' ? 'date' : 'text'}
      defaultValue={draft}
      onBlur={(e) => save(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
        if (e.key === 'Escape') setEditing(false);
      }}
      className={baseInputClass}
    />
  );
}
