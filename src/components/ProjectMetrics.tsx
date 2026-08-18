import { StatusBlock } from '@/components/properties/StatusBlock';

const CELL = 'border-b border-line-strong p-6 sm:border-b-0 sm:border-r sm:last:border-r-0';
const LABEL = 'text-[10px] uppercase tracking-[0.14em] text-muted';
const VALUE = 'mt-2 font-display text-xl tabular-nums';

// Rangée de lecture rapide (référence : bandeau de métriques bordées, OpenStatus) — remplace la
// lecture séquentielle obligatoire pour connaître statut/avancement d'un projet. Le budget vit
// dans son propre panneau « Vue financière » à côté de l'en-tête, pas ici (évite le doublon).
export function ProjectMetrics({
  stade,
  onSaveStade,
  jalonsAtteints,
  jalonsTotal,
  tachesFaites,
  tachesTotal,
  echeanceLabel,
  echeanceLate,
}: {
  stade: string;
  onSaveStade: (value: string) => Promise<void>;
  jalonsAtteints: number;
  jalonsTotal: number;
  tachesFaites: number;
  tachesTotal: number;
  echeanceLabel: string;
  echeanceLate: boolean;
}) {
  return (
    <div className="grid grid-cols-1 border-b border-line-strong sm:grid-cols-4">
      <div className={`${CELL} flex items-stretch p-0`}>
        <StatusBlock value={stade} onSave={onSaveStade} />
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
