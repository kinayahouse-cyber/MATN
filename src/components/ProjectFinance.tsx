import { EditableField } from '@/components/EditableField';
import { FieldRow } from '@/components/properties/FieldRow';
import { Card } from '@/components/ui/Card';

function formatDZD(n: number) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n) + ' DZD';
}

// Vue financière du projet : budget plafond, coûts internes (Dépenses, lecture seule ici — édité
// depuis la section Dépenses) et encaissé (saisie manuelle, pas de rapprochement facture/paiement
// modélisé). Occupe le second bloc du bandeau d'en-tête, à côté de l'identité du projet.
export function ProjectFinance({
  budgetRaw,
  budgetDisplay,
  onSaveBudget,
  budgetDepense,
  budgetEncaisseRaw,
  budgetEncaisseDisplay,
  onSaveBudgetEncaisse,
}: {
  budgetRaw: string;
  budgetDisplay: string | undefined;
  onSaveBudget: (value: string) => Promise<void>;
  budgetDepense: number;
  budgetEncaisseRaw: string;
  budgetEncaisseDisplay: string | undefined;
  onSaveBudgetEncaisse: (value: string) => Promise<void>;
}) {
  return (
    <Card padded={false} className="flex h-full flex-col justify-center p-8">
      <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Vue financière</p>
      <div className="mt-3 divide-y divide-line">
        <FieldRow label="Budget total">
          <EditableField
            value={budgetRaw}
            displayValue={budgetDisplay}
            onSave={onSaveBudget}
            type="number"
            className="font-mono"
          />
        </FieldRow>
        <FieldRow label="Dépensé">
          <span className="font-mono">{formatDZD(budgetDepense)}</span>
        </FieldRow>
        <FieldRow label="Encaissé">
          <EditableField
            value={budgetEncaisseRaw}
            displayValue={budgetEncaisseDisplay}
            onSave={onSaveBudgetEncaisse}
            type="number"
            className="font-mono"
          />
        </FieldRow>
      </div>
    </Card>
  );
}
