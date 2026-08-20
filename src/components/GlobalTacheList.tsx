'use client';

import { Fragment, useCallback, useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { EditableField } from '@/components/EditableField';
import { DeleteButton } from '@/components/DeleteButton';
import { TacheDoneCheckbox } from '@/components/TacheDoneCheckbox';
import { TacheCalendar } from '@/components/TacheCalendar';
import { TacheTimeline } from '@/components/TacheTimeline';
import { DatabaseToolbar } from '@/components/database/DatabaseToolbar';
import { useDatabaseView } from '@/components/database/useDatabaseView';
import type { PropertyDef } from '@/components/database/types';
import { Card } from '@/components/ui/Card';
import { TagSelect } from '@/components/ui/TagSelect';
import { updateTacheField, deleteTache } from '@/app/(app)/projets/actions';
import { STATUT_TACHE_LABELS } from '@/lib/labels';

const statutTacheOptions = Object.entries(STATUT_TACHE_LABELS).map(([value, label]) => ({
  value,
  label,
}));
const STATUT_VALUES = Object.keys(STATUT_TACHE_LABELS);

// Mêmes clés que TacheList : seules statut/assigneAId sont des cibles de drop valides pour
// updateTacheField. Projet n'en fait volontairement pas partie — déplacer une tâche d'un projet à
// l'autre par glisser-déposer sortirait du cadre de cette vue (lecture + édition de champs, pas
// de réaffectation).
const DRAGGABLE_GROUP_KEYS = ['statut', 'assigneAId'] as const;

const statutTone = (statut: string) =>
  statut === 'EN_COURS' ? 'accent' : statut === 'FAIT' ? 'emerald' : 'neutral';

type Utilisateur = { id: string; nom: string | null; email: string };
type Tache = {
  id: string;
  libelle: string;
  description: string | null;
  statut: string;
  dateDebut: Date | null;
  echeance: Date | null;
  assigneAId: string | null;
  projetId: string;
  projetNom: string;
  projetCode: string;
};

// Variante inter-projets de TacheList : mêmes quatre vues (List/Timeline/Kanban/Calendrier) sur le
// même moteur de filtre/tri/groupement, avec une colonne/propriété Projet en plus. Pas de création
// inline ici — AddTacheRow est scopé à un seul projet, et une tâche sans projet n'existe pas dans
// ce schéma ; créer une tâche reste une action du Project Workspace.
export function GlobalTacheList({
  taches,
  utilisateurs,
  todayISO,
}: {
  taches: Tache[];
  utilisateurs: Utilisateur[];
  todayISO: string;
}) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [overKey, setOverKey] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const userOptions = useMemo(
    () => utilisateurs.map((u) => ({ value: u.id, label: u.nom ?? u.email })),
    [utilisateurs]
  );

  const projetOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const t of taches) map.set(t.projetId, `${t.projetCode} — ${t.projetNom}`);
    return Array.from(map, ([value, label]) => ({ value, label })).sort((a, b) =>
      a.label.localeCompare(b.label, 'fr')
    );
  }, [taches]);

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
        key: 'projetId',
        label: 'Projet',
        getValue: (t) => t.projetId,
        format: (v) => projetOptions.find((o) => o.value === v)?.label ?? v,
        options: projetOptions,
        alwaysVisible: true,
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
        key: 'dateDebut',
        label: 'Début',
        getValue: (t) => (t.dateDebut ? t.dateDebut.toISOString().slice(0, 10) : ''),
        alwaysVisible: true,
        groupable: false,
      },
      {
        key: 'echeance',
        label: 'Échéance',
        getValue: (t) => (t.echeance ? t.echeance.toISOString().slice(0, 10) : ''),
        alwaysVisible: true,
        groupable: false,
      },
    ],
    [userOptions, projetOptions]
  );

  const searchKeys = useCallback(
    (t: Tache) => [t.libelle, t.description ?? '', t.projetNom, t.projetCode],
    []
  );
  const view = useDatabaseView<Tache>({ rows: taches, properties, searchKeys });
  const { state, filtered, groups } = view;

  const groupKey = state.groupBy ?? 'statut';
  const canDrag = (DRAGGABLE_GROUP_KEYS as readonly string[]).includes(groupKey);

  const kanbanGroups = useMemo(() => {
    if (groups) return groups;
    const prop = properties.find((p) => p.key === 'statut')!;
    return STATUT_VALUES.map((s) => ({
      key: s,
      label: STATUT_TACHE_LABELS[s],
      rows: filtered.filter((t) => prop.getValue(t) === s),
    }));
  }, [groups, filtered, properties]);

  const dropInto = (targetValue: string) => {
    const id = dragId;
    setDragId(null);
    setOverKey(null);
    if (!id || !canDrag) return;
    const tache = taches.find((t) => t.id === id);
    if (!tache) return;
    const current = groupKey === 'statut' ? tache.statut : (tache.assigneAId ?? '');
    if (current === targetValue) return;
    startTransition(async () => {
      await updateTacheField(id, groupKey as 'statut' | 'assigneAId', targetValue);
    });
  };

  const renderCard = (t: Tache, draggable = false) => {
    const fait = t.statut === 'FAIT';
    return (
      <Card
        key={t.id}
        className={`transition-colors duration-fast hover:border-line-strong ${
          draggable ? 'cursor-grab active:cursor-grabbing' : ''
        } ${dragId === t.id ? 'opacity-40' : ''}`}
      >
        <div
          draggable={draggable}
          onDragStart={() => setDragId(t.id)}
          onDragEnd={() => {
            setDragId(null);
            setOverKey(null);
          }}
        >
          <div className="flex items-start justify-between gap-2">
            <p
              className={`text-sm font-medium leading-snug ${fait ? 'text-muted line-through' : ''}`}
            >
              {t.libelle}
            </p>
            <DeleteButton action={deleteTache.bind(null, t.id)} />
          </div>
          <Link
            href={`/projets/${t.projetId}`}
            className="mt-1 block truncate text-[11px] text-muted hover:text-fg hover:underline"
          >
            {t.projetCode} — {t.projetNom}
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <TagSelect
              value={t.statut}
              options={statutTacheOptions}
              onSave={updateTacheField.bind(null, t.id, 'statut')}
              tone={statutTone(t.statut)}
              ariaLabel={`Statut de ${t.libelle}`}
            />
            {t.echeance && (
              <span className="font-mono text-[11px] text-muted">
                {t.echeance.toISOString().slice(0, 10)}
              </span>
            )}
            {t.assigneAId && (
              <span className="text-[11px] text-muted">
                {userOptions.find((o) => o.value === t.assigneAId)?.label}
              </span>
            )}
          </div>
        </div>
      </Card>
    );
  };

  const renderRow = (t: Tache) => {
    const fait = t.statut === 'FAIT';
    return (
      <tr key={t.id} className="border-b border-line">
        <td className="py-2 pr-4">
          <div className="flex items-center gap-2">
            <TacheDoneCheckbox id={t.id} statut={t.statut} />
            <EditableField
              value={t.libelle}
              onSave={updateTacheField.bind(null, t.id, 'libelle')}
              className={`flex-1 text-sm font-medium ${fait ? 'text-muted line-through' : ''}`}
            />
          </div>
        </td>
        <td className="pr-4 text-muted">
          <Link href={`/projets/${t.projetId}`} className="text-xs hover:text-fg hover:underline">
            {t.projetCode}
          </Link>
        </td>
        <td className="pr-4 text-muted">
          <EditableField
            value={t.statut}
            onSave={updateTacheField.bind(null, t.id, 'statut')}
            type="select"
            options={statutTacheOptions}
          />
        </td>
        <td className="pr-4 text-muted">
          <EditableField
            value={t.dateDebut ? t.dateDebut.toISOString().slice(0, 10) : ''}
            onSave={updateTacheField.bind(null, t.id, 'dateDebut')}
            type="date"
          />
        </td>
        <td className="pr-4 text-muted">
          <EditableField
            value={t.echeance ? t.echeance.toISOString().slice(0, 10) : ''}
            onSave={updateTacheField.bind(null, t.id, 'echeance')}
            type="date"
          />
        </td>
        <td className="pr-4 text-muted">
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

  const empty = taches.length === 0 ? 'Aucune tâche.' : 'Aucun résultat pour ces filtres.';

  return (
    <div className={pending ? 'opacity-70' : ''}>
      <DatabaseToolbar view={view} properties={properties} views={['list', 'timeline', 'board', 'calendar']} />

      {state.view === 'calendar' ? (
        <TacheCalendar taches={filtered} todayISO={todayISO} />
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted">{empty}</p>
      ) : state.view === 'board' ? (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {kanbanGroups.map((g) => (
            <div
              key={g.key}
              data-kanban-column={g.key}
              onDragOver={(e) => {
                if (!canDrag || !dragId) return;
                e.preventDefault();
                setOverKey(g.key);
              }}
              onDragLeave={() => setOverKey((k) => (k === g.key ? null : k))}
              onDrop={(e) => {
                e.preventDefault();
                dropInto(g.key);
              }}
              className={`w-64 shrink-0 rounded-lg border p-2 transition-colors duration-fast ${
                overKey === g.key && canDrag ? 'border-accent bg-accent/5' : 'border-line bg-bg/40'
              }`}
            >
              <p className="px-1 py-1 text-xs uppercase tracking-wide text-muted">
                {g.label} <span className="text-line-strong">({g.rows.length})</span>
              </p>
              <div className="mt-1 space-y-2">
                {g.rows.map((t) => renderCard(t, canDrag))}
                {g.rows.length === 0 && (
                  <p className="px-1 py-4 text-center text-xs text-line-strong">
                    {canDrag ? 'Déposer ici' : '—'}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : state.view === 'timeline' ? (
        <TacheTimeline taches={filtered} utilisateurs={utilisateurs} todayISO={todayISO} />
      ) : (
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs uppercase tracking-wide text-muted">
              <th className="py-2 pr-4 font-normal">Tâche</th>
              <th className="pr-4 font-normal">Projet</th>
              <th className="pr-4 font-normal">Statut</th>
              <th className="pr-4 font-normal">Début</th>
              <th className="pr-4 font-normal">Échéance</th>
              <th className="pr-4 font-normal">Assigné à</th>
              <th className="w-6 font-normal" />
            </tr>
          </thead>
          <tbody>
            {groups
              ? groups.map((g) => (
                  <Fragment key={g.key}>
                    <tr>
                      <td colSpan={7} className="pb-1 pt-5 text-[10px] uppercase tracking-[0.12em] text-muted">
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
    </div>
  );
}
