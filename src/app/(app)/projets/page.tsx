import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { ProjetsBoard } from '@/components/ProjetsBoard';

export const dynamic = 'force-dynamic';

export default async function ProjetsPage() {
  const [projets, clients] = await Promise.all([
    prisma.projet.findMany({
      include: {
        organisation: { select: { id: true, nom: true } },
        taches: { select: { id: true, libelle: true, statut: true }, orderBy: { createdAt: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.organisation.findMany({ orderBy: { nom: 'asc' }, select: { id: true, nom: true } }),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-medium">Projects</h1>
        <Link
          href="/projets/new"
          className="rounded-md border border-neutral-800 px-3 py-1.5 text-sm hover:border-neutral-600"
        >
          + Nouveau (formulaire)
        </Link>
      </div>

      <ProjetsBoard projets={projets} clients={clients} />
    </div>
  );
}
