export function StatBlock({ label, value, meta }: { label: string; value: string; meta?: string }) {
  return (
    <div className="k-frame k-frame--sm p-5">
      <p className="mb-2 text-label uppercase text-fg-muted">{label}</p>
      <p className="font-serif text-title text-fg">{value}</p>
      {meta && <p className="mt-2 text-data text-fg-secondary">{meta}</p>}
    </div>
  );
}
