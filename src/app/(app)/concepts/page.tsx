export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatDate } from '@/lib/format';

export default async function ConceptsPage() {
  const concepts = await prisma.concept.findMany({
    include: { projet: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif text-title text-fg">Concepts</h1>
      <p className="text-data text-fg-muted">
        Toutes les notes libres, tous projets confondus. Une note se crée depuis la fiche projet (Vue travail).
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {concepts.map((c) => (
          <Link key={c.id} href={`/projets/${c.projetId}`} className="k-frame k-frame--warm p-5">
            <p className="mb-1 text-accent">،</p>
            {c.titre && <p className="font-serif italic text-[15px] text-fg">{c.titre}</p>}
            <p className="mb-3 whitespace-pre-wrap font-serif text-body text-fg-secondary" style={{ lineHeight: 1.5 }}>
              {c.contenu}
            </p>
            <p className="text-[11px] text-fg-muted">
              {c.projet.nom} · {formatDate(c.createdAt)}
            </p>
          </Link>
        ))}
        {concepts.length === 0 && <p className="text-data text-fg-muted">Aucun concept pour l&apos;instant.</p>}
      </div>
    </div>
  );
}
