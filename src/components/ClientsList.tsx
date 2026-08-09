'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { EditableField } from '@/components/EditableField';
import { DeleteButton } from '@/components/DeleteButton';
import { Toolbar, toolbarInputClass } from '@/components/database/Toolbar';
import { updateOrganisationField, deleteOrganisation } from '@/app/(app)/clients/actions';
import { TRACK_LABELS, TYPE_ORGANISATION_LABELS } from '@/lib/labels';

const typeOptions = Object.entries(TYPE_ORGANISATION_LABELS).map(([value, label]) => ({
  value,
  label,
}));
const trackOptions = Object.entries(TRACK_LABELS).map(([value, label]) => ({ value, label }));

type Client = {
  id: string;
  nom: string;
  type: string;
  track: string | null;
  secteur: string | null;
};

export function ClientsList({ clients }: { clients: Client[] }) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [trackFilter, setTrackFilter] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return clients.filter((c) => {
      if (typeFilter && c.type !== typeFilter) return false;
      if (trackFilter && c.track !== trackFilter) return false;
      if (
        q &&
        !c.nom.toLowerCase().includes(q) &&
        !(c.secteur ?? '').toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [clients, search, typeFilter, trackFilter]);

  return (
    <div>
      <Toolbar>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher…"
          className={`${toolbarInputClass} min-w-[10rem] flex-1`}
        />
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={toolbarInputClass}>
          <option value="">Tous les types</option>
          {typeOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          value={trackFilter}
          onChange={(e) => setTrackFilter(e.target.value)}
          className={toolbarInputClass}
        >
          <option value="">Tous les tracks</option>
          {trackOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Toolbar>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted">Aucun client.</p>
      ) : (
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line-strong text-xs uppercase tracking-wide text-muted">
              <th className="py-2 font-normal">Nom</th>
              <th className="font-normal">Type</th>
              <th className="font-normal">Track</th>
              <th className="font-normal">Secteur</th>
              <th className="w-6 font-normal" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-b border-line">
                <td className="py-2">
                  <Link href={`/clients/${c.id}`} className="hover:underline">
                    {c.nom}
                  </Link>
                </td>
                <td className="text-muted">
                  <EditableField
                    value={c.type}
                    onSave={updateOrganisationField.bind(null, c.id, 'type')}
                    type="select"
                    options={typeOptions}
                  />
                </td>
                <td className="text-muted">
                  <EditableField
                    value={c.track ?? ''}
                    onSave={updateOrganisationField.bind(null, c.id, 'track')}
                    type="select"
                    options={trackOptions}
                  />
                </td>
                <td className="text-muted">
                  <EditableField
                    value={c.secteur ?? ''}
                    onSave={updateOrganisationField.bind(null, c.id, 'secteur')}
                  />
                </td>
                <td>
                  <DeleteButton
                    action={deleteOrganisation.bind(null, c.id)}
                    confirmMessage={`Supprimer ${c.nom} ? Les projets liés seront détachés, pas supprimés.`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
