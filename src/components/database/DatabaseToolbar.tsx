'use client';

import { useState } from 'react';
import { Popover, PopoverDivider, PopoverAction, popoverControlClass } from './Popover';
import {
  IconDisplay,
  IconFilter,
  IconSort,
  IconGroup,
  IconProperties,
  IconClose,
} from './icons';
import {
  OPERATOR_LABELS,
  OPERATORS_WITHOUT_VALUE,
  type FilterOperator,
  type PropertyDef,
  type ViewKind,
} from './types';
import type { DatabaseView } from './useDatabaseView';

const VIEW_LABELS: Record<ViewKind, string> = { list: 'List', cards: 'Card', board: 'Kanban' };

/**
 * Barre d'outils à divulgation progressive :
 *   [ VUE ]   [ Filtre ] [ Tri ] [ Groupe ] [ Propriétés ]   [ + Nouveau ]
 * Les contrôles secondaires vivent dans des popovers ; la barre reste compacte.
 */
export function DatabaseToolbar<T>({
  view,
  properties,
  views = ['list'],
  createSlot,
}: {
  view: DatabaseView<T>;
  properties: PropertyDef<T>[];
  views?: ViewKind[];
  createSlot?: React.ReactNode;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const { state, update } = view;

  const groupable = properties.filter((p) => p.groupable !== false);
  const hideable = properties.filter((p) => !p.alwaysVisible);
  const propOf = (key: string) => properties.find((p) => p.key === key);

  const shared = { openId, setOpenId };

  return (
    <div className="flex flex-wrap items-center gap-x-1 gap-y-2 py-3">
      {/* Recherche — contrôle primaire, reste visible */}
      <input
        value={state.search}
        onChange={(e) => update({ search: e.target.value })}
        placeholder="Rechercher…"
        aria-label="Rechercher"
        className="mr-2 min-w-[8rem] max-w-xs flex-1 border border-line bg-bg px-2 py-1.5 text-sm text-fg placeholder:text-muted transition-colors duration-fast focus:border-accent focus:outline-none"
      />

      {/* Sélecteur de vue — primaire, en toutes lettres */}
      {views.length > 1 && (
        <>
          <div className="flex items-center gap-3 px-1 text-sm">
            {views.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => update({ view: v })}
                className={`border-b transition-colors duration-fast ${
                  state.view === v
                    ? 'border-accent text-fg'
                    : 'border-transparent text-muted hover:text-fg'
                }`}
              >
                {VIEW_LABELS[v]}
              </button>
            ))}
          </div>
          <span aria-hidden className="mx-2 h-4 w-px bg-line" />
        </>
      )}

      {/* ---------- Secondaires : icônes + popovers ---------- */}

      {/* Display */}
      <Popover
        {...shared}
        id="display"
        label="Affichage"
        icon={<IconDisplay />}
        active={state.view !== 'list'}
      >
        <p className="text-[10px] uppercase tracking-[0.12em] text-muted">Vue</p>
        <div className="mt-1.5 space-y-0.5">
          {views.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => update({ view: v })}
              className={`block w-full px-1 py-1 text-left text-xs transition-colors duration-fast hover:bg-line/40 ${
                state.view === v ? 'text-fg' : 'text-muted'
              }`}
            >
              {state.view === v && <span className="mr-1.5 text-accent">•</span>}
              {VIEW_LABELS[v]}
            </button>
          ))}
        </div>
        <p className="mt-3 text-[10px] uppercase tracking-[0.12em] text-muted">
          Vues à venir
        </p>
        <p className="mt-1 text-[11px] leading-snug text-muted">
          Timeline et Gallery ne sont pas encore implémentées — elles apparaîtront ici.
        </p>
      </Popover>

      {/* Filter */}
      <Popover
        {...shared}
        id="filter"
        label="Filtre"
        icon={<IconFilter />}
        active={view.activeFilterCount > 0}
        indicator={view.activeFilterCount}
      >
        {state.filters.length === 0 ? (
          <p className="text-[11px] text-muted">Aucun filtre.</p>
        ) : (
          <div className="space-y-2">
            {state.filters.map((f, i) => {
              const prop = propOf(f.property);
              const needsValue = !OPERATORS_WITHOUT_VALUE.includes(f.operator);
              return (
                <div key={f.id} className="space-y-1">
                  {i > 0 && (
                    <div className="flex items-center gap-2">
                      {(['AND', 'OR'] as const).map((logic) => (
                        <button
                          key={logic}
                          type="button"
                          onClick={() => update({ filterLogic: logic })}
                          className={`text-[10px] uppercase tracking-[0.08em] transition-colors duration-fast ${
                            state.filterLogic === logic
                              ? 'text-accent'
                              : 'text-muted hover:text-fg'
                          }`}
                        >
                          {logic === 'AND' ? 'Et' : 'Ou'}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <select
                      aria-label="Propriété"
                      value={f.property}
                      onChange={(e) =>
                        update({
                          filters: state.filters.map((x) =>
                            x.id === f.id ? { ...x, property: e.target.value, value: '' } : x
                          ),
                        })
                      }
                      className={`${popoverControlClass} flex-1`}
                    >
                      {properties.map((p) => (
                        <option key={p.key} value={p.key}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      aria-label="Retirer le filtre"
                      onClick={() =>
                        update({ filters: state.filters.filter((x) => x.id !== f.id) })
                      }
                      className="px-1 text-muted hover:text-accent"
                    >
                      <IconClose />
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    <select
                      aria-label="Opérateur"
                      value={f.operator}
                      onChange={(e) =>
                        update({
                          filters: state.filters.map((x) =>
                            x.id === f.id
                              ? { ...x, operator: e.target.value as FilterOperator }
                              : x
                          ),
                        })
                      }
                      className={`${popoverControlClass} w-28 shrink-0`}
                    >
                      {(Object.keys(OPERATOR_LABELS) as FilterOperator[]).map((op) => (
                        <option key={op} value={op}>
                          {OPERATOR_LABELS[op]}
                        </option>
                      ))}
                    </select>
                    {needsValue &&
                      (prop?.options ? (
                        <select
                          aria-label="Valeur"
                          value={f.value}
                          onChange={(e) =>
                            update({
                              filters: state.filters.map((x) =>
                                x.id === f.id ? { ...x, value: e.target.value } : x
                              ),
                            })
                          }
                          className={`${popoverControlClass} flex-1`}
                        >
                          <option value="">—</option>
                          {prop.options.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          aria-label="Valeur"
                          value={f.value}
                          onChange={(e) =>
                            update({
                              filters: state.filters.map((x) =>
                                x.id === f.id ? { ...x, value: e.target.value } : x
                              ),
                            })
                          }
                          className={`${popoverControlClass} min-w-0 flex-1`}
                        />
                      ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <PopoverDivider />
        <div className="flex items-center justify-between">
          <PopoverAction
            onClick={() =>
              update({
                filters: [
                  ...state.filters,
                  {
                    id: crypto.randomUUID(),
                    property: properties[0]?.key ?? '',
                    operator: 'is',
                    value: '',
                  },
                ],
              })
            }
          >
            + Ajouter un filtre
          </PopoverAction>
          {state.filters.length > 0 && (
            <PopoverAction onClick={() => update({ filters: [] })}>Effacer</PopoverAction>
          )}
        </div>
      </Popover>

      {/* Sort */}
      <Popover
        {...shared}
        id="sort"
        label="Tri"
        icon={<IconSort />}
        active={view.activeSortCount > 0}
        indicator={view.activeSortCount}
      >
        {state.sorts.length === 0 ? (
          <p className="text-[11px] text-muted">Aucun tri.</p>
        ) : (
          <div className="space-y-1.5">
            {state.sorts.map((s, i) => (
              <div key={`${s.property}-${i}`} className="flex items-center gap-1">
                <select
                  aria-label="Trier par"
                  value={s.property}
                  onChange={(e) =>
                    update({
                      sorts: state.sorts.map((x, j) =>
                        j === i ? { ...x, property: e.target.value } : x
                      ),
                    })
                  }
                  className={`${popoverControlClass} min-w-0 flex-1`}
                >
                  {properties.map((p) => (
                    <option key={p.key} value={p.key}>
                      {p.label}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Sens du tri"
                  value={s.direction}
                  onChange={(e) =>
                    update({
                      sorts: state.sorts.map((x, j) =>
                        j === i ? { ...x, direction: e.target.value as 'asc' | 'desc' } : x
                      ),
                    })
                  }
                  className={`${popoverControlClass} w-24 shrink-0`}
                >
                  <option value="asc">Croissant</option>
                  <option value="desc">Décroissant</option>
                </select>
                <button
                  type="button"
                  aria-label="Retirer le tri"
                  onClick={() => update({ sorts: state.sorts.filter((_, j) => j !== i) })}
                  className="px-1 text-muted hover:text-accent"
                >
                  <IconClose />
                </button>
              </div>
            ))}
          </div>
        )}

        <PopoverDivider />
        <div className="flex items-center justify-between">
          <PopoverAction
            onClick={() =>
              update({
                sorts: [
                  ...state.sorts,
                  { property: properties[0]?.key ?? '', direction: 'asc' },
                ],
              })
            }
          >
            + Ajouter un tri
          </PopoverAction>
          {state.sorts.length > 0 && (
            <PopoverAction onClick={() => update({ sorts: [] })}>Effacer</PopoverAction>
          )}
        </div>
      </Popover>

      {/* Group */}
      <Popover
        {...shared}
        id="group"
        label="Groupe"
        icon={<IconGroup />}
        active={state.groupBy !== null}
      >
        <p className="text-[10px] uppercase tracking-[0.12em] text-muted">Grouper par</p>
        <select
          aria-label="Grouper par"
          value={state.groupBy ?? ''}
          onChange={(e) => update({ groupBy: e.target.value || null })}
          className={`${popoverControlClass} mt-1.5 w-full`}
        >
          <option value="">Aucun</option>
          {groupable.map((p) => (
            <option key={p.key} value={p.key}>
              {p.label}
            </option>
          ))}
        </select>

        {state.groupBy && (
          <>
            <PopoverDivider />
            <p className="text-[10px] uppercase tracking-[0.12em] text-muted">Ordre des groupes</p>
            <div className="mt-1.5 space-y-0.5">
              {(['asc', 'desc'] as const).map((dir) => (
                <button
                  key={dir}
                  type="button"
                  onClick={() => update({ groupDirection: dir })}
                  className={`block w-full px-1 py-1 text-left text-xs transition-colors duration-fast hover:bg-line/40 ${
                    state.groupDirection === dir ? 'text-fg' : 'text-muted'
                  }`}
                >
                  {state.groupDirection === dir && <span className="mr-1.5 text-accent">•</span>}
                  {dir === 'asc' ? 'Croissant' : 'Décroissant'}
                </button>
              ))}
            </div>
            <PopoverDivider />
            <PopoverAction onClick={() => update({ groupBy: null })}>
              Retirer le groupement
            </PopoverAction>
          </>
        )}
      </Popover>

      {/* Properties */}
      {hideable.length > 0 && (
        <Popover
          {...shared}
          id="properties"
          label="Propriétés"
          icon={<IconProperties />}
          active={view.hiddenCount > 0}
          indicator={view.hiddenCount > 0 ? view.hiddenCount : undefined}
        >
          <div className="space-y-0.5">
            {hideable.map((p) => {
              const visible = !state.hidden.includes(p.key);
              return (
                <label
                  key={p.key}
                  className="flex cursor-pointer items-center gap-2 px-1 py-1 text-xs transition-colors duration-fast hover:bg-line/40"
                >
                  <input
                    type="checkbox"
                    checked={visible}
                    onChange={() =>
                      update({
                        hidden: visible
                          ? [...state.hidden, p.key]
                          : state.hidden.filter((k) => k !== p.key),
                      })
                    }
                  />
                  <span className={visible ? 'text-fg' : 'text-muted'}>{p.label}</span>
                </label>
              );
            })}
          </div>
          <PopoverDivider />
          <div className="flex items-center justify-between">
            <PopoverAction onClick={() => update({ hidden: [] })}>Tout afficher</PopoverAction>
            <PopoverAction onClick={() => update({ hidden: hideable.map((p) => p.key) })}>
              Tout masquer
            </PopoverAction>
          </div>
        </Popover>
      )}

      {/* Action primaire */}
      {createSlot && <div className="ml-auto">{createSlot}</div>}
    </div>
  );
}
