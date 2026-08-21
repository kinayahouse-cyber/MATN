'use client';

import { Fragment, useCallback, useMemo, useState, useTransition } from 'react';
import { EditableField } from '@/components/EditableField';
import { DeleteButton } from '@/components/DeleteButton';
import { TacheDoneCheckbox } from '@/components/TacheDoneCheckbox';
import { AddTacheRow } from '@/components/AddTacheRow';
import { TacheCalendar } from '@/components/TacheCalendar';
import { TacheTimeline } from '@/components/TacheTimeline';
import { DatabaseToolbar } from '@/components/database/DatabaseToolbar';
import { useDatabaseView } from '@/components/database/useDatabaseView';
import type { PropertyDef } from '@/components/database/types';
import { Card } from '@/components/ui/Card';
import { TagSelect } from '@/components/ui/TagSelect';
import { KanbanQuickAdd } from '@/components/KanbanQuickAdd';
import { updateTacheField, deleteTache } from '@/app/(app)/projets/actions';
import { STATUT_TACHE_LABELS, PRIORITE_TACHE_LABELS, PRIORITE_TACHE_TONE } from '@/lib/labels';
import type { StatutTache } from '@prisma/client';

const statutTacheOptions = Object.entries(STATUT_TACHE_LABELS).map(([value, label]) => ({
  value,
  label,
}));
const prioriteTacheOptions = Object.entries(PRIORITE_TACHE_LABELS).map(([value, label]) => ({
  value,
  label,
}));
const STATUT_VALUES = Object.keys(STATUT_TACHE_LABELS);

// Seules ces propriétés sont modifiables par glisser-déposer : ce sont celles que le kanban peut
// écrire via updateTacheField. Grouper par autre chose désactive le drag plutôt que de faire
// croire à une action possible.
const DRAGGABLE_GROUP_KEYS = ['statut', 'assigneAId', 'priorite'] as const;

const statutTone = (statut: string) =>
  statut === 'EN_COURS' ? 'accent' : statut === 'EN_PAUSE' ? 'amber' : statut === 'FAIT' ? 'emerald' : 'neutral';

type Utilisateur = { id: string; nom: string | null; email: string };
type Tache = {
  id: string;
  libelle: string;
  description: string | null;
  statut: string;
  priorite: string;
  dateDebut: Date | null;
  echeance: Date | null;
  assigneAId: string | null;
};

