import { requireAdmin } from '@/lib/auth/current-user';
import { getOrCreateAgenceInfo } from '@/lib/agence-info';
import { updateAgenceInfoField } from './actions';
import { EditableField } from '@/components/EditableField';
import { FieldRow } from '@/components/properties/FieldRow';
import { StructuralLine } from '@/components/grid/StructuralLine';

export const dynamic = 'force-dynamic';

// Infos de Kinaya elle-même — le "prestataire" imprimé sur chaque devis/facture (/imprimer/[docId]).
// Livré vide (voir src/lib/agence-info.ts) : rien n'est pré-rempli, l'admin saisit une fois.
export default async function ParametresPage() {
  await requireAdmin();
  const agence = await getOrCreateAgenceInfo();

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-2xl tracking-tight text-fg">Paramètres</h1>
      <p className="mt-1 text-sm text-muted">
        Informations de Kinaya, utilisées comme prestataire sur les devis et factures imprimés.
      </p>

      <StructuralLine weight="primary" className="mt-6" />

      <section className="mt-4">
        <p className="text-[11px] uppercase tracking-[0.08em] text-muted">Identité</p>
        <div className="mt-2 divide-y divide-line">
          <FieldRow label="Nom">
            <EditableField value={agence.nom} onSave={updateAgenceInfoField.bind(null, agence.id, 'nom')} />
          </FieldRow>
          <FieldRow label="Adresse">
            <EditableField
              value={agence.adresse ?? ''}
              onSave={updateAgenceInfoField.bind(null, agence.id, 'adresse')}
            />
          </FieldRow>
          <FieldRow label="Email">
            <EditableField
              value={agence.email ?? ''}
              onSave={updateAgenceInfoField.bind(null, agence.id, 'email')}
            />
          </FieldRow>
          <FieldRow label="Téléphone">
            <EditableField
              value={agence.telephone ?? ''}
              onSave={updateAgenceInfoField.bind(null, agence.id, 'telephone')}
            />
          </FieldRow>
        </div>
      </section>

      <section className="mt-6">
        <p className="text-[11px] uppercase tracking-[0.08em] text-muted">Fiscal</p>
        <div className="mt-2 divide-y divide-line">
          {(['nif', 'nis', 'rc', 'ai'] as const).map((field) => (
            <FieldRow key={field} label={field}>
              <EditableField
                value={agence[field] ?? ''}
                onSave={updateAgenceInfoField.bind(null, agence.id, field)}
                className="font-mono text-xs"
              />
            </FieldRow>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <p className="text-[11px] uppercase tracking-[0.08em] text-muted">Bancaire</p>
        <div className="mt-2 divide-y divide-line">
          <FieldRow label="Banque">
            <EditableField
              value={agence.banqueNom ?? ''}
              onSave={updateAgenceInfoField.bind(null, agence.id, 'banqueNom')}
            />
          </FieldRow>
          <FieldRow label="RIB">
            <EditableField
              value={agence.rib ?? ''}
              onSave={updateAgenceInfoField.bind(null, agence.id, 'rib')}
              className="font-mono text-xs"
            />
          </FieldRow>
        </div>
      </section>

      <section className="mt-6">
        <p className="text-[11px] uppercase tracking-[0.08em] text-muted">
          Conditions de paiement
        </p>
        <p className="mt-1 text-xs text-muted">
          Texte libre, reproduit tel quel en bas de chaque devis/facture imprimé.
        </p>
        <div className="mt-2">
          <EditableField
            value={agence.conditionsPaiement ?? ''}
            onSave={updateAgenceInfoField.bind(null, agence.id, 'conditionsPaiement')}
            type="textarea"
            placeholder="Ex. Paiement à 30 jours, 50% à la commande…"
            className="text-sm"
          />
        </div>
      </section>
    </div>
  );
}
