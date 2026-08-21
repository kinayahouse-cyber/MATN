import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/PageHeader';
import { FinanceBoard } from '@/components/FinanceBoard';
import { TabNav } from '@/components/ui/TabNav';
import { DepensesView, type DepenseRow } from '@/components/finance/DepensesView';
import { EcheancierView, type CreanceRow } from '@/components/finance/EcheancierView';
import { RecettesView, type RecetteRow } from '@/components/finance/RecettesView';
import { computeTotaux, computeCreance } from '@/lib/facturation';
import { requireAdmin } from '@/lib/auth/current-user';

export const dynamic = 'force-dynamic';

const MONTHS_SHORT = ['jan', 'fév', 'mar', 'avr', 'mai', 'jui', 'jul', 'aoû', 'sep', 'oct', 'nov', 'déc'];

const VUES = [
  { value: 'apercu', label: "Vue d'ensemble" },
  { value: 'depenses', label: 'Dépenses' },
  { value: 'echeancier', label: 'Échéancier' },
  { value: 'recettes', label: 'Recettes' },
];

function debutAnnee() {
  return new Date(Date.UTC(new Date().getUTCFullYear(), 0, 1));
}

// Quatre vues sur la même matière financière, adressables par l'URL (?vue=) plutôt que par un
// état local : un lien vers l'échéancier reste partageable et le retour navigateur fonctionne.
// Chaque vue ne charge que ce dont elle a besoin, au lieu de tout requêter à chaque visite.
export default async function FinancePage({
  searchParams,
}: {
  searchParams: Promise<{ vue?: string }>;
}) {
  await requireAdmin();
  const { vue } = await searchParams;
  const active = VUES.some((v) => v.value === vue) ? vue! : 'apercu';

  const header = (meta?: string) => (
    <>
      <PageHeader title="Finance" meta={meta} />
      <TabNav items={VUES} active={active} basePath="/finance" />
    </>
  );

  if (active === 'depenses') {
    const [depenses, projets, totalAnneeAgg] = await Promise.all([
      prisma.depense.findMany({
        orderBy: { date: 'desc' },
        take: 200,
        include: { projet: { select: { id: true, code: true, nom: true } } },
      }),
      prisma.projet.findMany({
        select: { id: true, code: true, nom: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.depense.aggregate({ _sum: { montant: true }, where: { date: { gte: debutAnnee() } } }),
    ]);

    const rows: DepenseRow[] = depenses.map((d) => ({
      id: d.id,
      date: d.date,
      categorie: d.categorie,
      montant: Number(d.montant),
      projetId: d.projet?.id ?? null,
      projetCode: d.projet?.code ?? null,
      projetNom: d.projet?.nom ?? null,
    }));

    return (
      <div>
        {header(`${rows.length} dépense${rows.length > 1 ? 's' : ''}`)}
        <div className="mt-6">
          <DepensesView
            rows={rows}
            projets={projets}
            totalAnnee={Number(totalAnneeAgg._sum.montant ?? 0)}
          />
        </div>
      </div>
    );
  }

  if (active === 'echeancier') {
    const factures = await prisma.document.findMany({
      where: { type: 'FACTURE' },
      include: {
        lignes: true,
        paiements: { select: { montant: true } },
        projet: { select: { id: true, nom: true, organisation: { select: { nom: true } } } },
      },
    });

    const rows: CreanceRow[] = factures
      .map((f) => {
        const totaux = computeTotaux(
          f.lignes.map((l) => ({
            quantite: Number(l.quantite),
            prixUnitaire: Number(l.prixUnitaire),
          })),
          f.tauxTva !== null ? Number(f.tauxTva) : null,
          f.remisePct !== null ? Number(f.remisePct) : null
        );
        const creance = computeCreance(
          totaux.ttc,
          f.paiements.map((p) => ({ montant: Number(p.montant) })),
          f.dateEcheance
        );
        return {
          id: f.id,
          numero: f.numero,
          projetId: f.projet?.id ?? null,
          projetNom: f.projet?.nom ?? null,
          clientNom: f.projet?.organisation?.nom ?? null,
          dateEcheance: f.dateEcheance,
          ...creance,
        };
      })
      // Ce qui est dû remonte en premier, échéance la plus proche d'abord ; les factures soldées
      // ferment la liste sans polluer la lecture.
      .sort((a, b) => {
        if ((a.statut === 'PAYEE') !== (b.statut === 'PAYEE')) return a.statut === 'PAYEE' ? 1 : -1;
        const aTime = a.dateEcheance?.getTime() ?? Number.MAX_SAFE_INTEGER;
        const bTime = b.dateEcheance?.getTime() ?? Number.MAX_SAFE_INTEGER;
        return aTime - bTime;
      });

    const impayees = rows.filter((r) => r.statut !== 'PAYEE').length;

    return (
      <div>
        {header(`${impayees} facture${impayees > 1 ? 's' : ''} en attente de règlement`)}
        <div className="mt-6">
          <EcheancierView rows={rows} />
        </div>
      </div>
    );
  }

  if (active === 'recettes') {
    const douzeMois = new Date(
      Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() - 11, 1)
    );

    const [paiements, totalAnneeAgg] = await Promise.all([
      prisma.paiement.findMany({
        where: { date: { gte: douzeMois } },
        orderBy: { date: 'desc' },
        include: {
          document: {
            select: {
              id: true,
              numero: true,
              projet: { select: { id: true, nom: true, organisation: { select: { nom: true } } } },
            },
          },
        },
      }),
      prisma.paiement.aggregate({ _sum: { montant: true }, where: { date: { gte: debutAnnee() } } }),
    ]);

    const rows: RecetteRow[] = paiements.map((p) => ({
      id: p.id,
      date: p.date,
      montant: Number(p.montant),
      methode: p.methode,
      documentId: p.document.id,
      numero: p.document.numero,
      projetId: p.document.projet?.id ?? null,
      projetNom: p.document.projet?.nom ?? null,
      clientNom: p.document.projet?.organisation?.nom ?? null,
    }));

    return (
      <div>
        {header(`${rows.length} encaissement${rows.length > 1 ? 's' : ''} sur 12 mois`)}
        <div className="mt-6">
          <RecettesView rows={rows} totalAnnee={Number(totalAnneeAgg._sum.montant ?? 0)} />
        </div>
      </div>
    );
  }

  // Vue d'ensemble — la page Finance historique, inchangée.
  const sixMonthsAgo = new Date(
    Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() - 5, 1)
  );

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
      {header(`${rows.length} projet${rows.length > 1 ? 's' : ''}`)}
      <div className="mt-6">
        <FinanceBoard projets={rows} monthlyDepenses={monthlyDepenses} />
      </div>
    </div>
  );
}
