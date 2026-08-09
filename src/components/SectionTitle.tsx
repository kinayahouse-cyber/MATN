type Size = 'xl' | 'lg' | 'md' | 'sm';

// Titres soulignés à plusieurs échelles — le contraste display/métadonnée porte la hiérarchie
// (spec : « typography can become a structural component »).
const SIZE_CLASS: Record<Size, string> = {
  xl: 'font-display text-4xl md:text-5xl tracking-tight',
  lg: 'font-display text-2xl md:text-3xl tracking-tight',
  md: 'font-display text-xl tracking-tight',
  sm: 'text-sm',
};

export function SectionTitle({
  children,
  size = 'lg',
  uppercase = true,
  className = '',
}: {
  children: React.ReactNode;
  size?: Size;
  uppercase?: boolean;
  className?: string;
}) {
  return (
    <h2 className={`${SIZE_CLASS[size]} ${uppercase ? 'uppercase' : ''} ${className}`}>
      <span className="border-b-2 border-fg pb-1">{children}</span>
    </h2>
  );
}

// Sur-titre discret placé au-dessus d'un titre display (« Overview », « Scopes »).
export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm text-muted">
      <span className="border-b border-fg pb-0.5">{children}</span>
    </p>
  );
}
