import { createFournisseur } from '../actions';
import { CATEGORIE_FOURNISSEUR_LABELS } from '@/lib/labels';

const inputClass =
  'mt-1 w-full rounded-md border border-neutral-800 bg-transparent px-3 py-2 text-sm';
const labelClass = 'text-sm text-neutral-400';

export default function NewFournisseurPage() {
  return (
    <div className="max-w-md">
      <h1 className="text-xl font-medium">Nouveau fournisseur</h1>
      <form action={createFournisseur} className="mt-6 space-y-4">
        <div>
          <label className={labelClass}>Nom</label>
          <input name="nom" required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Catégorie</label>
          <select name="categorie" defaultValue="" className={inputClass}>
            <option value="">—</option>
            {Object.entries(CATEGORIE_FOURNISSEUR_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Contact</label>
          <input name="contact" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Email</label>
          <input name="email" type="email" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Téléphone</label>
          <input name="telephone" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Notes</label>
          <textarea name="notes" rows={3} className={inputClass} />
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
