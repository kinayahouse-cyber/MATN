export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { StatBlock } from '@/components/StatBlock';
import { formatMontant, STADE_PROJET_LABEL } from '@/lib/format';

const DIVISIONS_COMMERCIALES = ['STUDIO', 'ATELIER'] as const;

async function getData() {
  const [paiements, depenses, projetsParStade, devisEnAttente, facturesEnRetard, projetsCommerciaux, productionsParStade, depensesLabel] =
    await Promise.all([
      prisma.paiement.aggregate({ _sum: { montant: true } }),
      prisma.depense.aggregate({ _sum: { montant: true } }),
      prisma.projet.groupBy({ by: ['stade'], _count: { _all: true } }),
      prisma.devis.count({ where: { statut: 'ENVOYE' } }),
      prisma.facture.count({ where: { statut: 'EN_RETARD' } }),
      prisma.projet.findMany({
        where: { division: { in: [...DIVISIONS_COMMERCIALES] } },
        include: { factures: { include: { paiements: true } }, depenses: true },
      }),
      prisma.productionLabel.groupBy({ by: ['stadeProduction'], _count: { _all: true } }),
      prisma.depense.aggregate({
        where: { productionLabelId: { not: null } },
        _sum: { montant: true },
      }),
    ]);

  const tresoNette = Number(paiements._sum.montant ?? 0) - Number(depenses._sum.montant ?? 0);

  const margeGlobale = projetsCommerciaux.reduce((total, projet) => {
    const encaisse = projet.factures.reduce(
      (sum, f) => sum + f.paiements.reduce((s, p) => s + Number(p.montant), 0),
      0
    );
    const depensesProjet = projet.depenses.reduce((sum, d) => sum + Number(d.montant), 0);
    return total + (encaisse - depensesProjet);
  }, 0);

  return {
    tresoNette,
    projetsParStade,
    devisEnAttente,
    facturesEnRetard,
    margeGlobale,
    productionsParStade,
    depensesLabel: Number(depensesLabel._sum.montant ?? 0),
  };
}

export default async function DashboardPage() {
  const data = await getData();
  const actifs = data.projetsParStade.filter((g) => g.stade !== 'CLOTURE');

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="font-serif text-title text-fg">Tableau de bord</h1>
      </div>

      <section>
        <p className="mb-3 text-label uppercase text-fg-muted">Activité commerciale</p>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatBlock label="Trésorerie nette" value={formatMontant(data.tresoNette)} />
          <StatBlock
            label="Projets actifs"
            value={String(actifs.reduce((s, g) => s + g._count._all, 0))}
            meta={actifs.map((g) => `${STADE_PROJET_LABEL[g.stade]} ${g._count._all}`).join(' · ') || 'Aucun'}
          />
          <StatBlock label="Devis en attente" value={String(data.devisEnAttente)} />
          <StatBlock label="Factures en retard" value={String(data.facturesEnRetard)} />
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-4">
          <StatBlock label="Marge globale" value={formatMontant(data.margeGlobale)} meta="Hors projets internes / label" />
        </div>
      </section>

      <section>
        <p className="mb-3 text-label uppercase text-fg-muted">Label</p>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatBlock
            label="Productions"
            value={String(data.productionsParStade.reduce((s, g) => s + g._count._all, 0))}
            meta={data.productionsParStade.map((g) => `${g.stadeProduction} ${g._count._all}`).join(' · ') || 'Aucune'}
          />
          <StatBlock label="Dépenses label" value={formatMontant(data.depensesLabel)} meta="Aucune recette attendue" />
        </div>
      </section>
    </div>
  );
}
