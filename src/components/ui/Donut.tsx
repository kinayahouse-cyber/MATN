// Anneau de progression en SVG pur (pas de librairie de charts) — référence : les cartes à anneau
// « Total progress » du dashboard Projector. Utilisé par la carte Vue financière.
export function Donut({
  value,
  label,
  size = 92,
  stroke = 9,
  tone = 'accent',
}: {
  /** Ratio 0–1 ; les valeurs > 1 sont bornées à l'anneau plein mais le libellé garde le vrai %. */
  value: number;
  label?: string;
  size?: number;
  stroke?: number;
  tone?: 'accent' | 'positive' | 'muted';
}) {
  const clamped = Math.max(0, Math.min(1, value));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = clamped * circumference;

  const strokeClass =
    tone === 'positive'
      ? 'stroke-emerald-400'
      : tone === 'muted'
        ? 'stroke-muted'
        : 'stroke-accent';

  return (
    <div className="relative inline-flex shrink-0 items-center justify-center">
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-line"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
          className={strokeClass}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-base leading-none tracking-tight text-fg">
          {Math.round(value * 100)}%
        </span>
        {label && <span className="mt-0.5 text-[9px] uppercase tracking-wide text-muted">{label}</span>}
      </div>
    </div>
  );
}

// Barre de progression fine, même grammaire que l'anneau.
export function Meter({ value, tone = 'accent' }: { value: number; tone?: 'accent' | 'positive' }) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-line">
      <div
        className={`h-1 rounded-full ${tone === 'positive' ? 'bg-emerald-400' : 'bg-accent'}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
