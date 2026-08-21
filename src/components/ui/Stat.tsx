// Primitives de visualisation chiffrée, d'après les références :
//  - StatTile   : tuile « label / grand nombre / légende » (dashboard Gross Sales)
//  - SegmentBar : barre de proportion à deux segments étiquetés (COFFEE 37% / 63% MILK)
//  - TickBar    : progression en barrettes verticales (« Extended », 71%)
//  - HeroStat   : tuile inversée (fond clair, "Your Sales Analysis" — la métrique qu'on veut voir
//                 en premier, distincte des StatTile qui l'entourent)
//  - BarChart   : histogramme vertical simple ("Sales Funnel")
//  - HeatGrid   : grille d'intensité ("Order · Base on social media")
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

export function HeroStat({
  label,
  value,
  caption,
}: {
  label: string;
  value: React.ReactNode;
  caption?: string;
}) {
  return (
    <div className="rounded-2xl bg-fg p-5 text-bg">
      <p className="text-[10px] uppercase tracking-[0.12em] text-bg/60">{label}</p>
      <div className="mt-2 font-display text-3xl leading-none tracking-tight tabular-nums">{value}</div>
      {caption && <p className="mt-2 text-[11px] text-bg/60">{caption}</p>}
    </div>
  );
}

export function BarChart({
  bars,
  highlightLabel,
}: {
  bars: { label: string; value: number }[];
  /** Label de la barre à mettre en avant (mois en cours, par exemple). */
  highlightLabel?: string;
}) {
  const max = Math.max(1, ...bars.map((b) => b.value));
  return (
    <div className="flex h-32 items-end gap-2" aria-hidden>
      {bars.map((b) => {
        const isHighlight = b.label === highlightLabel;
        const heightPct = Math.max(2, Math.round((b.value / max) * 100));
        return (
          <div key={b.label} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
            <div
              title={b.label}
              className={`w-full rounded-md transition-colors duration-fast ${
                isHighlight ? 'bg-accent' : 'bg-line'
              }`}
              style={{ height: `${heightPct}%` }}
            />
            <span className="text-[9px] uppercase tracking-wide text-muted">{b.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export function HeatGrid({
  rows,
  cols,
  value,
}: {
  rows: string[];
  cols: string[];
  /** Intensité 0–1 pour une cellule donnée. */
  value: (row: string, col: string) => number;
}) {
  return (
    <div className="overflow-x-auto">
      <div className="inline-grid gap-1.5" style={{ gridTemplateColumns: `auto repeat(${cols.length}, 1.5rem)` }}>
        <div />
        {cols.map((c) => (
          <div key={c} className="flex h-16 items-end justify-center pb-1">
            {/* Colonnes verticales : les libellés de stade sont trop longs pour 1.5rem à
                l'horizontale sans se chevaucher. */}
            <span
              className="whitespace-nowrap text-[9px] uppercase tracking-wide text-muted"
              style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
            >
              {c}
            </span>
          </div>
        ))}
        {rows.map((r) => (
          <div key={r} className="contents">
            <div className="flex items-center pr-2 text-[10px] text-muted">{r}</div>
            {cols.map((c) => {
              const v = Math.max(0, Math.min(1, value(r, c)));
              return (
                <div
                  key={c}
                  title={`${r} · ${c} : ${Math.round(v * 100)}%`}
                  className="h-6 w-6 rounded-[4px]"
                  style={{ backgroundColor: `rgba(16, 185, 129, ${0.08 + v * 0.72})` }}
                />
              );
            })}
          </div>
        ))}
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
