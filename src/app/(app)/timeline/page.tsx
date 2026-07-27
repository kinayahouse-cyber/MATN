export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { formatDate, DIVISION_LABEL } from '@/lib/format';

const DIVISION_ORDER = ['STUDIO', 'ATELIER', 'LABEL', 'GENERALITES'] as const;

const DIVISION_VAR: Record<string, string> = {
  STUDIO: 'var(--div-studio)',
  ATELIER: 'var(--div-atelier)',
  LABEL: 'var(--div-label)',
  GENERALITES: 'var(--div-general)',
};

const STADE_PROGRESS: Record<string, number> = {
  CADRAGE: 10,
  PREPROD: 30,
  PRODUCTION: 60,
  LIVRAISON: 90,
  CLOTURE: 100,
};

export default async function TimelinePage() {
  const projets = await prisma.projet.findMany({
    where: { stade: { not: 'CLOTURE' } },
    orderBy: { dateDebut: 'asc' },
  });

  const withDates = projets.filter((p) => p.dateDebut && p.dateFinPrevue);
  const now = new Date();

  const rangeStart = withDates.length
    ? new Date(Math.min(...withDates.map((p) => p.dateDebut!.getTime())))
    : new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const rangeEnd = withDates.length
    ? new Date(Math.max(...withDates.map((p) => p.dateFinPrevue!.getTime())))
    : new Date(now.getFullYear(), now.getMonth() + 3, 1);
  const rangeMs = Math.max(rangeEnd.getTime() - rangeStart.getTime(), 1);

  const pct = (d: Date) => ((d.getTime() - rangeStart.getTime()) / rangeMs) * 100;
  const todayPct = Math.min(Math.max(pct(now), 0), 100);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-serif text-title text-fg">Timeline</h1>

      <div className="k-frame p-6">
        <div className="relative">
          <div
            className="pointer-events-none absolute top-0 z-10 h-full border-l-[1.5px] border-dashed"
            style={{ left: `${todayPct}%`, borderColor: 'var(--accent)' }}
          >
            <span
              className="absolute -top-3 -translate-x-1/2 whitespace-nowrap rounded-pill px-2 py-0.5 text-[11px]"
              style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}
            >
              {formatDate(now)}
            </span>
          </div>

          <div className="flex flex-col gap-8">
            {DIVISION_ORDER.map((division) => {
              const items = projets.filter((p) => p.division === division);
              if (items.length === 0) return null;
              return (
                <div key={division}>
                  <p className="mb-3 text-label uppercase text-fg-muted">{DIVISION_LABEL[division]}</p>
                  <div className="flex flex-col gap-3">
                    {items.map((p) => {
                      const hasDates = p.dateDebut && p.dateFinPrevue;
                      const left = hasDates ? pct(p.dateDebut!) : 0;
                      const width = hasDates ? Math.max(pct(p.dateFinPrevue!) - left, 2) : 100;
                      const progress = STADE_PROGRESS[p.stade] ?? 0;
                      return (
                        <div key={p.id} className="relative h-8">
                          <div
                            className="absolute h-8 rounded-pill"
                            style={{
                              left: `${left}%`,
                              width: `${width}%`,
                              background: `color-mix(in srgb, ${DIVISION_VAR[division]} 22%, transparent)`,
                            }}
                          >
                            <div
                              className="h-full rounded-pill"
                              style={{ width: `${progress}%`, background: DIVISION_VAR[division] }}
                            />
                            <span className="absolute inset-0 flex items-center px-3 font-serif text-[14px] text-fg">
                              {p.nom}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {projets.length === 0 && <p className="text-data text-fg-muted">Aucun projet actif.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
