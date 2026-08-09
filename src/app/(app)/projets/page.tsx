import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { STADE_PROJET_LABELS, TRACK_LABELS } from '@/lib/labels';
import { EditableField } from '@/components/EditableField';
import { updateProjetField } from './actions';

export const dynamic = 'force-dynamic';

const trackOptions = Object.entries(TRACK_LABELS).map(([value, label]) => ({ value, label }));
const stadeOptions = Object.entries(STADE_PROJET_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export default async function ProjetsPage() {
  const projets = await prisma.projet.findMany({
    include: { organisation: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-medium">Projects</h1>
        <Link
          href="/projets/new"
          className="rounded-md border border-neutral-800 px-3 py-1.5 text-sm hover:border-neutral-600"
        >
          + Nouveau
        </Link>
      </div>

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
                <td className="text-neutral-400">
                  <EditableField
                    value={p.track ?? ''}
                    onSave={updateProjetField.bind(null, p.id, 'track')}
                    type="select"
                    options={trackOptions}
                  />
                </td>
                <td className="text-neutral-400">
                  <EditableField
                    value={p.stade}
                    onSave={updateProjetField.bind(null, p.id, 'stade')}
                    type="select"
                    options={stadeOptions}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
