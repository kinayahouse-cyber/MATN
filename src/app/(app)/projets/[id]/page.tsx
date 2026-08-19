import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import {
  ENGAGEMENT_LABELS,
  TYPE_DOCUMENT_LABELS,
  STATUT_DOCUMENT_LABELS,
  STADE_PRODUCTION_LABEL_LABELS,
  TYPE_ASSET_LABELS,
} from '@/lib/labels';
import {
  addJalon,
  updateJalonField,
  deleteJalon,
  addDocument,
  updateDocumentField,
  deleteDocument,
  addAsset,
  updateAssetField,
  deleteAsset,
  updateProjetField,
  deleteProjet,
  removeContactFromProjet,
  updateDepenseField,
  deleteDepense,
  addDecision,
  addNote,
} from '../actions';
import { resolveFileUrl } from '@/lib/supabase/admin';
import { EditableField } from '@/components/EditableField';
import { DeleteButton } from '@/components/DeleteButton';
import { AddDepenseRow } from '@/components/AddDepenseRow';
import { AddProjetContact } from '@/components/AddProjetContact';
import { JalonAtteintCheckbox } from '@/components/JalonAtteintCheckbox';
import { TacheList } from '@/components/TacheList';
import { SectionTitle, Eyebrow } from '@/components/SectionTitle';
import { StadeTimeline } from '@/components/StadeTimeline';
import { ProjectHeader } from '@/components/ProjectHeader';
import { ProjectMetrics } from '@/components/ProjectMetrics';
import { ProjectFinance } from '@/components/ProjectFinance';
import { ProjectSectionTabs } from '@/components/ProjectSectionTabs';
import { CaptureBar } from '@/components/CaptureBar';

const engagementOptions = Object.entries(ENGAGEMENT_LABELS).map(([value, label]) => ({
  value,
  label,
}));
const typeDocumentOptions = Object.entries(TYPE_DOCUMENT_LABELS).map(([value, label]) => ({
  value,
  label,
}));
const statutDocumentOptions = Object.entries(STATUT_DOCUMENT_LABELS).map(([value, label]) => ({
  value,
  label,
}));
const stadeLabelOptions = Object.entries(STADE_PRODUCTION_LABEL_LABELS).map(([value, label]) => ({
  value,
  label,
}));
const typeAssetOptions = Object.entries(TYPE_ASSET_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const inputClass =
  'mt-1 w-full border border-line bg-bg px-3 py-2 text-sm text-fg focus:outline-none focus:border-accent';
const labelClass = 'text-sm text-muted';

function formatMontant(montant: unknown) {
  if (montant === null || montant === undefined) return null;
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Number(montant)) + ' DZD';
}

function formatEcheance(dateFinPrevue: Date | null, stade: string) {
  if (!dateFinPrevue) return { label: '—', late: false };
  const clos = stade === 'LIVRE' || stade === 'CLOS' || stade === 'ABANDONNE';
  const diffDays = Math.ceil((dateFinPrevue.getTime() - Date.now()) / 86_400_000);
  if (clos) return { label: diffDays >= 0 ? `${diffDays}j` : 'Passée', late: false };
  if (diffDays < 0) return { label: `${Math.abs(diffDays)}j de retard`, late: true };
  if (diffDays === 0) return { label: "Aujourd'hui", late: false };
  return { label: `${diffDays}j restants`, late: false };
}

