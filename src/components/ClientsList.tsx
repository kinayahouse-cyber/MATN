'use client';

import { Fragment, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { EditableField } from '@/components/EditableField';
import { DeleteButton } from '@/components/DeleteButton';
import { DatabaseToolbar } from '@/components/database/DatabaseToolbar';
import { useDatabaseView } from '@/components/database/useDatabaseView';
import type { PropertyDef } from '@/components/database/types';
import { updateOrganisationField, deleteOrganisation } from '@/app/(app)/clients/actions';
import {
  TRACK_LABELS,
  TYPE_ORGANISATION_LABELS,
  ETAT_PROSPECTION_LABELS,
  SECTEUR_LABELS,
  TRACK_TONE,
  ETAT_PROSPECTION_TONE,
  SECTEUR_TONE,
} from '@/lib/labels';
import { TagSelect } from '@/components/ui/TagSelect';


const typeOptions = Object.entries(TYPE_ORGANISATION_LABELS).map(([value, label]) => ({
  value,
  label,
}));
const trackOptions = Object.entries(TRACK_LABELS).map(([value, label]) => ({ value, label }));
const etatProspectionOptions = Object.entries(ETAT_PROSPECTION_LABELS).map(([value, label]) => ({
  value,
  label,
}));
const secteurOptions = Object.entries(SECTEUR_LABELS).map(([value, label]) => ({ value, label }));

type Client = {
  id: string;
  nom: string;
  type: string;
  etatProspection: string;
  track: string | null;
  secteur: string | null;
};

export function ClientsList({ clients }: { clients: Client[] }) {
  const properties = useMemo<PropertyDef<Client>[]>(
    () => [
      { key: 'nom', label: 'Nom', getValue: (c) => c.nom, alwaysVisible: true, groupable: false },
      {
        key: 'type',
        label: 'Type',
        getValue: (c) => c.type,
        format: (v) => TYPE_ORGANISATION_LABELS[v] ?? v,
        options: typeOptions,
      },
      {
        key: 'etatProspection',
        label: 'Prospection',
        getValue: (c) => c.etatProspection,
        format: (v) => ETAT_PROSPECTION_LABELS[v] ?? v,
        options: etatProspectionOptions,
      },
      {
        key: 'track',
        label: 'Track',
        getValue: (c) => c.track ?? '',
        format: (v) => TRACK_LABELS[v] ?? v,
        options: trackOptions,
      },
      {
        key: 'secteur',
        label: 'Secteur',
        getValue: (c) => c.secteur ?? '',
        format: (v) => SECTEUR_LABELS[v] ?? v,
        options: secteurOptions,
      },
    ],
    []
  );

  const searchKeys = useCallback((c: Client) => [c.nom, c.secteur ?? ''], []);
  const view = useDatabaseView<Client>({ rows: clients, properties, searchKeys });
  const { filtered, groups, isVisible } = view;

  const colCount =
    2 +
    [
      isVisible('type'),
      isVisible('etatProspection'),
      isVisible('track'),
      isVisible('secteur'),
    ].filter(Boolean).length;

  const renderRow = (c: Client) => (
    <tr key={c.id} className="divide-x divide-line border-b border-line">
      <td className="py-2 pr-3">
        <Link href={`/clients/${c.id}`} className="hover:underline">
          {c.nom}
        </Link>
      </td>
      {isVisible('type') && (
        <td className="pl-3 text-muted">
          <EditableField
            value={c.type}
            onSave={updateOrganisationField.bind(null, c.id, 'type')}
            type="select"
            options={typeOptions}
          />
        </td>
      )}
      {isVisible('etatProspection') && (
        <td className="pl-3">
          <TagSelect
            value={c.etatProspection}
            options={etatProspectionOptions}
            onSave={updateOrganisationField.bind(null, c.id, 'etatProspection')}
            tone={ETAT_PROSPECTION_TONE[c.etatProspection] ?? 'neutral'}
            ariaLabel={`État de prospection de ${c.nom}`}
          />
        </td>
      )}
      {isVisible('track') && (
        <td className="pl-3">
          {c.track ? (
            <TagSelect
              value={c.track}
              options={trackOptions}
              onSave={updateOrganisationField.bind(null, c.id, 'track')}
              tone={TRACK_TONE[c.track] ?? 'neutral'}
              ariaLabel={`Track de ${c.nom}`}
            />
          ) : (
            <EditableField
              value=""
              onSave={updateOrganisationField.bind(null, c.id, 'track')}
              type="select"
              options={trackOptions}
              className="text-muted"
            />
          )}
        </td>
      )}
      {isVisible('secteur') && (
        <td className="pl-3">
          {c.secteur ? (
            <TagSelect
              value={c.secteur}
              options={secteurOptions}
              onSave={updateOrganisationField.bind(null, c.id, 'secteur')}
              tone={SECTEUR_TONE[c.secteur] ?? 'neutral'}
              ariaLabel={`Secteur de ${c.nom}`}
            />
          ) : (
            <EditableField
              value=""
              onSave={updateOrganisationField.bind(null, c.id, 'secteur')}
              type="select"
              options={secteurOptions}
              className="text-muted"
            />
          )}
        </td>
      )}
      <td className="pl-3">
        <DeleteButton
          action={deleteOrganisation.bind(null, c.id)}
          confirmMessage={`Supprimer ${c.nom} ? Les projets liés seront détachés, pas supprimés.`}
        />
      </td>
    </tr>
  );

  return (
    <div>
      <DatabaseToolbar
        view={view}
        properties={properties}
        createSlot={
          <Link href="/clients/new" className="text-sm text-muted hover:text-fg">
            + Nouveau
          </Link>
        }
      />

      {filtered.length === 0 ? (
        <p className="text-sm text-muted">Aucun client.</p>
      ) : (
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="divide-x divide-line border-b border-muted text-xs uppercase tracking-wide text-muted">
              <th className="py-2 font-normal">Nom</th>
              {isVisible('type') && <th className="pl-3 font-normal">Type</th>}
              {isVisible('etatProspection') && <th className="pl-3 font-normal">Prospection</th>}
              {isVisible('track') && <th className="pl-3 font-normal">Track</th>}
              {isVisible('secteur') && <th className="pl-3 font-normal">Secteur</th>}
              <th className="w-6 pl-3 font-normal" />
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
          </tbody>
        </table>
      )}
    </div>
  );
}
