import { EditableField } from '@/components/EditableField';
import { DeleteButton } from '@/components/DeleteButton';
import { updateFournisseurField, deleteFournisseur } from '@/app/(app)/orbit/actions';
import { CATEGORIE_FOURNISSEUR_LABELS } from '@/lib/labels';
import type { Fournisseur } from '@prisma/client';

const categorieOptions = Object.entries(CATEGORIE_FOURNISSEUR_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export function FournisseurDetail({ fournisseur }: { fournisseur: Fournisseur }) {
  return (
    <div className="max-w-md">
      <div className="flex items-start justify-between gap-2">
        <EditableField
          value={fournisseur.nom}
          onSave={updateFournisseurField.bind(null, fournisseur.id, 'nom')}
          className="flex-1 font-display text-2xl"
        />
        <DeleteButton
          action={deleteFournisseur.bind(null, fournisseur.id)}
          confirmMessage={`Supprimer ${fournisseur.nom} ?`}
          label="Supprimer"
          className="mt-1 shrink-0 text-xs text-muted hover:text-accent"
        />
      </div>

      <dl className="mt-6 space-y-3 text-sm">
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted">Catégorie</dt>
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
          <dt className="text-xs uppercase tracking-wide text-muted">Contact</dt>
          <dd className="mt-1">
            <EditableField
              value={fournisseur.contact ?? ''}
              onSave={updateFournisseurField.bind(null, fournisseur.id, 'contact')}
            />
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted">Email</dt>
          <dd className="mt-1">
            <EditableField
              value={fournisseur.email ?? ''}
              onSave={updateFournisseurField.bind(null, fournisseur.id, 'email')}
            />
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted">Téléphone</dt>
          <dd className="mt-1">
            <EditableField
              value={fournisseur.telephone ?? ''}
              onSave={updateFournisseurField.bind(null, fournisseur.id, 'telephone')}
            />
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted">Notes</dt>
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
