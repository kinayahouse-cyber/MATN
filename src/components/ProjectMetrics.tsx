import { StatusBlock } from '@/components/properties/StatusBlock';

function formatDZD(n: number) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n) + ' DZD';
}

const CELL = 'border-b border-line-strong p-6 sm:border-b-0 sm:border-r sm:last:border-r-0';
const LABEL = 'text-[10px] uppercase tracking-[0.14em] text-muted';
const VALUE = 'mt-2 font-display text-xl tabular-nums';

// Rangée de lecture rapide (référence : bandeau de métriques bordées, OpenStatus) — remplace la
// lecture séquentielle obligatoire pour connaître statut/budget/échéance d'un projet.
export function ProjectMetrics({
  stade,
  onSaveStade,
  budgetSpent,
  budgetTotal,
  jalonsAtteints,
  jalonsTotal,
  tachesFaites,
  tachesTotal,
  echeanceLabel,
  echeanceLate,
}: {
  stade: string;
  onSaveStade: (value: string) => Promise<void>;
  budgetSpent: number;
  budgetTotal: number | null;
  jalonsAtteints: number;
  jalonsTotal: number;
  tachesFaites: number;
  tachesTotal: number;
  echeanceLabel: string;
  echeanceLate: boolean;
}) {
  const budgetPct =
    budgetTotal && budgetTotal > 0 ? Math.min(100, Math.round((budgetSpent / budgetTotal) * 100)) : null;

  return (
    <div className="grid grid-cols-1 border-b border-line-strong sm:grid-cols-5">
      <div className={`${CELL} flex items-stretch p-0`}>
        <StatusBlock value={stade} onSave={onSaveStade} />
      </div>

      <div className={CELL}>
        <p className={LABEL}>Budget</p>
        <p className={`${VALUE} whitespace-nowrap`}>{formatDZD(budgetSpent)}</p>
        {budgetTotal !== null && (
          <p className="mt-0.5 whitespace-nowrap text-xs text-muted">sur {formatDZD(budgetTotal)}</p>
        )}
        {budgetPct !== null && (
          <div className="mt-2.5 h-1 bg-line/50">
            <div
              className={`h-1 ${budgetPct >= 100 ? 'bg-accent' : 'bg-fg'}`}
              style={{ width: `${budgetPct}%` }}
            />
          </div>
        )}
      </div>

      <div className={CELL}>
        <p className={LABEL}>Jalons</p>
        <p className={VALUE}>
          {jalonsAtteints}
          <span className="text-muted">/{jalonsTotal}</span>
        </p>
      </div>

      <div className={CELL}>
        <p className={LABEL}>Tâches</p>
        <p className={VALUE}>
          {tachesFaites}
          <span className="text-muted">/{tachesTotal}</span>
        </p>
      </div>

      <div className={CELL}>
        <p className={LABEL}>Échéance</p>
        <p className={`${VALUE} ${echeanceLate ? 'text-accent' : ''}`}>{echeanceLabel}</p>
      </div>
    </div>
  );
}
