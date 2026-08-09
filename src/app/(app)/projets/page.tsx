import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { STADE_PROJET_LABELS, TRACK_LABELS } from '@/lib/labels';

export const dynamic = 'force-dynamic';

export default async function ProjetsPage() {
  const projets = await prisma.projet.findMany({
    include: { organisation: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <h1 className="text-xl font-medium">Projects</h1>

      {projets.length === 0 ? (
        <p className="mt-4 text-sm text-neutral-600">Aucun projet.</p>
      ) : (
        <table className="mt-4 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-800 text-xs uppercase text-neutral-500">
              <th className="py-2 font-normal">Code</th>
              <th className="font-normal">Nom</th>
              <th className="font-normal">Client</th>
              <th className="font-normal">Track</th>
              <th className="font-normal">Stade</th>
            </tr>
          </thead>
          <tbody>
            {projets.map((p) => (
              <tr key={p.id} className="border-b border-neutral-900">
                <td className="py-2 font-mono text-xs text-neutral-500">{p.code}</td>
                <td>
                  <Link href={`/projets/${p.id}`} className="hover:underline">
                    {p.nom}
                  </Link>
                </td>
                <td className="text-neutral-400">{p.organisation?.nom ?? '—'}</td>
                <td className="text-neutral-400">{p.track ? TRACK_LABELS[p.track] : '—'}</td>
                <td className="text-neutral-400">{STADE_PROJET_LABELS[p.stade] ?? p.stade}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
