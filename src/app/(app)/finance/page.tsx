import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/PageHeader';
import { FinanceBoard } from '@/components/FinanceBoard';
import { requireAdmin } from '@/lib/auth/current-user';

export const dynamic = 'force-dynamic';

export default async function FinancePage() {
  await requireAdmin();

  const projets = await prisma.projet.findMany({
    select: {
      id: true,
      code: true,
      nom: true,
      track: true,
      stade: true,
      budget: true,
      budgetEncaisse: true,
      depenses: { select: { montant: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Les champs Decimal de Prisma ne sont pas sérialisables vers un composant client : conversion
  // en number ici, comme ProjectFinance le fait déjà pour un seul projet.
  const rows = projets.map((p) => ({
    id: p.id,
    code: p.code,
    nom: p.nom,
    track: p.track,
    stade: p.stade,
    budget: p.budget === null ? null : Number(p.budget),
    budgetEncaisse: p.budgetEncaisse === null ? null : Number(p.budgetEncaisse),
    budgetDepense: p.depenses.reduce((sum, d) => sum + Number(d.montant), 0),
  }));

  return (
    <div>
      <PageHeader
        title="Finance"
        meta={`${rows.length} projet${rows.length > 1 ? 's' : ''}`}
      />
      <FinanceBoard projets={rows} />
    </div>
  );
}
