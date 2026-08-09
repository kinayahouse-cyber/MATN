import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { ProjetsBoard } from '@/components/ProjetsBoard';
import { PageHeader } from '@/components/PageHeader';

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
      <PageHeader
        title="Projects"
        meta={`${projets.length} projet${projets.length > 1 ? 's' : ''}`}
        actions={
          <Link href="/projets/new" className="text-sm text-muted hover:text-fg">
            + Nouveau (formulaire)
          </Link>
        }
      />
      <ProjetsBoard projets={projets} clients={clients} />
    </div>
  );
}
