import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/PageHeader';
import { FinanceBoard } from '@/components/FinanceBoard';
import { requireAdmin } from '@/lib/auth/current-user';

export const dynamic = 'force-dynamic';

const MONTHS_SHORT = ['jan', 'fév', 'mar', 'avr', 'mai', 'jui', 'jul', 'aoû', 'sep', 'oct', 'nov', 'déc'];

export default async function FinancePage() {
  await requireAdmin();

  const sixMonthsAgo = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() - 5, 1));

  const [projets, depenses] = await Promise.all([
    prisma.projet.findMany({
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
    }),
    prisma.depense.findMany({
      where: { date: { gte: sixMonthsAgo } },
      select: { date: true, montant: true },
    }),
  ]);

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

  // 6 derniers mois, bornes fixes (mois sans dépense = barre à 0, pas un trou dans l'axe).
  const monthlyTotals = new Map<string, number>();
  for (let i = 0; i < 6; i++) {
    const d = new Date(Date.UTC(sixMonthsAgo.getUTCFullYear(), sixMonthsAgo.getUTCMonth() + i, 1));
    monthlyTotals.set(`${d.getUTCFullYear()}-${d.getUTCMonth()}`, 0);
  }
  for (const d of depenses) {
    const k = `${d.date.getUTCFullYear()}-${d.date.getUTCMonth()}`;
    if (monthlyTotals.has(k)) monthlyTotals.set(k, (monthlyTotals.get(k) ?? 0) + Number(d.montant));
  }
  const monthlyDepenses = Array.from(monthlyTotals.entries()).map(([k, total]) => {
    const [, m] = k.split('-').map(Number);
    return { label: MONTHS_SHORT[m], total };
  });

  return (
    <div>
      <PageHeader
        title="Finance"
        meta={`${rows.length} projet${rows.length > 1 ? 's' : ''}`}
      />
      <FinanceBoard projets={rows} monthlyDepenses={monthlyDepenses} />
    </div>
  );
}
