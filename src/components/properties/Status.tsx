export function StatusDot({ active, muted = false }: { active?: boolean; muted?: boolean }) {
  return (
    <span
      className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${
        active ? 'bg-accent' : muted ? 'bg-line-strong' : 'bg-muted'
      }`}
    />
  );
}
