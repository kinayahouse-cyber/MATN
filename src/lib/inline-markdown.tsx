import type { ReactNode } from 'react';

// Formatage en ligne minimal pour le Brief : gras/italique/lien, en syntaxe façon Markdown, rendu
// en éléments React — jamais en HTML injecté. Le brief est visible sur le portail client public
// (lien magique, sans authentification) : `dangerouslySetInnerHTML` y serait une faille XSS
// ouverte à quiconque tape dans un champ de brief. Un parseur maison, volontairement restreint à
// trois motifs, élimine le risque par construction plutôt que par assainissement a posteriori.
const MOTIF = /\*\*(.+?)\*\*|\*(.+?)\*|_(.+?)_|\[([^\]]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+)\)/g;

export function renderInline(texte: string): ReactNode[] {
  const noeuds: ReactNode[] = [];
  let curseur = 0;
  let cle = 0;
  let m: RegExpExecArray | null;

  MOTIF.lastIndex = 0;
  while ((m = MOTIF.exec(texte))) {
    if (m.index > curseur) noeuds.push(texte.slice(curseur, m.index));
    const [, gras, italique1, italique2, libelleLien, urlLien] = m;

    if (gras !== undefined) {
      noeuds.push(<strong key={cle++}>{gras}</strong>);
    } else if (italique1 !== undefined || italique2 !== undefined) {
      noeuds.push(<em key={cle++}>{italique1 ?? italique2}</em>);
    } else if (libelleLien !== undefined) {
      noeuds.push(
        <a
          key={cle++}
          href={urlLien}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-accent"
        >
          {libelleLien}
        </a>
      );
    }

    curseur = m.index + m[0].length;
  }

  if (curseur < texte.length) noeuds.push(texte.slice(curseur));
  return noeuds;
}
