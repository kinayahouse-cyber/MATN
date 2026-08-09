'use client';

import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { EditableField } from '@/components/EditableField';
import { DeleteButton } from '@/components/DeleteButton';
import { AddProjetRow } from '@/components/AddProjetRow';
import { ProjetCard } from '@/components/ProjetCard';
import { StatusDot } from '@/components/properties/Status';
import { ViewTabs } from '@/components/database/ViewTabs';
import { Toolbar, toolbarInputClass } from '@/components/database/Toolbar';
import { updateProjetField, deleteProjet, deleteProjets, moveProjets } from '@/app/(app)/projets/actions';
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
  const [stadeFilter, setStadeFilter] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkMoveTo, setBulkMoveTo] = useState('');
  const [pending, startTransition] = useTransition();

  const clientOptions = clients.map((c) => ({ value: c.id, label: c.nom }));

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return projets.filter((p) => {
      if (trackFilter && p.track !== trackFilter) return false;
      if (clientFilter && p.organisationId !== clientFilter) return false;
      if (stadeFilter && p.stade !== stadeFilter) return false;
      if (q && !p.nom.toLowerCase().includes(q) && !p.code.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [projets, search, trackFilter, clientFilter, stadeFilter]);

  const toggleSelected = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allFilteredSelected = filtered.length > 0 && filtered.every((p) => selected.has(p.id));
  const toggleSelectAll = () => {
    setSelected(allFilteredSelected ? new Set() : new Set(filtered.map((p) => p.id)));
  };

  const clearSelection = () => setSelected(new Set());

  const bulkDelete = () => {
    if (!window.confirm(`Supprimer ${selected.size} projet(s) ?`)) return;
    const ids = Array.from(selected);
    startTransition(async () => {
      await deleteProjets(ids);
      clearSelection();
    });
  };

  const bulkMove = () => {
    if (!bulkMoveTo) return;
    const ids = Array.from(selected);
    startTransition(async () => {
      await moveProjets(ids, bulkMoveTo);
      clearSelection();
      setBulkMoveTo('');
    });
  };

  return (
    <div>
      <Toolbar>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher…"
          className={`${toolbarInputClass} min-w-[10rem] flex-1`}
        />
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
        <select
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
          className={toolbarInputClass}
        >
          <option value="">Tous les clients</option>
          {clientOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          value={stadeFilter}
          onChange={(e) => setStadeFilter(e.target.value)}
          className={toolbarInputClass}
        >
          <option value="">Tous les stades</option>
          {stadeOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <div className="ml-auto">
          <ViewTabs
            value={view}
            onChange={setView}
            options={[
              { value: 'list', label: 'Liste' },
              { value: 'board', label: 'Cartes' },
            ]}
          />
        </div>
      </Toolbar>

      {view === 'list' && selected.size > 0 && (
        <div className="mb-2 flex items-center gap-3 border border-line bg-line/20 px-3 py-2 text-sm">
          <span className="text-muted">{selected.size} sélectionné(s)</span>
          <select
            value={bulkMoveTo}
            onChange={(e) => setBulkMoveTo(e.target.value)}
            className={toolbarInputClass}
          >
            <option value="">Déplacer vers…</option>
            {stadeOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={bulkMove}
            disabled={!bulkMoveTo || pending}
            className="bg-fg px-2 py-1 text-xs font-medium text-bg disabled:opacity-40"
          >
            Déplacer
          </button>
          <button
            type="button"
            onClick={bulkDelete}
            disabled={pending}
            className="px-2 py-1 text-xs text-accent hover:bg-line/40 disabled:opacity-40"
          >
            Supprimer
          </button>
          <button
            type="button"
            onClick={clearSelection}
            className="ml-auto text-xs text-muted hover:text-fg"
          >
            Annuler
          </button>
        </div>
      )}

      {view === 'list' ? (
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-muted text-xs uppercase tracking-wide text-muted">
              <th className="w-6 py-2 font-normal">
                <input type="checkbox" checked={allFilteredSelected} onChange={toggleSelectAll} />
              </th>
              <th className="font-normal">Code</th>
              <th className="font-normal">Nom</th>
              <th className="font-normal">Client</th>
              <th className="font-normal">Track</th>
              <th className="font-normal">Stade</th>
              <th className="w-6 font-normal" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-line">
                <td className="py-2">
                  <input
                    type="checkbox"
                    checked={selected.has(p.id)}
                    onChange={() => toggleSelected(p.id)}
                  />
                </td>
                <td className="font-mono text-xs text-muted">{p.code}</td>
                <td>
                  <Link href={`/projets/${p.id}`} className="hover:underline">
                    {p.nom}
                  </Link>
                </td>
                <td className="text-muted">
                  <EditableField
                    value={p.organisationId ?? ''}
                    onSave={updateProjetField.bind(null, p.id, 'organisationId')}
                    type="select"
                    options={clientOptions}
                    placeholder="—"
                  />
                </td>
                <td className="text-muted">
                  <EditableField
                    value={p.track ?? ''}
                    onSave={updateProjetField.bind(null, p.id, 'track')}
                    type="select"
                    options={trackOptions}
                  />
                </td>
                <td className="text-muted">
                  <div className="flex items-center gap-2">
                    <StatusDot active={p.stade === 'EN_COURS'} muted={p.stade === 'ABANDONNE'} />
                    <EditableField
                      value={p.stade}
                      onSave={updateProjetField.bind(null, p.id, 'stade')}
                      type="select"
                      options={stadeOptions}
                    />
                  </div>
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
        <div className="flex gap-6 overflow-x-auto pb-2">
          {STADE_COLUMNS.map((stade, i) => (
            <div key={stade} className="flex w-64 shrink-0 gap-6">
              {i > 0 && <div className="w-px shrink-0 bg-line" />}
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted">
                  <StatusDot active={stade === 'EN_COURS'} muted={stade === 'ABANDONNE'} />
                  {STADE_PROJET_LABELS[stade]}
                  <span className="text-line-strong">
                    ({filtered.filter((p) => p.stade === stade).length})
                  </span>
                </p>
                <div className="mt-3 space-y-2">
                  {filtered
                    .filter((p) => p.stade === stade)
                    .map((p) => (
                      <ProjetCard key={p.id} projet={p} />
                    ))}
                  {filtered.filter((p) => p.stade === stade).length === 0 && (
                    <p className="text-xs text-line-strong">—</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
