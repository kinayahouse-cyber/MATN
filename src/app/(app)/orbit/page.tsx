import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { CATEGORIE_FOURNISSEUR_LABELS } from '@/lib/labels';
import { EditableField } from '@/components/EditableField';
import { DeleteButton } from '@/components/DeleteButton';
import { updateFournisseurField, deleteFournisseur } from './actions';

export const dynamic = 'force-dynamic';

const categorieOptions = Object.entries(CATEGORIE_FOURNISSEUR_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export default async function OrbitPage() {
  const fournisseurs = await prisma.fournisseur.findMany({ orderBy: { nom: 'asc' } });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-medium">Orbit</h1>
        <Link
          href="/orbit/new"
          className="rounded-md border border-neutral-800 px-3 py-1.5 text-sm hover:border-neutral-600"
        >
          + Nouveau
        </Link>
      </div>
      <p className="mt-1 text-sm text-neutral-500">
        Annuaire des fournisseurs et intervenants — pas de rattachement Projet en MVP (ADR-008).
      </p>

      {fournisseurs.length === 0 ? (
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
            {fournisseurs.map((f) => (
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
