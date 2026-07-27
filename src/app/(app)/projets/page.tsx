export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { DivisionBadge } from '@/components/DivisionBadge';
import { formatMontant, STADE_PROJET_LABEL } from '@/lib/format';
import { createProjet } from './actions';

export default async function ProjetsPage({
  searchParams,
}: {
  searchParams: Promise<{ division?: string; stade?: string }>;
}) {
  const sp = await searchParams;
  const where: Record<string, unknown> = {};
  if (sp.division) where.division = sp.division;
  if (sp.stade) where.stade = sp.stade;

  const [projets, organisations] = await Promise.all([
    prisma.projet.findMany({
      where,
      include: {
        organisation: true,
        factures: { include: { paiements: true } },
        devis: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.organisation.findMany({ orderBy: { nom: 'asc' } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-title text-fg">Projets</h1>
        <a href="/api/export/projets" className="k-btn k-btn--secondary">
          Exporter Excel
        </a>
      </div>

      <div className="flex flex-wrap gap-2">
        {['STUDIO', 'ATELIER', 'LABEL', 'GENERALITES'].map((d) => (
          <Link
            key={d}
            href={`/projets?division=${d}`}
            className="k-btn k-btn--ghost"
            style={{
              padding: '7px 16px',
              fontSize: 12,
              border: '1px solid var(--border-strong)',
              color: sp.division === d ? 'var(--fg-primary)' : 'var(--fg-secondary)',
            }}
          >
            {d}
          </Link>
        ))}
        {Object.entries(STADE_PROJET_LABEL).map(([k, v]) => (
          <Link
            key={k}
            href={`/projets?stade=${k}`}
            className="k-btn k-btn--ghost"
            style={{
              padding: '7px 16px',
              fontSize: 12,
              border: '1px solid var(--border-strong)',
              color: sp.stade === k ? 'var(--fg-primary)' : 'var(--fg-secondary)',
            }}
          >
            {v}
          </Link>
        ))}
        <Link href="/projets" className="k-btn k-btn--ghost" style={{ padding: '7px 16px', fontSize: 12 }}>
          Réinitialiser
        </Link>
      </div>

      <div className="k-frame overflow-hidden">
        <div className="k-th grid grid-cols-[2.2fr_1fr_.8fr_1fr_1fr] gap-2 border-b border-hairline px-6 py-3">
          <div>Projet</div>
          <div>Code</div>
          <div>Division</div>
          <div>Stade</div>
          <div className="text-right">Budget</div>
        </div>
        {projets.map((p) => {
          const encaisse = p.factures.reduce(
            (s, f) => s + f.paiements.reduce((ss, pay) => ss + Number(pay.montant), 0),
            0
          );
          return (
            <Link
              key={p.id}
              href={`/projets/${p.id}`}
              className="grid grid-cols-[2.2fr_1fr_.8fr_1fr_1fr] items-center gap-2 border-b border-hairline px-6 py-3 text-data last:border-b-0 hover:bg-surface"
            >
              <div>
                <p className="font-serif text-[16px] text-fg">{p.nom}</p>
                <p className="text-fg-muted">{p.organisation?.nom ?? 'Interne'}</p>
              </div>
              <div className="k-code">{p.code}</div>
              <div>
                <DivisionBadge division={p.division} />
              </div>
              <div className="text-fg-secondary">{STADE_PROJET_LABEL[p.stade]}</div>
              <div className="k-td-num text-fg-secondary">
                {formatMontant(p.budget)}
                <span className="block text-[11px] text-fg-muted">encaissé {formatMontant(encaisse)}</span>
              </div>
            </Link>
          );
        })}
        {projets.length === 0 && <p className="px-6 py-8 text-data text-fg-muted">Aucun projet.</p>}
      </div>

      <details className="k-frame k-frame--sm p-4">
        <summary className="cursor-pointer text-data text-fg-secondary">Nouveau projet</summary>
        <form action={createProjet} className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-5">
          <input name="nom" placeholder="Nom du projet" required className="k-field md:col-span-2" />
          <select name="division" required className="k-field">
            <option value="">Division…</option>
            <option value="STUDIO">Studio</option>
            <option value="ATELIER">Atelier</option>
            <option value="LABEL">Label</option>
            <option value="GENERALITES">Généralités</option>
          </select>
          <select name="engagement" className="k-field">
            <option value="">Engagement…</option>
            <option value="LECTURE">Lecture</option>
            <option value="IDENTITE">Identité</option>
            <option value="FILM">Film</option>
            <option value="EDITION">Édition</option>
            <option value="CAPSULES">Capsules</option>
            <option value="MODULE_ATELIER">Module Atelier</option>
          </select>
          <select name="organisationId" className="k-field">
            <option value="">Organisation (optionnel)…</option>
            {organisations.map((o) => (
              <option key={o.id} value={o.id}>
                {o.nom}
              </option>
            ))}
          </select>
          <input name="budget" type="number" placeholder="Budget (DA)" className="k-field" />
          <button type="submit" className="k-btn k-btn--primary md:col-span-5 md:w-fit">
            Créer
          </button>
        </form>
      </details>
    </div>
  );
}
