import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { STADE_PROJET_LABELS, ENGAGEMENT_LABELS, TYPE_DOCUMENT_LABELS } from '@/lib/labels';

const STADE_ORDER = ['DEVIS_ENVOYE', 'SIGNE', 'EN_COURS', 'LIVRE', 'CLOS'] as const;

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' }).format(
    date
  );
}

function timeAgo(date: Date) {
  const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 0) return "aujourd'hui";
  if (days === 1) return 'il y a 1 jour';
  return `il y a ${days} jours`;
}

export default async function ProjetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const projet = await prisma.projet.findUnique({
    where: { id },
    include: {
      organisation: true,
      jalons: { orderBy: { ordre: 'asc' } },
      documents: { orderBy: { createdAt: 'desc' } },
      decisions: { orderBy: { date: 'desc' }, take: 10 },
      notesMatn: { orderBy: { createdAt: 'desc' }, take: 10 },
    },
  });

  if (!projet) notFound();

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

  return (
    <div className="space-y-8">
      {/* Overview / Description */}
      <section className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-neutral-500">Overview</p>
          <h2 className="mt-2 text-lg font-medium">Description</h2>
          <p className="mt-2 text-sm text-neutral-400">
            {projet.description ?? 'Aucune description.'}
          </p>

          {/* Scopes : contenu non encore modélisé (ADR-009) — placeholder */}
          <p className="mt-6 text-xs uppercase tracking-wide text-neutral-500">Scopes</p>
          <p className="mt-1 text-sm text-neutral-600">À définir.</p>

          {projet.engagement && (
            <p className="mt-4 text-sm text-neutral-400">
              Type d&rsquo;engagement : {ENGAGEMENT_LABELS[projet.engagement] ?? projet.engagement}
            </p>
          )}
        </div>

        <div className="flex items-start justify-between border-t border-neutral-800 pt-4 md:border-l md:border-t-0 md:pl-8 md:pt-0">
          <div>
            <h1 className="text-xl font-medium">{projet.nom}</h1>
            {projet.organisation && (
              <Link
                href={`/clients/${projet.organisation.id}`}
                className="mt-1 block text-sm text-neutral-400 hover:underline"
              >
                {projet.organisation.nom}
              </Link>
            )}
          </div>
          <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-950">
            {STADE_PROJET_LABELS[projet.stade] ?? projet.stade}
          </span>
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
                    <p className="font-medium">{doc.numero ?? doc.type}</p>
                    <p className="text-xs text-neutral-500">
                      {TYPE_DOCUMENT_LABELS[doc.type] ?? doc.type}
                    </p>
                  </div>
                  <span className="text-xs text-neutral-500">{doc.statut}</span>
                </li>
              ))}
            </ul>
          )}
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
        <button
          type="button"
          className="flex items-center justify-center rounded-md border border-dashed border-neutral-700 p-3 text-sm text-neutral-400 hover:border-neutral-500 hover:text-neutral-100"
        >
          + Capturer
        </button>
      </section>
    </div>
  );
}
