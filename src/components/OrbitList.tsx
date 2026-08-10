'use client';

import { Fragment, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { EditableField } from '@/components/EditableField';
import { DeleteButton } from '@/components/DeleteButton';
import { DatabaseToolbar } from '@/components/database/DatabaseToolbar';
import { useDatabaseView } from '@/components/database/useDatabaseView';
import type { PropertyDef } from '@/components/database/types';
import { updateFournisseurField, deleteFournisseur } from '@/app/(app)/orbit/actions';
import { CATEGORIE_FOURNISSEUR_LABELS } from '@/lib/labels';

const categorieOptions = Object.entries(CATEGORIE_FOURNISSEUR_LABELS).map(([value, label]) => ({
  value,
  label,
}));

type Fournisseur = {
  id: string;
  nom: string;
  categorie: string | null;
  contact: string | null;
  email: string | null;
};

export function OrbitList({ fournisseurs }: { fournisseurs: Fournisseur[] }) {
  const properties = useMemo<PropertyDef<Fournisseur>[]>(
    () => [
      { key: 'nom', label: 'Nom', getValue: (f) => f.nom, alwaysVisible: true, groupable: false },
      {
        key: 'categorie',
        label: 'Catégorie',
        getValue: (f) => f.categorie ?? '',
        format: (v) => CATEGORIE_FOURNISSEUR_LABELS[v] ?? v,
        options: categorieOptions,
      },
      {
        key: 'contact',
        label: 'Contact',
        getValue: (f) => f.contact ?? f.email ?? '',
        groupable: false,
      },
    ],
    []
  );

  const searchKeys = useCallback(
    (f: Fournisseur) => [f.nom, f.contact ?? '', f.email ?? ''],
    []
  );
  const view = useDatabaseView<Fournisseur>({ rows: fournisseurs, properties, searchKeys });
  const { filtered, groups, isVisible } = view;

  const colCount = 2 + [isVisible('categorie'), isVisible('contact')].filter(Boolean).length;

  const renderRow = (f: Fournisseur) => (
    <tr key={f.id} className="border-b border-line">
      <td className="py-2">
        <Link href={`/orbit/${f.id}`} className="font-medium hover:underline">
          {f.nom}
        </Link>
      </td>
      {isVisible('categorie') && (
        <td className="text-muted">
          <EditableField
            value={f.categorie ?? ''}
            onSave={updateFournisseurField.bind(null, f.id, 'categorie')}
            type="select"
            options={categorieOptions}
          />
        </td>
      )}
      {isVisible('contact') && (
        <td className="text-muted">{f.contact ?? f.email ?? '—'}</td>
      )}
      <td>
        <DeleteButton
          action={deleteFournisseur.bind(null, f.id)}
          confirmMessage={`Supprimer ${f.nom} ?`}
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
          <Link href="/orbit/new" className="text-sm text-muted hover:text-fg">
            + Nouveau
          </Link>
        }
      />

      {filtered.length === 0 ? (
        <p className="text-sm text-muted">Aucun fournisseur.</p>
      ) : (
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-muted text-xs uppercase tracking-wide text-muted">
              <th className="py-2 font-normal">Nom</th>
              {isVisible('categorie') && <th className="font-normal">Catégorie</th>}
              {isVisible('contact') && <th className="font-normal">Contact</th>}
              <th className="w-6 font-normal" />
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
