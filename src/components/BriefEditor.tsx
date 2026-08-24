'use client';

import { memo, useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { saveBrief, type BriefBlock, type BriefBlockType } from '@/app/(app)/projets/actions';
import { renderInline } from '@/lib/inline-markdown';
import { positionCaret } from '@/lib/caret-textarea';

type Formatage = 'gras' | 'italique' | 'lien';

// P1/P2/P3 = trois tailles de corps de texte, du plus large au plus dense. h1-h3/p1-p3 restent le
// modèle de données (compatible avec les briefs déjà enregistrés) ; seuls h1/h2/h3/p2 sont
// atteignables depuis l'éditeur — p1/p3 ne servent plus qu'au rendu de blocs existants.
const BLOCK_CLASS: Record<BriefBlockType, string> = {
  h1: 'font-display text-2xl leading-tight tracking-tight text-fg',
  h2: 'font-display text-xl leading-tight tracking-tight text-fg',
  h3: 'font-display text-base leading-snug tracking-tight text-fg',
  p1: 'text-[15px] leading-relaxed text-fg',
  p2: 'text-sm leading-relaxed text-fg',
  p3: 'text-xs leading-relaxed text-muted',
  li: 'text-sm leading-relaxed text-fg',
};

const PLACEHOLDER: Record<BriefBlockType, string> = {
  h1: 'Titre',
  h2: 'Sous-titre',
  h3: 'Intertitre',
  p1: 'Écrivez, ou tapez « / » pour les commandes',
  p2: 'Écrivez, ou tapez « / » pour les commandes',
  p3: 'Écrivez, ou tapez « / » pour les commandes',
  li: 'Élément de liste',
};

const newBlock = (type: BriefBlockType = 'p2'): BriefBlock => ({
  id: crypto.randomUUID(),
  type,
  text: '',
});

// Rendu statique du brief — Collaborateur et portail client le lisent sans pouvoir l'éditer.
// Composant serveur possible (aucune interactivité), volontairement séparé de BriefEditor plutôt
// que masqué en CSS : évite d'envoyer tout le JS de l'éditeur (refs, actions serveur) à un
// lecteur qui n'en a pas l'usage.
export function BriefReadOnly({ blocks }: { blocks: BriefBlock[] }) {
  if (blocks.length === 0) return <p className="text-sm text-muted">Aucun brief.</p>;

  // Les puces consécutives sont regroupées en une seule <ul> : une suite de <ul> à un élément
  // serait valide mais casserait l'espacement de la liste et sa sémantique pour un lecteur d'écran.
  const groupes: (BriefBlock | BriefBlock[])[] = [];
  for (const b of blocks) {
    const dernier = groupes[groupes.length - 1];
    if (b.type === 'li' && Array.isArray(dernier)) dernier.push(b);
    else groupes.push(b.type === 'li' ? [b] : b);
  }

  return (
    <div className="space-y-2">
      {groupes.map((g, i) =>
        Array.isArray(g) ? (
          <ul key={g[0].id} className="list-disc space-y-1 pl-5">
            {g.map((b) => (
              <li key={b.id} className={BLOCK_CLASS.li}>
                {renderInline(b.text)}
              </li>
            ))}
          </ul>
        ) : (
          <p key={g.id ?? i} className={BLOCK_CLASS[g.type]}>
            {renderInline(g.text)}
          </p>
        )
      )}
    </div>
  );
}

type Commande = { type: BriefBlockType; label: string; description: string; apercu: string };

// Le menu « / » façon Notion : taper « / » ouvre ce menu, la suite filtre la liste, Entrée
// applique. Volontairement restreint à h1-h3 et un seul type de texte — Notion n'a pas non plus
// plusieurs tailles de paragraphe, et c'est justement ce qu'on cherche à reproduire.
const COMMANDES: Commande[] = [
  { type: 'h1', label: 'Titre 1', description: 'Grand titre de section', apercu: 'H1' },
  { type: 'h2', label: 'Titre 2', description: 'Titre de sous-section', apercu: 'H2' },
  { type: 'h3', label: 'Titre 3', description: 'Petit intertitre', apercu: 'H3' },
  { type: 'p2', label: 'Texte', description: 'Paragraphe simple', apercu: '¶' },
  { type: 'li', label: 'Liste à puces', description: 'Énumération', apercu: '•' },
];

// Référence stable pour les blocs sans menu ouvert : un `[]` littéral recréé à chaque rendu casse
// le memo() de BriefBlockRow pour TOUS les blocs à chaque frappe dans N'IMPORTE LEQUEL d'entre eux
// (nouvelle référence de prop à chaque fois), ce qui re-rend tout le brief à chaque caractère tapé
// au lieu du seul bloc concerné.
const AUCUNE_COMMANDE: Commande[] = [];

type RowProps = {
  block: BriefBlock;
  refSetter: (el: HTMLTextAreaElement | null) => void;
  onText: (id: string, text: string) => void;
  onEnter: (id: string) => void;
  onBackspaceEmpty: (id: string) => void;
  onBlur: () => void;
  onFormat: (id: string, formatage: Formatage) => void;
  menuOuvert: boolean;
  commandesFiltrees: Commande[];
  indexSelection: number;
  setIndexSelection: (maj: (i: number) => number) => void;
  onChoisirCommande: (id: string, type: BriefBlockType) => void;
  onFermerMenu: (id: string) => void;
  onSelection: (id: string) => void;
  bulle: { gauche: number; haut: number } | null;
};

const BOUTONS_FORMATAGE: { formatage: Formatage; label: string; classe: string; titre: string }[] = [
  { formatage: 'gras', label: 'G', classe: 'font-bold', titre: 'Gras (Ctrl+B)' },
  { formatage: 'italique', label: 'I', classe: 'italic', titre: 'Italique (Ctrl+I)' },
  { formatage: 'lien', label: 'L', classe: 'underline', titre: 'Lien (Ctrl+K)' },
];

// Une ligne par bloc, mémoïsée : taper dans un bloc ne doit re-rendre que ce bloc, pas les autres
// — sinon chaque frappe recalcule tout le brief, ce qui se sent dès qu'il y a plusieurs blocs.
// Toutes les props sont des callbacks stables (useCallback côté parent) pour que la mémoïsation
// tienne réellement.
const BriefBlockRow = memo(function BriefBlockRow({
  block,
  refSetter,
  onText,
  onEnter,
  onBackspaceEmpty,
  onBlur,
  onFormat,
  menuOuvert,
  commandesFiltrees,
  indexSelection,
  setIndexSelection,
  onChoisirCommande,
  onFermerMenu,
  onSelection,
  bulle,
}: RowProps) {
  const estPuce = block.type === 'li';

  return (
    <div className="group relative">
      {/* Barre flottante : n'apparaît que sur une sélection réelle, ancrée au-dessus du texte
          sélectionné plutôt que dans un coin fixe — sinon elle est perdue de vue dès que le bloc
          fait plusieurs lignes. */}
      {bulle && (
        <div
          style={{ left: bulle.gauche, top: bulle.haut }}
          className="absolute z-30 flex -translate-x-1/2 -translate-y-full gap-0.5 rounded-md border border-line bg-surface p-0.5 shadow-card"
        >
          {BOUTONS_FORMATAGE.map((b) => (
            <button
              key={b.formatage}
              type="button"
              title={b.titre}
              // mousedown + preventDefault : sans ça le textarea perd le focus ET sa sélection
              // avant que le clic n'arrive, et le formatage n'aurait plus rien à envelopper.
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onFormat(block.id, b.formatage)}
              className={`h-6 w-6 rounded text-[11px] leading-none text-muted transition-colors duration-fast hover:bg-line/60 hover:text-fg ${b.classe}`}
            >
              {b.label}
            </button>
          ))}
        </div>
      )}

      {estPuce && (
        <span
          aria-hidden
          className="pointer-events-none absolute left-2 top-1 select-none text-sm leading-relaxed text-muted"
        >
          •
        </span>
      )}

      {/* Auto-grow en CSS pur (globals.css) : pas de scrollHeight lu en JS à chaque frappe. Plus
          aucun chrome visible autour du bloc — tout passe par « / » et les raccourcis clavier,
          comme Notion. */}
      <div
        className={`grow-wrap w-full ${BLOCK_CLASS[block.type]} ${estPuce ? 'pl-5' : ''}`}
        data-replicated-value={block.text}
      >
        <textarea
          ref={refSetter}
          value={block.text}
          rows={1}
          placeholder={PLACEHOLDER[block.type]}
          onChange={(e) => onText(block.id, e.target.value)}
          onSelect={() => onSelection(block.id)}
          onBlur={onBlur}
          onKeyDown={(e) => {
            // Le menu ne capture les touches que s'il a réellement des résultats à proposer —
            // sinon « /nimportequoi » suivi d'Entrée resterait bloqué sans créer de bloc.
            if (menuOuvert) {
              const total = commandesFiltrees.length;
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setIndexSelection((i) => (i + 1) % total);
                return;
              }
              if (e.key === 'ArrowUp') {
                e.preventDefault();
                setIndexSelection((i) => (i - 1 + total) % total);
                return;
              }
              if (e.key === 'Enter') {
                e.preventDefault();
                const commande = commandesFiltrees[indexSelection] ?? commandesFiltrees[0];
                if (commande) onChoisirCommande(block.id, commande.type);
                return;
              }
              if (e.key === 'Escape') {
                e.preventDefault();
                onFermerMenu(block.id);
                return;
              }
            }

            const raccourci = e.metaKey || e.ctrlKey;
            if (raccourci && e.key.toLowerCase() === 'b') {
              e.preventDefault();
              onFormat(block.id, 'gras');
              return;
            }
            if (raccourci && e.key.toLowerCase() === 'i') {
              e.preventDefault();
              onFormat(block.id, 'italique');
              return;
            }
            if (raccourci && e.key.toLowerCase() === 'k') {
              e.preventDefault();
              onFormat(block.id, 'lien');
              return;
            }
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onEnter(block.id);
            }
            if (e.key === 'Backspace' && block.text === '') {
              e.preventDefault();
              onBackspaceEmpty(block.id);
            }
          }}
          className="w-full resize-none overflow-hidden rounded-md border border-transparent bg-transparent px-2 py-1 placeholder:text-muted/50 focus:border-line focus:outline-none"
        />
      </div>

      {menuOuvert && (
        <div className="absolute left-2 top-full z-20 mt-1 w-64 overflow-hidden rounded-lg border border-line bg-surface shadow-card">
          {commandesFiltrees.map((c, i) => (
            <button
              key={c.type}
              type="button"
              // mousedown plutôt que click : sans preventDefault, le textarea perd le focus avant
              // que le clic n'atteigne ce bouton, et onBlur ferme le menu avant la sélection.
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onChoisirCommande(block.id, c.type)}
              onMouseEnter={() => setIndexSelection(() => i)}
              className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs transition-colors duration-fast ${
                i === indexSelection ? 'bg-line/60 text-fg' : 'text-muted hover:bg-line/30'
              }`}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-line bg-bg font-display text-[10px] text-fg">
                {c.apercu}
              </span>
              <span>
                <span className="block text-fg">{c.label}</span>
                <span className="block text-[10px] text-muted">{c.description}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

/**
 * Espace de rédaction du brief, en blocs typés (H1–H3, Texte). Pas de sélecteur visible : le type
 * d'un bloc se choisit via « / » (menu de commandes, façon Notion) ou les raccourcis markdown
 * « # », « ## », « ### » + espace. Entrée crée le bloc suivant, Retour arrière sur un bloc vide le
 * supprime. L'enregistrement part au blur (ou immédiatement après un changement de type).
 */
export function BriefEditor({
  projetId,
  initialBlocks,
}: {
  projetId: string;
  initialBlocks: BriefBlock[];
}) {
  // Id fixe pour le bloc initial : `crypto.randomUUID()` produirait une valeur différente au
  // rendu serveur et au rendu client. Les blocs créés après montage sont côté client uniquement.
  const [blocks, setBlocks] = useState<BriefBlock[]>(
    initialBlocks.length > 0 ? initialBlocks : [{ id: 'brief-0', type: 'h2', text: '' }]
  );
  const [pending, startTransition] = useTransition();
  const [menuId, setMenuId] = useState<string | null>(null);
  const [indexSelection, setIndexSelection] = useState(0);
  // Position de la barre flottante, en coordonnées relatives à la ligne du bloc concerné.
  const [bulle, setBulle] = useState<{ id: string; gauche: number; haut: number } | null>(null);
  const focusId = useRef<{ id: string; debut?: number; fin?: number } | null>(null);
  const refs = useRef(new Map<string, HTMLTextAreaElement>());
  // Bloc dont le menu « / » a été fermé à la main : sans ça, Échap serait sans effet, la frappe
  // suivante rouvrant aussitôt le menu puisque le texte commence toujours par « / ».
  const menuAnnule = useRef<string | null>(null);
  // Miroir synchrone de `blocks`, lu par les gestionnaires d'événements pour calculer l'état
  // suivant sans dépendre de `blocks` — ça casserait la mémoïsation des lignes à chaque frappe.
  const blocksRef = useRef(blocks);
  blocksRef.current = blocks;

  // Après ajout/suppression/formatage/choix de commande, on rend le focus au bloc visé — sinon la
  // frappe est interrompue. Le formatage restaure en plus la sélection (texte enveloppé), pour
  // qu'on puisse continuer à taper par-dessus sans avoir à re-cliquer.
  useEffect(() => {
    const cible = focusId.current;
    if (!cible) return;
    const el = refs.current.get(cible.id);
    if (el) {
      el.focus();
      if (cible.debut !== undefined && cible.fin !== undefined) el.setSelectionRange(cible.debut, cible.fin);
    }
    focusId.current = null;
  });

  const persist = useCallback(
    (next: BriefBlock[]) => {
      startTransition(async () => {
        await saveBrief(
          projetId,
          next.filter((b) => b.text.trim() !== '')
        );
      });
    },
    [projetId]
  );

  /**
   * Point de passage unique pour toute modification des blocs.
   *
   * `persist` ne doit JAMAIS être appelé depuis l'intérieur d'un `setBlocks(bs => …)` : React
   * exécute ces fonctions pendant la phase de rendu, où déclencher une transition et la navigation
   * du routeur (revalidatePath) est interdit — React émet « Cannot call startTransition while
   * rendering » / « Cannot update a component while rendering a different component », et l'état
   * du composant se corrompt : c'est ce qui empêchait les changements de type de bloc (menu « / »
   * et raccourcis « # ») de s'appliquer. On calcule donc l'état suivant à partir du miroir
   * synchrone, puis on met à jour et on persiste depuis le gestionnaire d'événement lui-même.
   */
  const appliquer = useCallback(
    (next: BriefBlock[], persister = false) => {
      blocksRef.current = next;
      setBlocks(next);
      if (persister) persist(next);
    },
    [persist]
  );

  const handleBlur = useCallback(() => {
    persist(blocksRef.current);
    setMenuId(null);
    setBulle(null);
  }, [persist]);

  /**
   * Affiche la barre flottante dès qu'une portion de texte est sélectionnée, ancrée au milieu de
   * la sélection. `onSelect` couvre la souris comme le clavier (Maj+flèches), là où un `mouseup`
   * seul raterait la sélection au clavier.
   */
  const handleSelection = useCallback((id: string) => {
    const el = refs.current.get(id);
    if (!el) return;
    const { selectionStart, selectionEnd } = el;
    if (selectionStart === selectionEnd) {
      setBulle((b) => (b ? null : b));
      return;
    }
    const p = positionCaret(el, Math.floor((selectionStart + selectionEnd) / 2));
    // offsetLeft/Top ramènent la mesure — faite dans le repère du textarea — dans celui de la
    // ligne du bloc, seul élément positionné du sous-arbre.
    setBulle({ id, gauche: el.offsetLeft + p.gauche, haut: el.offsetTop + p.haut - 6 });
  }, []);

  // Le raccourci « # »/« ## »/« ### » + espace convertit le bloc en titre et vide le texte, comme
  // Notion. Détecté ici plutôt que dans un onKeyDown séparé : c'est la forme finale du texte après
  // la frappe qui compte, pas la touche qui vient d'être pressée.
  const handleText = useCallback(
    (id: string, text: string) => {
      const raccourciTitre = /^(#{1,3}) $/.exec(text);
      // « - » ou « * » suivi d'une espace démarre une liste, comme les « # » démarrent un titre.
      const raccourciPuce = /^[-*] $/.test(text);
      if (raccourciTitre || raccourciPuce) {
        const type = raccourciTitre
          ? (`h${raccourciTitre[1].length}` as BriefBlockType)
          : ('li' as BriefBlockType);
        appliquer(
          blocksRef.current.map((b) => (b.id === id ? { ...b, type, text: '' } : b)),
          true
        );
        setMenuId(null);
        return;
      }

      appliquer(blocksRef.current.map((b) => (b.id === id ? { ...b, text } : b)));

      const veutMenu = text.startsWith('/');
      if (!veutMenu) menuAnnule.current = null;
      const ouvre = veutMenu && menuAnnule.current !== id;
      setMenuId(ouvre ? id : null);
      if (ouvre) setIndexSelection(0);
    },
    [appliquer]
  );

  const handleEnter = useCallback(
    (id: string) => {
      const bs = blocksRef.current;
      const i = bs.findIndex((b) => b.id === id);
      const courant = bs[i];

      // Entrée sur une puce vide sort de la liste au lieu d'en empiler une de plus — c'est la
      // seule façon de terminer une énumération sans passer par le menu.
      if (courant?.type === 'li' && courant.text === '') {
        focusId.current = { id };
        appliquer(
          bs.map((b) => (b.id === id ? { ...b, type: 'p2' as BriefBlockType } : b)),
          true
        );
        return;
      }

      // Une puce enchaîne sur une puce ; un titre retombe sur du texte.
      const created = newBlock(courant?.type.startsWith('h') ? 'p2' : courant?.type);
      focusId.current = { id: created.id };
      appliquer([...bs.slice(0, i + 1), created, ...bs.slice(i + 1)]);
    },
    [appliquer]
  );

  const handleBackspaceEmpty = useCallback(
    (id: string) => {
      const bs = blocksRef.current;
      if (bs.length === 1) return;
      const i = bs.findIndex((b) => b.id === id);
      const cibleId = bs[i - 1]?.id ?? bs[i + 1]?.id ?? null;
      focusId.current = cibleId ? { id: cibleId } : null;
      appliquer(
        bs.filter((b) => b.id !== id),
        true
      );
    },
    [appliquer]
  );

  // Enveloppe la sélection courante (ou insère un mot-clé si rien n'est sélectionné) avec la
  // syntaxe markdown-lite correspondante, puis persiste et restaure la sélection sur le texte
  // enveloppé — pour pouvoir enchaîner sans re-cliquer.
  const handleFormat = useCallback(
    (id: string, formatage: Formatage) => {
      const el = refs.current.get(id);
      if (!el) return;
      const { selectionStart, selectionEnd, value } = el;
      const selection = value.slice(selectionStart, selectionEnd);

      let inserted: string;
      let debut: number;
      let fin: number;

      if (formatage === 'lien') {
        const url = window.prompt('URL du lien :', 'https://');
        if (!url) return;
        const libelle = selection || 'texte';
        inserted = `[${libelle}](${url})`;
        debut = fin = selectionStart + inserted.length;
      } else {
        const marqueur = formatage === 'gras' ? '**' : '*';
        const contenu = selection || 'texte';
        inserted = `${marqueur}${contenu}${marqueur}`;
        debut = selectionStart + marqueur.length;
        fin = debut + contenu.length;
      }

      const texte = value.slice(0, selectionStart) + inserted + value.slice(selectionEnd);
      focusId.current = { id, debut, fin };
      appliquer(
        blocksRef.current.map((b) => (b.id === id ? { ...b, text: texte } : b)),
        true
      );
    },
    [appliquer]
  );

  const handleChoisirCommande = useCallback(
    (id: string, type: BriefBlockType) => {
      focusId.current = { id };
      setMenuId(null);
      menuAnnule.current = null;
      appliquer(
        blocksRef.current.map((b) => (b.id === id ? { ...b, type, text: '' } : b)),
        true
      );
    },
    [appliquer]
  );

  const handleFermerMenu = useCallback((id: string) => {
    menuAnnule.current = id;
    setMenuId(null);
  }, []);

  // Un ref-setter stable par bloc : recréer la fonction à chaque rendu forcerait React à détacher
  // puis rattacher le ref sur chaque textarea à chaque frappe.
  const refSetters = useRef(new Map<string, (el: HTMLTextAreaElement | null) => void>());
  const getRefSetter = useCallback((id: string) => {
    let fn = refSetters.current.get(id);
    if (!fn) {
      fn = (el) => {
        if (el) refs.current.set(id, el);
        else refs.current.delete(id);
      };
      refSetters.current.set(id, fn);
    }
    return fn;
  }, []);

  // Cliquer dans le vide sous le dernier bloc y place le curseur — et crée un bloc à la volée si
  // le dernier est déjà rempli. C'est ce qui remplace le bouton « + Ajouter un bloc » : un bloc
  // naît de l'écriture, jamais d'une action explicite, comme dans Notion.
  const continuerEcriture = useCallback(() => {
    const bs = blocksRef.current;
    const dernier = bs[bs.length - 1];
    if (dernier && dernier.text === '') {
      refs.current.get(dernier.id)?.focus();
      return;
    }
    const created = newBlock();
    focusId.current = { id: created.id };
    appliquer([...bs, created]);
  }, [appliquer]);

  return (
    <div className={pending ? 'opacity-70' : ''}>
      <div className="space-y-1">
        {blocks.map((block) => {
          const cible = menuId === block.id;
          const commandesFiltrees = cible
            ? COMMANDES.filter((c) => c.label.toLowerCase().includes(block.text.slice(1).toLowerCase()))
            : AUCUNE_COMMANDE;
          // Un menu sans résultat n'est pas « ouvert » : il ne s'affiche pas et ne capture ni
          // Entrée ni les flèches, pour ne pas bloquer la rédaction sur « /texte quelconque ».
          const ouvert = cible && commandesFiltrees.length > 0;

          return (
            <BriefBlockRow
              key={block.id}
              block={block}
              refSetter={getRefSetter(block.id)}
              onText={handleText}
              onEnter={handleEnter}
              onBackspaceEmpty={handleBackspaceEmpty}
              onBlur={handleBlur}
              onFormat={handleFormat}
              menuOuvert={ouvert}
              commandesFiltrees={ouvert ? commandesFiltrees : AUCUNE_COMMANDE}
              // Idem pour indexSelection : figée à 0 pour les blocs fermés (pour qui elle n'a de
              // toute façon aucun sens) plutôt que de propager la vraie valeur, qui change à
              // chaque flèche pressée dans le menu d'un AUTRE bloc.
              indexSelection={ouvert ? indexSelection : 0}
              setIndexSelection={setIndexSelection}
              onChoisirCommande={handleChoisirCommande}
              onFermerMenu={handleFermerMenu}
              onSelection={handleSelection}
              bulle={bulle && bulle.id === block.id ? { gauche: bulle.gauche, haut: bulle.haut } : null}
            />
          );
        })}
      </div>

      {/* Zone de continuation : surface cliquable sous le dernier bloc, sans libellé ni bouton.
          Elle donne aussi au brief une respiration en bas, comme une vraie page d'écriture. */}
      <div
        onClick={continuerEcriture}
        className="min-h-20 w-full cursor-text"
        aria-label="Continuer à écrire"
      />
    </div>
  );
}
