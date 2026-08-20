'use client';

import { Fragment, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { EditableField } from '@/components/EditableField';
import { DatabaseToolbar } from '@/components/database/DatabaseToolbar';
import { useDatabaseView } from '@/components/database/useDatabaseView';
import type { PropertyDef } from '@/components/database/types';
import { TagSelect } from '@/components/ui/TagSelect';
import { StatTile } from '@/components/ui/Stat';
import { updateProjetField } from '@/app/(app)/projets/actions';
import { TRACK_LABELS, STADE_PROJET_LABELS, TRACK_TONE } from '@/lib/labels';

const trackOptions = Object.entries(TRACK_LABELS).map(([value, label]) => ({ value, label }));
const stadeOptions = Object.entries(STADE_PROJET_LABELS).map(([value, label]) => ({ value, label }));

function formatDZD(n: number) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n) + ' DZD';
}

type Projet = {
  id: string;
  code: string;
  nom: string;
  track: string | null;
  stade: string;
  budget: number | null;
  budgetEncaisse: number | null;
  budgetDepense: number;
};

// Vue agrégée MVP : une ligne par projet, budget/encaissé édités en place (mêmes actions que le
// Project Workspace), dépensé et marge dérivés en lecture seule — aucun rapprochement
// facture/paiement n'est modélisé, comme dans ProjectFinance.
export function FinanceBoard({ projets }: { projets: Projet[] }) {
  const properties = useMemo<PropertyDef<Projet>[]>(
    () => [
      { key: 'nom', label: 'Projet', getValue: (p) => p.nom, alwaysVisible: true, groupable: false },
      {
        key: 'track',
        label: 'Track',
        getValue: (p) => p.track ?? '',
        format: (v) => TRACK_LABELS[v] ?? v,
        options: trackOptions,
        alwaysVisible: true,
      },
      {
        key: 'stade',
        label: 'Stade',
        getValue: (p) => p.stade,
        format: (v) => STADE_PROJET_LABELS[v] ?? v,
        options: stadeOptions,
        alwaysVisible: true,
      },
      {
        key: 'budget',
        label: 'Budget total',
        getValue: (p) => (p.budget !== null ? String(p.budget) : ''),
        alwaysVisible: true,
        groupable: false,
      },
      {
        key: 'budgetDepense',
        label: 'Dépensé',
        getValue: (p) => String(p.budgetDepense),
        alwaysVisible: true,
        groupable: false,
      },
      {
        key: 'budgetEncaisse',
        label: 'Encaissé',
        getValue: (p) => (p.budgetEncaisse !== null ? String(p.budgetEncaisse) : ''),
        alwaysVisible: true,
        groupable: false,
      },
    ],
    []
  );

  const searchKeys = useCallback((p: Projet) => [p.nom, p.code], []);
  const view = useDatabaseView<Projet>({ rows: projets, properties, searchKeys });
  const { filtered, groups } = view;

  const totals = useMemo(
    () =>
      filtered.reduce(
        (acc, p) => ({
          budget: acc.budget + (p.budget ?? 0),
          depense: acc.depense + p.budgetDepense,
          encaisse: acc.encaisse + (p.budgetEncaisse ?? 0),
        }),
        { budget: 0, depense: 0, encaisse: 0 }
      ),
    [filtered]
  );
  const marge = totals.budget - totals.depense;

  const renderRow = (p: Projet) => {
    const budgetRaw = p.budget !== null ? String(p.budget) : '';
    const encaisseRaw = p.budgetEncaisse !== null ? String(p.budgetEncaisse) : '';
    const margeProjet = p.budget !== null ? p.budget - p.budgetDepense : null;

    return (
      <tr key={p.id} className="border-b border-line">
        <td className="py-2 pr-4">
          <Link href={`/projets/${p.id}`} className="text-sm font-medium hover:underline">
            {p.code} — {p.nom}
          </Link>
        </td>
        <td className="pr-4">
          {p.track ? (
            <TagSelect
              value={p.track}
              options={trackOptions}
              onSave={updateProjetField.bind(null, p.id, 'track')}
              tone={TRACK_TONE[p.track] ?? 'neutral'}
              ariaLabel={`Track de ${p.nom}`}
            />
          ) : (
            <EditableField
              value=""
              onSave={updateProjetField.bind(null, p.id, 'track')}
              type="select"
              options={trackOptions}
              className="text-muted"
            />
          )}
        </td>
        <td className="pr-4">
          <TagSelect
            value={p.stade}
            options={stadeOptions}
            onSave={updateProjetField.bind(null, p.id, 'stade')}
            tone="accent"
            ariaLabel={`Stade de ${p.nom}`}
          />
        </td>
        <td className="pr-4 tabular-nums text-muted">
          <EditableField
            value={budgetRaw}
            displayValue={p.budget !== null ? formatDZD(p.budget) : undefined}
            onSave={updateProjetField.bind(null, p.id, 'budget')}
            type="number"
          />
        </td>
        <td className="pr-4 tabular-nums text-muted">{formatDZD(p.budgetDepense)}</td>
        <td className="pr-4 tabular-nums text-muted">
          <EditableField
            value={encaisseRaw}
            displayValue={p.budgetEncaisse !== null ? formatDZD(p.budgetEncaisse) : undefined}
            onSave={updateProjetField.bind(null, p.id, 'budgetEncaisse')}
            type="number"
          />
        </td>
        <td
          className={`tabular-nums ${
            margeProjet !== null && margeProjet < 0 ? 'text-rose-400' : 'text-muted'
          }`}
        >
          {margeProjet === null ? '—' : formatDZD(margeProjet)}
        </td>
      </tr>
    );
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <StatTile label="Budget total" value={formatDZD(totals.budget)} />
        <StatTile label="Dépensé" value={formatDZD(totals.depense)} />
        <StatTile label="Encaissé" value={formatDZD(totals.encaisse)} tone="positive" />
        <StatTile
          label="Marge prév."
          value={formatDZD(marge)}
          tone={marge < 0 ? 'negative' : 'positive'}
          caption="budget − dépensé"
        />
      </div>

      <div className="mt-6">
        <DatabaseToolbar view={view} properties={properties} />

        {filtered.length === 0 ? (
          <p className="text-sm text-muted">Aucun projet.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-wide text-muted">
                <th className="py-2 pr-4 font-normal">Projet</th>
                <th className="pr-4 font-normal">Track</th>
                <th className="pr-4 font-normal">Stade</th>
                <th className="pr-4 font-normal">Budget total</th>
                <th className="pr-4 font-normal">Dépensé</th>
                <th className="pr-4 font-normal">Encaissé</th>
                <th className="font-normal">Marge</th>
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
    </div>
  );
}
