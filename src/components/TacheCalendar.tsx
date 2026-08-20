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
const MONTHS_SHORT = MONTHS.map((m) => m.slice(0, 3).toLowerCase() + '.');

type Mode = 'month' | 'week';

// Tout le calcul de dates se fait en UTC, comme partout ailleurs dans l'app (les échéances sont
// formatées via toISOString().slice(0,10)) — évite les décalages d'un jour selon le fuseau.
const key = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (d: Date, n: number) =>
  new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + n));

function statutDot(statut: string) {
  if (statut === 'FAIT') return 'bg-emerald-400';
  if (statut === 'EN_COURS') return 'bg-accent';
  return 'bg-muted';
}

/**
 * Vue calendrier des tâches : grille mensuelle ou hebdomadaire (bascule Mois/Semaine, référence
 * Notion), une pastille par tâche à sa date d'échéance. `todayISO` vient du serveur pour que la
 * période initiale soit identique au rendu client.
 */
export function TacheCalendar({ taches, todayISO }: { taches: Tache[]; todayISO: string }) {
  const today = useMemo(() => {
    const [y, m, d] = todayISO.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d));
  }, [todayISO]);

  const [mode, setMode] = useState<Mode>('month');
  const [anchor, setAnchor] = useState(today);

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

  // 6 semaines pleines en mode mois : la hauteur de la grille ne saute pas d'un mois à l'autre.
  const monthCells = useMemo(() => {
    const first = new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth(), 1));
    const shift = (first.getUTCDay() + 6) % 7; // lundi = 0
    const start = addDays(first, -shift);
    return Array.from({ length: 42 }, (_, i) => {
      const d = addDays(start, i);
      return { date: d, k: key(d), inMonth: d.getUTCMonth() === anchor.getUTCMonth() };
    });
  }, [anchor]);

  const weekCells = useMemo(() => {
    const shift = (anchor.getUTCDay() + 6) % 7; // lundi = 0
    const start = addDays(anchor, -shift);
    return Array.from({ length: 7 }, (_, i) => {
      const d = addDays(start, i);
      return { date: d, k: key(d), inMonth: true };
    });
  }, [anchor]);

  const cells = mode === 'month' ? monthCells : weekCells;
  const itemCap = mode === 'month' ? 3 : 8;

  const headerLabel =
    mode === 'month'
      ? `${MONTHS[anchor.getUTCMonth()]} ${anchor.getUTCFullYear()}`
      : (() => {
          const start = weekCells[0].date;
          const end = weekCells[6].date;
          const sameMonth = start.getUTCMonth() === end.getUTCMonth();
          const startLabel = sameMonth
            ? `${start.getUTCDate()}`
            : `${start.getUTCDate()} ${MONTHS_SHORT[start.getUTCMonth()]}`;
          return `${startLabel} – ${end.getUTCDate()} ${MONTHS_SHORT[end.getUTCMonth()]} ${end.getUTCFullYear()}`;
        })();

  const shift = (delta: number) =>
    setAnchor((a) =>
      mode === 'month'
        ? new Date(Date.UTC(a.getUTCFullYear(), a.getUTCMonth() + delta, 1))
        : addDays(a, delta * 7)
    );

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={mode === 'month' ? 'Mois précédent' : 'Semaine précédente'}
            onClick={() => shift(-1)}
            className="rounded-md px-2 py-1 text-sm text-muted transition-colors duration-fast hover:bg-line/60 hover:text-fg"
          >
            ‹
          </button>
          <span className="min-w-[10rem] text-center text-sm font-medium text-fg">
            {headerLabel}
          </span>
          <button
            type="button"
            aria-label={mode === 'month' ? 'Mois suivant' : 'Semaine suivante'}
            onClick={() => shift(1)}
            className="rounded-md px-2 py-1 text-sm text-muted transition-colors duration-fast hover:bg-line/60 hover:text-fg"
          >
            ›
          </button>
          <button
            type="button"
            onClick={() => setAnchor(today)}
            className="ml-1 rounded-md px-2 py-1 text-xs text-muted transition-colors duration-fast hover:bg-line/60 hover:text-fg"
          >
            Aujourd&rsquo;hui
          </button>
        </div>

        <div className="flex items-center gap-1 text-xs">
          {(['week', 'month'] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`rounded-md px-2 py-1 transition-colors duration-fast ${
                mode === m ? 'bg-line/60 text-fg' : 'text-muted hover:bg-line/30 hover:text-fg'
              }`}
            >
              {m === 'week' ? 'Semaine' : 'Mois'}
            </button>
          ))}
        </div>
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
              className={`bg-bg p-1.5 ${mode === 'month' ? 'min-h-[5.5rem]' : 'min-h-[14rem]'} ${
                cell.inMonth ? '' : 'opacity-40'
              }`}
            >
              <span
                className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] tabular-nums ${
                  isToday ? 'bg-accent font-medium text-bg' : 'text-muted'
                }`}
              >
                {cell.date.getUTCDate()}
              </span>
              <div className="mt-1 space-y-1">
                {items.slice(0, itemCap).map((t) => (
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
                {items.length > itemCap && (
                  <p className="px-1.5 text-[10px] text-muted">+{items.length - itemCap}</p>
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
