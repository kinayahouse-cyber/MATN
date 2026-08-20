// Pastilles de métadonnée colorées (référence : Clarity, Sales CRM, Esporsan) — remplace les
// petites capitales soulignées de l'ancien système. Couleur dérivée par hash pour rester stable
// par valeur (« En cours » a toujours la même couleur) sans mapping manuel à maintenir.
const TAG_COLORS = [
  'bg-violet-500/15 text-violet-300 border-violet-500/20',
  'bg-sky-500/15 text-sky-300 border-sky-500/20',
  'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  'bg-amber-500/15 text-amber-300 border-amber-500/20',
  'bg-rose-500/15 text-rose-300 border-rose-500/20',
  'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/20',
  'bg-teal-500/15 text-teal-300 border-teal-500/20',
];

function colorFor(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  return TAG_COLORS[hash % TAG_COLORS.length];
}

export function Tag({
  children,
  tone,
  className = '',
}: {
  children: string;
  /** 'accent' pour l'état le plus significatif (aplat orange) ; 'neutral' pour du texte discret. */
  tone?: 'accent' | 'neutral';
  className?: string;
}) {
  const cls =
    tone === 'accent'
      ? 'bg-accent/15 text-accent border-accent/30'
      : tone === 'neutral'
        ? 'bg-line/60 text-muted border-transparent'
        : colorFor(children);

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium leading-tight ${cls} ${className}`}
    >
      {children}
    </span>
  );
}
