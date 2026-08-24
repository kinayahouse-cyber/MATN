// Position en pixels d'un index de caractère dans un <textarea>.
//
// Le DOM n'expose rien pour ça : `window.getSelection()` ne traverse pas un textarea, et
// `selectionStart` ne donne qu'un index de caractère. La technique — la même que la plupart des
// éditeurs web — consiste à cloner le textarea dans un <div> invisible qui hérite exactement de
// ses styles typographiques, à y insérer le texte jusqu'à l'index voulu, puis à mesurer l'endroit
// où s'arrête ce texte. Le clone doit copier toutes les propriétés qui influencent le retour à la
// ligne : une seule qui manque et la mesure dérive dès qu'il y a plusieurs lignes.

const PROPRIETES = [
  'boxSizing',
  'width',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
  'fontStyle',
  'fontVariant',
  'fontWeight',
  'fontStretch',
  'fontSize',
  'fontFamily',
  'lineHeight',
  'letterSpacing',
  'wordSpacing',
  'textTransform',
  'textIndent',
  'whiteSpace',
  'wordWrap',
  'wordBreak',
  'overflowWrap',
  'tabSize',
] as const;

export type PositionCaret = { gauche: number; haut: number; hauteurLigne: number };

/** Coordonnées, relatives au coin haut-gauche du textarea, du caractère à `index`. */
export function positionCaret(zone: HTMLTextAreaElement, index: number): PositionCaret {
  const style = window.getComputedStyle(zone);
  const miroir = document.createElement('div');

  for (const p of PROPRIETES) miroir.style[p] = style[p];
  miroir.style.position = 'absolute';
  miroir.style.visibility = 'hidden';
  miroir.style.top = '0';
  miroir.style.left = '-9999px';
  // Le textarea enroule le texte ; sans ça le miroir tiendrait tout sur une ligne.
  miroir.style.whiteSpace = 'pre-wrap';
  miroir.style.overflowWrap = 'break-word';
  miroir.style.height = 'auto';

  miroir.textContent = zone.value.slice(0, index);
  // Un marqueur non vide : un <span> vide n'a pas de position exploitable, et une espace insécable
  // garantit une boîte mesurable même en fin de ligne.
  const marqueur = document.createElement('span');
  marqueur.textContent = zone.value.slice(index) || ' ';
  miroir.appendChild(marqueur);

  document.body.appendChild(miroir);
  const hauteurLigne = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.2;
  const position = {
    gauche: marqueur.offsetLeft,
    haut: marqueur.offsetTop - zone.scrollTop,
    hauteurLigne,
  };
  document.body.removeChild(miroir);

  return position;
}
