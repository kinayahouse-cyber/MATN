type Weight = 'primary' | 'secondary' | 'interaction';
type Direction = 'horizontal' | 'vertical';

const WEIGHT_CLASS: Record<Weight, string> = {
  primary: 'bg-line-strong',
  secondary: 'bg-line',
  interaction: 'bg-line/60',
};

export function StructuralLine({
  direction = 'horizontal',
  weight = 'secondary',
  className = '',
}: {
  direction?: Direction;
  weight?: Weight;
  className?: string;
}) {
  const base = direction === 'horizontal' ? 'h-px w-full' : 'w-px h-full';
  return <div className={`${base} shrink-0 ${WEIGHT_CLASS[weight]} ${className}`} />;
}
