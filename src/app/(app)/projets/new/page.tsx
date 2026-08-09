import { prisma } from '@/lib/prisma';
import { createProjet } from '../actions';
import { TRACK_LABELS, ENGAGEMENT_LABELS } from '@/lib/labels';

export const dynamic = 'force-dynamic';

const inputClass =
  'mt-1 w-full rounded-md border border-neutral-800 bg-transparent px-3 py-2 text-sm';
const labelClass = 'text-sm text-neutral-400';

export default async function NewProjetPage() {
  const clients = await prisma.organisation.findMany({ orderBy: { nom: 'asc' } });

  return (
    <div className="max-w-md">
      <h1 className="text-xl font-medium">Nouveau projet</h1>
      <form action={createProjet} className="mt-6 space-y-4">
        <div>
          <label className={labelClass}>Code</label>
          <input name="code" required placeholder="KIN-26-S-001" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Nom</label>
          <input name="nom" required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Client</label>
          <select name="organisationId" defaultValue="" className={inputClass}>
            <option value="">— Aucun (projet interne) —</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Track</label>
          <select name="track" defaultValue="" className={inputClass}>
            <option value="">—</option>
            {Object.entries(TRACK_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Engagement</label>
          <select name="engagement" defaultValue="" className={inputClass}>
            <option value="">—</option>
            {Object.entries(ENGAGEMENT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Description</label>
          <textarea name="description" rows={3} className={inputClass} />
        </div>
        <button
          type="submit"
          className="rounded-md bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-950"
        >
          Créer
        </button>
      </form>
    </div>
  );
}
