'use client';

import { useMemo, useState } from 'react';
import { STATUT_TACHE_LABELS } from '@/lib/labels';

type Tache = {
  id: string;
  libelle: string;
  statut: string;
  echeance: Date | null;
};

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

// Tout le calcul de dates se fait en UTC, comme partout ailleurs dans l'app (les échéances sont
// formatées via toISOString().slice(0,10)) — évite les décalages d'un jour selon le fuseau.
const key = (d: Date) => d.toISOString().slice(0, 10);

function statutDot(statut: string) {
  if (statut === 'FAIT') return 'bg-emerald-400';
  if (statut === 'EN_COURS') return 'bg-accent';
  return 'bg-muted';
}

/**
 * Vue calendrier des tâches : grille mensuelle, une pastille par tâche à sa date d'échéance.
 * `todayISO` vient du serveur pour que le mois initial soit identique au rendu client.
 */
export function TacheCalendar({ taches, todayISO }: { taches: Tache[]; todayISO: string }) {
  const [year0, month0] = useMemo(() => {
    const [y, m] = todayISO.split('-').map(Number);
    return [y, m - 1];
  }, [todayISO]);

  const [cursor, setCursor] = useState({ year: year0, month: month0 });

  const byDate = useMemo(() => {
    const map = new Map<string, Tache[]>();
    for (const t of taches) {
      if (!t.echeance) continue;
      const k = key(t.echeance);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(t);
    }
    return map;
  }, [taches]);

  const sansEcheance = useMemo(() => taches.filter((t) => !t.echeance), [taches]);

  // 6 semaines pleines : la hauteur de la grille ne saute pas d'un mois à l'autre.
  const cells = useMemo(() => {
    const first = new Date(Date.UTC(cursor.year, cursor.month, 1));
    const shift = (first.getUTCDay() + 6) % 7; // lundi = 0
    const start = new Date(Date.UTC(cursor.year, cursor.month, 1 - shift));
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate() + i));
      return { date: d, k: key(d), inMonth: d.getUTCMonth() === cursor.month };
    });
  }, [cursor]);

  const shiftMonth = (delta: number) =>
    setCursor(({ year, month }) => {
      const d = new Date(Date.UTC(year, month + delta, 1));
      return { year: d.getUTCFullYear(), month: d.getUTCMonth() };
    });

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <button
          type="button"
          aria-label="Mois précédent"
          onClick={() => shiftMonth(-1)}
          className="rounded-md px-2 py-1 text-sm text-muted transition-colors duration-fast hover:bg-line/60 hover:text-fg"
        >
          ‹
        </button>
        <span className="min-w-[9rem] text-center text-sm font-medium text-fg">
          {MONTHS[cursor.month]} {cursor.year}
        </span>
        <button
          type="button"
          aria-label="Mois suivant"
          onClick={() => shiftMonth(1)}
          className="rounded-md px-2 py-1 text-sm text-muted transition-colors duration-fast hover:bg-line/60 hover:text-fg"
        >
          ›
        </button>
        <button
          type="button"
          onClick={() => setCursor({ year: year0, month: month0 })}
          className="ml-2 rounded-md px-2 py-1 text-xs text-muted transition-colors duration-fast hover:bg-line/60 hover:text-fg"
        >
          Aujourd&rsquo;hui
        </button>
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-md border border-line bg-line">
        {WEEKDAYS.map((w) => (
          <div key={w} className="bg-surface px-2 py-1.5 text-[10px] uppercase tracking-wide text-muted">
            {w}
          </div>
        ))}

        {cells.map((cell) => {
          const items = byDate.get(cell.k) ?? [];
          const isToday = cell.k === todayISO;
          return (
            <div
              key={cell.k}
              className={`min-h-[5.5rem] bg-bg p-1.5 ${cell.inMonth ? '' : 'opacity-40'}`}
            >
              <span
                className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] tabular-nums ${
                  isToday ? 'bg-accent font-medium text-bg' : 'text-muted'
                }`}
              >
                {cell.date.getUTCDate()}
              </span>
              <div className="mt-1 space-y-1">
                {items.slice(0, 3).map((t) => (
                  <div
                    key={t.id}
                    title={`${t.libelle} — ${STATUT_TACHE_LABELS[t.statut] ?? t.statut}`}
                    className="flex items-center gap-1.5 rounded-[4px] bg-surface px-1.5 py-1"
                  >
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${statutDot(t.statut)}`} />
                    <span
                      className={`truncate text-[11px] leading-tight ${
                        t.statut === 'FAIT' ? 'text-muted line-through' : 'text-fg'
                      }`}
                    >
                      {t.libelle}
                    </span>
                  </div>
                ))}
                {items.length > 3 && (
                  <p className="px-1.5 text-[10px] text-muted">+{items.length - 3}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {sansEcheance.length > 0 && (
        <div className="mt-4">
          <p className="text-[10px] uppercase tracking-[0.12em] text-muted">
            Sans échéance <span className="text-line-strong">({sansEcheance.length})</span>
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {sansEcheance.map((t) => (
              <span
                key={t.id}
                className="flex items-center gap-1.5 rounded-md border border-line bg-surface px-2 py-1 text-[11px] text-fg"
              >
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${statutDot(t.statut)}`} />
                {t.libelle}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
