'use client';

import { memo, useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { saveBrief, type BriefBlock, type BriefBlockType } from '@/app/(app)/projets/actions';
import { renderInline } from '@/lib/inline-markdown';

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
};

const PLACEHOLDER: Record<BriefBlockType, string> = {
  h1: 'Titre',
  h2: 'Sous-titre',
  h3: 'Intertitre',
  p1: 'Écrivez, ou tapez « / » pour les commandes',
  p2: 'Écrivez, ou tapez « / » pour les commandes',
  p3: 'Écrivez, ou tapez « / » pour les commandes',
};

const newBlock = (type: BriefBlockType = 'p2'): BriefBlock => ({
  id: crypto.randomUUID(),
  type,
  text: '',
});

// Rendu statique du brief — Collaborateur et portail client le lisent sans pouvoir l'éditer.
// Composant serveur possible (aucune interactivité), volontairement séparé de BriefEditor plutôt
// que masqué en CSS : évite d'envoyer tout le JS de l'éditeur (drag, refs, actions serveur) à un
// lecteur qui n'en a pas l'usage.
export function BriefReadOnly({ blocks }: { blocks: BriefBlock[] }) {
  if (blocks.length === 0) return <p className="text-sm text-muted">Aucun brief.</p>;
  return (
    <div className="space-y-2">
      {blocks.map((b) => (
        <p key={b.id} className={BLOCK_CLASS[b.type]}>
          {renderInline(b.text)}
        </p>
      ))}
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
];

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
  onFermerMenu: () => void;
};

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
}: RowProps) {
  return (
    <div className="group relative">
      {/* Auto-grow en CSS pur (globals.css) : pas de scrollHeight lu en JS à chaque frappe. Plus
          aucun chrome visible autour du bloc — tout passe par « / » et les raccourcis clavier,
          comme Notion. */}
      <div className={`grow-wrap w-full ${BLOCK_CLASS[block.type]}`} data-replicated-value={block.text}>
        <textarea
          ref={refSetter}
          value={block.text}
          rows={1}
          placeholder={PLACEHOLDER[block.type]}
          onChange={(e) => onText(block.id, e.target.value)}
          onBlur={onBlur}
          onKeyDown={(e) => {
            if (menuOuvert) {
              const total = Math.max(commandesFiltrees.length, 1);
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
                const commande = commandesFiltrees[indexSelection];
                if (commande) onChoisirCommande(block.id, commande.type);
                return;
              }
              if (e.key === 'Escape') {
                e.preventDefault();
                onFermerMenu();
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
          {commandesFiltrees.length === 0 ? (
            <p className="px-3 py-2 text-xs text-muted">Aucun résultat.</p>
          ) : (
            commandesFiltrees.map((c, i) => (
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
            ))
          )}
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
  const focusId = useRef<{ id: string; debut?: number; fin?: number } | null>(null);
  const refs = useRef(new Map<string, HTMLTextAreaElement>());
  // Miroir synchrone de `blocks`, lu par les callbacks stables (persist au blur) pour éviter
  // qu'elles n'aient `blocks` en dépendance — ça casserait la mémoïsation des lignes à chaque
  // frappe alors que seul le blur a besoin de la valeur la plus récente.
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

  const handleBlur = useCallback(() => {
    persist(blocksRef.current);
    // Laisse le temps à un clic sur une commande d'aboutir (onMouseDown y empêche déjà le blur,
    // mais un blur déclenché autrement — Tab, clic ailleurs — doit quand même refermer le menu).
    setMenuId(null);
  }, [persist]);

  // Le raccourci « # »/« ## »/« ### » + espace convertit le bloc en titre et vide le texte, comme
  // Notion. Détecté ici plutôt que dans un onKeyDown séparé : c'est la forme finale du texte après
  // la frappe qui compte, pas la touche qui vient d'être pressée.
  const handleText = useCallback(
    (id: string, text: string) => {
      const raccourciTitre = /^(#{1,3}) $/.exec(text);
      if (raccourciTitre) {
        const type = `h${raccourciTitre[1].length}` as BriefBlockType;
        setBlocks((bs) => {
          const next = bs.map((b) => (b.id === id ? { ...b, type, text: '' } : b));
          persist(next);
          return next;
        });
        setMenuId(null);
        return;
      }

      setBlocks((bs) => bs.map((b) => (b.id === id ? { ...b, text } : b)));
      setMenuId((atuel) => (text.startsWith('/') ? id : atuel === id ? null : atuel));
      setIndexSelection(0);
    },
    [persist]
  );

  const handleEnter = useCallback(
    (id: string) =>
      setBlocks((bs) => {
        const i = bs.findIndex((b) => b.id === id);
        const created = newBlock(bs[i]?.type.startsWith('h') ? 'p2' : bs[i]?.type);
        focusId.current = { id: created.id };
        return [...bs.slice(0, i + 1), created, ...bs.slice(i + 1)];
      }),
    []
  );

  const handleBackspaceEmpty = useCallback(
    (id: string) =>
      setBlocks((bs) => {
        if (bs.length === 1) return bs;
        const i = bs.findIndex((b) => b.id === id);
        const cibleId = bs[i - 1]?.id ?? bs[i + 1]?.id ?? null;
        focusId.current = cibleId ? { id: cibleId } : null;
        const next = bs.filter((b) => b.id !== id);
        persist(next);
        return next;
      }),
    [persist]
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
      setBlocks((bs) => {
        const next = bs.map((b) => (b.id === id ? { ...b, text: texte } : b));
        persist(next);
        return next;
      });
      focusId.current = { id, debut, fin };
    },
    [persist]
  );

  const handleChoisirCommande = useCallback(
    (id: string, type: BriefBlockType) => {
      setBlocks((bs) => {
        const next = bs.map((b) => (b.id === id ? { ...b, type, text: '' } : b));
        persist(next);
        return next;
      });
      setMenuId(null);
      focusId.current = { id };
    },
    [persist]
  );

  const handleFermerMenu = useCallback(() => setMenuId(null), []);

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

  return (
    <div className={pending ? 'opacity-70' : ''}>
      <div className="space-y-1">
        {blocks.map((block) => {
          const ouvert = menuId === block.id;
          const requete = ouvert ? block.text.slice(1).toLowerCase() : '';
          const commandesFiltrees = ouvert
            ? COMMANDES.filter((c) => c.label.toLowerCase().includes(requete))
            : [];

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
              commandesFiltrees={commandesFiltrees}
              indexSelection={indexSelection}
              setIndexSelection={setIndexSelection}
              onChoisirCommande={handleChoisirCommande}
              onFermerMenu={handleFermerMenu}
            />
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => setBlocks((bs) => [...bs, newBlock()])}
        className="mt-2 rounded-md px-2 py-1 text-xs text-muted transition-colors duration-fast hover:bg-line/40 hover:text-fg"
      >
        + Ajouter un bloc
      </button>
    </div>
  );
}
