import Link from 'next/link';
import { EditableField } from '@/components/EditableField';
import { TRACK_LABELS } from '@/lib/labels';

type Projet = {
  id: string;
  nom: string;
  code: string;
  track: string | null;
  organisation: { id: string; nom: string } | null;
};

// Ancre d'identité unique en tête de page : fil d'Ariane + titre. Avant, le nom du projet
// n'apparaissait qu'au milieu de la grille — aucune orientation immédiate à l'arrivée sur la page.
export function ProjectHeader({
  projet,
  onSaveName,
}: {
  projet: Projet;
  onSaveName: (value: string) => Promise<void>;
}) {
  return (
    <div className="p-8">
      <nav aria-label="Fil d'Ariane" className="flex flex-wrap items-center gap-2 text-sm text-muted">
        {projet.organisation ? (
          <Link
            href={`/clients/${projet.organisation.id}`}
            className="hover:text-fg hover:underline"
          >
            {projet.organisation.nom}
          </Link>
        ) : (
          <span>Projet interne</span>
        )}
        <span aria-hidden>/</span>
        <Link href="/projets" className="hover:text-fg hover:underline">
          {projet.track ? TRACK_LABELS[projet.track] ?? projet.track : 'Projects'}
        </Link>
        <span aria-hidden>/</span>
        <span className="font-mono text-xs uppercase tracking-wide">{projet.code}</span>
      </nav>

      <div className="mt-4">
        <EditableField
          value={projet.nom}
          onSave={onSaveName}
          className="font-display text-4xl tracking-tight md:text-5xl [&_button]:border-b-2 [&_button]:border-fg [&_button]:pb-1"
        />
      </div>
    </div>
  );
}
