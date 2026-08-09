import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { CATEGORIE_FOURNISSEUR_LABELS } from '@/lib/labels';

export default async function FournisseurPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const fournisseur = await prisma.fournisseur.findUnique({ where: { id } });
  if (!fournisseur) notFound();

  return (
    <div className="max-w-md">
      <h1 className="text-xl font-medium">{fournisseur.nom}</h1>
      {fournisseur.categorie && (
        <p className="mt-1 text-sm text-neutral-400">
          {CATEGORIE_FOURNISSEUR_LABELS[fournisseur.categorie]}
        </p>
      )}

      <dl className="mt-6 space-y-3 text-sm">
        <div>
          <dt className="text-xs uppercase tracking-wide text-neutral-500">Contact</dt>
          <dd className="mt-1">{fournisseur.contact ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-neutral-500">Email</dt>
          <dd className="mt-1">{fournisseur.email ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-neutral-500">Téléphone</dt>
          <dd className="mt-1">{fournisseur.telephone ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-neutral-500">Notes</dt>
          <dd className="mt-1 whitespace-pre-wrap text-neutral-400">
            {fournisseur.notes ?? '—'}
          </dd>
        </div>
      </dl>
    </div>
  );
}
