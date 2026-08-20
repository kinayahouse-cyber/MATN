// Pastilles de métadonnée colorées (référence : Clarity, Sales CRM, Esporsan).
// Deux modes : une couleur explicite via `tone` (quand la valeur doit être reconnaissable d'un
// coup d'œil — Track, état de prospection), sinon une couleur dérivée par hash, stable par
// valeur, pour les champs libres qu'on ne veut pas mapper à la main.

export const TAG_TONES = {
  accent: 'bg-accent/15 text-accent border-accent/30',
  neutral: 'bg-line/60 text-muted border-transparent',
  slate: 'bg-slate-500/15 text-slate-300 border-slate-500/25',
  violet: 'bg-violet-500/15 text-violet-300 border-violet-500/25',
  sky: 'bg-sky-500/15 text-sky-300 border-sky-500/25',
  emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  amber: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
  rose: 'bg-rose-500/15 text-rose-300 border-rose-500/25',
  fuchsia: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/25',
  teal: 'bg-teal-500/15 text-teal-300 border-teal-500/25',
} as const;

export type TagTone = keyof typeof TAG_TONES;

const HASHED: TagTone[] = ['violet', 'sky', 'emerald', 'amber', 'rose', 'fuchsia', 'teal'];

function hashedTone(value: string): TagTone {
  let hash = 0;
  for (let i = 0; i < value.length; i++) hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  return HASHED[hash % HASHED.length];
}

export function Tag({
  children,
  tone,
  className = '',
}: {
  children: string;
  tone?: TagTone;
  className?: string;
}) {
  const cls = TAG_TONES[tone ?? hashedTone(children)];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium leading-tight ${cls} ${className}`}
    >
      {children}
    </span>
  );
}
