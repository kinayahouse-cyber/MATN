// Icônes géométriques minimales, dessinées au trait sur une grille de 16 — pas de bibliothèque
// externe, pas d'iconographie décorative (spec §08).
const base = {
  width: 14,
  height: 14,
  viewBox: '0 0 16 16',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.25,
  strokeLinecap: 'square' as const,
  'aria-hidden': true,
};

// Display → grille / disposition
export function IconDisplay() {
  return (
    <svg {...base}>
      <rect x="2" y="2" width="12" height="12" />
      <path d="M2 6.5h12M6.5 6.5V14" />
    </svg>
  );
}

// Filter → entonnoir
export function IconFilter() {
  return (
    <svg {...base}>
      <path d="M2 3h12l-4.5 5.5V13L6.5 11.5V8.5L2 3Z" />
    </svg>
  );
}

// Sort → flèches directionnelles
export function IconSort() {
  return (
    <svg {...base}>
      <path d="M4.5 2.5v11M4.5 2.5 2 5M4.5 2.5 7 5" />
      <path d="M11.5 13.5v-11M11.5 13.5 9 11M11.5 13.5 14 11" />
    </svg>
  );
}

// Group → lignes groupées
export function IconGroup() {
  return (
    <svg {...base}>
      <path d="M2 3h12M4 6.5h10M4 9.5h10M2 13h12" />
    </svg>
  );
}

// Properties → colonnes
export function IconProperties() {
  return (
    <svg {...base}>
      <rect x="2" y="2" width="12" height="12" />
      <path d="M6.5 2v12M10.5 2v12" />
    </svg>
  );
}

export function IconClose() {
  return (
    <svg {...base}>
      <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
    </svg>
  );
}
