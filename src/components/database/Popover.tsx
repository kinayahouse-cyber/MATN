'use client';

import { useEffect, useId, useRef, useState } from 'react';

/**
 * Déclencheur icône + popover ancré. Gère fermeture au clic extérieur et à Échap, retour du focus
 * sur le déclencheur, et repositionnement si le panneau déborde du viewport.
 */
export function Popover({
  label,
  icon,
  active = false,
  indicator,
  children,
  openId,
  setOpenId,
  id,
}: {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  /** Compteur discret affiché à côté de l'icône quand la configuration est active. */
  indicator?: string | number;
  children: React.ReactNode;
  /** Un seul popover ouvert à la fois : identifiant partagé par la barre d'outils. */
  openId: string | null;
  setOpenId: (id: string | null) => void;
  id: string;
}) {
  const open = openId === id;
  const panelId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [alignRight, setAlignRight] = useState(false);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setOpenId(null);
        triggerRef.current?.focus();
      }
    };
    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (panelRef.current?.contains(t) || triggerRef.current?.contains(t)) return;
      setOpenId(null);
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open, setOpenId]);

  // Bascule l'ancrage à droite si le panneau sortirait du viewport.
  useEffect(() => {
    if (!open || !panelRef.current) return;
    const rect = panelRef.current.getBoundingClientRect();
    setAlignRight(rect.right > window.innerWidth - 8);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    // Le focus entre dans le panneau sans voler le premier champ interactif au clavier.
    panelRef.current?.focus();
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        title={label}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpenId(open ? null : id)}
        className={`group relative flex h-7 items-center gap-1 px-1.5 transition-colors duration-fast ${
          open || active ? 'text-fg' : 'text-muted hover:text-fg'
        }`}
      >
        {icon}
        {indicator !== undefined && indicator !== 0 && indicator !== '' && (
          <span className="font-mono text-[10px] leading-none text-accent">{indicator}</span>
        )}
        {/* État actif : trait d'accent sous l'icône, jamais de pastille pleine */}
        <span
          className={`absolute inset-x-1 -bottom-0.5 h-px transition-colors duration-fast ${
            open ? 'bg-fg' : active ? 'bg-accent' : 'bg-transparent'
          }`}
        />
      </button>

      {open && (
        <div
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-label={label}
          tabIndex={-1}
          className={`absolute top-9 z-50 w-72 border border-line-strong bg-bg p-3 shadow-lg focus:outline-none ${
            alignRight ? 'right-0' : 'left-0'
          }`}
        >
          <p className="mb-2 text-[10px] uppercase tracking-[0.12em] text-muted">{label}</p>
          <div className="h-px bg-line" />
          <div className="pt-2">{children}</div>
        </div>
      )}
    </div>
  );
}

// Séparateur structurel interne aux popovers.
export function PopoverDivider() {
  return <div className="my-2 h-px bg-line" />;
}

// Action textuelle discrète en pied de popover (« Effacer », « Tout afficher »…).
export function PopoverAction({
  children,
  onClick,
  tone = 'default',
}: {
  children: React.ReactNode;
  onClick: () => void;
  tone?: 'default' | 'accent';
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left text-xs transition-colors duration-fast ${
        tone === 'accent' ? 'text-accent hover:opacity-80' : 'text-muted hover:text-fg'
      }`}
    >
      {children}
    </button>
  );
}

export const popoverControlClass =
  'border border-line bg-bg px-1.5 py-1 text-xs text-fg focus:outline-none focus:border-accent transition-colors duration-fast';
