import { StructuralLine } from '@/components/grid/StructuralLine';

export function PageHeader({
  title,
  meta,
  actions,
}: {
  title: string;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="pb-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl tracking-tight text-fg">{title}</h1>
          {meta && <p className="mt-1 text-xs text-muted">{meta}</p>}
        </div>
        {actions}
      </div>
      <StructuralLine weight="primary" className="mt-6" />
    </div>
  );
}
