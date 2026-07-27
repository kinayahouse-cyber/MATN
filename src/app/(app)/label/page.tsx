export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatMontant } from '@/lib/format';
import { createProductionLabel } from './actions';

const STADE_LABEL: Record<string, string> = {
  DEVELOPPEMENT: 'Développement',
  PREPROD: 'Préprod',
  PROD: 'Prod',
  DISTRIBUTION: 'Distribution',
  ARCHIVE: 'Archive',
};

export default async function LabelPage() {
  const productions = await prisma.productionLabel.findMany({
    include: { depenses: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif text-title text-fg">Label</h1>

      <div className="k-frame overflow-hidden">
        <div className="k-th grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-2 border-b border-hairline px-6 py-3">
          <div>Titre</div>
          <div>Code</div>
          <div>Stade</div>
          <div>Budget alloué</div>
          <div className="text-right">Consommé</div>
        </div>
        {productions.map((p) => {
          const consomme = p.depenses.reduce((s, d) => s + Number(d.montant), 0);
          return (
            <Link
              key={p.id}
              href={`/label/${p.id}`}
              className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] items-center gap-2 border-b border-hairline px-6 py-3 text-data last:border-b-0 hover:bg-surface"
            >
              <div className="font-serif text-[16px] text-fg">{p.titre}</div>
              <div className="k-code">{p.code}</div>
              <div className="text-fg-secondary">{STADE_LABEL[p.stadeProduction]}</div>
              <div className="text-fg-secondary">{formatMontant(p.budgetAlloue)}</div>
              <div className="k-td-num text-fg-secondary">{formatMontant(consomme)}</div>
            </Link>
          );
        })}
        {productions.length === 0 && <p className="px-6 py-8 text-data text-fg-muted">Aucune production.</p>}
      </div>

      <details className="k-frame k-frame--sm p-4">
        <summary className="cursor-pointer text-data text-fg-secondary">Nouvelle production Label</summary>
        <form action={createProductionLabel} className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
          <input name="titre" placeholder="Titre" required className="k-field md:col-span-2" />
          <input name="format" placeholder="Format" className="k-field" />
          <input name="budgetAlloue" type="number" placeholder="Budget alloué (DA)" className="k-field" />
          <button type="submit" className="k-btn k-btn--primary md:col-span-4 md:w-fit">
            Créer
          </button>
        </form>
      </details>
    </div>
  );
}
