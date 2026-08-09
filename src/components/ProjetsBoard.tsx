'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { EditableField } from '@/components/EditableField';
import { DeleteButton } from '@/components/DeleteButton';
import { AddProjetRow } from '@/components/AddProjetRow';
import { updateProjetField, deleteProjet } from '@/app/(app)/projets/actions';
import { TRACK_LABELS, STADE_PROJET_LABELS } from '@/lib/labels';

const STADE_COLUMNS = ['DEVIS_ENVOYE', 'SIGNE', 'EN_COURS', 'LIVRE', 'CLOS', 'ABANDONNE'] as const;

const trackOptions = Object.entries(TRACK_LABELS).map(([value, label]) => ({ value, label }));
const stadeOptions = Object.entries(STADE_PROJET_LABELS).map(([value, label]) => ({
  value,
  label,
}));

type Tache = { id: string; libelle: string; statut: string };
type Client = { id: string; nom: string };
type Projet = {
  id: string;
  code: string;
  nom: string;
  track: string | null;
  stade: string;
  organisationId: string | null;
  organisation: { id: string; nom: string } | null;
  taches: Tache[];
};

export function ProjetsBoard({ projets, clients }: { projets: Projet[]; clients: Client[] }) {
  const [view, setView] = useState<'list' | 'board'>('list');
  const [search, setSearch] = useState('');
  const [trackFilter, setTrackFilter] = useState('');
  const [clientFilter, setClientFilter] = useState('');

  const clientOptions = clients.map((c) => ({ value: c.id, label: c.nom }));

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return projets.filter((p) => {
      if (trackFilter && p.track !== trackFilter) return false;
      if (clientFilter && p.organisationId !== clientFilter) return false;
      if (q && !p.nom.toLowerCase().includes(q) && !p.code.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [projets, search, trackFilter, clientFilter]);

  const selectClass =
    'rounded-md border border-neutral-800 bg-transparent px-2 py-1.5 text-sm text-neutral-300';

  return (
    <div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un projet…"
          className={`${selectClass} flex-1 min-w-[10rem]`}
        />
        <select
          value={trackFilter}
          onChange={(e) => setTrackFilter(e.target.value)}
          className={selectClass}
        >
          <option value="">Tous les tracks</option>
          {trackOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
          className={selectClass}
        >
          <option value="">Tous les clients</option>
          {clientOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <div className="flex overflow-hidden rounded-md border border-neutral-800 text-sm">
          <button
            type="button"
            onClick={() => setView('list')}
            className={`px-3 py-1.5 ${view === 'list' ? 'bg-neutral-100 text-neutral-950' : 'text-neutral-400 hover:text-neutral-100'}`}
          >
            Liste
          </button>
          <button
            type="button"
            onClick={() => setView('board')}
            className={`px-3 py-1.5 ${view === 'board' ? 'bg-neutral-100 text-neutral-950' : 'text-neutral-400 hover:text-neutral-100'}`}
          >
            Cartes
          </button>
        </div>
      </div>

      {view === 'list' ? (
        <table className="mt-4 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-800 text-xs uppercase text-neutral-500">
              <th className="py-2 font-normal">Code</th>
              <th className="font-normal">Nom</th>
              <th className="font-normal">Client</th>
              <th className="font-normal">Track</th>
              <th className="font-normal">Stade</th>
              <th className="w-6 font-normal" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-neutral-900">
                <td className="py-2 font-mono text-xs text-neutral-500">{p.code}</td>
                <td>
                  <Link href={`/projets/${p.id}`} className="hover:underline">
                    {p.nom}
                  </Link>
                </td>
                <td className="text-neutral-400">
                  <EditableField
                    value={p.organisationId ?? ''}
                    onSave={updateProjetField.bind(null, p.id, 'organisationId')}
                    type="select"
                    options={clientOptions}
                    placeholder="—"
                  />
                </td>
                <td className="text-neutral-400">
                  <EditableField
                    value={p.track ?? ''}
                    onSave={updateProjetField.bind(null, p.id, 'track')}
                    type="select"
                    options={trackOptions}
                  />
                </td>
                <td className="text-neutral-400">
                  <EditableField
                    value={p.stade}
                    onSave={updateProjetField.bind(null, p.id, 'stade')}
                    type="select"
                    options={stadeOptions}
                  />
                </td>
                <td>
                  <DeleteButton
                    action={deleteProjet.bind(null, p.id)}
                    confirmMessage={`Supprimer le projet ${p.nom} ? Jalons, fichiers, tâches et dépenses associés seront aussi supprimés.`}
                  />
                </td>
              </tr>
            ))}
            <AddProjetRow clients={clients} />
          </tbody>
        </table>
      ) : (
        <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
          {STADE_COLUMNS.map((stade) => {
            const items = filtered.filter((p) => p.stade === stade);
            return (
              <div key={stade} className="w-64 shrink-0">
                <p className="text-xs uppercase tracking-wide text-neutral-500">
                  {STADE_PROJET_LABELS[stade]}{' '}
                  <span className="text-neutral-700">({items.length})</span>
                </p>
                <div className="mt-2 space-y-2">
                  {items.map((p) => (
                    <Link
                      key={p.id}
                      href={`/projets/${p.id}`}
                      className="block rounded-md border border-neutral-800 p-3 hover:border-neutral-600"
                    >
                      <p className="text-sm font-medium">{p.nom}</p>
                      <p className="mt-0.5 text-xs text-neutral-500">
                        {p.organisation?.nom ?? '—'}
                        {p.track ? ` · ${TRACK_LABELS[p.track]}` : ''}
                      </p>
                      {p.taches.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {p.taches.slice(0, 4).map((t) => (
                            <li
                              key={t.id}
                              className={`text-xs ${t.statut === 'FAIT' ? 'text-neutral-600 line-through' : 'text-neutral-400'}`}
                            >
                              {t.libelle}
                            </li>
                          ))}
                          {p.taches.length > 4 && (
                            <li className="text-xs text-neutral-600">
                              +{p.taches.length - 4} autres
                            </li>
                          )}
                        </ul>
                      )}
                    </Link>
                  ))}
                  {items.length === 0 && <p className="text-xs text-neutral-700">—</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