export default async function ProjetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [projet, utilisateurs, allContacts] = await Promise.all([
    prisma.projet.findUnique({
      where: { id },
      include: {
        organisation: true,
        contacts: { orderBy: { nom: 'asc' } },
        jalons: { orderBy: { ordre: 'asc' } },
        documents: { orderBy: { createdAt: 'desc' } },
        assets: { orderBy: { createdAt: 'desc' } },
        decisions: { orderBy: { date: 'desc' }, take: 10 },
        notesMatn: { orderBy: { createdAt: 'desc' }, take: 10 },
        taches: { orderBy: { createdAt: 'asc' } },
        depenses: { orderBy: { date: 'desc' } },
      },
    }),
    prisma.utilisateur.findMany({ orderBy: { email: 'asc' } }),
    prisma.contact.findMany({ include: { organisation: true }, orderBy: { nom: 'asc' } }),
  ]);

  if (!projet) notFound();

  const linkedContactIds = new Set(projet.contacts.map((c) => c.id));
  const availableContacts = allContacts
    .filter((c) => !linkedContactIds.has(c.id))
    .map((c) => ({ id: c.id, nom: c.nom, organisationNom: c.organisation?.nom ?? null }));

  const [documentUrls, assetUrls] = await Promise.all([
    Promise.all(projet.documents.map((doc) => resolveFileUrl(doc.url))),
    Promise.all(projet.assets.map((asset) => resolveFileUrl(asset.url))),
  ]);
  const documentUrlById = new Map(projet.documents.map((doc, i) => [doc.id, documentUrls[i]]));
  const assetUrlById = new Map(projet.assets.map((asset, i) => [asset.id, assetUrls[i]]));

  const totalDepenses = projet.depenses.reduce((sum, d) => sum + Number(d.montant), 0);
  const jalonsAtteints = projet.jalons.filter((j) => j.atteint).length;
  const tachesFaites = projet.taches.filter((t) => t.statut === 'FAIT').length;
  const echeance = formatEcheance(projet.dateFinPrevue, projet.stade);

  // Fusionne Décisions et Notes en un seul flux chronologique pour la barre de capture.
  const feed = [
    ...projet.decisions.map((d) => ({
      kind: 'Décision' as const,
      id: d.id,
      titre: d.intitule,
      date: d.date,
    })),
    ...projet.notesMatn.map((n) => ({
      kind: 'Note' as const,
      id: n.id,
      titre: n.titre ?? n.contenu.slice(0, 60),
      date: n.createdAt,
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 3);

  const budget = formatMontant(projet.budget);
  const budgetInterne = formatMontant(projet.budgetInterne);
  const budgetEncaisse = formatMontant(projet.budgetEncaisse);
  const budgetRaw = projet.budget === null ? '' : String(projet.budget);
  const budgetInterneRaw = projet.budgetInterne === null ? '' : String(projet.budgetInterne);
  const budgetEncaisseRaw = projet.budgetEncaisse === null ? '' : String(projet.budgetEncaisse);
  const dateDebutRaw = projet.dateDebut ? projet.dateDebut.toISOString().slice(0, 10) : '';
  const dateFinPrevueRaw = projet.dateFinPrevue
    ? projet.dateFinPrevue.toISOString().slice(0, 10)
    : '';

  const tabs = [
    {
      id: 'tasks',
      label: 'Tâches',
      content: <TacheList projetId={projet.id} taches={projet.taches} utilisateurs={utilisateurs} />,
    },
    {
      id: 'overview',
      label: 'Overview',
      content: (
        <div>
          <Eyebrow>Overview</Eyebrow>
          <div className="mt-4">
            <SectionTitle size="md">Description</SectionTitle>
          </div>
          <EditableField
            value={projet.description ?? ''}
            onSave={updateProjetField.bind(null, projet.id, 'description')}
            type="textarea"
            placeholder="Aucune description."
            className="mt-6 max-w-3xl text-sm leading-relaxed text-fg"
          />

          <div className="mt-8 flex items-start justify-between gap-8">
            {/* Scopes : contenu non encore modélisé (ADR-009) — placeholder */}
            <div>
              <SectionTitle size="sm" uppercase={false}>
                Scopes&nbsp;:
              </SectionTitle>
              <p className="mt-2 text-sm text-muted">À définir.</p>
            </div>
            <div className="text-right">
              <Eyebrow>Type d&rsquo;engagements</Eyebrow>
              <EditableField
                value={projet.engagement ?? ''}
                onSave={updateProjetField.bind(null, projet.id, 'engagement')}
                type="select"
                options={engagementOptions}
                className="mt-2 text-sm"
              />
            </div>
          </div>

          <div className="mt-10 border-t border-line-strong pt-8">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
              <div>
                <Eyebrow>Budget interne</Eyebrow>
                <EditableField
                  value={budgetInterneRaw}
                  displayValue={budgetInterne ?? undefined}
                  onSave={updateProjetField.bind(null, projet.id, 'budgetInterne')}
                  type="number"
                  className="mt-2 font-display text-xl tabular-nums"
                />
              </div>
              <div>
                <Eyebrow>Début</Eyebrow>
                <EditableField
                  value={dateDebutRaw}
                  onSave={updateProjetField.bind(null, projet.id, 'dateDebut')}
                  type="date"
                  className="mt-2 text-sm"
                />
              </div>
              <div>
                <Eyebrow>Fin prévue</Eyebrow>
                <EditableField
                  value={dateFinPrevueRaw}
                  onSave={updateProjetField.bind(null, projet.id, 'dateFinPrevue')}
                  type="date"
                  className="mt-2 text-sm"
                />
              </div>
            </div>
            <div className="mt-10">
              <StadeTimeline stade={projet.stade} />
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'jalons',
      label: 'Jalons',
      content: (
        <div>
          {projet.jalons.length === 0 ? (
            <p className="text-sm text-muted">Aucun jalon.</p>
          ) : (
            <ul className="relative max-w-xl space-y-4 pl-6">
              <span className="absolute bottom-2 left-[3px] top-2 w-px bg-fg" aria-hidden />
              {projet.jalons.map((jalon) => (
                <li key={jalon.id} className="relative">
                  <span
                    aria-hidden
                    className={`absolute -left-6 top-1.5 h-1.5 w-1.5 rotate-45 ${
                      jalon.atteint ? 'bg-fg' : 'border border-fg'
                    }`}
                  />
                  <div className="flex items-baseline gap-3 border-b border-line pb-1.5">
                    <EditableField
                      value={jalon.date.toISOString().slice(0, 10)}
                      onSave={updateJalonField.bind(null, jalon.id, 'date')}
                      type="date"
                      className="w-[5.5rem] shrink-0 text-xs text-muted"
                    />
                    <EditableField
                      value={jalon.libelle}
                      onSave={updateJalonField.bind(null, jalon.id, 'libelle')}
                      className="flex-1 text-sm font-medium"
                    />
                    <JalonAtteintCheckbox id={jalon.id} atteint={jalon.atteint} />
                    <DeleteButton action={deleteJalon.bind(null, jalon.id)} />
                  </div>
                </li>
              ))}
            </ul>
          )}

          <details className="mt-6">
            <summary className="cursor-pointer text-sm text-muted hover:text-fg">
              + Ajouter un jalon
            </summary>
            <form action={addJalon} className="mt-3 max-w-sm space-y-3">
              <input type="hidden" name="projetId" value={projet.id} />
              <div>
                <label className={labelClass}>Libellé</label>
                <input name="libelle" required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Date</label>
                <input name="date" type="date" required className={inputClass} />
              </div>
              <button type="submit" className="bg-fg px-4 py-2 text-sm font-medium text-bg">
                Ajouter
              </button>
            </form>
          </details>
        </div>
      ),
    },
    {
      id: 'files',
      label: 'Files',
      content: (
        <div>
          {projet.documents.length === 0 ? (
            <p className="text-sm text-muted">Aucun document.</p>
          ) : (
            <ul className="max-w-xl space-y-3">
              {projet.documents.map((doc) => (
                <li key={doc.id} className="flex gap-3 border-b border-line pb-2">
                  <span aria-hidden className="mt-0.5 text-sm text-fg">
                    ✳
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <EditableField
                        value={doc.numero ?? ''}
                        onSave={updateDocumentField.bind(null, doc.id, 'numero')}
                        placeholder="Sans numéro"
                        className="flex-1 text-sm font-medium"
                      />
                      <EditableField
                        value={doc.statut}
                        onSave={updateDocumentField.bind(null, doc.id, 'statut')}
                        type="select"
                        options={statutDocumentOptions}
                        className="w-24 shrink-0 text-right text-xs text-muted"
                      />
                      <DeleteButton action={deleteDocument.bind(null, doc.id)} />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <EditableField
                        value={doc.type}
                        onSave={updateDocumentField.bind(null, doc.id, 'type')}
                        type="select"
                        options={typeDocumentOptions}
                        className="text-xs text-muted"
                      />
                      {documentUrlById.get(doc.id) && (
                        <a
                          href={documentUrlById.get(doc.id)!}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-accent hover:underline"
                        >
                          Ouvrir
                        </a>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <details className="mt-6">
            <summary className="cursor-pointer text-sm text-muted hover:text-fg">
              + Ajouter un fichier
            </summary>
            <form action={addDocument} className="mt-3 max-w-sm space-y-3">
              <input type="hidden" name="projetId" value={projet.id} />
              <div>
                <label className={labelClass}>Type</label>
                <select name="type" defaultValue="LIVRABLE" className={inputClass}>
                  {typeDocumentOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Numéro (optionnel)</label>
                <input name="numero" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Fichier</label>
                <input name="file" type="file" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Lien externe (si pas d&rsquo;upload)</label>
                <input name="url" type="url" placeholder="https://…" className={inputClass} />
              </div>
              <button type="submit" className="bg-fg px-4 py-2 text-sm font-medium text-bg">
                Ajouter
              </button>
            </form>
          </details>
        </div>
      ),
    },
    {
      id: 'contacts',
      label: 'Contacts',
      content: (
        <div className="max-w-xl">
          {projet.contacts.length === 0 ? (
            <p className="text-sm text-muted">Aucun contact lié.</p>
          ) : (
            <ul className="divide-y divide-line">
              {projet.contacts.map((contact) => (
                <li key={contact.id} className="flex items-center justify-between py-2 text-sm">
                  {contact.organisationId ? (
                    <Link href={`/clients/${contact.organisationId}`} className="hover:underline">
                      {contact.nom}
                    </Link>
                  ) : (
                    <span>{contact.nom}</span>
                  )}
                  <DeleteButton
                    action={removeContactFromProjet.bind(null, projet.id, contact.id)}
                    confirmMessage={`Délier ${contact.nom} de ce projet ?`}
                  />
                </li>
              ))}
            </ul>
          )}
          <AddProjetContact projetId={projet.id} contacts={availableContacts} />

          {/* Champs propres au track LABEL (ADR-008) */}
          {projet.track === 'LABEL' && (
            <div className="mt-10">
              <SectionTitle size="sm">Label</SectionTitle>
              <div className="mt-6 grid grid-cols-1 gap-6">
                <div>
                  <Eyebrow>Stade production</Eyebrow>
                  <EditableField
                    value={projet.stadeLabel ?? ''}
                    onSave={updateProjetField.bind(null, projet.id, 'stadeLabel')}
                    type="select"
                    options={stadeLabelOptions}
                    className="mt-2 text-sm"
                  />
                </div>
                <div>
                  <Eyebrow>Format</Eyebrow>
                  <EditableField
                    value={projet.format ?? ''}
                    onSave={updateProjetField.bind(null, projet.id, 'format')}
                    className="mt-2 text-sm"
                  />
                </div>
                <div>
                  <Eyebrow>Statut diffusion</Eyebrow>
                  <EditableField
                    value={projet.statutDiffusion ?? ''}
                    onSave={updateProjetField.bind(null, projet.id, 'statutDiffusion')}
                    className="mt-2 text-sm"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'depenses',
      label: 'Dépenses',
      content: (
        <table className="w-full max-w-2xl text-left text-sm">
          <thead>
            <tr className="border-b border-muted text-xs uppercase tracking-wide text-muted">
              <th className="pb-2 font-normal">Catégorie</th>
              <th className="pb-2 font-normal">Montant</th>
              <th className="pb-2 font-normal">Date</th>
              <th className="w-6 pb-2 font-normal" />
            </tr>
          </thead>
          <tbody>
            {projet.depenses.map((d) => (
              <tr key={d.id} className="border-b border-line">
                <td className="py-1">
                  <EditableField
                    value={d.categorie}
                    onSave={updateDepenseField.bind(null, d.id, 'categorie')}
                  />
                </td>
                <td className="py-1 tabular-nums text-muted">
                  <EditableField
                    value={String(d.montant)}
                    onSave={updateDepenseField.bind(null, d.id, 'montant')}
                    type="number"
                  />
                </td>
                <td className="py-1 text-muted">
                  <EditableField
                    value={d.date.toISOString().slice(0, 10)}
                    onSave={updateDepenseField.bind(null, d.id, 'date')}
                    type="date"
                  />
                </td>
                <td className="py-1">
                  <DeleteButton action={deleteDepense.bind(null, d.id)} />
                </td>
              </tr>
            ))}
            <AddDepenseRow projetId={projet.id} />
          </tbody>
        </table>
      ),
    },
    {
      id: 'assets',
      label: 'Assets',
      content: (
        <div>
          {projet.assets.length === 0 ? (
            <p className="text-sm text-muted">Aucun asset.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
              {projet.assets.map((asset) => {
                const resolvedUrl = assetUrlById.get(asset.id);
                return (
                  <div key={asset.id} className="border border-line">
                    {asset.type === 'IMAGE' && resolvedUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={resolvedUrl} alt={asset.nom} className="h-28 w-full object-cover" />
                    ) : (
                      <div className="flex h-28 w-full items-center justify-center bg-line/40 text-xs uppercase tracking-wide text-muted">
                        {TYPE_ASSET_LABELS[asset.type] ?? asset.type}
                      </div>
                    )}
                    <div className="p-2">
                      <EditableField
                        value={asset.nom}
                        onSave={updateAssetField.bind(null, asset.id, 'nom')}
                        className="text-xs font-medium"
                      />
                      <div className="mt-1 flex items-center justify-between">
                        <EditableField
                          value={asset.type}
                          onSave={updateAssetField.bind(null, asset.id, 'type')}
                          type="select"
                          options={typeAssetOptions}
                          className="text-xs text-muted"
                        />
                        <DeleteButton action={deleteAsset.bind(null, asset.id)} />
                      </div>
                      {asset.sourceGenerateurIa && (
                        <span className="mt-1 inline-block bg-line px-1.5 py-0.5 text-[10px] uppercase text-muted">
                          IA
                        </span>
                      )}
                      {resolvedUrl && (
                        <a
                          href={resolvedUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 block text-xs text-accent hover:underline"
                        >
                          Ouvrir
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <details className="mt-6">
            <summary className="cursor-pointer text-sm text-muted hover:text-fg">
              + Ajouter un asset
            </summary>
            <form action={addAsset} className="mt-3 max-w-sm space-y-3">
              <input type="hidden" name="projetId" value={projet.id} />
              <div>
                <label className={labelClass}>Nom</label>
                <input name="nom" required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Type</label>
                <select name="type" defaultValue="IMAGE" className={inputClass}>
                  {typeAssetOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Fichier</label>
                <input name="file" type="file" required className={inputClass} />
              </div>
              <label className="flex items-center gap-2 text-sm text-muted">
                <input type="checkbox" name="sourceGenerateurIa" />
                Généré par IA
              </label>
              <button type="submit" className="bg-fg px-4 py-2 text-sm font-medium text-bg">
                Ajouter
              </button>
            </form>
          </details>
        </div>
      ),
    },
    {
      id: 'notes',
      label: 'Notes',
      content: (
        <CaptureBar projetId={projet.id} feed={feed} addDecision={addDecision} addNote={addNote} />
      ),
    },
  ];

  return (
    <div className="-mx-8 -my-6 md:-mx-10">
      <div className="grid grid-cols-1 border-b border-line-strong lg:grid-cols-[3fr_2fr]">
        <ProjectHeader
          projet={{
            id: projet.id,
            nom: projet.nom,
            code: projet.code,
            track: projet.track,
            organisation: projet.organisation,
          }}
          onSaveName={updateProjetField.bind(null, projet.id, 'nom')}
        />
        <div className="border-t border-line-strong lg:border-l lg:border-t-0">
          <ProjectFinance
            budgetRaw={budgetRaw}
            budgetDisplay={budget ?? undefined}
            onSaveBudget={updateProjetField.bind(null, projet.id, 'budget')}
            budgetDepense={totalDepenses}
            budgetEncaisseRaw={budgetEncaisseRaw}
            budgetEncaisseDisplay={budgetEncaisse ?? undefined}
            onSaveBudgetEncaisse={updateProjetField.bind(null, projet.id, 'budgetEncaisse')}
          />
        </div>
      </div>

      <ProjectMetrics
        stade={projet.stade}
        onSaveStade={updateProjetField.bind(null, projet.id, 'stade')}
        jalonsAtteints={jalonsAtteints}
        jalonsTotal={projet.jalons.length}
        tachesFaites={tachesFaites}
        tachesTotal={projet.taches.length}
        echeanceLabel={echeance.label}
        echeanceLate={echeance.late}
      />

      {/* ============ Corps : un seul module actif à la fois (référence Frame 41/60) ============ */}
      <ProjectSectionTabs tabs={tabs} defaultTab="tasks" />

      {/* Suppression du projet — action destructrice, isolée en fin de page */}
      <section className="border-t border-line-strong p-8">
        <DeleteButton
          action={deleteProjet.bind(null, projet.id)}
          confirmMessage={`Supprimer le projet ${projet.nom} ? Jalons, fichiers, tâches et dépenses associés seront aussi supprimés.`}
          label="Supprimer le projet"
          className="text-xs uppercase tracking-wide text-muted hover:text-accent"
        />
      </section>
    </div>
  );
}
