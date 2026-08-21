import { createClient } from '../actions';
import { TRACK_LABELS, TYPE_ORGANISATION_LABELS, SECTEUR_LABELS } from '@/lib/labels';
import { requireAdmin } from '@/lib/auth/current-user';

const inputClass = 'mt-1 w-full border border-line bg-bg px-3 py-2 text-sm text-fg focus:outline-none focus:border-accent';
const labelClass = 'text-sm text-muted';

export default async function NewClientPage() {
  await requireAdmin();

  return (
    <div className="max-w-md">
      <h1 className="font-display text-2xl">Nouveau client</h1>
      <form action={createClient} className="mt-6 space-y-4">
        <div>
          <label className={labelClass}>Nom</label>
          <input name="nom" required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Type</label>
          <select name="type" defaultValue="CLIENT_DIRECT" className={inputClass}>
            {Object.entries(TYPE_ORGANISATION_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
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
          <label className={labelClass}>Secteur</label>
          <select name="secteur" defaultValue="" className={inputClass}>
            <option value="">—</option>
            {Object.entries(SECTEUR_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="bg-fg px-4 py-2 text-sm font-medium text-bg">
          Créer
        </button>
      </form>
    </div>
  );
}
