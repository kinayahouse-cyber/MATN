// Descripteurs de propriété : source de vérité unique partagée par le filtre, le tri, le
// groupement et la visibilité des colonnes. Chaque dataset (projets, clients, orbit) déclare ses
// propriétés une seule fois ; la barre d'outils et la vue lisent les mêmes définitions.
export type PropertyDef<T> = {
  key: string;
  label: string;
  /** Valeur brute utilisée pour filtrer / trier / grouper. */
  getValue: (row: T) => string;
  /** Libellé affiché pour une valeur (enums traduits). Par défaut : la valeur elle-même. */
  format?: (value: string) => string;
  /** Renseigné pour les propriétés à choix fermé — alimente les valeurs de filtre. */
  options?: { value: string; label: string }[];
  /** Une propriété non masquable reste toujours visible (identité de la ligne). */
  alwaysVisible?: boolean;
  /** Exclut la propriété des menus de groupement (texte libre, identifiants…). */
  groupable?: boolean;
};

export type FilterOperator = 'is' | 'is_not' | 'contains' | 'is_empty' | 'is_not_empty';

export type FilterRule = {
  id: string;
  property: string;
  operator: FilterOperator;
  value: string;
};

export type SortRule = {
  property: string;
  direction: 'asc' | 'desc';
};

export type ViewKind = 'list' | 'cards' | 'board';

export type ViewState = {
  view: ViewKind;
  search: string;
  filters: FilterRule[];
  filterLogic: 'AND' | 'OR';
  sorts: SortRule[];
  groupBy: string | null;
  groupDirection: 'asc' | 'desc';
  hidden: string[];
};

export const OPERATOR_LABELS: Record<FilterOperator, string> = {
  is: 'est',
  is_not: 'n’est pas',
  contains: 'contient',
  is_empty: 'est vide',
  is_not_empty: 'n’est pas vide',
};

export const OPERATORS_WITHOUT_VALUE: FilterOperator[] = ['is_empty', 'is_not_empty'];

export function emptyViewState(view: ViewKind = 'list'): ViewState {
  return {
    view,
    search: '',
    filters: [],
    filterLogic: 'AND',
    sorts: [],
    groupBy: null,
    groupDirection: 'asc',
    hidden: [],
  };
}
