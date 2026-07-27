export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { prisma } from '@/lib/prisma';

const DIVISION_VAR: Record<string, string> = {
  STUDIO: 'var(--div-studio)',
  ATELIER: 'var(--div-atelier)',
  LABEL: 'var(--div-label)',
  GENERALITES: 'var(--div-general)',
};

const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

function startOfMonthGrid(year: number, monthIndex: number) {
  const first = new Date(year, monthIndex, 1);
  const weekday = (first.getDay() + 6) % 7; // lundi = 0
  const gridStart = new Date(year, monthIndex, 1 - weekday);
  return gridStart;
}

export default async function CalendrierPage({
  searchParams,
}: {
  searchParams: Promise<{ mois?: string }>;
}) {
  const { mois } = await searchParams;
  const now = new Date();
  const [yy, mm] = (mois ?? `${now.getFullYear()}-${now.getMonth() + 1}`).split('-').map(Number);
  const year = yy || now.getFullYear();
  const monthIndex = (mm || now.getMonth() + 1) - 1;

  const monthStart = new Date(year, monthIndex, 1);
  const monthLabel = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(monthStart);

  const gridStart = startOfMonthGrid(year, monthIndex);
  const days: Date[] = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });
  const rangeEnd = days[days.length - 1];

  const taches = await prisma.tache.findMany({
    where: { echeance: { gte: days[0], lte: rangeEnd } },
    include: { projet: true, production: true },
  });

  const prevMonth = new Date(year, monthIndex - 1, 1);
  const nextMonth = new Date(year, monthIndex + 1, 1);
  const toParam = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}`;

  const isSameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-title capitalize text-fg">{monthLabel}</h1>
        <div className="flex gap-2">
          <Link href={`/calendrier?mois=${toParam(prevMonth)}`} className="k-btn k-btn--secondary">
            ← Précédent
          </Link>
          <Link href={`/calendrier?mois=${toParam(nextMonth)}`} className="k-btn k-btn--secondary">
            Suivant →
          </Link>
        </div>
      </div>

      <div className="k-frame overflow-hidden">
        <div className="grid grid-cols-7 border-b border-hairline-strong">
          {JOURS.map((j) => (
            <div key={j} className="k-th px-3 py-2 text-center">
              {j}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day, i) => {
            const inMonth = day.getMonth() === monthIndex;
            const isToday = isSameDay(day, now);
            const events = taches.filter((t) => t.echeance && isSameDay(t.echeance, day));
            return (
              <div
                key={i}
                className="min-h-[96px] border-b border-r border-hairline p-2"
                style={{ background: isToday ? 'var(--accent-muted)' : 'transparent' }}
              >
                <p className="tabular-nums text-data" style={{ color: inMonth ? 'var(--fg-secondary)' : 'var(--fg-muted)' }}>
                  {day.getDate()}
                </p>
                <div className="mt-1 flex flex-col gap-1">
                  {events.map((e) => {
                    const division = e.projet?.division ?? 'GENERALITES';
                    return (
                      <div
                        key={e.id}
                        className="truncate rounded-sm border px-1.5 py-0.5 text-[11px]"
                        style={{ borderColor: DIVISION_VAR[division], color: 'var(--fg-primary)' }}
                      >
                        {e.libelle}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
