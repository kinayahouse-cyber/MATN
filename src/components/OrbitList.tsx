'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { EditableField } from '@/components/EditableField';
import { DeleteButton } from '@/components/DeleteButton';
import { Toolbar, toolbarInputClass } from '@/components/database/Toolbar';
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
          value={categorieFilter}
          onChange={(e) => setCategorieFilter(e.target.value)}
          className={toolbarInputClass}
        >
          <option value="">Toutes les catégories</option>
          {categorieOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </Toolbar>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted">Aucun fournisseur.</p>
      ) : (
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-muted text-xs uppercase tracking-wide text-muted">
              <th className="py-2 font-normal">Nom</th>
              <th className="font-normal">Catégorie</th>
              <th className="font-normal">Contact</th>
              <th className="w-6 font-normal" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((f) => (
              <tr key={f.id} className="border-b border-line">
                <td className="py-2">
                  <Link href={`/orbit/${f.id}`} className="font-medium hover:underline">
                    {f.nom}
                  </Link>
                </td>
                <td className="text-muted">
                  <EditableField
                    value={f.categorie ?? ''}
                    onSave={updateFournisseurField.bind(null, f.id, 'categorie')}
                    type="select"
                    options={categorieOptions}
                  />
                </td>
                <td className="text-muted">{f.contact ?? f.email ?? '—'}</td>
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
