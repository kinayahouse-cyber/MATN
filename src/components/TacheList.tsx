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

type Utilisateur = { id: string; nom: string | null; email: string };
type Tache = {
  id: string;
  libelle: string;
  description: string | null;
  statut: string;
  echeance: Date | null;
  assigneAId: string | null;
};

// Liste type « flux » plutôt que tableau (référence inbox) : identité forte à gauche, métadonnées
// en pastilles sous le libellé, barre d'accent sur la tâche en cours. La barre d'outils apporte le
// tri/filtre/groupement réel (même moteur que Projects/Clients/Orbit) sans changer cette grammaire.
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
  const { filtered, groups } = view;

  const renderTache = (t: Tache) => {
    const enCours = t.statut === 'EN_COURS';
    const fait = t.statut === 'FAIT';
    return (
      <li key={t.id} className="relative flex gap-3 py-3 pl-3">
        {enCours && <span aria-hidden className="absolute bottom-3 left-0 top-3 w-0.5 bg-accent" />}
        <div className="pt-0.5">
          <TacheDoneCheckbox id={t.id} statut={t.statut} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <EditableField
              value={t.libelle}
              onSave={updateTacheField.bind(null, t.id, 'libelle')}
              className={`flex-1 text-sm font-medium ${fait ? 'text-muted line-through' : ''}`}
            />
            <DeleteButton action={deleteTache.bind(null, t.id)} />
          </div>

          <EditableField
            value={t.description ?? ''}
            onSave={updateTacheField.bind(null, t.id, 'description')}
            type="textarea"
            placeholder="+ description"
            className="text-xs text-muted"
          />

          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <EditableField
              value={t.statut}
              onSave={updateTacheField.bind(null, t.id, 'statut')}
              type="select"
              options={statutTacheOptions}
              className={`border px-1.5 text-[10px] uppercase tracking-[0.08em] ${
                enCours ? 'border-accent text-accent' : 'border-line text-muted'
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
      </li>
    );
  };

  return (
    <div>
      <DatabaseToolbar view={view} properties={properties} />

      {filtered.length === 0 ? (
        <p className="text-sm text-muted">
          {taches.length === 0 ? 'Aucune tâche.' : 'Aucun résultat pour ces filtres.'}
        </p>
      ) : (
        <ul className="divide-y divide-line">
          {groups
            ? groups.map((g) => (
                <Fragment key={g.key}>
                  <li className="pb-1 pt-5 text-[10px] uppercase tracking-[0.12em] text-muted">
                    {g.label} <span className="text-line-strong">({g.rows.length})</span>
                  </li>
                  {g.rows.map(renderTache)}
                </Fragment>
              ))
            : filtered.map(renderTache)}
        </ul>
      )}

      <table className="w-full">
        <tbody>
          <AddTacheRow projetId={projetId} utilisateurs={utilisateurs} />
        </tbody>
      </table>
    </div>
  );
}
