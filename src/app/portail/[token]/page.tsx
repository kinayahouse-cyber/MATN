import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { resolveFileUrl } from '@/lib/supabase/admin';
import { STADE_PROJET_LABELS } from '@/lib/labels';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import { BriefReadOnly } from '@/components/BriefEditor';
import type { BriefBlock } from '@/app/(app)/projets/actions';

export const dynamic = 'force-dynamic';

function formatEcheance(dateFinPrevue: Date | null) {
  if (!dateFinPrevue) return null;
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(
    dateFinPrevue
  );
}

// Portail client : lien magique (jeton opaque dans l'URL, pas de compte), lecture seule, contenu
// volontairement minimal — statut, brief, livrables. Aucune donnée interne (budget, dépenses,
// décisions/notes, autres documents) n'est jamais chargée pour cette route, pas seulement cachée
// en CSS : le `select`/`where` ci-dessous ne ramène rien d'autre.
export default async function PortailPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const projet = await prisma.projet.findUnique({
    where: { portailToken: token },
    select: {
      nom: true,
      code: true,
      stade: true,
      brief: true,
      dateFinPrevue: true,
      organisation: { select: { nom: true } },
      documents: {
        where: { type: 'LIVRABLE' },
        orderBy: { createdAt: 'desc' },
        select: { id: true, numero: true, statut: true, url: true, createdAt: true },
      },
    },
  });

  if (!projet) notFound();

  const briefBlocks: BriefBlock[] = Array.isArray(projet.brief)
    ? (projet.brief as unknown[]).filter(
        (b): b is BriefBlock =>
          typeof b === 'object' && b !== null && 'id' in b && 'type' in b && 'text' in b
      )
    : [];

  const livrableUrls = await Promise.all(projet.documents.map((d) => resolveFileUrl(d.url)));
  const echeance = formatEcheance(projet.dateFinPrevue);

  return (
    <div className="mx-auto min-h-screen max-w-2xl px-6 py-16">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent font-display text-sm text-bg">
          M
        </span>
        <span className="font-display text-base tracking-tight text-fg">MATN</span>
      </div>

      <p className="mt-10 text-xs uppercase tracking-[0.2em] text-muted">
        {projet.organisation?.nom ?? 'Kinaya'} · {projet.code}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl tracking-tight text-fg">{projet.nom}</h1>
        <Tag tone="accent">{STADE_PROJET_LABELS[projet.stade] ?? projet.stade}</Tag>
      </div>
      {echeance && <p className="mt-1 text-xs text-muted">Livraison prévue le {echeance}</p>}

      <Card padded={false} className="mt-8 p-6">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Brief</p>
        <div className="mt-3">
          <BriefReadOnly blocks={briefBlocks} />
        </div>
      </Card>

      <Card padded={false} className="mt-6 p-6">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Livrables</p>
        {projet.documents.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Aucun livrable partagé pour l&rsquo;instant.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {projet.documents.map((doc, i) => (
              <li key={doc.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate text-fg">{doc.numero || 'Livrable'}</span>
                {livrableUrls[i] ? (
                  <a
                    href={livrableUrls[i]!}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 text-xs text-accent hover:underline"
                  >
                    Ouvrir
                  </a>
                ) : (
                  <span className="shrink-0 text-xs text-muted">Lien indisponible</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <p className="mt-10 text-center text-[11px] text-muted">
        Lien privé propre à ce projet — ne pas partager en dehors de votre équipe.
      </p>
    </div>
  );
}
