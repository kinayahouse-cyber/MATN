import { createFournisseur } from '@/app/(app)/orbit/actions';
import { CATEGORIE_FOURNISSEUR_LABELS } from '@/lib/labels';

const inputClass = 'mt-1 w-full border border-line bg-bg px-3 py-2 text-sm text-fg focus:outline-none focus:border-accent';
const labelClass = 'text-sm text-muted';

export function FournisseurForm() {
  return (
    <div className="max-w-md">
      <h1 className="font-display text-2xl">Nouveau fournisseur</h1>
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
        <button type="submit" className="bg-fg px-4 py-2 text-sm font-medium text-bg">
          Créer
        </button>
      </form>
    </div>
  );
}
