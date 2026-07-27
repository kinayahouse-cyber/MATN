export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { formatMontant, formatDate } from '@/lib/format';
import {
  updateStadeProduction,
  createSectionDossier,
  createAsset,
  createTacheLabel,
  updateTacheLabelStatut,
  createDepenseLabel,
} from '../actions';

const FACES = ['developpement', 'suivi'] as const;
type Face = (typeof FACES)[number];

const STADE_LABEL: Record<string, string> = {
  DEVELOPPEMENT: 'Développement',
  PREPROD: 'Préprod',
  PROD: 'Prod',
  DISTRIBUTION: 'Distribution',
  ARCHIVE: 'Archive',
};

const SECTION_LABEL: Record<string, string> = {
  NOTE_INTENTION: "Note d'intention",
  PITCH: 'Pitch',
  REFERENCES: 'Références',
  TRAITEMENT: 'Traitement',
  SCRIPT: 'Script / chemin de fer',
};

async function getProduction(id: string) {
  return prisma.productionLabel.findUnique({
    where: { id },
    include: {
      sections: { orderBy: { ordre: 'asc' } },
      assets: { orderBy: { createdAt: 'desc' } },
      taches: { orderBy: { createdAt: 'asc' } },
      depenses: { orderBy: { date: 'desc' } },
    },
  });
}

