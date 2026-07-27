export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { formatMontant, formatDate, STATUT_FACTURE_LABEL } from '@/lib/format';
import { createDevis, createFacture, createPaiement, createDepenseGenerale } from './actions';
import { StatBlock } from '@/components/StatBlock';

export default async function ArgentPage() {
  const [projets, devis, factures, depensesGenerales, paiementsAgg, depensesAgg] = await Promise.all([
    prisma.projet.findMany({ orderBy: { nom: 'asc' } }),
    prisma.devis.findMany({ include: { projet: true, lignes: true }, orderBy: { createdAt: 'desc' } }),
    prisma.facture.findMany({ include: { projet: true, paiements: true }, orderBy: { dateEmission: 'desc' } }),
    prisma.depense.findMany({
      where: { projetId: null, productionLabelId: null },
      orderBy: { date: 'desc' },
    }),
    prisma.paiement.aggregate({ _sum: { montant: true } }),
    prisma.depense.aggregate({ _sum: { montant: true } }),
  ]);

  const soldeNet = Number(paiementsAgg._sum.montant ?? 0) - Number(depensesAgg._sum.montant ?? 0);

  return (
    <div className="flex flex-col gap-12">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-title text-fg">Argent</h1>
        <a href="/api/export/tresorerie" className="k-btn k-btn--secondary">
          Exporter Excel
        </a>
      </div>

      <section>
        <p className="mb-3 text-label uppercase text-fg-muted">Cash</p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatBlock label="Solde net" value={formatMontant(soldeNet)} meta="Σ Paiements − Σ Dépenses" />
          <StatBlock label="Encaissé (total)" value={formatMontant(paiementsAgg._sum.montant ?? 0)} />
          <StatBlock label="Dépenses (total)" value={formatMontant(depensesAgg._sum.montant ?? 0)} />
        </div>

        <div className="mt-4 k-frame overflow-hidden">
          <div className="k-th grid grid-cols-[2fr_1fr_1fr] gap-2 border-b border-hairline px-6 py-3">
            <div>Catégorie</div>
            <div>Date</div>
            <div className="text-right">Montant</div>
          </div>
          {depensesGenerales.map((d) => (
            <div key={d.id} className="grid grid-cols-[2fr_1fr_1fr] items-center gap-2 border-b border-hairline px-6 py-3 text-data last:border-b-0">
              <div className="text-fg">{d.categorie}</div>
              <div className="text-fg-secondary">{formatDate(d.date)}</div>
              <div className="k-td-num text-fg-secondary">{formatMontant(d.montant)}</div>
            </div>
          ))}
          {depensesGenerales.length === 0 && <p className="px-6 py-4 text-data text-fg-muted">Aucune dépense générale.</p>}
        </div>
        <form action={createDepenseGenerale} className="k-frame k-frame--sm mt-3 flex flex-wrap gap-2 p-4">
          <input name="categorie" placeholder="Catégorie (loyer, salaire…)" required className="k-field" />
          <input name="montant" type="number" placeholder="Montant (DA)" required className="k-field" />
          <button type="submit" className="k-btn k-btn--secondary">
            Ajouter une dépense générale
          </button>
        </form>
      </section>

      <section>
        <p className="mb-3 text-label uppercase text-fg-muted">Documents — Factures</p>
        <div className="k-frame overflow-hidden">
          <div className="k-th grid grid-cols-[1.2fr_1.6fr_1fr_1fr_1fr] gap-2 border-b border-hairline px-6 py-3">
            <div>N°</div>
            <div>Projet</div>
            <div>Statut</div>
            <div>Échéance</div>
            <div className="text-right">Montant</div>
          </div>
          {factures.map((f) => {
            const paye = f.paiements.reduce((s, p) => s + Number(p.montant), 0);
            return (
              <div key={f.id} className="border-b border-hairline px-6 py-3 text-data last:border-b-0">
                <div className="grid grid-cols-[1.2fr_1.6fr_1fr_1fr_1fr] items-center gap-2">
                  <div className="k-code">{f.numero}</div>
                  <div className="font-serif text-[15px] text-fg">{f.projet.nom}</div>
                  <div>
                    <span
                      className={`k-badge ${
                        f.statut === 'PAYEE'
                          ? 'k-badge--paid'
                          : f.statut === 'EN_RETARD'
                          ? 'k-badge--late'
                          : 'k-badge--due'
                      }`}
                    >
                      {STATUT_FACTURE_LABEL[f.statut]}
                    </span>
                  </div>
                  <div className="text-fg-secondary">{formatDate(f.dateEcheance)}</div>
                  <div className="k-td-num text-fg-secondary">
                    {formatMontant(f.montant)}
                    <span className="block text-[11px] text-fg-muted">payé {formatMontant(paye)}</span>
                  </div>
                </div>
                {f.statut !== 'PAYEE' && (
                  <form action={createPaiement} className="mt-2 flex items-center gap-2">
                    <input type="hidden" name="factureId" value={f.id} />
                    <input name="montant" type="number" placeholder="Montant encaissé" required className="k-field" style={{ padding: '6px 10px', fontSize: 12 }} />
                    <input name="moyen" placeholder="Moyen (virement…)" className="k-field" style={{ padding: '6px 10px', fontSize: 12 }} />
                    <button type="submit" className="k-btn k-btn--ghost" style={{ padding: '6px 12px', fontSize: 12 }}>
                      Enregistrer paiement
                    </button>
                  </form>
                )}
              </div>
            );
          })}
          {factures.length === 0 && <p className="px-6 py-4 text-data text-fg-muted">Aucune facture.</p>}
        </div>
        <details className="k-frame k-frame--sm mt-3 p-4">
          <summary className="cursor-pointer text-data text-fg-secondary">Nouvelle facture</summary>
          <form action={createFacture} className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
            <select name="projetId" required className="k-field">
              <option value="">Projet…</option>
              {projets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} — {p.nom}
                </option>
              ))}
            </select>
            <input name="montant" type="number" placeholder="Montant (DA)" required className="k-field" />
            <input name="dateEcheance" type="date" className="k-field" />
            <label className="flex items-center gap-2 text-data text-fg-secondary">
              <input name="exonerationTva" type="checkbox" defaultChecked /> Exonération TVA
            </label>
            <button type="submit" className="k-btn k-btn--primary md:col-span-4 md:w-fit">
              Créer
            </button>
          </form>
        </details>
      </section>

      <section>
        <p className="mb-3 text-label uppercase text-fg-muted">Documents — Devis</p>
        <div className="k-frame overflow-hidden">
          <div className="k-th grid grid-cols-[1.2fr_1.6fr_1fr_1fr] gap-2 border-b border-hairline px-6 py-3">
            <div>N°</div>
            <div>Projet</div>
            <div>Statut</div>
            <div className="text-right">Total</div>
          </div>
          {devis.map((d) => {
            const total = d.lignes.reduce((s, l) => s + Number(l.quantite) * Number(l.prixUnitaire), 0);
            return (
              <div key={d.id} className="grid grid-cols-[1.2fr_1.6fr_1fr_1fr] items-center gap-2 border-b border-hairline px-6 py-3 text-data last:border-b-0">
                <div className="k-code">{d.numero}</div>
                <div className="font-serif text-[15px] text-fg">{d.projet.nom}</div>
                <div className="text-fg-secondary">{d.statut}</div>
                <div className="k-td-num text-fg-secondary">{formatMontant(total)}</div>
              </div>
            );
          })}
          {devis.length === 0 && <p className="px-6 py-4 text-data text-fg-muted">Aucun devis.</p>}
        </div>
        <details className="k-frame k-frame--sm mt-3 p-4">
          <summary className="cursor-pointer text-data text-fg-secondary">Nouveau devis</summary>
          <form action={createDevis} className="mt-4 flex flex-col gap-3">
            <select name="projetId" required className="k-field w-fit">
              <option value="">Projet…</option>
              {projets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} — {p.nom}
                </option>
              ))}
            </select>
            <div className="flex flex-col gap-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex gap-2">
                  <input name="ligneLibelle" placeholder="Ligne (libellé)" className="k-field flex-1" />
                  <input name="ligneQuantite" type="number" placeholder="Qté" defaultValue={1} className="k-field w-24" />
                  <input name="lignePrix" type="number" placeholder="Prix unitaire (DA)" className="k-field w-40" />
                </div>
              ))}
            </div>
            <p className="text-[11px] text-fg-muted">
              Grille tarifaire v4 : suggestion à afficher comme garde-fou, tout reste éditable (non connectée ici — grille non fournie).
            </p>
            <button type="submit" className="k-btn k-btn--primary w-fit">
              Créer
            </button>
          </form>
        </details>
      </section>
    </div>
  );
}
