'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { updateTacheField, deleteTache } from '@/app/(app)/projets/actions';
import { popoverControlClass } from '@/components/database/Popover';
import { STATUT_TACHE_LABELS } from '@/lib/labels';

type Utilisateur = { id: string; nom: string | null; email: string };
type Tache = {
  id: string;
  libelle: string;
  statut: string;
  dateDebut: Date | null;
  echeance: Date | null;
  assigneAId: string | null;
};

const statutTacheOptions = Object.entries(STATUT_TACHE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

// Même convention UTC que le calendrier : les échéances sont formatées via toISOString() partout,
// travailler en UTC évite les décalages d'un jour selon le fuseau du navigateur.
const key = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (d: Date, n: number) =>
  new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + n));
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

const MONTHS_SHORT = ['jan', 'fév', 'mar', 'avr', 'mai', 'jui', 'jul', 'aoû', 'sep', 'oct', 'nov', 'déc'];

function statutClass(statut: string) {
  if (statut === 'FAIT') return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
  if (statut === 'EN_COURS') return 'bg-accent/20 text-accent border-accent/30';
  return 'bg-line text-muted border-line';
}

type Zoom = 'day' | 'week' | 'month';

// Largeur par jour en px, propre à chaque niveau de zoom (référence : sélecteur Jour/Semaine/Mois
// de Notion). Contrairement aux colonnes fractionnaires précédentes, ce sont des largeurs fixes —
// la frise défile horizontalement plutôt que de tasser les jours pour tenir dans la colonne, ce
// qui est justement le comportement attendu d'un zoom.
const ZOOM: Record<Zoom, { label: string; dayWidth: number; showDay: (d: Date, first: boolean) => boolean }> = {
  day: { label: 'Jour', dayWidth: 36, showDay: () => true },
  week: {
    label: 'Semaine',
    dayWidth: 14,
    showDay: (d, first) => first || d.getUTCDay() === 1, // lundi = début de semaine
  },
  month: {
    label: 'Mois',
    dayWidth: 5,
    showDay: (d, first) => first || d.getUTCDate() === 1,
  },
};

type DragMode = 'move' | 'resize-start' | 'resize-end';
type DragState = {
  id: string;
  mode: DragMode;
  pointerId: number;
  startClientX: number;
  origStartIdx: number;
  origEndIdx: number;
  hadDebut: boolean;
  deltaDays: number;
  moved: boolean;
};

/**
 * Vue chronologique : un axe de jours, une barre par tâche — le nom de la tâche est porté par la
 * barre elle-même (dans la barre si elle est assez large, sinon juste après) plutôt que par une
 * colonne de titre séparée. La barre se redimensionne à la souris (bords = dateDebut/échéance,
 * corps = déplacer les deux ensemble) ; un clic sans glisser ouvre un panneau d'édition rapide.
 */
