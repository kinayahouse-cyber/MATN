import { DIVISION_LETTER } from '@/lib/format';

const DIVISION_VAR: Record<string, string> = {
  STUDIO: 'var(--div-studio)',
  ATELIER: 'var(--div-atelier)',
  LABEL: 'var(--div-label)',
  GENERALITES: 'var(--div-general)',
};

export function DivisionBadge({ division }: { division: string }) {
  return (
    <span
      className="k-badge k-badge--division"
      style={{ background: DIVISION_VAR[division] }}
    >
      {DIVISION_LETTER[division] ?? division}
    </span>
  );
}
