import { EditableField } from '@/components/EditableField';
import { Card } from '@/components/ui/Card';
import { StatTile, SegmentBar, TickBar } from '@/components/ui/Stat';

function formatDZD(n: number) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n) + ' DZD';
}

// Bento financier du projet : budget plafond, coûts internes (somme des Dépenses, lecture seule
// ici — édité depuis l'onglet Dépenses) et encaissé (saisie manuelle, aucun rapprochement
// facture/paiement n'est modélisé). Marge et reste à encaisser sont dérivés, pas stockés.
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
  const budget = budgetRaw === '' ? null : Number(budgetRaw);
  const encaisse = budgetEncaisseRaw === '' ? 0 : Number(budgetEncaisseRaw);
  const hasBudget = budget !== null && budget > 0;

  const ratioEncaisse = hasBudget ? encaisse / budget : 0;
  const ratioDepense = hasBudget ? budgetDepense / budget : 0;
  const marge = hasBudget ? budget - budgetDepense : null;
  const resteAEncaisser = hasBudget ? budget - encaisse : null;

  return (
    <Card padded={false} className="p-5">
      <p className="text-[10px] uppercase tracking-[0.2em] text-muted">Vue financière</p>

      {hasBudget ? (
        <>
          <div className="mt-4">
            <TickBar value={ratioEncaisse} label="du budget encaissé" tone="positive" />
          </div>

          <div className="mt-5">
            <SegmentBar leftLabel="Dépensé" rightLabel="Restant" ratio={ratioDepense} />
          </div>
        </>
      ) : (
        <p className="mt-3 text-xs text-muted">
          Renseigne un budget total pour activer le suivi.
        </p>
      )}

      <div className="mt-5 grid grid-cols-2 gap-2.5">
        <StatTile
          label="Budget total"
          value={
            <EditableField
              value={budgetRaw}
              displayValue={budgetDisplay}
              onSave={onSaveBudget}
              type="number"
            />
          }
        />
        <StatTile
          label="Dépensé"
          value={formatDZD(budgetDepense)}
          caption={hasBudget ? `${Math.round(ratioDepense * 100)}% du budget` : undefined}
        />
        <StatTile
          label="Encaissé"
          value={
            <EditableField
              value={budgetEncaisseRaw}
              displayValue={budgetEncaisseDisplay}
              onSave={onSaveBudgetEncaisse}
              type="number"
            />
          }
          caption={
            hasBudget && resteAEncaisser !== null
              ? `${formatDZD(resteAEncaisser)} à venir`
              : undefined
          }
        />
        <StatTile
          label="Marge prév."
          value={marge === null ? '—' : formatDZD(marge)}
          tone={marge !== null && marge < 0 ? 'negative' : marge !== null ? 'positive' : 'default'}
          caption="budget − dépensé"
        />
      </div>
    </Card>
  );
}