export function TacheTimeline({
  taches,
  utilisateurs,
  todayISO,
}: {
  taches: Tache[];
  utilisateurs: Utilisateur[];
  todayISO: string;
}) {
  const [zoom, setZoom] = useState<Zoom>('week');
  const [drag, setDrag] = useState<DragState | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const mutate = useCallback(
    (fn: () => Promise<void>) => startTransition(async () => { await fn(); }),
    [startTransition]
  );
  const { dayWidth, showDay } = ZOOM[zoom];

  const today = useMemo(() => {
    const [y, m, d] = todayISO.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d));
  }, [todayISO]);

  const userOptions = useMemo(
    () => utilisateurs.map((u) => ({ value: u.id, label: u.nom ?? u.email })),
    [utilisateurs]
  );

  const initialsById = useMemo(() => {
    const map = new Map<string, string>();
    for (const u of utilisateurs) {
      const src = (u.nom ?? u.email).trim();
      const parts = src.split(/\s+/).filter(Boolean);
      map.set(u.id, (parts.length >= 2 ? parts[0][0] + parts[1][0] : src.slice(0, 2)).toUpperCase());
    }
    return map;
  }, [utilisateurs]);

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
    const firstTask = dated.reduce(
      (min, t) => ((t.debut ?? t.echeance) < min ? (t.debut ?? t.echeance) : min),
      dated[0].debut ?? dated[0].echeance
    );
    const lastTask = dated.reduce((max, t) => (t.echeance > max ? t.echeance : max), dated[0].echeance);
    // La frise respire toujours au-delà d'aujourd'hui plutôt que de s'arrêter net à la dernière
    // tâche connue — au moins 2 semaines avant et un mois après "aujourd'hui", élargi si les
    // tâches débordent déjà de cette fenêtre.
    const first = firstTask < addDays(today, -14) ? firstTask : addDays(today, -14);
    const last = lastTask > addDays(today, 30) ? lastTask : addDays(today, 30);
    // Marge de 6 jours de part et d'autre : au-delà de laisser de l'air visuel, ça donne de la
    // place pour glisser une barre vers l'extérieur de la plage actuelle sans être bloqué au bord.
    const start = addDays(new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), first.getUTCDate())), -6);
    const end = addDays(new Date(Date.UTC(last.getUTCFullYear(), last.getUTCMonth(), last.getUTCDate())), 6);
    const out: Date[] = [];
    for (let d = start; d.getTime() <= end.getTime(); d = addDays(d, 1)) out.push(d);
    return out;
  }, [dated, today]);

  const indexOf = useMemo(() => new Map(days.map((d, i) => [key(d), i])), [days]);

  const rows = useMemo(
    () =>
      dated.map((t) => {
        const endIdx = indexOf.get(key(t.echeance)) ?? 0;
        const startIdx = t.debut ? (indexOf.get(key(t.debut)) ?? endIdx) : endIdx;
        return { ...t, startIdx, endIdx };
      }),
    [dated, indexOf]
  );

  const beginDrag = useCallback(
    (e: React.PointerEvent<HTMLElement>, row: (typeof rows)[number], mode: DragMode) => {
      e.stopPropagation();
      e.currentTarget.setPointerCapture(e.pointerId);
      setOpenId(null);
      setDrag({
        id: row.id,
        mode,
        pointerId: e.pointerId,
        startClientX: e.clientX,
        origStartIdx: row.startIdx,
        origEndIdx: row.endIdx,
        hadDebut: row.debut !== null,
        deltaDays: 0,
        moved: false,
      });
    },
    []
  );

  const onDragMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (!drag || e.pointerId !== drag.pointerId) return;
      const dx = e.clientX - drag.startClientX;
      const deltaDays = Math.round(dx / dayWidth);
      const moved = drag.moved || Math.abs(dx) > 3;
      if (deltaDays === drag.deltaDays && moved === drag.moved) return;
      setDrag({ ...drag, deltaDays, moved });
    },
    [drag, dayWidth]
  );

  const onDragEnd = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (!drag || e.pointerId !== drag.pointerId) return;
      if (!drag.moved) {
        if (drag.mode === 'move') setOpenId((id) => (id === drag.id ? null : drag.id));
        setDrag(null);
        return;
      }

      const span = drag.origEndIdx - drag.origStartIdx;
      let newStart = drag.origStartIdx;
      let newEnd = drag.origEndIdx;
      if (drag.mode === 'resize-start') {
        newStart = clamp(drag.origStartIdx + drag.deltaDays, 0, drag.origEndIdx);
      } else if (drag.mode === 'resize-end') {
        newEnd = clamp(drag.origEndIdx + drag.deltaDays, drag.origStartIdx, days.length - 1);
      } else {
        newStart = clamp(drag.origStartIdx + drag.deltaDays, 0, days.length - 1 - span);
        newEnd = newStart + span;
      }

      const id = drag.id;
      if (drag.mode === 'resize-start') {
        mutate(() => updateTacheField(id, 'dateDebut', key(days[newStart])));
      } else if (drag.mode === 'resize-end') {
        mutate(() => updateTacheField(id, 'echeance', key(days[newEnd])));
      } else if (drag.hadDebut) {
        mutate(() =>
          Promise.all([
            updateTacheField(id, 'dateDebut', key(days[newStart])),
            updateTacheField(id, 'echeance', key(days[newEnd])),
          ]).then(() => undefined)
        );
      } else {
        mutate(() => updateTacheField(id, 'echeance', key(days[newEnd])));
      }
      setDrag(null);
    },
    [drag, days, mutate]
  );

  const ZoomSwitch = (
    <div className="mb-3 flex items-center gap-1 text-xs">
      {(Object.keys(ZOOM) as Zoom[]).map((z) => (
        <button
          key={z}
          type="button"
          onClick={() => setZoom(z)}
          className={`rounded-md px-2 py-1 transition-colors duration-fast ${
            zoom === z ? 'bg-line/60 text-fg' : 'text-muted hover:bg-line/30 hover:text-fg'
          }`}
        >
          {ZOOM[z].label}
        </button>
      ))}
    </div>
  );

  if (dated.length === 0) {
    return (
      <div>
        {ZoomSwitch}
        <p className="text-sm text-muted">Aucune tâche avec une échéance à placer sur la frise.</p>
        {sansEcheance.length > 0 && <SansEcheance taches={sansEcheance} />}
      </div>
    );
  }

  const timelineWidth = days.length * dayWidth;
  const todayIdx = indexOf.get(todayISO);

  return (
    <div className={pending ? 'opacity-70' : ''}>
      {ZoomSwitch}

      <div className="overflow-x-auto rounded-md border border-line">
        <div className="relative" style={{ width: timelineWidth }}>
          {/* Ligne "Aujourd'hui" : traverse l'en-tête et toutes les lignes en continu — la frise
              respire toujours au-delà de cette ligne (voir le calcul de `days`) plutôt que de
              s'arrêter net à la dernière tâche connue. */}
          {todayIdx !== undefined && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 z-20"
              style={{ left: todayIdx * dayWidth + dayWidth / 2 }}
            >
              <div className="h-full w-px bg-accent" />
              {/* `top-0` plutôt qu'un décalage négatif : `overflow-x-auto` force `overflow-y` à
                  `auto` (règle CSS : un axe visible devient auto dès que l'autre l'est), donc tout
                  élément qui déborderait au-dessus du conteneur serait rogné. */}
              <span className="absolute top-0.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-accent px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-bg shadow">
                Aujourd&rsquo;hui
              </span>
            </div>
          )}

          {/* En-tête : mois puis jours */}
          <div className="flex border-b border-line bg-surface">
            {days.map((d, i) => {
              const isToday = key(d) === todayISO;
              const firstOfMonth = i === 0 || d.getUTCDate() === 1;
              return (
                <div
                  key={key(d)}
                  style={{ width: dayWidth }}
                  className={`shrink-0 overflow-visible py-2 text-center ${isToday ? 'bg-accent/10' : ''}`}
                >
                  {firstOfMonth && (
                    <p className="whitespace-nowrap text-[9px] uppercase tracking-wide text-muted">
                      {MONTHS_SHORT[d.getUTCMonth()]}
                    </p>
                  )}
                  {showDay(d, i === 0) && (
                    <p
                      className={`whitespace-nowrap text-[10px] tabular-nums ${
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

          {/* Une ligne par tâche : la barre porte le nom, se redimensionne aux deux bords, se
              déplace par le corps ; un clic sans glisser ouvre l'édition rapide. */}
          {rows.map((t) => {
            const dragging = drag?.id === t.id && drag.moved;
            let renderStart = t.startIdx;
            let renderEnd = t.endIdx;
            if (dragging) {
              const span = drag!.origEndIdx - drag!.origStartIdx;
              if (drag!.mode === 'resize-start') {
                renderStart = clamp(drag!.origStartIdx + drag!.deltaDays, 0, drag!.origEndIdx);
              } else if (drag!.mode === 'resize-end') {
                renderEnd = clamp(drag!.origEndIdx + drag!.deltaDays, drag!.origStartIdx, days.length - 1);
              } else {
                renderStart = clamp(drag!.origStartIdx + drag!.deltaDays, 0, days.length - 1 - span);
                renderEnd = renderStart + span;
              }
            }
            const span = Math.max(1, renderEnd - renderStart + 1);
            const barLeft = renderStart * dayWidth;
            const barWidth = span * dayWidth - 2;
            const fitsInside = barWidth >= 90;
            const label = t.debut
              ? `${t.libelle} — ${STATUT_TACHE_LABELS[t.statut] ?? t.statut} — ${key(t.debut)} → ${key(t.echeance)}`
              : `${t.libelle} — ${STATUT_TACHE_LABELS[t.statut] ?? t.statut} — échéance ${key(t.echeance)}`;

            const initials = t.assigneAId ? initialsById.get(t.assigneAId) : undefined;

            return (
              <div key={t.id} className="border-b border-line last:border-b-0">
                <div className="relative py-2.5" style={{ width: timelineWidth, height: '2.25rem' }}>
                  <div
                    title={label}
                    onPointerDown={(e) => beginDrag(e, t, 'move')}
                    onPointerMove={onDragMove}
                    onPointerUp={onDragEnd}
                    onPointerCancel={() => setDrag(null)}
                    className={`group absolute top-1/2 flex h-6 -translate-y-1/2 cursor-grab select-none items-center overflow-visible rounded-full border transition-colors duration-fast active:cursor-grabbing ${statutClass(
                      t.statut
                    )} ${dragging ? 'z-10 shadow-lg' : ''}`}
                    style={{ left: barLeft, width: barWidth }}
                  >
                    <span
                      onPointerDown={(e) => beginDrag(e, t, 'resize-start')}
                      className="absolute inset-y-0 left-0 z-10 w-2.5 cursor-ew-resize"
                      aria-hidden
                    />
                    {fitsInside && (
                      <span className="truncate px-3 text-[11px] font-medium">{t.libelle}</span>
                    )}
                    <span
                      onPointerDown={(e) => beginDrag(e, t, 'resize-end')}
                      className="absolute inset-y-0 right-0 z-10 w-2.5 cursor-ew-resize"
                      aria-hidden
                    />
                  </div>

                  {/* Avatar (initiales) à cheval sur le bord gauche de la barre — référence : les
                      cercles de portrait des maquettes fournies. Pas de photo dans nos données,
                      donc initiales sur fond neutre plutôt qu'un espace vide. */}
                  {initials && (
                    <div
                      aria-hidden
                      title={userOptions.find((o) => o.value === t.assigneAId)?.label}
                      className="pointer-events-none absolute top-1/2 z-20 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full border-2 border-bg bg-line-strong text-[9px] font-semibold text-fg"
                      style={{ left: barLeft - 8 }}
                    >
                      {initials}
                    </div>
                  )}

                  {!fitsInside && (
                    <span
                      aria-hidden
                      className={`pointer-events-none absolute top-1/2 -translate-y-1/2 whitespace-nowrap text-[11px] ${
                        t.statut === 'FAIT' ? 'text-muted line-through' : 'text-fg'
                      }`}
                      style={{ left: barLeft + barWidth + 8 }}
                    >
                      {t.libelle}
                    </span>
                  )}

                  {openId === t.id && (
                    <TacheQuickEdit
                      tache={t}
                      userOptions={userOptions}
                      left={Math.min(barLeft, Math.max(0, timelineWidth - 224))}
                      mutate={mutate}
                      onClose={() => setOpenId(null)}
                    />
                  )}
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

// Édition rapide en place, ancrée sous la barre — évite l'aller-retour vers la vue List pour
// changer statut/assignation depuis la frise. Se ferme au clic extérieur ou à Échap, même
// mécanisme que les popovers de la barre d'outils (voir database/Popover).
function TacheQuickEdit({
  tache,
  userOptions,
  left,
  mutate,
  onClose,
}: {
  tache: Tache;
  userOptions: { value: string; label: string }[];
  left: number;
  mutate: (fn: () => Promise<void>) => void;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const onPointerDown = (e: PointerEvent) => {
      if (panelRef.current?.contains(e.target as Node)) return;
      onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [onClose]);

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label={`Édition rapide — ${tache.libelle}`}
      className="absolute top-full z-20 mt-2 w-56 space-y-2 border border-line-strong bg-bg p-3 shadow-lg"
      style={{ left }}
    >
      <p className="truncate text-xs font-medium text-fg">{tache.libelle}</p>

      <label className="block text-[10px] uppercase tracking-[0.1em] text-muted">
        Statut
        <select
          defaultValue={tache.statut}
          onChange={(e) => mutate(() => updateTacheField(tache.id, 'statut', e.target.value))}
          className={`${popoverControlClass} mt-1 w-full`}
        >
          {statutTacheOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-[10px] uppercase tracking-[0.1em] text-muted">
        Assigné à
        <select
          defaultValue={tache.assigneAId ?? ''}
          onChange={(e) => mutate(() => updateTacheField(tache.id, 'assigneAId', e.target.value))}
          className={`${popoverControlClass} mt-1 w-full`}
        >
          <option value="">Non assigné</option>
          {userOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      <div className="flex items-center gap-3 pt-1">
        <label className="flex-1 text-[10px] uppercase tracking-[0.1em] text-muted">
          Début
          <input
            type="date"
            defaultValue={tache.dateDebut ? key(tache.dateDebut) : ''}
            onChange={(e) => mutate(() => updateTacheField(tache.id, 'dateDebut', e.target.value))}
            className={`${popoverControlClass} mt-1 w-full`}
          />
        </label>
        <label className="flex-1 text-[10px] uppercase tracking-[0.1em] text-muted">
          Échéance
          <input
            type="date"
            defaultValue={tache.echeance ? key(tache.echeance) : ''}
            onChange={(e) => mutate(() => updateTacheField(tache.id, 'echeance', e.target.value))}
            className={`${popoverControlClass} mt-1 w-full`}
          />
        </label>
      </div>

      <button
        type="button"
        onClick={() => {
          if (!window.confirm(`Supprimer « ${tache.libelle} » ?`)) return;
          mutate(() => deleteTache(tache.id));
          onClose();
        }}
        className="pt-1 text-xs text-muted transition-colors duration-fast hover:text-accent"
      >
        Supprimer
      </button>
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
