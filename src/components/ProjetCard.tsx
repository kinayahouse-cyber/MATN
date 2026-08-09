'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { updateProjetField, deleteProjet } from '@/app/(app)/projets/actions';
import { TRACK_LABELS, STADE_PROJET_LABELS } from '@/lib/labels';

const STADE_VALUES = Object.keys(STADE_PROJET_LABELS);

type Tache = { id: string; libelle: string; statut: string };
type Projet = {
  id: string;
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

  return (
    <div
      ref={ref}
      className={`relative border border-line p-3 transition-colors duration-fast hover:border-line-strong ${pending ? 'opacity-50' : ''}`}
    >
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setMoveOpen(false);
          setMenuOpen((v) => !v);
        }}
        className="absolute right-2 top-2 px-1 text-muted hover:text-fg"
      >
        ⋯
      </button>

      {menuOpen && (
        <div className="absolute right-2 top-7 z-10 w-40 border border-line bg-bg py-1 text-xs shadow-lg">
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

      <Link href={`/projets/${projet.id}`} className="block pr-5">
        <p className="text-sm font-medium">{projet.nom}</p>
        <p className="mt-0.5 text-xs text-muted">
          {projet.organisation?.nom ?? '—'}
          {projet.track ? ` · ${TRACK_LABELS[projet.track]}` : ''}
        </p>
        {projet.taches.length > 0 && (
          <ul className="mt-2 space-y-1">
            {projet.taches.slice(0, 4).map((t) => (
              <li
                key={t.id}
                className={`text-xs ${t.statut === 'FAIT' ? 'text-line-strong line-through' : 'text-muted'}`}
              >
                {t.libelle}
              </li>
            ))}
            {projet.taches.length > 4 && (
              <li className="text-xs text-line-strong">+{projet.taches.length - 4} autres</li>
            )}
          </ul>
        )}
      </Link>
    </div>
  );
}
