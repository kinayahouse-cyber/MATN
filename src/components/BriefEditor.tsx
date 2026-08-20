'use client';

import { memo, useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { saveBrief, type BriefBlock, type BriefBlockType } from '@/app/(app)/projets/actions';

const BLOCK_TYPES: { value: BriefBlockType; label: string }[] = [
  { value: 'h1', label: 'H1' },
  { value: 'h2', label: 'H2' },
  { value: 'h3', label: 'H3' },
  { value: 'p1', label: 'P1' },
  { value: 'p2', label: 'P2' },
  { value: 'p3', label: 'P3' },
];

// P1/P2/P3 = trois tailles de corps de texte, du plus large au plus dense.
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
  p1: 'Paragraphe',
  p2: 'Paragraphe',
  p3: 'Note',
};

const newBlock = (type: BriefBlockType = 'p2'): BriefBlock => ({
  id: crypto.randomUUID(),
  type,
  text: '',
});

type RowProps = {
  block: BriefBlock;
  refSetter: (el: HTMLTextAreaElement | null) => void;
  onText: (id: string, text: string) => void;
  onType: (id: string, type: BriefBlockType) => void;
  onEnter: (id: string) => void;
  onBackspaceEmpty: (id: string) => void;
  onBlur: () => void;
  onDeadClick: (id: string) => void;
};

// Une ligne par bloc, mémoïsée : taper dans un bloc ne doit re-rendre que ce bloc, pas les autres
// — sinon chaque frappe recalcule tout le brief, ce qui se sent dès qu'il y a plusieurs blocs.
// Toutes les props sont des callbacks stables (useCallback côté parent) pour que la mémoïsation
// tienne réellement.
const BriefBlockRow = memo(function BriefBlockRow({
  block,
  refSetter,
  onText,
  onType,
  onEnter,
  onBackspaceEmpty,
  onBlur,
  onDeadClick,
}: RowProps) {
  return (
    <div
      className="group flex items-start gap-2"
      // Le sélecteur de type est pointer-events-none tant qu'invisible, donc un clic dans sa zone
      // (avant le texte) atterrit ici, sur la ligne — on le redirige vers le textarea plutôt que
      // de laisser le clic ne rien faire.
      onClick={(e) => {
        if (e.target === e.currentTarget) onDeadClick(block.id);
      }}
    >
      <select
        aria-label="Type de bloc"
        value={block.type}
        onChange={(e) => onType(block.id, e.target.value as BriefBlockType)}
        // pointer-events-none tant qu'invisible : sans ça, un premier clic près du bord gauche du
        // bloc (avant le texte du placeholder) tombe sur ce select plutôt que sur le textarea, et
        // tout ce qui est tapé ensuite disparaît silencieusement dedans. Révélé uniquement par
        // group-focus-within (le textarea a le focus), jamais par group-hover : un simple survol
        // de la souris en route vers le textarea déclenche group-hover exactement au moment du
        // clic, ce qui réactivait le piège.
        className="pointer-events-none mt-1 w-[3.25rem] shrink-0 rounded-md border border-line bg-bg px-1 py-0.5 text-[10px] uppercase tracking-wide text-muted opacity-0 transition-opacity duration-fast group-focus-within:pointer-events-auto group-focus-within:opacity-100"
      >
        {BLOCK_TYPES.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>

      {/* Auto-grow en CSS pur (globals.css) : pas de scrollHeight lu en JS à chaque frappe. */}
      <div className={`grow-wrap w-full ${BLOCK_CLASS[block.type]}`} data-replicated-value={block.text}>
        <textarea
          ref={refSetter}
          value={block.text}
          rows={1}
          placeholder={PLACEHOLDER[block.type]}
          onChange={(e) => onText(block.id, e.target.value)}
          onBlur={onBlur}
          onKeyDown={(e) => {
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
    </div>
  );
});

/**
 * Espace de rédaction du brief, en blocs typés (H1–H3, P1–P3). Chaque bloc a son sélecteur de
 * type ; Entrée crée le bloc suivant, Retour arrière sur un bloc vide le supprime.
 * L'enregistrement part au blur, pas à chaque frappe.
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
  const focusId = useRef<string | null>(null);
  const refs = useRef(new Map<string, HTMLTextAreaElement>());
  // Miroir synchrone de `blocks`, lu par les callbacks stables (persist au blur) pour éviter
  // qu'elles n'aient `blocks` en dépendance — ça casserait la mémoïsation des lignes à chaque
  // frappe alors que seul le blur a besoin de la valeur la plus récente.
  const blocksRef = useRef(blocks);
  blocksRef.current = blocks;

  // Après ajout/suppression, on rend le focus au bloc visé — sinon la frappe est interrompue.
  useEffect(() => {
    if (!focusId.current) return;
    refs.current.get(focusId.current)?.focus();
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

  const handleBlur = useCallback(() => persist(blocksRef.current), [persist]);

  const handleText = useCallback(
    (id: string, text: string) => setBlocks((bs) => bs.map((b) => (b.id === id ? { ...b, text } : b))),
    []
  );

  const handleType = useCallback(
    (id: string, type: BriefBlockType) =>
      setBlocks((bs) => {
        const next = bs.map((b) => (b.id === id ? { ...b, type } : b));
        persist(next);
        return next;
      }),
    [persist]
  );

  const handleEnter = useCallback(
    (id: string) =>
      setBlocks((bs) => {
        const i = bs.findIndex((b) => b.id === id);
        const created = newBlock(bs[i]?.type.startsWith('h') ? 'p2' : bs[i]?.type);
        focusId.current = created.id;
        return [...bs.slice(0, i + 1), created, ...bs.slice(i + 1)];
      }),
    []
  );

  const handleBackspaceEmpty = useCallback(
    (id: string) =>
      setBlocks((bs) => {
        if (bs.length === 1) return bs;
        const i = bs.findIndex((b) => b.id === id);
        focusId.current = bs[i - 1]?.id ?? bs[i + 1]?.id ?? null;
        const next = bs.filter((b) => b.id !== id);
        persist(next);
        return next;
      }),
    [persist]
  );

  const handleDeadClick = useCallback((id: string) => refs.current.get(id)?.focus(), []);

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
        {blocks.map((block) => (
          <BriefBlockRow
            key={block.id}
            block={block}
            refSetter={getRefSetter(block.id)}
            onText={handleText}
            onType={handleType}
            onEnter={handleEnter}
            onBackspaceEmpty={handleBackspaceEmpty}
            onBlur={handleBlur}
            onDeadClick={handleDeadClick}
          />
        ))}
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
