'use client';

import { useState, useTransition } from 'react';
import { addContactToProjet } from '@/app/(app)/projets/actions';

type Contact = { id: string; nom: string; organisationNom: string | null };

export function AddProjetContact({
  projetId,
  contacts,
}: {
  projetId: string;
  contacts: Contact[];
}) {
  const [contactId, setContactId] = useState('');
  const [pending, startTransition] = useTransition();

  const submit = () => {
    if (!contactId || pending) return;
    startTransition(async () => {
      await addContactToProjet(projetId, contactId);
      setContactId('');
    });
  };

  if (contacts.length === 0) return null;

  return (
    <div className="mt-3 flex items-center gap-2">
      <select
        value={contactId}
        onChange={(e) => setContactId(e.target.value)}
        className="border border-line bg-bg px-1.5 py-1 text-sm text-fg focus:outline-none focus:border-accent"
      >
        <option value="">+ Lier un contact</option>
        {contacts.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nom}
            {c.organisationNom ? ` — ${c.organisationNom}` : ''}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={submit}
        disabled={!contactId || pending}
        className="bg-fg px-2 py-1 text-xs font-medium text-bg disabled:opacity-40"
      >
        Lier
      </button>
    </div>
  );
}
