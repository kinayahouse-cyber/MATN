import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import {
  STADE_PROJET_LABELS,
  ENGAGEMENT_LABELS,
  TYPE_DOCUMENT_LABELS,
  STATUT_DOCUMENT_LABELS,
  STATUT_TACHE_LABELS,
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
  updateTacheField,
  deleteTache,
  updateDepenseField,
  deleteDepense,
  addDecision,
  addNote,
} from '../actions';
import { resolveFileUrl } from '@/lib/supabase/admin';
import { EditableField } from '@/components/EditableField';
import { DeleteButton } from '@/components/DeleteButton';
import { AddTacheRow } from '@/components/AddTacheRow';
import { AddDepenseRow } from '@/components/AddDepenseRow';
import { AddProjetContact } from '@/components/AddProjetContact';
import { JalonAtteintCheckbox } from '@/components/JalonAtteintCheckbox';
import { TacheDoneCheckbox } from '@/components/TacheDoneCheckbox';

const STADE_ORDER = ['DEVIS_ENVOYE', 'SIGNE', 'EN_COURS', 'LIVRE', 'CLOS'] as const;

const engagementOptions = Object.entries(ENGAGEMENT_LABELS).map(([value, label]) => ({
  value,
  label,
}));
const stadeOptions = [...STADE_ORDER, 'ABANDONNE'].map((value) => ({
  value,
  label: STADE_PROJET_LABELS[value],
}));
const statutTacheOptions = Object.entries(STATUT_TACHE_LABELS).map(([value, label]) => ({
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
  'mt-1 w-full rounded-md border border-line bg-transparent px-3 py-2 text-sm';
const labelClass = 'text-sm text-muted';

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' }).format(
    date
  );
}

function formatMontant(montant: unknown) {
  if (montant === null || montant === undefined) return null;
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(Number(montant)) + ' DZD';
}

function timeAgo(date: Date) {
  const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 0) return "aujourd'hui";
  if (days === 1) return 'il y a 1 jour';
  return `il y a ${days} jours`;
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

  // Fusionne Décisions et Notes en un seul flux chronologique pour la barre de capture.
  const feed = [
    ...projet.decisions.map((d) => ({
      kind: 'Décision' as const,
      id: d.id,
      titre: d.intitule,
      soustitre: null,
      date: d.date,
    })),
    ...projet.notesMatn.map((n) => ({
      kind: 'Note' as const,
      id: n.id,
      titre: n.titre ?? n.contenu.slice(0, 60),
      soustitre: null,
      date: n.createdAt,
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 3);

  const stadeIndex = STADE_ORDER.indexOf(projet.stade as (typeof STADE_ORDER)[number]);
  const budget = formatMontant(projet.budget);
  const budgetInterne = formatMontant(projet.budgetInterne);
  const budgetRaw = projet.budget === null ? '' : String(projet.budget);
  const budgetInterneRaw = projet.budgetInterne === null ? '' : String(projet.budgetInterne);
  const dateDebutRaw = projet.dateDebut ? projet.dateDebut.toISOString().slice(0, 10) : '';
  const dateFinPrevueRaw = projet.dateFinPrevue
    ? projet.dateFinPrevue.toISOString().slice(0, 10)
    : '';

  return (
    <div className="space-y-8">
      {/* Overview / Description */}
      <section className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted">Overview</p>
          <h2 className="mt-2 text-lg font-medium">Description</h2>
          <EditableField
            value={projet.description ?? ''}
            onSave={updateProjetField.bind(null, projet.id, 'description')}
            type="textarea"
            placeholder="Aucune description."
            className="mt-2 text-sm text-muted"
          />

          {/* Scopes : contenu non encore modélisé (ADR-009) — placeholder */}
          <p className="mt-6 text-xs uppercase tracking-wide text-muted">Scopes</p>
          <p className="mt-1 text-sm text-muted">À définir.</p>

          <div className="mt-4">
            <p className="text-xs uppercase tracking-wide text-muted">
              Type d&rsquo;engagement
            </p>
            <EditableField
              value={projet.engagement ?? ''}
              onSave={updateProjetField.bind(null, projet.id, 'engagement')}
              type="select"
              options={engagementOptions}
              className="mt-1 text-sm text-muted"
            />
          </div>

          <div className="mt-4 flex gap-6 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted">Budget</p>
              <EditableField
                value={budgetRaw}
                displayValue={budget ?? undefined}
                onSave={updateProjetField.bind(null, projet.id, 'budget')}
                type="number"
                className="mt-1 font-medium tabular-nums"
              />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted">Budget interne</p>
              <EditableField
                value={budgetInterneRaw}
                displayValue={budgetInterne ?? undefined}
                onSave={updateProjetField.bind(null, projet.id, 'budgetInterne')}
                type="number"
                className="mt-1 font-medium tabular-nums"
              />
            </div>
          </div>

          <div className="mt-4 flex gap-6 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted">Début</p>
              <EditableField
                value={dateDebutRaw}
                onSave={updateProjetField.bind(null, projet.id, 'dateDebut')}
                type="date"
                className="mt-1"
              />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted">Fin prévue</p>
              <EditableField
                value={dateFinPrevueRaw}
                onSave={updateProjetField.bind(null, projet.id, 'dateFinPrevue')}
                type="date"
                className="mt-1"
              />
            </div>
          </div>
        </div>

        <div className="flex items-start justify-between border-t border-line pt-4 md:border-l md:border-t-0 md:pl-8 md:pt-0">
          <div className="flex-1">
            <EditableField
              value={projet.nom}
              onSave={updateProjetField.bind(null, projet.id, 'nom')}
              className="font-display text-2xl"
            />
            {projet.organisation && (
              <Link
                href={`/clients/${projet.organisation.id}`}
                className="mt-1 block text-sm text-muted hover:underline"
              >
                {projet.organisation.nom}
              </Link>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <EditableField
              value={projet.stade}
              onSave={updateProjetField.bind(null, projet.id, 'stade')}
              type="select"
              options={stadeOptions}
              className="rounded-full border border-line px-3 py-1 text-xs"
            />
            <DeleteButton
              action={deleteProjet.bind(null, projet.id)}
              confirmMessage={`Supprimer le projet ${projet.nom} ? Jalons, fichiers, tâches et dépenses associés seront aussi supprimés.`}
              label="Supprimer le projet"
              className="text-xs text-muted hover:text-accent"
            />
          </div>
        </div>
      </section>

      {/* Label — champs propres au track LABEL (ADR-008) */}
      {projet.track === 'LABEL' && (
        <section className="border-t border-line pt-4">
          <p className="text-xs uppercase tracking-wide text-muted">Label</p>
          <div className="mt-2 grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted">
                Stade production
              </p>
              <EditableField
                value={projet.stadeLabel ?? ''}
                onSave={updateProjetField.bind(null, projet.id, 'stadeLabel')}
                type="select"
                options={stadeLabelOptions}
                className="mt-1"
              />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted">Format</p>
              <EditableField
                value={projet.format ?? ''}
                onSave={updateProjetField.bind(null, projet.id, 'format')}
                className="mt-1"
              />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted">
                Statut diffusion
              </p>
              <EditableField
                value={projet.statutDiffusion ?? ''}
                onSave={updateProjetField.bind(null, projet.id, 'statutDiffusion')}
                className="mt-1"
              />
            </div>
          </div>
        </section>
      )}

      {/* Contacts liés (relation directe Contact<->Projet, ADR-006 pt.5) */}
      <section className="border-t border-line pt-4">
        <h2 className="text-sm font-medium uppercase tracking-wide">Contacts</h2>
        {projet.contacts.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Aucun contact lié.</p>
        ) : (
          <ul className="mt-3 flex flex-wrap gap-2">
            {projet.contacts.map((contact) => (
              <li
                key={contact.id}
                className="flex items-center gap-2 rounded-full border border-line px-3 py-1 text-sm"
              >
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
      </section>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Jalons */}
        <section>
          <h2 className="text-sm font-medium uppercase tracking-wide">Jalons</h2>
          {projet.jalons.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Aucun jalon.</p>
          ) : (
            <ul className="mt-3 space-y-2 border-l border-line pl-4">
              {projet.jalons.map((jalon) => (
                <li key={jalon.id} className="flex items-center gap-2 text-sm">
                  <JalonAtteintCheckbox id={jalon.id} atteint={jalon.atteint} />
                  <EditableField
                    value={jalon.date.toISOString().slice(0, 10)}
                    onSave={updateJalonField.bind(null, jalon.id, 'date')}
                    type="date"
                    className="w-28 shrink-0 text-muted"
                  />
                  <EditableField
                    value={jalon.libelle}
                    onSave={updateJalonField.bind(null, jalon.id, 'libelle')}
                    className="flex-1 font-medium"
                  />
                  <DeleteButton action={deleteJalon.bind(null, jalon.id)} />
                </li>
              ))}
            </ul>
          )}

          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-muted hover:text-fg">
              + Ajouter un jalon
            </summary>
            <form action={addJalon} className="mt-3 space-y-3">
              <input type="hidden" name="projetId" value={projet.id} />
              <div>
                <label className={labelClass}>Libellé</label>
                <input name="libelle" required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Date</label>
                <input name="date" type="date" required className={inputClass} />
              </div>
              <button
                type="submit"
                className="rounded-md bg-fg px-4 py-2 text-sm font-medium text-bg"
              >
                Ajouter
              </button>
            </form>
          </details>
        </section>

        {/* Files (Documents) */}
        <section>
          <h2 className="text-sm font-medium uppercase tracking-wide">Files</h2>
          {projet.documents.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Aucun document.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line">
              {projet.documents.map((doc) => (
                <li key={doc.id} className="py-2 text-sm">
                  <div className="flex items-center gap-2">
                    <EditableField
                      value={doc.type}
                      onSave={updateDocumentField.bind(null, doc.id, 'type')}
                      type="select"
                      options={typeDocumentOptions}
                      className="w-32 shrink-0 font-medium"
                    />
                    <EditableField
                      value={doc.numero ?? ''}
                      onSave={updateDocumentField.bind(null, doc.id, 'numero')}
                      placeholder="N° —"
                      className="flex-1"
                    />
                    <EditableField
                      value={doc.statut}
                      onSave={updateDocumentField.bind(null, doc.id, 'statut')}
                      type="select"
                      options={statutDocumentOptions}
                      className="w-28 shrink-0 text-xs text-muted"
                    />
                    <DeleteButton action={deleteDocument.bind(null, doc.id)} />
                  </div>
                  <div className="mt-1 flex items-center gap-2 pl-1">
                    <span className="text-xs text-muted">Lien :</span>
                    <EditableField
                      value={doc.url ?? ''}
                      onSave={updateDocumentField.bind(null, doc.id, 'url')}
                      placeholder="https://…"
                      className="flex-1 text-xs text-muted"
                    />
                    {documentUrlById.get(doc.id) && (
                      <a
                        href={documentUrlById.get(doc.id)!}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-muted hover:underline"
                      >
                        Ouvrir
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}

          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-muted hover:text-fg">
              + Ajouter un fichier
            </summary>
            <form action={addDocument} className="mt-3 space-y-3">
              <input type="hidden" name="projetId" value={projet.id} />
              <div>
                <label className={labelClass}>Type</label>
                <select name="type" defaultValue="LIVRABLE" className={inputClass}>
                  {Object.entries(TYPE_DOCUMENT_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
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
                <p className="mt-1 text-xs text-muted">
                  Uploadé dans le stockage MATN. Sinon, colle un lien externe (Drive, etc.)
                  ci-dessous.
                </p>
              </div>
              <div>
                <label className={labelClass}>Lien du fichier (si pas d&rsquo;upload)</label>
                <input name="url" type="url" placeholder="https://…" className={inputClass} />
              </div>
              <button
                type="submit"
                className="rounded-md bg-fg px-4 py-2 text-sm font-medium text-bg"
              >
                Ajouter
              </button>
            </form>
          </details>
        </section>
      </div>

      {/* Assets (images, vidéos, sons — stockage MATN) */}
      <section className="border-t border-line pt-4">
        <h2 className="text-sm font-medium uppercase tracking-wide">Assets</h2>
        {projet.assets.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Aucun asset.</p>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {projet.assets.map((asset) => {
              const resolvedUrl = assetUrlById.get(asset.id);
              return (
                <div key={asset.id} className="rounded-md border border-line p-2">
                  {asset.type === 'IMAGE' && resolvedUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={resolvedUrl}
                      alt={asset.nom}
                      className="h-24 w-full rounded object-cover"
                    />
                  ) : (
                    <div className="flex h-24 w-full items-center justify-center rounded bg-line/40 text-xs text-muted">
                      {TYPE_ASSET_LABELS[asset.type] ?? asset.type}
                    </div>
                  )}
                  <EditableField
                    value={asset.nom}
                    onSave={updateAssetField.bind(null, asset.id, 'nom')}
                    className="mt-2 text-xs font-medium"
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
                    <span className="mt-1 inline-block bg-line px-2 py-0.5 text-[10px] uppercase text-muted">
                      IA
                    </span>
                  )}
                  {resolvedUrl && (
                    <a
                      href={resolvedUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 block text-xs text-muted hover:underline"
                    >
                      Ouvrir
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-muted hover:text-fg">
            + Ajouter un asset
          </summary>
          <form action={addAsset} className="mt-3 space-y-3">
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
            <button
              type="submit"
              className="rounded-md bg-fg px-4 py-2 text-sm font-medium text-bg"
            >
              Ajouter
            </button>
          </form>
        </details>
      </section>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Tâches */}
        <section>
          <h2 className="text-sm font-medium uppercase tracking-wide">Tâches</h2>
          <table className="mt-3 w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase text-muted">
                <th className="w-6 pb-1 font-normal" />
                <th className="pb-1 font-normal">Libellé</th>
                <th className="pb-1 font-normal">Statut</th>
                <th className="pb-1 font-normal">Échéance</th>
                <th className="pb-1 font-normal">Assigné à</th>
                <th className="w-6 pb-1 font-normal" />
              </tr>
            </thead>
            <tbody>
              {projet.taches.map((t) => (
                <tr key={t.id} className="border-b border-line align-top">
                  <td className="py-2">
                    <TacheDoneCheckbox id={t.id} statut={t.statut} />
                  </td>
                  <td className="py-1">
                    <EditableField
                      value={t.libelle}
                      onSave={updateTacheField.bind(null, t.id, 'libelle')}
                      className={t.statut === 'FAIT' ? 'text-muted line-through' : ''}
                    />
                    <EditableField
                      value={t.description ?? ''}
                      onSave={updateTacheField.bind(null, t.id, 'description')}
                      type="textarea"
                      placeholder="Description —"
                      className="text-xs text-muted"
                    />
                  </td>
                  <td className="py-1 text-muted">
                    <EditableField
                      value={t.statut}
                      onSave={updateTacheField.bind(null, t.id, 'statut')}
                      type="select"
                      options={statutTacheOptions}
                    />
                  </td>
                  <td className="py-1 text-muted">
                    <EditableField
                      value={t.echeance ? t.echeance.toISOString().slice(0, 10) : ''}
                      onSave={updateTacheField.bind(null, t.id, 'echeance')}
                      type="date"
                    />
                  </td>
                  <td className="py-1 text-muted">
                    <EditableField
                      value={t.assigneAId ?? ''}
                      onSave={updateTacheField.bind(null, t.id, 'assigneAId')}
                      type="select"
                      options={utilisateurs.map((u) => ({
                        value: u.id,
                        label: u.nom ?? u.email,
                      }))}
                    />
                  </td>
                  <td className="py-2">
                    <DeleteButton action={deleteTache.bind(null, t.id)} />
                  </td>
                </tr>
              ))}
              <AddTacheRow projetId={projet.id} utilisateurs={utilisateurs} />
            </tbody>
          </table>
        </section>

        {/* Dépenses */}
        <section>
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-medium uppercase tracking-wide">Dépenses</h2>
            {totalDepenses > 0 && (
              <span className="text-xs text-muted">
                Total : {formatMontant(totalDepenses)}
                {budget && ` / ${budget}`}
              </span>
            )}
          </div>
          <table className="mt-3 w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs uppercase text-muted">
                <th className="pb-1 font-normal">Catégorie</th>
                <th className="pb-1 font-normal">Montant</th>
                <th className="pb-1 font-normal">Date</th>
                <th className="w-6 pb-1 font-normal" />
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
        </section>
      </div>

      {/* Timeline du cycle commercial */}
      <section className="border-t border-line pt-6">
        <div className="flex items-center justify-between">
          {STADE_ORDER.map((stade, i) => (
            <div key={stade} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-1">
                <span
                  className={
                    'h-2.5 w-2.5 rounded-full ' +
                    (i < stadeIndex
                      ? 'bg-fg'
                      : i === stadeIndex
                        ? 'bg-accent'
                        : 'border border-line')
                  }
                />
                <span className="text-xs text-muted">{STADE_PROJET_LABELS[stade]}</span>
              </div>
              {i < STADE_ORDER.length - 1 && <div className="mx-2 h-px flex-1 bg-line" />}
            </div>
          ))}
        </div>
        {projet.stade === 'ABANDONNE' && (
          <p className="mt-3 text-sm text-accent">Projet abandonné.</p>
        )}
      </section>

      {/* Capture — Décisions / Notes récentes */}
      <section className="grid grid-cols-1 gap-3 border-t border-line pt-6 sm:grid-cols-4">
        {feed.map((entry) => (
          <div key={`${entry.kind}-${entry.id}`} className="rounded-md border border-line p-3">
            <span className="bg-line px-2 py-0.5 text-[10px] uppercase text-muted">
              {entry.kind}
            </span>
            <p className="mt-2 text-sm font-medium">{entry.titre}</p>
            <p className="mt-1 text-xs text-muted">{timeAgo(entry.date)}</p>
          </div>
        ))}
        <div className="space-y-2">
          <details className="rounded-md border border-dashed border-line p-3">
            <summary className="cursor-pointer text-sm text-muted hover:text-fg">
              + Décision
            </summary>
            <form action={addDecision} className="mt-3 space-y-2">
              <input type="hidden" name="projetId" value={projet.id} />
              <input name="intitule" required placeholder="Intitulé" className={inputClass} />
              <textarea
                name="justification"
                required
                rows={2}
                placeholder="Justification"
                className={inputClass}
              />
              <details>
                <summary className="cursor-pointer text-xs text-muted hover:text-muted">
                  + Contexte / options écartées
                </summary>
                <textarea
                  name="contexte"
                  rows={2}
                  placeholder="Contexte"
                  className={`${inputClass} mt-2`}
                />
                <textarea
                  name="optionsEcartees"
                  rows={2}
                  placeholder="Options écartées"
                  className={`${inputClass} mt-2`}
                />
              </details>
              <button
                type="submit"
                className="rounded-md bg-fg px-3 py-1.5 text-xs font-medium text-bg"
              >
                Logger
              </button>
            </form>
          </details>

          <details className="rounded-md border border-dashed border-line p-3">
            <summary className="cursor-pointer text-sm text-muted hover:text-fg">
              + Note
            </summary>
            <form action={addNote} className="mt-3 space-y-2">
              <input type="hidden" name="projetId" value={projet.id} />
              <textarea name="contenu" required rows={2} placeholder="Contenu" className={inputClass} />
              <input name="tag" placeholder="Tag (optionnel)" className={inputClass} />
              <button
                type="submit"
                className="rounded-md bg-fg px-3 py-1.5 text-xs font-medium text-bg"
              >
                Ajouter
              </button>
            </form>
          </details>
        </div>
      </section>
    </div>
  );
}
