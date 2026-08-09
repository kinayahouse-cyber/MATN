import { createClient } from '../actions';
import { TRACK_LABELS, TYPE_ORGANISATION_LABELS } from '@/lib/labels';

const inputClass =
  'mt-1 w-full rounded-md border border-neutral-800 bg-transparent px-3 py-2 text-sm';
const labelClass = 'text-sm text-neutral-400';

export default function NewClientPage() {
  return (
    <div className="max-w-md">
      <h1 className="text-xl font-medium">Nouveau client</h1>
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
          <input name="secteur" className={inputClass} />
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
