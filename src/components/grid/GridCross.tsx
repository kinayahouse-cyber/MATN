// Marque de repère aux intersections structurelles majeures (spec : « small geometric marks at
// meaningful structural intersections »). Purement décoratif — masqué aux lecteurs d'écran.
export function GridCross({ className = '' }: { className?: string }) {
  return (
    <span aria-hidden className={`pointer-events-none absolute z-10 ${className}`}>
      <span className="relative block h-4 w-4">
        <span className="absolute left-1/2 top-0 h-4 w-px -translate-x-1/2 bg-line-strong" />
        <span className="absolute left-0 top-1/2 h-px w-4 -translate-y-1/2 bg-line-strong" />
      </span>
    </span>
  );
}
