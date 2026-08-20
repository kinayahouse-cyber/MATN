'use client';

import { useMemo } from 'react';
import { STATUT_TACHE_LABELS } from '@/lib/labels';

type Tache = {
  id: string;
  libelle: string;
  statut: string;
  dateDebut: Date | null;
  echeance: Date | null;
};

// Même convention UTC que le calendrier : les échéances sont formatées via toISOString() partout,
// travailler en UTC évite les décalages d'un jour selon le fuseau du navigateur.
const key = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (d: Date, n: number) =>
  new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + n));

const MONTHS_SHORT = ['jan', 'fév', 'mar', 'avr', 'mai', 'jui', 'jul', 'aoû', 'sep', 'oct', 'nov', 'déc'];

function statutClass(statut: string) {
  if (statut === 'FAIT') return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
  if (statut === 'EN_COURS') return 'bg-accent/20 text-accent border-accent/30';
  return 'bg-line text-muted border-line';
}

/**
 * Vue chronologique : un axe de jours, une ligne par tâche. Une tâche avec date de début affiche
 * une barre couvrant début → échéance ; sans date de début, un marqueur ponctuel à l'échéance —
 * la barre n'est jamais extrapolée.
 */
export function TacheTimeline({ taches, todayISO }: { taches: Tache[]; todayISO: string }) {
  const dated = useMemo(
    () =>
      taches
        .filter((t): t is Tache & { echeance: Date } => t.echeance !== null)
        .map((t) => {
          // Une date de début postérieure à l'échéance est ignorée plutôt que de dessiner une
          // barre à l'envers : on retombe sur un marqueur ponctuel.
          const debut =
            t.dateDebut && t.dateDebut.getTime() <= t.echeance.getTime() ? t.dateDebut : null;
          return { ...t, debut };
        })
        .sort(
          (a, b) =>
            (a.debut ?? a.echeance).getTime() - (b.debut ?? b.echeance).getTime() ||
            a.echeance.getTime() - b.echeance.getTime()
        ),
    [taches]
  );

  const sansEcheance = useMemo(() => taches.filter((t) => !t.echeance), [taches]);

  const days = useMemo(() => {
    if (dated.length === 0) return [];
    const first = dated.reduce(
      (min, t) => ((t.debut ?? t.echeance) < min ? (t.debut ?? t.echeance) : min),
      dated[0].debut ?? dated[0].echeance
    );
    const last = dated.reduce((max, t) => (t.echeance > max ? t.echeance : max), dated[0].echeance);
    // Marge de 2 jours de part et d'autre pour que les marqueurs d'extrémité ne collent pas au bord.
    const start = addDays(new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), first.getUTCDate())), -2);
    const end = addDays(new Date(Date.UTC(last.getUTCFullYear(), last.getUTCMonth(), last.getUTCDate())), 2);
    const out: Date[] = [];
    for (let d = start; d.getTime() <= end.getTime(); d = addDays(d, 1)) out.push(d);
    return out;
  }, [dated]);

  if (dated.length === 0) {
    return (
      <div>
        <p className="text-sm text-muted">Aucune tâche avec une échéance à placer sur la frise.</p>
        {sansEcheance.length > 0 && <SansEcheance taches={sansEcheance} />}
      </div>
    );
  }

  // Colonnes de jour en fractions plutôt qu'en pixels fixes : la frise s'ajuste à la largeur
  // disponible, donc la dernière tâche reste visible sans défilement horizontal. On n'étiquette
  // plus chaque jour dès que les colonnes deviennent trop étroites pour rester lisibles.
  const labelEvery = days.length <= 21 ? 1 : days.length <= 60 ? 7 : 14;
  const dayCols = `repeat(${days.length}, minmax(0, 1fr))`;
  const gridCols = `minmax(8rem, 11rem) ${dayCols}`;
  const pct = (n: number) => `${(n / days.length) * 100}%`;
  const indexOf = new Map(days.map((d, i) => [key(d), i]));

  return (
    <div>
      <div className="overflow-hidden rounded-md border border-line">
        <div>
          {/* En-tête : mois puis jours */}
          <div className="grid border-b border-line bg-surface" style={{ gridTemplateColumns: gridCols }}>
            <div className="sticky left-0 z-20 bg-surface px-3 py-2 text-[10px] uppercase tracking-wide text-muted">
              Tâche
            </div>
            {days.map((d, i) => {
              const isToday = key(d) === todayISO;
              const firstOfMonth = i === 0 || d.getUTCDate() === 1;
              const showDay = firstOfMonth || i % labelEvery === 0;
              return (
                <div
                  key={key(d)}
                  className={`overflow-visible py-2 text-center ${isToday ? 'bg-accent/10' : ''}`}
                >
                  {firstOfMonth && (
                    <p className="text-[9px] uppercase tracking-wide text-muted">
                      {MONTHS_SHORT[d.getUTCMonth()]}
                    </p>
                  )}
                  {showDay && (
                    <p
                      className={`text-[10px] tabular-nums ${
                        isToday ? 'font-medium text-accent' : 'text-muted'
                      }`}
                    >
                      {d.getUTCDate()}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Une ligne par tâche : barre début → échéance, ou marqueur ponctuel si pas de début */}
          {dated.map((t) => {
            const endIdx = indexOf.get(key(t.echeance)) ?? 0;
            const startIdx = t.debut ? (indexOf.get(key(t.debut)) ?? endIdx) : endIdx;
            const span = Math.max(1, endIdx - startIdx + 1);
            const label = t.debut
              ? `${t.libelle} — ${STATUT_TACHE_LABELS[t.statut] ?? t.statut} — ${key(t.debut)} → ${key(t.echeance)}`
              : `${t.libelle} — ${STATUT_TACHE_LABELS[t.statut] ?? t.statut} — échéance ${key(t.echeance)}`;

            return (
              <div
                key={t.id}
                className="grid border-b border-line last:border-b-0"
                style={{ gridTemplateColumns: gridCols }}
              >
                <div className="sticky left-0 z-20 truncate border-r border-line bg-surface px-3 py-2">
                  <span
                    className={`text-xs ${t.statut === 'FAIT' ? 'text-muted line-through' : 'text-fg'}`}
                    title={t.libelle}
                  >
                    {t.libelle}
                  </span>
                </div>

                <div className="relative py-2" style={{ gridColumn: '2 / -1' }}>
                  {/* Fond : surlignage de la colonne du jour courant */}
                  <div
                    className="absolute inset-0 grid"
                    aria-hidden
                    style={{ gridTemplateColumns: dayCols }}
                  >
                    {days.map((d) => (
                      <div
                        key={key(d)}
                        className={key(d) === todayISO ? 'bg-accent/10' : ''}
                      />
                    ))}
                  </div>

                  <span
                    title={label}
                    className={`relative block h-4 rounded-full border ${statutClass(t.statut)}`}
                    style={{ marginLeft: pct(startIdx), width: pct(span) }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {sansEcheance.length > 0 && <SansEcheance taches={sansEcheance} />}
    </div>
  );
}

function SansEcheance({ taches }: { taches: Tache[] }) {
  return (
    <div className="mt-4">
      <p className="text-[10px] uppercase tracking-[0.12em] text-muted">
        Sans échéance <span className="text-line-strong">({taches.length})</span>
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {taches.map((t) => (
          <span
            key={t.id}
            className="rounded-md border border-line bg-surface px-2 py-1 text-[11px] text-fg"
          >
            {t.libelle}
          </span>
        ))}
      </div>
    </div>
  );
}
