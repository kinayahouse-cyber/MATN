'use client';

import { useTransition } from 'react';
import { updateTacheField } from '@/app/(app)/projets/actions';

export function TacheDoneCheckbox({ id, statut }: { id: string; statut: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <input
      type="checkbox"
      defaultChecked={statut === 'FAIT'}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.checked ? 'FAIT' : 'A_FAIRE';
        startTransition(async () => {
          await updateTacheField(id, 'statut', next);
        });
      }}
      className="shrink-0"
    />
  );
}
