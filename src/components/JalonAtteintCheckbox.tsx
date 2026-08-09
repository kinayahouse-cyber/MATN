'use client';

import { useTransition } from 'react';
import { updateJalonField } from '@/app/(app)/projets/actions';

export function JalonAtteintCheckbox({ id, atteint }: { id: string; atteint: boolean }) {
  const [pending, startTransition] = useTransition();

  return (
    <input
      type="checkbox"
      defaultChecked={atteint}
      disabled={pending}
      onChange={(e) => {
        const checked = e.target.checked;
        startTransition(async () => {
          await updateJalonField(id, 'atteint', String(checked));
        });
      }}
      className="shrink-0"
    />
  );
}
