import { prisma } from '@/lib/prisma';
import { ProjetsBoard } from '@/components/ProjetsBoard';
import { PageHeader } from '@/components/PageHeader';
import { getCurrentUtilisateur, getCurrentRole } from '@/lib/auth/current-user';

export const dynamic = 'force-dynamic';

export default async function ProjetsPage() {
  const [role, utilisateur] = await Promise.all([getCurrentRole(), getCurrentUtilisateur()]);
  // Un Collaborateur ne voit que les projets où il est membre — jamais le portefeuille complet.
  const where = role === 'ADMIN' ? {} : { membres: { some: { id: utilisateur?.id ?? '' } } };

  const [projets, clients] = await Promise.all([
    // `select` explicite : les champs Decimal de Prisma ne sont pas sérialisables vers un
    // composant client, et ProjetsBoard n'a de toute façon pas besoin des budgets.
    prisma.projet.findMany({
      where,
      select: {
        id: true,
        code: true,
        nom: true,
        track: true,
        stade: true,
        organisationId: true,
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
      />
      <ProjetsBoard projets={projets} clients={clients} role={role} />
    </div>
  );
}
