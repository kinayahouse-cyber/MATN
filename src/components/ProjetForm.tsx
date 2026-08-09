import { createProjet } from '@/app/(app)/projets/actions';
import { TRACK_LABELS, ENGAGEMENT_LABELS } from '@/lib/labels';

const inputClass = 'mt-1 w-full border border-line bg-bg px-3 py-2 text-sm text-fg focus:outline-none focus:border-accent';
const labelClass = 'text-sm text-muted';

type Client = { id: string; nom: string };

export function ProjetForm({ clients }: { clients: Client[] }) {
  return (
    <div className="max-w-md">
      <h1 className="font-display text-2xl">Nouveau projet</h1>
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
        <button type="submit" className="bg-fg px-4 py-2 text-sm font-medium text-bg">
          Créer
        </button>
      </form>
    </div>
  );
}
