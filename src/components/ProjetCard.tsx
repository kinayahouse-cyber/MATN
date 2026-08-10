'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { updateProjetField, deleteProjet } from '@/app/(app)/projets/actions';
import { FieldRow, Chip } from '@/components/properties/FieldRow';
import { TRACK_LABELS, STADE_PROJET_LABELS } from '@/lib/labels';

const STADE_VALUES = Object.keys(STADE_PROJET_LABELS);

type Tache = { id: string; libelle: string; statut: string };
type Projet = {
  id: string;
  code: string;
  nom: string;
  track: string | null;
  stade: string;
  organisation: { nom: string } | null;
  taches: Tache[];
};

export function ProjetCard({ projet }: { projet: Projet }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setMoveOpen(false);
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const move = (stade: string) => {
    setMenuOpen(false);
    setMoveOpen(false);
    startTransition(async () => {
      await updateProjetField(projet.id, 'stade', stade);
    });
  };

  const remove = () => {
    if (!window.confirm(`Supprimer le projet ${projet.nom} ?`)) return;
    setMenuOpen(false);
    startTransition(async () => {
      await deleteProjet(projet.id);
    });
  };

  const done = projet.taches.filter((t) => t.statut === 'FAIT').length;

  return (
    <div ref={ref} className={`relative ${pending ? 'opacity-50' : ''}`}>
      {/* Bandeau de la carte : type d'objet à gauche, code à droite (référence « // INVOICE ») */}
      <div className="flex items-baseline justify-between bg-line/40 px-3 py-2">
        <span className="text-[10px] uppercase tracking-[0.12em] text-muted">// Projet</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted">
          {projet.code}
        </span>
      </div>

      {/* Carte encartée dans la surface, comme la référence */}
      <div className="border-x border-b border-line bg-line/40 p-3">
        <div className="border border-line-strong bg-bg p-4">
          <div className="flex items-start justify-between gap-2">
            <Link href={`/projets/${projet.id}`} className="min-w-0 flex-1">
              <p className="font-display text-lg leading-tight tracking-tight">{projet.nom}</p>
              <p className="mt-0.5 text-[10px] uppercase tracking-[0.08em] text-muted">
                {projet.organisation?.nom ?? 'Projet interne'}
              </p>
            </Link>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setMoveOpen(false);
                setMenuOpen((v) => !v);
              }}
              className="shrink-0 px-1 text-muted hover:text-fg"
            >
              ⋯
            </button>
          </div>

          <div className="my-3 h-px bg-line" />

          <div className="divide-y divide-line">
            <FieldRow label="Track">
              {projet.track ? TRACK_LABELS[projet.track] : '—'}
            </FieldRow>
            <FieldRow label="Tâches">
              <span className="font-mono text-xs">
                {done}/{projet.taches.length}
              </span>
            </FieldRow>
            <FieldRow label="Statut">
              <Chip tone={projet.stade === 'EN_COURS' ? 'accent' : 'neutral'}>
                {STADE_PROJET_LABELS[projet.stade] ?? projet.stade}
              </Chip>
            </FieldRow>
          </div>

          {projet.taches.length > 0 && (
            <>
              <div className="my-3 h-px bg-line" />
              <ul className="space-y-1">
                {projet.taches.slice(0, 3).map((t) => (
                  <li
                    key={t.id}
                    className={`text-xs ${
                      t.statut === 'FAIT' ? 'text-muted line-through' : 'text-fg'
                    }`}
                  >
                    {t.libelle}
                  </li>
                ))}
                {projet.taches.length > 3 && (
                  <li className="text-[10px] uppercase tracking-[0.08em] text-muted">
                    +{projet.taches.length - 3} autres
                  </li>
                )}
              </ul>
            </>
          )}
        </div>
      </div>

      {menuOpen && (
        <div className="absolute right-3 top-10 z-10 w-40 border border-line-strong bg-bg py-1 text-xs shadow-lg">
          <Link
            href={`/projets/${projet.id}`}
            className="block px-3 py-1.5 hover:bg-line/40"
            onClick={() => setMenuOpen(false)}
          >
            Modifier
          </Link>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMoveOpen((v) => !v);
            }}
            className="block w-full px-3 py-1.5 text-left hover:bg-line/40"
          >
            Déplacer vers…
          </button>
          {moveOpen && (
            <div className="border-t border-line">
              {STADE_VALUES.filter((s) => s !== projet.stade).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    move(s);
                  }}
                  className="block w-full px-3 py-1.5 text-left text-muted hover:bg-line/40"
                >
                  {STADE_PROJET_LABELS[s]}
                </button>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              remove();
            }}
            className="block w-full px-3 py-1.5 text-left text-accent hover:bg-line/40"
          >
            Supprimer
          </button>
        </div>
      )}
    </div>
  );
}
