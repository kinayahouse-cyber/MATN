import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import {
  STADE_PROJET_LABELS,
  ENGAGEMENT_LABELS,
  TYPE_DOCUMENT_LABELS,
  STATUT_TACHE_LABELS,
} from '@/lib/labels';
import {
  addJalon,
  addDocument,
  updateProjetField,
  updateTacheField,
  updateDepenseField,
  addDecision,
  addNote,
} from '../actions';
import { EditableField } from '@/components/EditableField';
import { AddTacheRow } from '@/components/AddTacheRow';
import { AddDepenseRow } from '@/components/AddDepenseRow';

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

const inputClass =
  'mt-1 w-full rounded-md border border-neutral-800 bg-transparent px-3 py-2 text-sm';
const labelClass = 'text-sm text-neutral-400';

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

  const [projet, utilisateurs] = await Promise.all([
    prisma.projet.findUnique({
      where: { id },
      include: {
        organisation: true,
        jalons: { orderBy: { ordre: 'asc' } },
        documents: { orderBy: { createdAt: 'desc' } },
        decisions: { orderBy: { date: 'desc' }, take: 10 },
        notesMatn: { orderBy: { createdAt: 'desc' }, take: 10 },
        taches: { orderBy: { createdAt: 'asc' } },
        depenses: { orderBy: { date: 'desc' } },
      },
    }),
    prisma.utilisateur.findMany({ orderBy: { email: 'asc' } }),
  ]);

  if (!projet) notFound();

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
          <p className="text-xs uppercase tracking-wide text-neutral-500">Overview</p>
          <h2 className="mt-2 text-lg font-medium">Description</h2>
          <EditableField
            value={projet.description ?? ''}
            onSave={updateProjetField.bind(null, projet.id, 'description')}
            type="textarea"
            placeholder="Aucune description."
            className="mt-2 text-sm text-neutral-400"
          />

          {/* Scopes : contenu non encore modélisé (ADR-009) — placeholder */}
          <p className="mt-6 text-xs uppercase tracking-wide text-neutral-500">Scopes</p>
          <p className="mt-1 text-sm text-neutral-600">À définir.</p>

          <div className="mt-4">
            <p className="text-xs uppercase tracking-wide text-neutral-500">
              Type d&rsquo;engagement
            </p>
            <EditableField
              value={projet.engagement ?? ''}
              onSave={updateProjetField.bind(null, projet.id, 'engagement')}
              type="select"
              options={engagementOptions}
              className="mt-1 text-sm text-neutral-400"
            />
          </div>

          <div className="mt-4 flex gap-6 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wide text-neutral-500">Budget</p>
              <EditableField
                value={budgetRaw}
                displayValue={budget ?? undefined}
                onSave={updateProjetField.bind(null, projet.id, 'budget')}
                type="number"
                className="mt-1 font-medium tabular-nums"
              />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-neutral-500">Budget interne</p>
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
              <p className="text-xs uppercase tracking-wide text-neutral-500">Début</p>
              <EditableField
                value={dateDebutRaw}
                onSave={updateProjetField.bind(null, projet.id, 'dateDebut')}
                type="date"
                className="mt-1"
              />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-neutral-500">Fin prévue</p>
              <EditableField
                value={dateFinPrevueRaw}
                onSave={updateProjetField.bind(null, projet.id, 'dateFinPrevue')}
                type="date"
                className="mt-1"
              />
            </div>
          </div>
        </div>

        <div className="flex items-start justify-between border-t border-neutral-800 pt-4 md:border-l md:border-t-0 md:pl-8 md:pt-0">
          <div className="flex-1">
            <EditableField
              value={projet.nom}
              onSave={updateProjetField.bind(null, projet.id, 'nom')}
              className="text-xl font-medium"
            />
            {projet.organisation && (
              <Link
                href={`/clients/${projet.organisation.id}`}
                className="mt-1 block text-sm text-neutral-400 hover:underline"
              >
                {projet.organisation.nom}
              </Link>
            )}
          </div>
          <EditableField
            value={projet.stade}
            onSave={updateProjetField.bind(null, projet.id, 'stade')}
            type="select"
            options={stadeOptions}
            className="rounded-full border border-neutral-800 px-3 py-1 text-xs"
          />
        </div>
      </section>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Jalons */}
        <section>
          <h2 className="text-sm font-medium uppercase tracking-wide">Jalons</h2>
          {projet.jalons.length === 0 ? (
            <p className="mt-3 text-sm text-neutral-600">Aucun jalon.</p>
          ) : (
            <ul className="mt-3 space-y-3 border-l border-neutral-800 pl-4">
              {projet.jalons.map((jalon) => (
                <li key={jalon.id} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="text-neutral-500">{formatDate(jalon.date)}</span>{' '}
                    <span className="ml-2 font-medium">{jalon.libelle}</span>
                  </div>
                  <span
                    className={
                      jalon.atteint ? 'text-xs text-neutral-400' : 'text-xs text-neutral-600'
                    }
                  >
                    {jalon.atteint ? 'Atteint' : 'À venir'}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-neutral-500 hover:text-neutral-300">
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
                className="rounded-md bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-950"
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
            <p className="mt-3 text-sm text-neutral-600">Aucun document.</p>
          ) : (
            <ul className="mt-3 divide-y divide-neutral-800">
              {projet.documents.map((doc) => (
                <li key={doc.id} className="flex items-center justify-between py-2 text-sm">
                  <div>
                    {doc.url ? (
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium hover:underline"
                      >
                        {doc.numero ?? doc.type}
                      </a>
                    ) : (
                      <p className="font-medium">{doc.numero ?? doc.type}</p>
                    )}
                    <p className="text-xs text-neutral-500">
                      {TYPE_DOCUMENT_LABELS[doc.type] ?? doc.type}
                    </p>
                  </div>
                  <span className="text-xs text-neutral-500">{doc.statut}</span>
                </li>
              ))}
            </ul>
          )}

          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-neutral-500 hover:text-neutral-300">
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
                <label className={labelClass}>Lien du fichier</label>
                <input
                  name="url"
                  type="url"
                  placeholder="https://…"
                  className={inputClass}
                />
                <p className="mt-1 text-xs text-neutral-600">
                  Lien externe (Drive, etc.) — pas de stockage de fichier propre à MATN pour
                  l&rsquo;instant.
                </p>
              </div>
              <button
                type="submit"
                className="rounded-md bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-950"
              >
                Ajouter
              </button>
            </form>
          </details>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Tâches */}
        <section>
          <h2 className="text-sm font-medium uppercase tracking-wide">Tâches</h2>
          <table className="mt-3 w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-800 text-xs uppercase text-neutral-500">
                <th className="pb-1 font-normal">Libellé</th>
                <th className="pb-1 font-normal">Statut</th>
                <th className="pb-1 font-normal">Échéance</th>
                <th className="pb-1 font-normal">Assigné à</th>
              </tr>
            </thead>
            <tbody>
              {projet.taches.map((t) => (
                <tr key={t.id} className="border-b border-neutral-900">
                  <td className="py-1">
                    <EditableField
                      value={t.libelle}
                      onSave={updateTacheField.bind(null, t.id, 'libelle')}
                    />
                  </td>
                  <td className="py-1 text-neutral-400">
                    <EditableField
                      value={t.statut}
                      onSave={updateTacheField.bind(null, t.id, 'statut')}
                      type="select"
                      options={statutTacheOptions}
                    />
                  </td>
                  <td className="py-1 text-neutral-400">
                    <EditableField
                      value={t.echeance ? t.echeance.toISOString().slice(0, 10) : ''}
                      onSave={updateTacheField.bind(null, t.id, 'echeance')}
                      type="date"
                    />
                  </td>
                  <td className="py-1 text-neutral-400">
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
              <span className="text-xs text-neutral-500">
                Total : {formatMontant(totalDepenses)}
                {budget && ` / ${budget}`}
              </span>
            )}
          </div>
          <table className="mt-3 w-full text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-800 text-xs uppercase text-neutral-500">
                <th className="pb-1 font-normal">Catégorie</th>
                <th className="pb-1 font-normal">Montant</th>
                <th className="pb-1 font-normal">Date</th>
              </tr>
            </thead>
            <tbody>
              {projet.depenses.map((d) => (
                <tr key={d.id} className="border-b border-neutral-900">
                  <td className="py-1">
                    <EditableField
                      value={d.categorie}
                      onSave={updateDepenseField.bind(null, d.id, 'categorie')}
                    />
                  </td>
                  <td className="py-1 tabular-nums text-neutral-400">
                    <EditableField
                      value={String(d.montant)}
                      onSave={updateDepenseField.bind(null, d.id, 'montant')}
                      type="number"
                    />
                  </td>
                  <td className="py-1 text-neutral-400">
                    <EditableField
                      value={d.date.toISOString().slice(0, 10)}
                      onSave={updateDepenseField.bind(null, d.id, 'date')}
                      type="date"
                    />
                  </td>
                </tr>
              ))}
              <AddDepenseRow projetId={projet.id} />
            </tbody>
          </table>
        </section>
      </div>

      {/* Timeline du cycle commercial */}
      <section className="border-t border-neutral-800 pt-6">
        <div className="flex items-center justify-between">
          {STADE_ORDER.map((stade, i) => (
            <div key={stade} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-1">
                <span
                  className={
                    'h-2.5 w-2.5 rounded-full ' +
                    (i < stadeIndex
                      ? 'bg-neutral-100'
                      : i === stadeIndex
                        ? 'bg-orange-500'
                        : 'border border-neutral-700')
                  }
                />
                <span className="text-xs text-neutral-500">{STADE_PROJET_LABELS[stade]}</span>
              </div>
              {i < STADE_ORDER.length - 1 && <div className="mx-2 h-px flex-1 bg-neutral-800" />}
            </div>
          ))}
        </div>
        {projet.stade === 'ABANDONNE' && (
          <p className="mt-3 text-sm text-red-400">Projet abandonné.</p>
        )}
      </section>

      {/* Capture — Décisions / Notes récentes */}
      <section className="grid grid-cols-1 gap-3 border-t border-neutral-800 pt-6 sm:grid-cols-4">
        {feed.map((entry) => (
          <div key={`${entry.kind}-${entry.id}`} className="rounded-md border border-neutral-800 p-3">
            <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-[10px] uppercase text-neutral-400">
              {entry.kind}
            </span>
            <p className="mt-2 text-sm font-medium">{entry.titre}</p>
            <p className="mt-1 text-xs text-neutral-500">{timeAgo(entry.date)}</p>
          </div>
        ))}
        <div className="space-y-2">
          <details className="rounded-md border border-dashed border-neutral-700 p-3">
            <summary className="cursor-pointer text-sm text-neutral-400 hover:text-neutral-100">
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
                <summary className="cursor-pointer text-xs text-neutral-600 hover:text-neutral-400">
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
                className="rounded-md bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-950"
              >
                Logger
              </button>
            </form>
          </details>

          <details className="rounded-md border border-dashed border-neutral-700 p-3">
            <summary className="cursor-pointer text-sm text-neutral-400 hover:text-neutral-100">
              + Note
            </summary>
            <form action={addNote} className="mt-3 space-y-2">
              <input type="hidden" name="projetId" value={projet.id} />
              <textarea name="contenu" required rows={2} placeholder="Contenu" className={inputClass} />
              <input name="tag" placeholder="Tag (optionnel)" className={inputClass} />
              <button
                type="submit"
                className="rounded-md bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-950"
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
