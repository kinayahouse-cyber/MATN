import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { TRACK_LABELS, TYPE_ORGANISATION_LABELS, STADE_PROJET_LABELS } from '@/lib/labels';

export default async function ClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const client = await prisma.organisation.findUnique({
    where: { id },
    include: {
      contacts: { orderBy: { nom: 'asc' } },
      projets: { orderBy: { createdAt: 'desc' } },
      decisions: { orderBy: { date: 'desc' }, take: 5 },
      notesMatn: { orderBy: { createdAt: 'desc' }, take: 5 },
    },
  });

  if (!client) notFound();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-medium">{client.nom}</h1>
        <p className="mt-1 text-sm text-neutral-400">
          {TYPE_ORGANISATION_LABELS[client.type] ?? client.type}
          {client.track && ` · ${TRACK_LABELS[client.track]}`}
          {client.secteur && ` · ${client.secteur}`}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <section>
          <h2 className="text-sm font-medium uppercase tracking-wide">Contacts</h2>
          {client.contacts.length === 0 ? (
            <p className="mt-3 text-sm text-neutral-600">Aucun contact.</p>
          ) : (
            <ul className="mt-3 divide-y divide-neutral-800">
              {client.contacts.map((contact) => (
                <li key={contact.id} className="py-2 text-sm">
                  <p className="font-medium">{contact.nom}</p>
                  <p className="text-xs text-neutral-500">
                    {contact.role ?? '—'} {contact.email && `· ${contact.email}`}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="text-sm font-medium uppercase tracking-wide">Projets</h2>
          {client.projets.length === 0 ? (
            <p className="mt-3 text-sm text-neutral-600">Aucun projet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-neutral-800">
              {client.projets.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-2 text-sm">
                  <Link href={`/projets/${p.id}`} className="hover:underline">
                    {p.nom}
                  </Link>
                  <span className="text-xs text-neutral-500">
                    {STADE_PROJET_LABELS[p.stade] ?? p.stade}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="border-t border-neutral-800 pt-6">
        <h2 className="text-sm font-medium uppercase tracking-wide">Décisions &amp; Notes récentes</h2>
        {client.decisions.length === 0 && client.notesMatn.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-600">Rien pour l&rsquo;instant.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {client.decisions.map((d) => (
              <li key={d.id} className="text-sm">
                <span className="mr-2 rounded-full bg-neutral-800 px-2 py-0.5 text-[10px] uppercase text-neutral-400">
                  Décision
                </span>
                {d.intitule}
              </li>
            ))}
            {client.notesMatn.map((n) => (
              <li key={n.id} className="text-sm">
                <span className="mr-2 rounded-full bg-neutral-800 px-2 py-0.5 text-[10px] uppercase text-neutral-400">
                  Note
                </span>
                {n.titre ?? n.contenu.slice(0, 80)}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
