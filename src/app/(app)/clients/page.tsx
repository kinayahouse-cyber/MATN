import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { TRACK_LABELS, TYPE_ORGANISATION_LABELS } from '@/lib/labels';

export const dynamic = 'force-dynamic';

export default async function ClientsPage() {
  const clients = await prisma.organisation.findMany({ orderBy: { nom: 'asc' } });

  return (
    <div>
      <h1 className="text-xl font-medium">Client</h1>

      {clients.length === 0 ? (
        <p className="mt-4 text-sm text-neutral-600">Aucun client.</p>
      ) : (
        <table className="mt-4 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-800 text-xs uppercase text-neutral-500">
              <th className="py-2 font-normal">Nom</th>
              <th className="font-normal">Type</th>
              <th className="font-normal">Track</th>
              <th className="font-normal">Secteur</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id} className="border-b border-neutral-900">
                <td className="py-2">
                  <Link href={`/clients/${c.id}`} className="hover:underline">
                    {c.nom}
                  </Link>
                </td>
                <td className="text-neutral-400">{TYPE_ORGANISATION_LABELS[c.type] ?? c.type}</td>
                <td className="text-neutral-400">{c.track ? TRACK_LABELS[c.track] : '—'}</td>
                <td className="text-neutral-400">{c.secteur ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
