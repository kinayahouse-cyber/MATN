'use client';

import { useTransition } from 'react';

export function DeleteButton({
  action,
  confirmMessage = 'Supprimer ?',
  className = 'text-xs text-muted hover:text-accent',
  label = '×',
}: {
  action: () => Promise<void>;
  confirmMessage?: string;
  className?: string;
  label?: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!window.confirm(confirmMessage)) return;
        startTransition(async () => {
          await action();
        });
      }}
      className={`${className} disabled:opacity-40`}
    >
      {label}
    </button>
  );
}
