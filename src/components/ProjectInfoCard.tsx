import Link from 'next/link';
import { EditableField } from '@/components/EditableField';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import { StadeTag } from '@/components/properties/StadeTag';
import { TRACK_LABELS } from '@/lib/labels';

type Projet = {
  id: string;
  nom: string;
  code: string;
  track: string | null;
  stade: string;
  description: string | null;
  engagement: string | null;
  organisation: { id: string; nom: string } | null;
};

// Bloc unique d'identité : fil d'Ariane, titre, tags (track/stade) et description fusionnés —
// remplace l'ancien header séparé + l'onglet Overview. Occupe le côté gauche du bandeau du haut,
// à côté de la carte Finances.
export function ProjectInfoCard({
  projet,
  onSaveName,
  onSaveStade,
  onSaveDescription,
  echeanceLabel,
  echeanceLate,
  engagementOptions,
  onSaveEngagement,
}: {
  projet: Projet;
  onSaveName: (value: string) => Promise<void>;
  onSaveStade: (value: string) => Promise<void>;
  onSaveDescription: (value: string) => Promise<void>;
  echeanceLabel: string;
  echeanceLate: boolean;
  engagementOptions: { value: string; label: string }[];
  onSaveEngagement: (value: string) => Promise<void>;
}) {
  return (
    <Card padded={false} className="h-full p-8">
      <nav aria-label="Fil d'Ariane" className="flex flex-wrap items-center gap-2 text-sm text-muted">
        {projet.organisation ? (
          <Link href={`/clients/${projet.organisation.id}`} className="hover:text-fg hover:underline">
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

      <div className="mt-3">
        <EditableField
          value={projet.nom}
          onSave={onSaveName}
          className="font-display text-3xl tracking-tight md:text-4xl"
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        {projet.track && <Tag>{TRACK_LABELS[projet.track]}</Tag>}
        <StadeTag value={projet.stade} onSave={onSaveStade} />
        <span className={`text-[11px] ${echeanceLate ? 'text-accent' : 'text-muted'}`}>
          {echeanceLabel}
        </span>
      </div>

      <EditableField
        value={projet.description ?? ''}
        onSave={onSaveDescription}
        type="textarea"
        placeholder="Aucune description."
        className="mt-5 text-sm leading-relaxed text-fg"
      />

      <div className="mt-5 flex items-center gap-2 text-xs text-muted">
        <span className="uppercase tracking-wide">Type d&rsquo;engagement</span>
        <EditableField
          value={projet.engagement ?? ''}
          onSave={onSaveEngagement}
          type="select"
          options={engagementOptions}
          className="text-fg"
        />
      </div>
    </Card>
  );
}
