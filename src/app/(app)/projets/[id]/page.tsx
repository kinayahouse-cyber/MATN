export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { DivisionBadge } from '@/components/DivisionBadge';
import { formatMontant, formatDate, STADE_PROJET_LABEL } from '@/lib/format';
import { createConcept, createTache, updateTacheStatut, createDepense, updateProjetStade } from '../actions';

const VUES = ['travail', 'client', 'financiere'] as const;
type Vue = (typeof VUES)[number];

async function getProjet(id: string) {
  return prisma.projet.findUnique({
    where: { id },
    include: {
      organisation: true,
      concepts: { orderBy: { createdAt: 'desc' } },
      taches: { orderBy: { createdAt: 'asc' } },
      depenses: { orderBy: { date: 'desc' } },
      devis: { include: { lignes: true } },
      factures: { include: { paiements: true }, orderBy: { dateEmission: 'desc' } },
    },
  });
}

export default async function FicheProjetPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ vue?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const projet = await getProjet(id);
  if (!projet) notFound();

  const vue: Vue = (VUES as readonly string[]).includes(sp.vue ?? '')
    ? (sp.vue as Vue)
    : 'travail';

  const devise = projet.devis.reduce(
    (s, d) => s + d.lignes.reduce((ss, l) => ss + Number(l.quantite) * Number(l.prixUnitaire), 0),
    0
  );
  const facture = projet.factures.reduce((s, f) => s + Number(f.montant), 0);
  const encaisse = projet.factures.reduce(
    (s, f) => s + f.paiements.reduce((ss, p) => ss + Number(p.montant), 0),
    0
  );
  const depensesTotal = projet.depenses.reduce((s, d) => s + Number(d.montant), 0);
  const margeReelle = encaisse - depensesTotal;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/projets" className="text-data text-fg-muted hover:text-fg-secondary">
          ← Projets
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <DivisionBadge division={projet.division} />
          <span className="k-code">{projet.code}</span>
        </div>
        <h1 className="mt-1 font-serif text-title text-fg">{projet.nom}</h1>
        <p className="text-data text-fg-secondary">{projet.organisation?.nom ?? 'Projet interne'}</p>
      </div>

      <div className="flex items-center gap-4">
        <form action={updateProjetStade} className="flex items-center gap-2">
          <input type="hidden" name="id" value={projet.id} />
          <span className="text-label uppercase text-fg-muted">Stade</span>
          <select name="stade" defaultValue={projet.stade} className="k-field" style={{ padding: '6px 10px', fontSize: 12 }}>
            {Object.entries(STADE_PROJET_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </form>
      </div>

      <div style={{ display: 'inline-flex', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-pill)', padding: 3, width: 'fit-content' }}>
        {VUES.map((v) => (
          <Link
            key={v}
            href={`/projets/${projet.id}?vue=${v}`}
            className="k-btn"
            style={{
              padding: '7px 18px',
              fontSize: 12,
              background: vue === v ? 'var(--accent-muted)' : 'transparent',
              color: vue === v ? 'var(--fg-primary)' : 'var(--fg-secondary)',
            }}
          >
            {v === 'travail' ? 'Vue travail' : v === 'client' ? 'Vue client' : 'Vue financière'}
          </Link>
        ))}
      </div>

      {vue === 'travail' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section>
            <p className="mb-3 text-label uppercase text-fg-muted">Tâches</p>
            <div className="k-frame k-frame--sm p-4">
              <ul className="flex flex-col gap-2">
                {projet.taches.map((t) => (
                  <li key={t.id} className="flex items-center justify-between border-b border-hairline pb-2 last:border-b-0">
                    <div>
                      <p className="text-body text-fg">{t.libelle}</p>
                      {t.echeance && <p className="text-[11px] text-fg-muted">{formatDate(t.echeance)}</p>}
                    </div>
                    <form action={updateTacheStatut}>
                      <input type="hidden" name="id" value={t.id} />
                      <input type="hidden" name="projetId" value={projet.id} />
                      <select name="statut" defaultValue={t.statut} className="k-field" style={{ padding: '4px 8px', fontSize: 11 }}>
                        <option value="A_FAIRE">À faire</option>
                        <option value="EN_COURS">En cours</option>
                        <option value="FAIT">Fait</option>
                      </select>
                    </form>
                  </li>
                ))}
                {projet.taches.length === 0 && <p className="text-data text-fg-muted">Aucune tâche.</p>}
              </ul>
              <form action={createTache} className="mt-4 flex gap-2">
                <input type="hidden" name="projetId" value={projet.id} />
                <input name="libelle" placeholder="Nouvelle tâche" required className="k-field flex-1" />
                <input name="echeance" type="date" className="k-field" />
                <button type="submit" className="k-btn k-btn--secondary">
                  Ajouter
                </button>
              </form>
            </div>
          </section>

          <section>
            <p className="mb-3 text-label uppercase text-fg-muted">Concepts</p>
            <div className="flex flex-col gap-3">
              {projet.concepts.map((c) => (
                <div key={c.id} className="k-frame k-frame--warm p-4">
                  <p className="mb-1 text-accent">،</p>
                  {c.titre && <p className="font-serif italic text-[15px] text-fg">{c.titre}</p>}
                  <p className="whitespace-pre-wrap font-serif text-body text-fg-secondary" style={{ lineHeight: 1.5 }}>
                    {c.contenu}
                  </p>
                </div>
              ))}
              {projet.concepts.length === 0 && <p className="text-data text-fg-muted">Aucune note.</p>}
              <form action={createConcept} className="k-frame k-frame--sm flex flex-col gap-2 p-4">
                <input type="hidden" name="projetId" value={projet.id} />
                <input name="titre" placeholder="Titre (optionnel)" className="k-field" />
                <textarea name="contenu" placeholder="Note…" required className="k-field" rows={3} />
                <button type="submit" className="k-btn k-btn--secondary w-fit">
                  Ajouter
                </button>
              </form>
            </div>
          </section>
        </div>
      )}

      {vue === 'client' && (
        <div className="flex flex-col gap-6">
          <p className="text-data text-fg-muted">
            Avancement, livrables et jalons — vue partageable (pas de marge, coûts ni notes internes).
          </p>
          <div className="k-frame k-frame--sm p-5">
            <p className="mb-2 text-label uppercase text-fg-muted">Stade actuel</p>
            <p className="font-serif text-subtitle text-fg">{STADE_PROJET_LABEL[projet.stade]}</p>
          </div>
          <section>
            <p className="mb-3 text-label uppercase text-fg-muted">Livrables / jalons</p>
            <div className="k-frame k-frame--sm p-4">
              <ul className="flex flex-col gap-2">
                {projet.taches
                  .filter((t) => t.statut !== 'A_FAIRE')
                  .map((t) => (
                    <li key={t.id} className="flex items-center justify-between border-b border-hairline pb-2 last:border-b-0">
                      <span className="text-body text-fg">{t.libelle}</span>
                      <span className="k-badge k-badge--neutral">{t.statut === 'FAIT' ? 'Fait' : 'En cours'}</span>
                    </li>
                  ))}
                {projet.taches.filter((t) => t.statut !== 'A_FAIRE').length === 0 && (
                  <p className="text-data text-fg-muted">Rien à afficher pour le moment.</p>
                )}
              </ul>
            </div>
          </section>
        </div>
      )}

      {vue === 'financiere' && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            {[
              ['Budget', formatMontant(projet.budget)],
              ['Devisé', formatMontant(devise)],
              ['Facturé', formatMontant(facture)],
              ['Encaissé', formatMontant(encaisse)],
              ['Marge réelle', formatMontant(margeReelle)],
            ].map(([label, value]) => (
              <div key={label} className="k-frame k-frame--sm p-4">
                <p className="mb-1 text-label uppercase text-fg-muted">{label}</p>
                <p className="font-serif text-subtitle text-fg">{value}</p>
              </div>
            ))}
          </div>

          <section>
            <p className="mb-3 text-label uppercase text-fg-muted">Dépenses</p>
            <div className="k-frame overflow-hidden">
              {projet.depenses.map((d) => (
                <div key={d.id} className="flex items-center justify-between border-b border-hairline px-6 py-3 text-data last:border-b-0">
                  <span className="text-fg">{d.categorie}</span>
                  <span className="text-fg-muted">{formatDate(d.date)}</span>
                  <span className="k-td-num text-fg-secondary">{formatMontant(d.montant)}</span>
                </div>
              ))}
              {projet.depenses.length === 0 && <p className="px-6 py-4 text-data text-fg-muted">Aucune dépense.</p>}
            </div>
            <form action={createDepense} className="k-frame k-frame--sm mt-3 flex flex-wrap gap-2 p-4">
              <input type="hidden" name="projetId" value={projet.id} />
              <input name="categorie" placeholder="Catégorie" required className="k-field" />
              <input name="montant" type="number" placeholder="Montant (DA)" required className="k-field" />
              <button type="submit" className="k-btn k-btn--secondary">
                Ajouter
              </button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
