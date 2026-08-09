import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { OrbitList } from '@/components/OrbitList';

export const dynamic = 'force-dynamic';

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

      <OrbitList fournisseurs={fournisseurs} />
    </div>
  );
}
