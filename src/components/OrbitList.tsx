'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { EditableField } from '@/components/EditableField';
import { DeleteButton } from '@/components/DeleteButton';
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
  const [search, setSearch] = useState('');
  const [categorieFilter, setCategorieFilter] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return fournisseurs.filter((f) => {
      if (categorieFilter && f.categorie !== categorieFilter) return false;
      if (
        q &&
        !f.nom.toLowerCase().includes(q) &&
        !(f.contact ?? '').toLowerCase().includes(q) &&
        !(f.email ?? '').toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [fournisseurs, search, categorieFilter]);

  const selectClass =
    'rounded-md border border-neutral-800 bg-transparent px-2 py-1.5 text-sm text-neutral-300';

  return (
    <div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un fournisseur…"
          className={`${selectClass} flex-1 min-w-[10rem]`}
        />
        <select
          value={categorieFilter}
          onChange={(e) => setCategorieFilter(e.target.value)}
          className={selectClass}
        >
          <option value="">Toutes les catégories</option>
          {categorieOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-4 text-sm text-neutral-600">Aucun fournisseur.</p>
      ) : (
        <table className="mt-4 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-800 text-xs uppercase text-neutral-500">
              <th className="py-2 font-normal">Nom</th>
              <th className="font-normal">Catégorie</th>
              <th className="font-normal">Contact</th>
              <th className="w-6 font-normal" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((f) => (
              <tr key={f.id} className="border-b border-neutral-900">
                <td className="py-2">
                  <Link href={`/orbit/${f.id}`} className="font-medium hover:underline">
                    {f.nom}
                  </Link>
                </td>
                <td className="text-neutral-400">
                  <EditableField
                    value={f.categorie ?? ''}
                    onSave={updateFournisseurField.bind(null, f.id, 'categorie')}
                    type="select"
                    options={categorieOptions}
                  />
                </td>
                <td className="text-neutral-400">{f.contact ?? f.email ?? '—'}</td>
                <td>
                  <DeleteButton
                    action={deleteFournisseur.bind(null, f.id)}
                    confirmMessage={`Supprimer ${f.nom} ?`}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
