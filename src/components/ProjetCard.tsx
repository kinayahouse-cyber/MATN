'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { updateProjetField, deleteProjet } from '@/app/(app)/projets/actions';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
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
  const pct = projet.taches.length > 0 ? Math.round((done / projet.taches.length) * 100) : 0;

  return (
    <div ref={ref} className={`relative ${pending ? 'opacity-50' : ''}`}>
      <Card className="transition-colors duration-fast hover:border-line-strong">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/projets/${projet.id}`} className="min-w-0 flex-1">
            <p className="font-display text-base leading-tight tracking-tight text-fg">
              {projet.nom}
            </p>
            <p className="mt-0.5 text-xs text-muted">
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
            className="shrink-0 rounded-md px-1.5 py-0.5 text-muted hover:bg-line hover:text-fg"
          >
            ⋯
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {projet.track && <Tag>{TRACK_LABELS[projet.track]}</Tag>}
          <Tag tone={projet.stade === 'EN_COURS' ? 'accent' : undefined}>
            {STADE_PROJET_LABELS[projet.stade] ?? projet.stade}
          </Tag>
        </div>

        {projet.taches.length > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-muted">
              <span>Tâches</span>
              <span className="font-mono">
                {done}/{projet.taches.length}
              </span>
            </div>
            <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-line">
              <div className="h-1 rounded-full bg-accent" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}
      </Card>

      {menuOpen && (
        <div className="absolute right-3 top-10 z-10 w-40 rounded-md border border-line bg-surface py-1 text-xs shadow-card">
          <Link
            href={`/projets/${projet.id}`}
            className="block px-3 py-1.5 hover:bg-line/60"
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
            className="block w-full px-3 py-1.5 text-left hover:bg-line/60"
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
                  className="block w-full px-3 py-1.5 text-left text-muted hover:bg-line/60"
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
            className="block w-full px-3 py-1.5 text-left text-accent hover:bg-line/60"
          >
            Supprimer
          </button>
        </div>
      )}
    </div>
  );
}