export default async function FicheLabelPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ face?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const production = await getProduction(id);
  if (!production) notFound();

  const face: Face = (FACES as readonly string[]).includes(sp.face ?? '')
    ? (sp.face as Face)
    : 'developpement';

  const consomme = production.depenses.reduce((s, d) => s + Number(d.montant), 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/label" className="text-data text-fg-muted hover:text-fg-secondary">
          ← Label
        </Link>
        <div className="mt-2 k-code">{production.code}</div>
        <h1 className="mt-1 font-serif text-title text-fg">{production.titre}</h1>
        <p className="text-data text-fg-secondary">{production.format ?? '—'}</p>
      </div>

      <form action={updateStadeProduction} className="flex items-center gap-2">
        <input type="hidden" name="id" value={production.id} />
        <span className="text-label uppercase text-fg-muted">Stade</span>
        <select name="stadeProduction" defaultValue={production.stadeProduction} className="k-field" style={{ padding: '6px 10px', fontSize: 12 }}>
          {Object.entries(STADE_LABEL).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </form>

      <div style={{ display: 'inline-flex', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-pill)', padding: 3, width: 'fit-content' }}>
        {FACES.map((f) => (
          <Link
            key={f}
            href={`/label/${production.id}?face=${f}`}
            className="k-btn"
            style={{
              padding: '7px 18px',
              fontSize: 12,
              background: face === f ? 'var(--accent-muted)' : 'transparent',
              color: face === f ? 'var(--fg-primary)' : 'var(--fg-secondary)',
            }}
          >
            {f === 'developpement' ? 'Développement' : 'Suivi'}
          </Link>
        ))}
      </div>

      {face === 'developpement' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section>
            <p className="mb-3 text-label uppercase text-fg-muted">Dossier de développement</p>
            <div className="flex flex-col gap-3">
              {production.sections.map((s) => (
                <div key={s.id} className="k-frame k-frame--warm p-4">
                  <p className="mb-1 text-[11px] uppercase tracking-label text-fg-muted">{SECTION_LABEL[s.type]}</p>
                  {s.titre && <p className="font-serif italic text-[15px] text-fg">{s.titre}</p>}
                  <p className="whitespace-pre-wrap font-serif text-body text-fg-secondary" style={{ lineHeight: 1.5 }}>
                    {s.contenu}
                  </p>
                </div>
              ))}
              {production.sections.length === 0 && <p className="text-data text-fg-muted">Aucune section.</p>}
              <form action={createSectionDossier} className="k-frame k-frame--sm flex flex-col gap-2 p-4">
                <input type="hidden" name="productionLabelId" value={production.id} />
                <select name="type" required className="k-field">
                  {Object.entries(SECTION_LABEL).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
                <input name="titre" placeholder="Titre (optionnel)" className="k-field" />
                <textarea name="contenu" placeholder="Contenu…" required className="k-field" rows={3} />
                <button type="submit" className="k-btn k-btn--secondary w-fit">
                  Ajouter
                </button>
              </form>
            </div>
          </section>

          <section>
            <p className="mb-3 text-label uppercase text-fg-muted">Bibliothèque d&apos;assets</p>
            <div className="k-frame k-frame--sm p-4">
              <ul className="flex flex-col gap-2">
                {production.assets.map((a) => (
                  <li key={a.id} className="flex items-center justify-between border-b border-hairline pb-2 last:border-b-0">
                    <div>
                      <p className="text-body text-fg">{a.nom}</p>
                      <p className="text-[11px] text-fg-muted">{a.type}</p>
                    </div>
                    <a href={a.url} target="_blank" rel="noreferrer" className="text-data text-accent">
                      Ouvrir
                    </a>
                  </li>
                ))}
                {production.assets.length === 0 && <p className="text-data text-fg-muted">Aucun asset.</p>}
              </ul>
              <form action={createAsset} className="mt-4 flex flex-wrap gap-2">
                <input type="hidden" name="productionLabelId" value={production.id} />
                <input name="nom" placeholder="Nom" required className="k-field" />
                <select name="type" required className="k-field">
                  <option value="IMAGE">Image</option>
                  <option value="VIDEO">Vidéo</option>
                  <option value="SON">Son</option>
                  <option value="DOC">Doc</option>
                </select>
                <input name="url" placeholder="URL" required className="k-field flex-1" />
                <button type="submit" className="k-btn k-btn--secondary">
                  Ajouter
                </button>
              </form>
              <p className="mt-3 text-[11px] text-fg-muted">
                Crochet réservé : réception directe depuis le générateur IA nodal (non implémenté).
              </p>
            </div>
          </section>
        </div>
      )}

      {face === 'suivi' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section>
            <p className="mb-3 text-label uppercase text-fg-muted">Tâches</p>
            <div className="k-frame k-frame--sm p-4">
              <ul className="flex flex-col gap-2">
                {production.taches.map((t) => (
                  <li key={t.id} className="flex items-center justify-between border-b border-hairline pb-2 last:border-b-0">
                    <div>
                      <p className="text-body text-fg">{t.libelle}</p>
                      {t.echeance && <p className="text-[11px] text-fg-muted">{formatDate(t.echeance)}</p>}
                    </div>
                    <form action={updateTacheLabelStatut}>
                      <input type="hidden" name="id" value={t.id} />
                      <input type="hidden" name="productionLabelId" value={production.id} />
                      <select name="statut" defaultValue={t.statut} className="k-field" style={{ padding: '4px 8px', fontSize: 11 }}>
                        <option value="A_FAIRE">À faire</option>
                        <option value="EN_COURS">En cours</option>
                        <option value="FAIT">Fait</option>
                      </select>
                    </form>
                  </li>
                ))}
                {production.taches.length === 0 && <p className="text-data text-fg-muted">Aucune tâche.</p>}
              </ul>
              <form action={createTacheLabel} className="mt-4 flex gap-2">
                <input type="hidden" name="productionLabelId" value={production.id} />
                <input name="libelle" placeholder="Nouvelle tâche" required className="k-field flex-1" />
                <input name="echeance" type="date" className="k-field" />
                <button type="submit" className="k-btn k-btn--secondary">
                  Ajouter
                </button>
              </form>
            </div>
          </section>

          <section>
            <p className="mb-3 text-label uppercase text-fg-muted">Budget alloué vs consommé</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="k-frame k-frame--sm p-4">
                <p className="mb-1 text-label uppercase text-fg-muted">Alloué</p>
                <p className="font-serif text-subtitle text-fg">{formatMontant(production.budgetAlloue)}</p>
              </div>
              <div className="k-frame k-frame--sm p-4">
                <p className="mb-1 text-label uppercase text-fg-muted">Consommé</p>
                <p className="font-serif text-subtitle text-fg">{formatMontant(consomme)}</p>
              </div>
            </div>

            <p className="mb-3 mt-6 text-label uppercase text-fg-muted">Dépenses</p>
            <div className="k-frame overflow-hidden">
              {production.depenses.map((d) => (
                <div key={d.id} className="flex items-center justify-between border-b border-hairline px-6 py-3 text-data last:border-b-0">
                  <span className="text-fg">{d.categorie}</span>
                  <span className="text-fg-muted">{formatDate(d.date)}</span>
                  <span className="k-td-num text-fg-secondary">{formatMontant(d.montant)}</span>
                </div>
              ))}
              {production.depenses.length === 0 && <p className="px-6 py-4 text-data text-fg-muted">Aucune dépense.</p>}
            </div>
            <form action={createDepenseLabel} className="k-frame k-frame--sm mt-3 flex flex-wrap gap-2 p-4">
              <input type="hidden" name="productionLabelId" value={production.id} />
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
