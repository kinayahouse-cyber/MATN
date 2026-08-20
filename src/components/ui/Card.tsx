export function Card({
  children,
  className = '',
  padded = true,
}: {
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border border-line bg-surface shadow-card ${padded ? 'p-4' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
