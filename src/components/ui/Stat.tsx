// Primitives de visualisation chiffrée, d'après les références :
//  - StatTile   : tuile « label / grand nombre / légende » (dashboard Gross Sales)
//  - SegmentBar : barre de proportion à deux segments étiquetés (COFFEE 37% / 63% MILK)
//  - TickBar    : progression en barrettes verticales (« Extended », 71%)
// Aucune ne fabrique de donnée : elles reçoivent des valeurs déjà calculées.

export function StatTile({
  label,
  value,
  caption,
  tone = 'default',
}: {
  label: string;
  value: React.ReactNode;
  caption?: string;
  tone?: 'default' | 'accent' | 'positive' | 'negative';
}) {
  const valueTone =
    tone === 'accent'
      ? 'text-accent'
      : tone === 'positive'
        ? 'text-emerald-400'
        : tone === 'negative'
          ? 'text-rose-400'
          : 'text-fg';

  return (
    <div className="rounded-md border border-line bg-bg/40 p-3">
      <p className="text-[10px] uppercase tracking-[0.12em] text-muted">{label}</p>
      <div className={`mt-1.5 font-display text-lg leading-none tracking-tight tabular-nums ${valueTone}`}>
        {value}
      </div>
      {caption && <p className="mt-1.5 text-[10px] text-muted">{caption}</p>}
    </div>
  );
}

export function SegmentBar({
  leftLabel,
  rightLabel,
  ratio,
}: {
  leftLabel: string;
  rightLabel: string;
  /** Part du segment de gauche, 0–1. */
  ratio: number;
}) {
  const left = Math.max(0, Math.min(1, ratio));
  const leftPct = Math.round(left * 100);

  return (
    <div className="flex items-stretch gap-1" aria-hidden>
      <div
        className="flex min-w-0 items-center rounded-md bg-accent/20 px-2.5 py-2"
        style={{ flexGrow: Math.max(left, 0.001), flexBasis: 0 }}
      >
        <span className="truncate font-mono text-[11px] uppercase tracking-wide text-accent">
          {leftLabel} {leftPct}%
        </span>
      </div>
      <div
        className="flex min-w-0 items-center justify-end rounded-md bg-line px-2.5 py-2"
        style={{ flexGrow: Math.max(1 - left, 0.001), flexBasis: 0 }}
      >
        <span className="truncate font-mono text-[11px] uppercase tracking-wide text-muted">
          {100 - leftPct}% {rightLabel}
        </span>
      </div>
    </div>
  );
}

export function TickBar({
  value,
  label,
  ticks = 32,
  tone = 'accent',
}: {
  /** Ratio 0–1. */
  value: number;
  label?: string;
  ticks?: number;
  tone?: 'accent' | 'positive';
}) {
  const clamped = Math.max(0, Math.min(1, value));
  const filled = Math.round(clamped * ticks);
  const fillClass = tone === 'positive' ? 'bg-emerald-400' : 'bg-accent';

  return (
    <div>
      <div className="flex items-baseline gap-2">
        <span className="font-display text-2xl leading-none tracking-tight tabular-nums text-fg">
          {Math.round(value * 100)}%
        </span>
        {label && <span className="text-[11px] text-muted">{label}</span>}
      </div>
      <div className="mt-2.5 flex h-8 items-stretch gap-[3px]" aria-hidden>
        {Array.from({ length: ticks }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 rounded-[2px] ${i < filled ? fillClass : 'bg-line'}`}
          />
        ))}
      </div>
    </div>
  );
}