// Quatre vues sur le même moteur de tri/filtre/groupement : List (tableau), Timeline (frise
// début → échéance), Kanban (colonnes, glisser-déposer) et Calendrier (grille mensuelle).
export function TacheList({
  projetId,
  taches,
  utilisateurs,
  todayISO,
}: {
  projetId: string;
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
        key: 'priorite',
        label: 'Priorité',
        getValue: (t) => t.priorite,
        format: (v) => PRIORITE_TACHE_LABELS[v] ?? v,
        options: prioriteTacheOptions,
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
    [userOptions]
  );

  const searchKeys = useCallback((t: Tache) => [t.libelle, t.description ?? ''], []);
  const view = useDatabaseView<Tache>({ rows: taches, properties, searchKeys });
  const { state, filtered, groups } = view;

  // Vue Kanban : le groupement pilote les colonnes ; par défaut on retombe sur le statut.
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
    const current =
      groupKey === 'statut' ? tache.statut : groupKey === 'priorite' ? tache.priorite : (tache.assigneAId ?? '');
    if (current === targetValue) return;
    startTransition(async () => {
      await updateTacheField(id, groupKey as 'statut' | 'assigneAId' | 'priorite', targetValue);
    });
  };

  // Carte Kanban : pastille priorité, titre, séparateur, description (3 lignes), pied
  // Assigné à / Échéance — même rythme visuel que la référence fournie, adapté à nos données
  // (pas de tags libres sur Tache, donc pas de rangée de chips génériques).
  const renderCard = (t: Tache, draggable = false) => {
    const fait = t.statut === 'FAIT';
    return (
      <Card
        key={t.id}
        padded={false}
        className={`rounded-xl p-3.5 transition-colors duration-fast hover:border-line-strong ${
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
            <div className="flex flex-wrap items-center gap-1.5">
              <TagSelect
                value={t.priorite}
                options={prioriteTacheOptions}
                onSave={updateTacheField.bind(null, t.id, 'priorite')}
                tone={PRIORITE_TACHE_TONE[t.priorite] ?? 'neutral'}
                ariaLabel={`Priorité de ${t.libelle}`}
              />
              <TagSelect
                value={t.statut}
                options={statutTacheOptions}
                onSave={updateTacheField.bind(null, t.id, 'statut')}
                tone={statutTone(t.statut)}
                ariaLabel={`Statut de ${t.libelle}`}
              />
            </div>
            <DeleteButton action={deleteTache.bind(null, t.id)} />
          </div>

          <p
            className={`mt-2.5 border-b border-line pb-2.5 text-sm font-semibold leading-snug ${
              fait ? 'text-muted line-through' : 'text-fg'
            }`}
          >
            {t.libelle}
          </p>

          {t.description && (
            <p className="mt-2.5 line-clamp-3 text-xs leading-relaxed text-muted">{t.description}</p>
          )}

          <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <p className="text-muted">Assigné à</p>
              <p className="mt-0.5 font-medium text-fg">
                {userOptions.find((o) => o.value === t.assigneAId)?.label ?? 'Non assigné'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-muted">Échéance</p>
              <p className="mt-0.5 font-mono font-medium text-fg">
                {t.echeance ? t.echeance.toISOString().slice(0, 10) : '—'}
              </p>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  const renderRow = (t: Tache) => {
    const fait = t.statut === 'FAIT';
    return (
      <tr key={t.id} className="divide-x divide-line border-b border-line">
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
        <td className="pl-3 text-muted">
          <EditableField
            value={t.statut}
            onSave={updateTacheField.bind(null, t.id, 'statut')}
            type="select"
            options={statutTacheOptions}
          />
        </td>
        <td className="pl-3 text-muted">
          <TagSelect
            value={t.priorite}
            options={prioriteTacheOptions}
            onSave={updateTacheField.bind(null, t.id, 'priorite')}
            tone={PRIORITE_TACHE_TONE[t.priorite] ?? 'neutral'}
            ariaLabel={`Priorité de ${t.libelle}`}
          />
        </td>
        <td className="pl-3 text-muted">
          <EditableField
            value={t.dateDebut ? t.dateDebut.toISOString().slice(0, 10) : ''}
            onSave={updateTacheField.bind(null, t.id, 'dateDebut')}
            type="date"
          />
        </td>
        <td className="pl-3 text-muted">
          <EditableField
            value={t.echeance ? t.echeance.toISOString().slice(0, 10) : ''}
            onSave={updateTacheField.bind(null, t.id, 'echeance')}
            type="date"
          />
        </td>
        <td className="pl-3 text-muted">
          <EditableField
            value={t.assigneAId ?? ''}
            onSave={updateTacheField.bind(null, t.id, 'assigneAId')}
            type="select"
            options={userOptions}
            placeholder="non assigné"
          />
        </td>
        <td className="pl-3">
          <DeleteButton action={deleteTache.bind(null, t.id)} />
        </td>
      </tr>
    );
  };

  const empty =
    taches.length === 0 ? 'Aucune tâche.' : 'Aucun résultat pour ces filtres.';

  return (
    <div className={pending ? 'opacity-70' : ''}>
      <DatabaseToolbar
        view={view}
        properties={properties}
        views={['list', 'timeline', 'board', 'calendar']}
        showSearch={false}
      />

      {state.view === 'calendar' ? (
        <TacheCalendar taches={filtered} todayISO={todayISO} />
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted">{empty}</p>
      ) : state.view === 'board' ? (
        <div className="flex gap-4 overflow-x-auto pb-2">
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
              className={`w-72 shrink-0 rounded-2xl border p-3 transition-colors duration-fast ${
                overKey === g.key && canDrag ? 'border-accent bg-accent/5' : 'border-line bg-surface/60'
              }`}
            >
              <p className="px-1 py-1 font-display text-lg tracking-tight text-fg">
                {g.label} <span className="text-sm font-normal text-line-strong">({g.rows.length})</span>
              </p>
              <div className="mt-2 space-y-2.5">
                {g.rows.map((t) => renderCard(t, canDrag))}
                {g.rows.length === 0 && !canDrag && (
                  <p className="px-1 py-4 text-center text-xs text-line-strong">—</p>
                )}
                {groupKey === 'statut' && (
                  <KanbanQuickAdd projetId={projetId} statut={g.key as StatutTache} />
                )}
              </div>
            </div>
          ))}
        </div>
      ) : state.view === 'timeline' ? (
        <TacheTimeline taches={filtered} utilisateurs={utilisateurs} todayISO={todayISO} />
      ) : (
        <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="divide-x divide-line border-b border-line text-xs uppercase tracking-wide text-muted">
              <th className="py-2 font-normal">Tâche</th>
              <th className="pl-3 font-normal">Statut</th>
              <th className="pl-3 font-normal">Priorité</th>
              <th className="pl-3 font-normal">Début</th>
              <th className="pl-3 font-normal">Échéance</th>
              <th className="pl-3 font-normal">Assigné à</th>
              <th className="w-6 pl-3 font-normal" />
            </tr>
          </thead>
          <tbody>
            {groups
              ? groups.map((g) => (
                  <Fragment key={g.key}>
                    <tr>
                      <td
                        colSpan={7}
                        className="pb-1 pt-5 text-[10px] uppercase tracking-[0.12em] text-muted"
                      >
                        {g.label} <span className="text-line-strong">({g.rows.length})</span>
                      </td>
                    </tr>
                    {g.rows.map(renderRow)}
                  </Fragment>
                ))
              : filtered.map(renderRow)}
          </tbody>
        </table>
        </div>
      )}

      {state.view !== 'calendar' && (
        <div className="overflow-x-auto">
        <table className="w-full">
          <tbody>
            <AddTacheRow projetId={projetId} utilisateurs={utilisateurs} />
          </tbody>
        </table>
        </div>
      )}
    </div>
  );
}
