'use client';

import { useRef, useState, useTransition } from 'react';
import { createProjetInline } from '@/app/(app)/projets/actions';
import { TRACK_LABELS } from '@/lib/labels';

type Client = { id: string; nom: string };

export function AddProjetRow({ clients }: { clients: Client[] }) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [nom, setNom] = useState('');
  const [organisationId, setOrganisationId] = useState('');
  const [track, setTrack] = useState('');
  const [pending, startTransition] = useTransition();
  const codeRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setCode('');
    setNom('');
    setOrganisationId('');
    setTrack('');
  };

  const submit = () => {
    if (!code.trim() || !nom.trim() || pending) return;
    startTransition(async () => {
      await createProjetInline(code, nom, organisationId, track);
      reset();
      codeRef.current?.focus();
    });
  };

  const cellInputClass =
    'w-full border border-line bg-bg px-1.5 py-1 text-sm text-fg focus:outline-none focus:border-accent transition-colors duration-fast';

  if (!open) {
    return (
      <tr>
        <td colSpan={7} className="py-2">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="text-sm text-muted hover:text-fg"
          >
            + Nouveau
          </button>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-line">
      <td />
      <td className="py-1">
        <input
          ref={codeRef}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="KIN-26-S-001"
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          className={`${cellInputClass} font-mono text-xs`}
        />
      </td>
      <td className="py-1">
        <input
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          placeholder="Nom du projet"
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
      <td className="py-1">
        <select
          value={organisationId}
          onChange={(e) => setOrganisationId(e.target.value)}
          className={cellInputClass}
        >
          <option value="">—</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nom}
            </option>
          ))}
        </select>
      </td>
      <td className="py-1">
        <select value={track} onChange={(e) => setTrack(e.target.value)} className={cellInputClass}>
          <option value="">—</option>
          {Object.entries(TRACK_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </td>
      <td className="py-1">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={submit}
            disabled={pending || !code.trim() || !nom.trim()}
            className="bg-fg px-2 py-1 text-xs font-medium text-bg disabled:opacity-40"
          >
            Ajouter
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              reset();
            }}
            className="text-xs text-muted hover:text-fg"
          >
            Annuler
          </button>
        </div>
      </td>
      <td />
    </tr>
  );
}
