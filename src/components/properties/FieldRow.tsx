// Grammaire label/valeur d'après la référence « facture » : libellé en petites capitales à
// gauche, valeur alignée à droite, ligne de base partagée. Réutilisée par les cartes et le
// panneau client pour que les deux lisent comme le même système.
export function FieldRow({
  label,
  children,
  className = '',
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-baseline justify-between gap-4 py-1.5 ${className}`}>
      <span className="shrink-0 text-[11px] uppercase tracking-[0.08em] text-muted">{label}</span>
      <span className="min-w-0 text-right text-sm">{children}</span>
    </div>
  );
}

// Pastille d'état en aplat d'accent — équivalent du « CLEARED » de la référence.
export function Chip({
  children,
  tone = 'accent',
}: {
  children: React.ReactNode;
  tone?: 'accent' | 'neutral';
}) {
  const cls =
    tone === 'accent' ? 'bg-accent text-bg' : 'border border-line text-muted';
  return (
    <span className={`inline-block px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] ${cls}`}>
      {children}
    </span>
  );
}
