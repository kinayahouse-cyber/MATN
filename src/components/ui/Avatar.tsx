// Palette d'avatars dérivée par hash du nom — couleur stable pour une même personne, pas de photo
// requise. Complète les stacks d'équipe des références (taskori, Windward, Clarity).
const AVATAR_COLORS = [
  'bg-rose-500/20 text-rose-300',
  'bg-amber-500/20 text-amber-300',
  'bg-emerald-500/20 text-emerald-300',
  'bg-sky-500/20 text-sky-300',
  'bg-violet-500/20 text-violet-300',
  'bg-fuchsia-500/20 text-fuchsia-300',
];

function colorFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?';
}

const SIZE = { sm: 'h-6 w-6 text-[10px]', md: 'h-8 w-8 text-xs' } as const;

export function Avatar({
  name,
  size = 'md',
  className = '',
}: {
  name: string;
  size?: keyof typeof SIZE;
  className?: string;
}) {
  return (
    <span
      title={name}
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-medium ring-2 ring-surface ${SIZE[size]} ${colorFor(name)} ${className}`}
    >
      {initials(name)}
    </span>
  );
}

export function AvatarStack({ names, size = 'sm' }: { names: string[]; size?: keyof typeof SIZE }) {
  const shown = names.slice(0, 4);
  const rest = names.length - shown.length;
  return (
    <span className="flex items-center -space-x-2">
      {shown.map((n, i) => (
        <Avatar key={`${n}-${i}`} name={n} size={size} />
      ))}
      {rest > 0 && (
        <span
          className={`inline-flex shrink-0 items-center justify-center rounded-full bg-line font-medium text-muted ring-2 ring-surface ${SIZE[size]}`}
        >
          +{rest}
        </span>
      )}
    </span>
  );
}
