'use client';

import { useMemo, useState } from 'react';
import {
  emptyViewState,
  OPERATORS_WITHOUT_VALUE,
  type FilterRule,
  type PropertyDef,
  type SortRule,
  type ViewKind,
  type ViewState,
} from './types';

function matches<T>(row: T, rule: FilterRule, props: PropertyDef<T>[]): boolean {
  const prop = props.find((p) => p.key === rule.property);
  if (!prop) return true;
  const value = prop.getValue(row) ?? '';
  switch (rule.operator) {
    case 'is':
      return value === rule.value;
    case 'is_not':
      return value !== rule.value;
    case 'contains':
      return value.toLowerCase().includes(rule.value.toLowerCase());
    case 'is_empty':
      return value === '';
    case 'is_not_empty':
      return value !== '';
    default:
      return true;
  }
}

/**
 * État de vue unique (recherche, filtres, tris, groupement, colonnes masquées) et dérivation des
 * lignes affichées. La barre d'outils et la vue manipulent ce même état — pas de duplication.
 */
export function useDatabaseView<T>({
  rows,
  properties,
  searchKeys,
  initialView = 'list',
}: {
  rows: T[];
  properties: PropertyDef<T>[];
  /** Propriétés balayées par la recherche plein texte. */
  searchKeys: (row: T) => string[];
  initialView?: ViewKind;
}) {
  const [state, setState] = useState<ViewState>(() => emptyViewState(initialView));

  const update = (patch: Partial<ViewState>) => setState((s) => ({ ...s, ...patch }));

  const filtered = useMemo(() => {
    const q = state.search.trim().toLowerCase();
    const active = state.filters.filter(
      (f) => f.property && (f.value !== '' || OPERATORS_WITHOUT_VALUE.includes(f.operator))
    );

    let out = rows.filter((row) => {
      if (q && !searchKeys(row).some((v) => (v ?? '').toLowerCase().includes(q))) return false;
      if (active.length === 0) return true;
      return state.filterLogic === 'AND'
        ? active.every((f) => matches(row, f, properties))
        : active.some((f) => matches(row, f, properties));
    });

    if (state.sorts.length > 0) {
      out = [...out].sort((a, b) => {
        for (const rule of state.sorts) {
          const prop = properties.find((p) => p.key === rule.property);
          if (!prop) continue;
          const cmp = prop
            .getValue(a)
            .localeCompare(prop.getValue(b), 'fr', { numeric: true, sensitivity: 'base' });
          if (cmp !== 0) return rule.direction === 'asc' ? cmp : -cmp;
        }
        return 0;
      });
    }

    return out;
  }, [rows, properties, searchKeys, state]);

  const groups = useMemo(() => {
    if (!state.groupBy) return null;
    const prop = properties.find((p) => p.key === state.groupBy);
    if (!prop) return null;

    const map = new Map<string, T[]>();
    for (const row of filtered) {
      const key = prop.getValue(row) || '';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(row);
    }

    // Les options déclarées donnent l'ordre canonique ; les valeurs libres suivent en alphabétique.
    const keys = prop.options
      ? prop.options.map((o) => o.value).filter((k) => map.has(k))
      : Array.from(map.keys()).sort((a, b) => a.localeCompare(b, 'fr'));
    if (map.has('') && !keys.includes('')) keys.push('');

    const ordered = state.groupDirection === 'asc' ? keys : [...keys].reverse();
    return ordered.map((key) => ({
      key,
      label: key ? (prop.format?.(key) ?? key) : '—',
      rows: map.get(key) ?? [],
    }));
  }, [filtered, properties, state.groupBy, state.groupDirection]);

  const visibleProperties = useMemo(
    () => properties.filter((p) => p.alwaysVisible || !state.hidden.includes(p.key)),
    [properties, state.hidden]
  );

  const isVisible = (key: string) =>
    properties.find((p) => p.key === key)?.alwaysVisible || !state.hidden.includes(key);

  return {
    state,
    update,
    setState,
    filtered,
    groups,
    visibleProperties,
    isVisible,
    // Indicateurs d'état actif pour les pastilles de la barre d'outils
    activeFilterCount: state.filters.filter(
      (f) => f.property && (f.value !== '' || OPERATORS_WITHOUT_VALUE.includes(f.operator))
    ).length,
    activeSortCount: state.sorts.length,
    hiddenCount: state.hidden.length,
  };
}

export type DatabaseView<T> = ReturnType<typeof useDatabaseView<T>>;
export type { FilterRule, SortRule, PropertyDef, ViewState };
