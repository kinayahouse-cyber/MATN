export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { formatMontant, STATUT_PIPELINE_LABEL } from '@/lib/format';
import { createOrganisation, createOpportunite, updateOpportuniteStatut, convertOpportuniteToProjet } from './actions';

const COLONNES = ['NOUVEAU', 'QUALIFICATION', 'PROPOSITION', 'NEGOCIATION', 'GAGNEE', 'PERDUE'] as const;

async function getData() {
  const [opportunites, organisations] = await Promise.all([
    prisma.opportunite.findMany({
      include: { organisation: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.organisation.findMany({
      include: { contacts: true },
      orderBy: { nom: 'asc' },
    }),
  ]);
  return { opportunites, organisations };
}

export default async function PipelinePage() {
  const { opportunites, organisations } = await getData();

  return (
    <div className="flex flex-col gap-12">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-title text-fg">Pipeline + CRM</h1>
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <p className="text-label uppercase text-fg-muted">Pipeline</p>
        </div>

        <div className="grid grid-cols-1 gap-4 overflow-x-auto md:grid-cols-3 xl:grid-cols-6">
          {COLONNES.map((statut) => {
            const items = opportunites.filter((o) => o.statut === statut);
            return (
              <div key={statut} className="k-frame k-frame--sm min-w-[220px] p-4">
                <p className="mb-3 text-label uppercase text-fg-secondary">
                  {STATUT_PIPELINE_LABEL[statut]} <span className="text-fg-muted">({items.length})</span>
                </p>
                <div className="flex flex-col gap-3">
                  {items.map((o) => (
                    <div key={o.id} className="k-frame p-3">
                      <p className="font-serif text-[16px] text-fg">{o.titre}</p>
                      <p className="mt-1 text-data text-fg-secondary">{o.organisation.nom}</p>
                      {o.valeurEstimee && (
                        <p className="mt-1 text-data tabular-nums text-fg-secondary">
                          {formatMontant(o.valeurEstimee)}
                        </p>
                      )}
                      <div className="mt-3 flex items-center gap-2">
                        <form action={updateOpportuniteStatut}>
                          <input type="hidden" name="id" value={o.id} />
                          <select
                            name="statut"
                            defaultValue={o.statut}
                            className="k-field text-[11px]"
                            style={{ padding: '4px 8px' }}
                          >
                            {COLONNES.map((s) => (
                              <option key={s} value={s}>
                                {STATUT_PIPELINE_LABEL[s]}
                              </option>
                            ))}
                          </select>
                        </form>
                        {!o.projetId && (
                          <form action={convertOpportuniteToProjet}>
                            <input type="hidden" name="id" value={o.id} />
                            <button type="submit" className="k-btn k-btn--ghost" style={{ padding: '4px 10px', fontSize: 11 }}>
                              → Projet
                            </button>
                          </form>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <details className="k-frame k-frame--sm mt-4 p-4">
          <summary className="cursor-pointer text-data text-fg-secondary">Nouvelle opportunité</summary>
          <form action={createOpportunite} className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
            <input name="titre" placeholder="Titre" required className="k-field" />
            <select name="organisationId" required className="k-field">
              <option value="">Organisation…</option>
              {organisations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.nom}
                </option>
              ))}
            </select>
            <select name="divisionPressentie" className="k-field">
              <option value="">Division…</option>
              <option value="STUDIO">Studio</option>
              <option value="ATELIER">Atelier</option>
              <option value="LABEL">Label</option>
              <option value="GENERALITES">Généralités</option>
            </select>
            <input name="valeurEstimee" type="number" placeholder="Valeur estimée (DA)" className="k-field" />
            <button type="submit" className="k-btn k-btn--primary md:col-span-4 md:w-fit">
              Créer
            </button>
          </form>
        </details>
      </section>

      <section>
        <p className="mb-4 text-label uppercase text-fg-muted">Organisations &amp; contacts</p>
        <div className="k-frame overflow-hidden">
          <div className="k-th grid grid-cols-[2fr_1fr_1fr_2fr] gap-2 border-b border-hairline px-6 py-3">
            <div>Nom</div>
            <div>Type</div>
            <div>Secteur</div>
            <div>Contacts</div>
          </div>
          {organisations.map((org) => (
            <div
              key={org.id}
              className="grid grid-cols-[2fr_1fr_1fr_2fr] items-center gap-2 border-b border-hairline px-6 py-3 text-data last:border-b-0"
            >
              <div className="font-serif text-[16px] text-fg">{org.nom}</div>
              <div className="text-fg-secondary">{org.type}</div>
              <div className="text-fg-secondary">{org.secteur ?? '—'}</div>
              <div className="text-fg-secondary">
                {org.contacts.map((c) => c.nom).join(', ') || '—'}
              </div>
            </div>
          ))}
        </div>

        <details className="k-frame k-frame--sm mt-4 p-4">
          <summary className="cursor-pointer text-data text-fg-secondary">Nouvelle organisation</summary>
          <form action={createOrganisation} className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
            <input name="nom" placeholder="Nom" required className="k-field" />
            <select name="type" className="k-field">
              <option value="CLIENT_DIRECT">Client direct</option>
              <option value="AGENCE">Agence</option>
              <option value="PRESCRIPTEUR">Prescripteur</option>
            </select>
            <input name="secteur" placeholder="Secteur" className="k-field" />
            <button type="submit" className="k-btn k-btn--primary md:col-span-1 md:w-fit">
              Créer
            </button>
          </form>
        </details>
      </section>
    </div>
  );
}
