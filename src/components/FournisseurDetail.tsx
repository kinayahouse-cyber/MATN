import { EditableField } from '@/components/EditableField';
import { updateFournisseurField } from '@/app/(app)/orbit/actions';
import { CATEGORIE_FOURNISSEUR_LABELS } from '@/lib/labels';
import type { Fournisseur } from '@prisma/client';

const categorieOptions = Object.entries(CATEGORIE_FOURNISSEUR_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export function FournisseurDetail({ fournisseur }: { fournisseur: Fournisseur }) {
  return (
    <div className="max-w-md">
      <EditableField
        value={fournisseur.nom}
        onSave={updateFournisseurField.bind(null, fournisseur.id, 'nom')}
        className="text-xl font-medium"
      />

      <dl className="mt-6 space-y-3 text-sm">
        <div>
          <dt className="text-xs uppercase tracking-wide text-neutral-500">Catégorie</dt>
          <dd className="mt-1">
            <EditableField
              value={fournisseur.categorie ?? ''}
              onSave={updateFournisseurField.bind(null, fournisseur.id, 'categorie')}
              type="select"
              options={categorieOptions}
            />
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-neutral-500">Contact</dt>
          <dd className="mt-1">
            <EditableField
              value={fournisseur.contact ?? ''}
              onSave={updateFournisseurField.bind(null, fournisseur.id, 'contact')}
            />
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-neutral-500">Email</dt>
          <dd className="mt-1">
            <EditableField
              value={fournisseur.email ?? ''}
              onSave={updateFournisseurField.bind(null, fournisseur.id, 'email')}
            />
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-neutral-500">Téléphone</dt>
          <dd className="mt-1">
            <EditableField
              value={fournisseur.telephone ?? ''}
              onSave={updateFournisseurField.bind(null, fournisseur.id, 'telephone')}
            />
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-neutral-500">Notes</dt>
          <dd className="mt-1">
            <EditableField
              value={fournisseur.notes ?? ''}
              onSave={updateFournisseurField.bind(null, fournisseur.id, 'notes')}
              type="textarea"
            />
          </dd>
        </div>
      </dl>
    </div>
  );
}
