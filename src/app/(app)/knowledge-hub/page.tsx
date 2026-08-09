import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { TYPE_DOCUMENT_LABELS, STATUT_DOCUMENT_LABELS } from '@/lib/labels';

export const dynamic = 'force-dynamic';

export default async function KnowledgeHubPage() {
  const [decisions, notes, documents] = await Promise.all([
    prisma.decision.findMany({
      include: { projet: true, client: true },
      orderBy: { date: 'desc' },
      take: 20,
    }),
    prisma.note.findMany({
      include: { projet: true, client: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    prisma.document.findMany({
      include: { projet: true, client: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-medium">Knowledge Hub</h1>

      <section>
        <h2 className="text-sm font-medium uppercase tracking-wide">Décisions</h2>
        {decisions.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-600">Aucune décision.</p>
        ) : (
          <ul className="mt-3 divide-y divide-neutral-800">
            {decisions.map((d) => (
              <li key={d.id} className="py-2 text-sm">
                <p className="font-medium">{d.intitule}</p>
                <p className="text-xs text-neutral-500">
                  {d.projet ? (
                    <Link href={`/projets/${d.projet.id}`} className="hover:underline">
                      {d.projet.nom}
                    </Link>
                  ) : d.client ? (
                    <Link href={`/clients/${d.client.id}`} className="hover:underline">
                      {d.client.nom}
                    </Link>
                  ) : (
                    'Stratégique'
                  )}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-sm font-medium uppercase tracking-wide">Notes</h2>
        {notes.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-600">Aucune note.</p>
        ) : (
          <ul className="mt-3 divide-y divide-neutral-800">
            {notes.map((n) => (
              <li key={n.id} className="py-2 text-sm">
                <p className="font-medium">{n.titre ?? n.contenu.slice(0, 80)}</p>
                <p className="text-xs text-neutral-500">
                  {n.projet ? (
                    <Link href={`/projets/${n.projet.id}`} className="hover:underline">
                      {n.projet.nom}
                    </Link>
                  ) : n.client ? (
                    <Link href={`/clients/${n.client.id}`} className="hover:underline">
                      {n.client.nom}
                    </Link>
                  ) : (
                    '—'
                  )}
                  {n.tag && ` · ${n.tag}`}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-sm font-medium uppercase tracking-wide">Documents</h2>
        {documents.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-600">Aucun document.</p>
        ) : (
          <ul className="mt-3 divide-y divide-neutral-800">
            {documents.map((doc) => (
              <li key={doc.id} className="flex items-center justify-between py-2 text-sm">
                <div>
                  <p className="font-medium">{doc.numero ?? TYPE_DOCUMENT_LABELS[doc.type]}</p>
                  <p className="text-xs text-neutral-500">
                    {doc.projet ? (
                      <Link href={`/projets/${doc.projet.id}`} className="hover:underline">
                        {doc.projet.nom}
                      </Link>
                    ) : doc.client ? (
                      <Link href={`/clients/${doc.client.id}`} className="hover:underline">
                        {doc.client.nom}
                      </Link>
                    ) : (
                      '—'
                    )}
                  </p>
                </div>
                <span className="text-xs text-neutral-500">
                  {STATUT_DOCUMENT_LABELS[doc.statut] ?? doc.statut}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
