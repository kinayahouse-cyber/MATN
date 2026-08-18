'use client';

import { Fragment, useCallback, useMemo } from 'react';
import { EditableField } from '@/components/EditableField';
import { DeleteButton } from '@/components/DeleteButton';
import { TacheDoneCheckbox } from '@/components/TacheDoneCheckbox';
import { AddTacheRow } from '@/components/AddTacheRow';
import { DatabaseToolbar } from '@/components/database/DatabaseToolbar';
import { useDatabaseView } from '@/components/database/useDatabaseView';
import type { PropertyDef } from '@/components/database/types';
import { updateTacheField, deleteTache } from '@/app/(app)/projets/actions';
import { STATUT_TACHE_LABELS } from '@/lib/labels';

const statutTacheOptions = Object.entries(STATUT_TACHE_LABELS).map(([value, label]) => ({
  value,
  label,
}));
const STATUT_VALUES = Object.keys(STATUT_TACHE_LABELS);

type Utilisateur = { id: string; nom: string | null; email: string };
type Tache = {
  id: string;
  libelle: string;
  description: string | null;
  statut: string;
  echeance: Date | null;
  assigneAId: string | null;
};

// Deux vues sur le même moteur de tri/filtre/groupement (référence : mockup « Card / List » du
// project management panel) — Card = colonnes par statut, List = tableau éditable en place.
export function TacheList({
  projetId,
  taches,
  utilisateurs,
}: {
  projetId: string;
  taches: Tache[];
  utilisateurs: Utilisateur[];
}) {
  const userOptions = useMemo(
    () => utilisateurs.map((u) => ({ value: u.id, label: u.nom ?? u.email })),
    [utilisateurs]
  );

  const properties = useMemo<PropertyDef<Tache>[]>(
    () => [
      {
        key: 'libelle',
        label: 'Tâche',
        getValue: (t) => t.libelle,
        alwaysVisible: true,
        groupable: false,
      },
      {
        key: 'statut',
        label: 'Statut',
        getValue: (t) => t.statut,
        format: (v) => STATUT_TACHE_LABELS[v] ?? v,
        options: statutTacheOptions,
        alwaysVisible: true,
      },
      {
        key: 'assigneAId',
        label: 'Assigné à',
        getValue: (t) => t.assigneAId ?? '',
        format: (v) => userOptions.find((o) => o.value === v)?.label ?? 'Non assigné',
        options: userOptions,
        alwaysVisible: true,
      },
      {
        key: 'echeance',
        label: 'Échéance',
        getValue: (t) => (t.echeance ? t.echeance.toISOString().slice(0, 10) : ''),
        alwaysVisible: true,
        groupable: false,
      },
    ],
    [userOptions]
  );

  const searchKeys = useCallback((t: Tache) => [t.libelle, t.description ?? ''], []);
  const view = useDatabaseView<Tache>({ rows: taches, properties, searchKeys });
  const { state, filtered, groups } = view;

  // Vue Card : le groupement pilote les colonnes ; par défaut on retombe sur le statut (Kanban).
  const boardGroups = useMemo(() => {
    if (groups) return groups;
    const prop = properties.find((p) => p.key === 'statut')!;
    return STATUT_VALUES.map((s) => ({
      key: s,
      label: STATUT_TACHE_LABELS[s],
      rows: filtered.filter((t) => prop.getValue(t) === s),
    }));
  }, [groups, filtered, properties]);

  const renderCard = (t: Tache) => {
    const fait = t.statut === 'FAIT';
    return (
      <div key={t.id} className="border border-line bg-bg p-3">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-medium leading-snug ${fait ? 'text-muted line-through' : ''}`}>
            {t.libelle}
          </p>
          <DeleteButton action={deleteTache.bind(null, t.id)} />
        </div>
        {t.description && (
          <p className="mt-1 line-clamp-2 text-xs text-muted">{t.description}</p>
        )}
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <EditableField
            value={t.statut}
            onSave={updateTacheField.bind(null, t.id, 'statut')}
            type="select"
            options={statutTacheOptions}
            className={`border px-1.5 text-[10px] uppercase tracking-[0.08em] ${
              t.statut === 'EN_COURS' ? 'border-accent text-accent' : 'border-line text-muted'
            }`}
          />
          <EditableField
            value={t.echeance ? t.echeance.toISOString().slice(0, 10) : ''}
            onSave={updateTacheField.bind(null, t.id, 'echeance')}
            type="date"
            placeholder="échéance"
            className="border border-line px-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-muted"
          />
          <EditableField
            value={t.assigneAId ?? ''}
            onSave={updateTacheField.bind(null, t.id, 'assigneAId')}
            type="select"
            options={userOptions}
            placeholder="non assigné"
            className="border border-line px-1.5 text-[10px] uppercase tracking-[0.08em] text-muted"
          />
        </div>
      </div>
    );
  };

  const renderRow = (t: Tache) => {
    const fait = t.statut === 'FAIT';
    return (
      <tr key={t.id} className="border-b border-line">
        <td className="py-2">
          <div className="flex items-center gap-2">
            <TacheDoneCheckbox id={t.id} statut={t.statut} />
            <EditableField
              value={t.libelle}
              onSave={updateTacheField.bind(null, t.id, 'libelle')}
              className={`flex-1 text-sm font-medium ${fait ? 'text-muted line-through' : ''}`}
            />
          </div>
        </td>
        <td className="text-muted">
          <EditableField
            value={t.statut}
            onSave={updateTacheField.bind(null, t.id, 'statut')}
            type="select"
            options={statutTacheOptions}
          />
        </td>
        <td className="text-muted">
          <EditableField
            value={t.echeance ? t.echeance.toISOString().slice(0, 10) : ''}
            onSave={updateTacheField.bind(null, t.id, 'echeance')}
            type="date"
          />
        </td>
        <td className="text-muted">
          <EditableField
            value={t.assigneAId ?? ''}
            onSave={updateTacheField.bind(null, t.id, 'assigneAId')}
            type="select"
            options={userOptions}
            placeholder="non assigné"
          />
        </td>
        <td>
          <DeleteButton action={deleteTache.bind(null, t.id)} />
        </td>
      </tr>
    );
  };

  return (
    <div>
      <DatabaseToolbar view={view} properties={properties} views={['list', 'board']} />

      {filtered.length === 0 ? (
        <p className="text-sm text-muted">
          {taches.length === 0 ? 'Aucune tâche.' : 'Aucun résultat pour ces filtres.'}
        </p>
      ) : state.view === 'board' ? (
        <div className="flex gap-6 overflow-x-auto pb-2">
          {boardGroups.map((g, i) => (
            <div key={g.key} className="flex w-64 shrink-0 gap-6">
              {i > 0 && <div className="w-px shrink-0 bg-line" />}
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-wide text-muted">
                  {g.label} <span className="text-line-strong">({g.rows.length})</span>
                </p>
                <div className="mt-3 space-y-2">
                  {g.rows.map(renderCard)}
                  {g.rows.length === 0 && <p className="text-xs text-line-strong">—</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-muted text-xs uppercase tracking-wide text-muted">
              <th className="py-2 font-normal">Tâche</th>
              <th className="font-normal">Statut</th>
              <th className="font-normal">Échéance</th>
              <th className="font-normal">Assigné à</th>
              <th className="w-6 font-normal" />
            </tr>
          </thead>
          <tbody>
            {groups
              ? groups.map((g) => (
                  <Fragment key={g.key}>
                    <tr>
                      <td colSpan={5} className="pb-1 pt-5 text-[10px] uppercase tracking-[0.12em] text-muted">
                        {g.label} <span className="text-line-strong">({g.rows.length})</span>
                      </td>
                    </tr>
                    {g.rows.map(renderRow)}
                  </Fragment>
                ))
              : filtered.map(renderRow)}
          </tbody>
        </table>
      )}

      <table className="w-full">
        <tbody>
          <AddTacheRow projetId={projetId} utilisateurs={utilisateurs} />
        </tbody>
      </table>
    </div>
  );
}
