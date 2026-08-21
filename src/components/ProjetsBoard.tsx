'use client';

import { Fragment, useCallback, useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { EditableField } from '@/components/EditableField';
import { DeleteButton } from '@/components/DeleteButton';
import { AddProjetRow } from '@/components/AddProjetRow';
import { ProjetCard } from '@/components/ProjetCard';
import { StatusDot } from '@/components/properties/Status';
import { DatabaseToolbar } from '@/components/database/DatabaseToolbar';
import { useDatabaseView } from '@/components/database/useDatabaseView';
import type { PropertyDef } from '@/components/database/types';
import { updateProjetField, deleteProjet, deleteProjets, moveProjets } from '@/app/(app)/projets/actions';
import { TRACK_LABELS, STADE_PROJET_LABELS } from '@/lib/labels';
import type { Role } from '@prisma/client';

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

// Un Collaborateur ne voit que les projets où il est membre (déjà filtré côté serveur) et n'a
// aucune des actions de gestion (créer, supprimer, changer client/track/stade) — lecture + accès
// à l'ouverture du projet seulement.
export function ProjetsBoard({
  projets,
  clients,
  role = 'ADMIN',
}: {
  projets: Projet[];
  clients: Client[];
  role?: Role;
}) {
  const readOnly = role !== 'ADMIN';
  const [pending, startTransition] = useTransition();
  const clientOptions = useMemo(
    () => clients.map((c) => ({ value: c.id, label: c.nom })),
    [clients]
  );

  // Définitions de propriétés : une seule source pour filtre, tri, groupement et visibilité.
  const properties = useMemo<PropertyDef<Projet>[]>(
    () => [
      { key: 'code', label: 'Code', getValue: (p) => p.code, groupable: false },
      { key: 'nom', label: 'Nom', getValue: (p) => p.nom, alwaysVisible: true, groupable: false },
      {
        key: 'client',
        label: 'Client',
        getValue: (p) => p.organisationId ?? '',
        format: (v) => clients.find((c) => c.id === v)?.nom ?? v,
        options: clientOptions,
      },
      {
        key: 'track',
        label: 'Track',
        getValue: (p) => p.track ?? '',
        format: (v) => TRACK_LABELS[v] ?? v,
        options: trackOptions,
      },
      {
        key: 'stade',
        label: 'Stade',
        getValue: (p) => p.stade,
        format: (v) => STADE_PROJET_LABELS[v] ?? v,
        options: stadeOptions,
      },
    ],
    [clients, clientOptions]
  );

  const searchKeys = useCallback((p: Projet) => [p.nom, p.code], []);

  const view = useDatabaseView<Projet>({ rows: projets, properties, searchKeys });
  const { state, filtered, groups, isVisible } = view;

  // La sélection vit dans l'état de vue local mais reste indépendante des filtres.
  const selected = useSelection(filtered);

  const bulkDelete = () => {
    if (!window.confirm(`Supprimer ${selected.ids.size} projet(s) ?`)) return;
    const ids = Array.from(selected.ids);
    startTransition(async () => {
      await deleteProjets(ids);
      selected.clear();
    });
  };

  const bulkMove = (stade: string) => {
    if (!stade) return;
    const ids = Array.from(selected.ids);
    startTransition(async () => {
      await moveProjets(ids, stade);
      selected.clear();
    });
  };

  // En vue Board, le groupement pilote les colonnes ; par défaut on retombe sur le stade.
  const boardGroups = useMemo(() => {
    if (groups) return groups;
    const prop = properties.find((p) => p.key === 'stade')!;
    return stadeOptions.map((o) => ({
      key: o.value,
      label: o.label,
      rows: filtered.filter((p) => prop.getValue(p) === o.value),
    }));
  }, [groups, filtered, properties]);

  const renderRow = (p: Projet) => (
    <tr key={p.id} className="divide-x divide-line border-b border-line">
      {!readOnly && (
        <td className="py-2">
          <input
            type="checkbox"
            aria-label={`Sélectionner ${p.nom}`}
            checked={selected.ids.has(p.id)}
            onChange={() => selected.toggle(p.id)}
          />
        </td>
      )}
      {isVisible('code') && <td className="pl-3 font-mono text-xs text-muted">{p.code}</td>}
      <td className="pl-3">
        <Link href={`/projets/${p.id}`} className="hover:underline">
          {p.nom}
        </Link>
      </td>
      {isVisible('client') && (
        <td className="pl-3 text-muted">
          {readOnly ? (
            clients.find((c) => c.id === p.organisationId)?.nom ?? '—'
          ) : (
            <EditableField
              value={p.organisationId ?? ''}
              onSave={updateProjetField.bind(null, p.id, 'organisationId')}
              type="select"
              options={clientOptions}
            />
          )}
        </td>
      )}
      {isVisible('track') && (
        <td className="pl-3 text-muted">
          {readOnly ? (
            (p.track && TRACK_LABELS[p.track]) ?? '—'
          ) : (
            <EditableField
              value={p.track ?? ''}
              onSave={updateProjetField.bind(null, p.id, 'track')}
              type="select"
              options={trackOptions}
            />
          )}
        </td>
      )}
      {isVisible('stade') && (
        <td className="pl-3 text-muted">
          <div className="flex items-center gap-2">
            <StatusDot active={p.stade === 'EN_COURS'} muted={p.stade === 'ABANDONNE'} />
            {readOnly ? (
              STADE_PROJET_LABELS[p.stade] ?? p.stade
            ) : (
              <EditableField
                value={p.stade}
                onSave={updateProjetField.bind(null, p.id, 'stade')}
                type="select"
                options={stadeOptions}
              />
            )}
          </div>
        </td>
      )}
      {!readOnly && (
        <td className="pl-3">
          <DeleteButton
            action={deleteProjet.bind(null, p.id)}
            confirmMessage={`Supprimer le projet ${p.nom} ? Fichiers, tâches et dépenses associés seront aussi supprimés.`}
          />
        </td>
      )}
    </tr>
  );

  const colCount =
    (readOnly ? 1 : 3) +
    [isVisible('code'), isVisible('client'), isVisible('track'), isVisible('stade')].filter(
      Boolean
    ).length;

  return (
    <div>
      <DatabaseToolbar
        view={view}
        properties={properties}
        views={['list', 'board']}
        createSlot={
          readOnly ? undefined : (
            <Link href="/projets/new" className="text-sm text-muted hover:text-fg">
              + Nouveau
            </Link>
          )
        }
      />

      {!readOnly && state.view === 'list' && selected.ids.size > 0 && (
        <div className="mb-2 flex flex-wrap items-center gap-3 border border-line bg-line/20 px-3 py-2 text-sm">
          <span className="text-muted">{selected.ids.size} sélectionné(s)</span>
          <select
            aria-label="Déplacer la sélection vers"
            defaultValue=""
            onChange={(e) => bulkMove(e.target.value)}
            disabled={pending}
            className="border border-line bg-bg px-2 py-1 text-xs text-fg focus:border-accent focus:outline-none"
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
            onClick={bulkDelete}
            disabled={pending}
            className="px-2 py-1 text-xs text-accent hover:bg-line/40 disabled:opacity-40"
          >
            Supprimer
          </button>
          <button
            type="button"
            onClick={selected.clear}
            className="ml-auto text-xs text-muted hover:text-fg"
          >
            Annuler
          </button>
        </div>
      )}

      {state.view === 'list' ? (
        <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="divide-x divide-line border-b border-muted text-xs uppercase tracking-wide text-muted">
              {!readOnly && (
                <th className="w-6 py-2 font-normal">
                  <input
                    type="checkbox"
                    aria-label="Tout sélectionner"
                    checked={selected.allSelected}
                    onChange={selected.toggleAll}
                  />
                </th>
              )}
              {isVisible('code') && <th className="pl-3 font-normal">Code</th>}
              <th className="pl-3 font-normal">Nom</th>
              {isVisible('client') && <th className="pl-3 font-normal">Client</th>}
              {isVisible('track') && <th className="pl-3 font-normal">Track</th>}
              {isVisible('stade') && <th className="pl-3 font-normal">Stade</th>}
              {!readOnly && <th className="w-6 pl-3 font-normal" />}
            </tr>
          </thead>
          <tbody>
            {groups
              ? groups.map((g) => (
                  <Fragment key={g.key}>
                    <tr>
                      <td
                        colSpan={colCount}
                        className="pb-1 pt-5 text-[10px] uppercase tracking-[0.12em] text-muted"
                      >
                        {g.label} <span className="text-line-strong">({g.rows.length})</span>
                      </td>
                    </tr>
                    {g.rows.map(renderRow)}
                  </Fragment>
                ))
              : filtered.map(renderRow)}
            {!readOnly && !groups && <AddProjetRow clients={clients} />}
          </tbody>
        </table>
        </div>
      ) : (
        <div className="flex gap-6 overflow-x-auto pb-2">
          {boardGroups.map((g, i) => (
            <div key={g.key} className="flex w-64 shrink-0 gap-6">
              {i > 0 && <div className="w-px shrink-0 bg-line" />}
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted">
                  <StatusDot active={g.key === 'EN_COURS'} muted={g.key === 'ABANDONNE'} />
                  {g.label}
                  <span className="text-line-strong">({g.rows.length})</span>
                </p>
                <div className="mt-3 space-y-2">
                  {g.rows.map((p) => (
                    <ProjetCard key={p.id} projet={p} />
                  ))}
                  {g.rows.length === 0 && <p className="text-xs text-line-strong">—</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Sélection multiple, dérivée des lignes actuellement visibles.
function useSelection<T extends { id: string }>(rows: T[]) {
  const [ids, setIds] = useState<Set<string>>(() => new Set());
  const allSelected = rows.length > 0 && rows.every((r) => ids.has(r.id));

  return {
    ids,
    toggle: (id: string) =>
      setIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      }),
    toggleAll: () => setIds(allSelected ? new Set<string>() : new Set(rows.map((r) => r.id))),
    clear: () => setIds(new Set<string>()),
    allSelected,
  };
}
