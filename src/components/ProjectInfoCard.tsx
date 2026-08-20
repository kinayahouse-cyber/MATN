import Link from 'next/link';
import { EditableField } from '@/components/EditableField';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import { TagSelect } from '@/components/ui/TagSelect';
import { StadeTag } from '@/components/properties/StadeTag';
import {
  TRACK_LABELS,
  TRACK_TONE,
  STADE_PRODUCTION_LABEL_TONE,
  STADE_PROJET_LABELS,
  STADE_PRODUCTION_LABEL_LABELS,
} from '@/lib/labels';

type Projet = {
  id: string;
  nom: string;
  code: string;
  track: string | null;
  stade: string;
  description: string | null;
  engagement: string | null;
  organisation: { id: string; nom: string } | null;
  stadeLabel: string | null;
  format: string | null;
  statutDiffusion: string | null;
};

// Bloc unique d'identité : fil d'Ariane, titre, tags (track/stade) et description fusionnés —
// remplace l'ancien header séparé + l'onglet Overview. Occupe le côté gauche du bandeau du haut,
// à côté de la carte Finances.
//
// Track=LABEL a un second cycle (stadeLabel : Développement→Preprod→Prod→Distribution→Archive,
// ADR-008) qui coexiste avec le cycle commercial (stade) sans le recouvrir. Ce cycle production
// est ce qui compte au quotidien pour un projet Label — il vit ici, visible dès l'ouverture de la
// page, plutôt que noyé dans l'onglet Contacts où il atterrissait jusqu'ici sans rapport avec le
// contenu de cet onglet.
export function ProjectInfoCard({
  projet,
  onSaveName,
  onSaveStade,
  onSaveDescription,
  echeanceLabel,
  echeanceLate,
  engagementOptions,
  onSaveEngagement,
  stadeLabelOptions,
  onSaveStadeLabel,
  onSaveFormat,
  onSaveStatutDiffusion,
  readOnly = false,
}: {
  projet: Projet;
  onSaveName: (value: string) => Promise<void>;
  onSaveStade: (value: string) => Promise<void>;
  onSaveDescription: (value: string) => Promise<void>;
  echeanceLabel: string;
  echeanceLate: boolean;
  engagementOptions: { value: string; label: string }[];
  onSaveEngagement: (value: string) => Promise<void>;
  stadeLabelOptions: { value: string; label: string }[];
  onSaveStadeLabel: (value: string) => Promise<void>;
  onSaveFormat: (value: string) => Promise<void>;
  onSaveStatutDiffusion: (value: string) => Promise<void>;
  /** Collaborateur : lecture seule — le contexte du projet reste visible, mais seuls Tâches et
   * Files restent modifiables (voir ProjetPage). */
  readOnly?: boolean;
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
        {readOnly ? (
          <h1 className="font-display text-3xl tracking-tight text-fg md:text-4xl">{projet.nom}</h1>
        ) : (
          <EditableField
            value={projet.nom}
            onSave={onSaveName}
            className="font-display text-3xl tracking-tight md:text-4xl"
          />
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        {projet.track && (
          <Tag tone={TRACK_TONE[projet.track] ?? 'neutral'}>{TRACK_LABELS[projet.track]}</Tag>
        )}
        {readOnly ? (
          <Tag tone="accent">{STADE_PROJET_LABELS[projet.stade] ?? projet.stade}</Tag>
        ) : (
          <StadeTag value={projet.stade} onSave={onSaveStade} />
        )}
        {projet.track === 'LABEL' &&
          (readOnly ? (
            <Tag tone={STADE_PRODUCTION_LABEL_TONE[projet.stadeLabel ?? 'DEVELOPPEMENT'] ?? 'neutral'}>
              {STADE_PRODUCTION_LABEL_LABELS[projet.stadeLabel ?? 'DEVELOPPEMENT']}
            </Tag>
          ) : (
            <TagSelect
              value={projet.stadeLabel ?? 'DEVELOPPEMENT'}
              options={stadeLabelOptions}
              onSave={onSaveStadeLabel}
              tone={STADE_PRODUCTION_LABEL_TONE[projet.stadeLabel ?? 'DEVELOPPEMENT'] ?? 'neutral'}
              ariaLabel="Stade de production Label"
            />
          ))}
        <span className={`text-[11px] ${echeanceLate ? 'text-accent' : 'text-muted'}`}>
          {echeanceLabel}
        </span>
      </div>

      {readOnly ? (
        <p className="mt-5 text-sm leading-relaxed text-fg">
          {projet.description || <span className="text-muted">Aucune description.</span>}
        </p>
      ) : (
        <EditableField
          value={projet.description ?? ''}
          onSave={onSaveDescription}
          type="textarea"
          placeholder="Aucune description."
          className="mt-5 text-sm leading-relaxed text-fg"
        />
      )}

      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted">
        <span className="flex items-center gap-2">
          <span className="uppercase tracking-wide">Type d&rsquo;engagement</span>
          {readOnly ? (
            <span className="text-fg">
              {(projet.engagement && engagementOptions.find((o) => o.value === projet.engagement)?.label) ?? '—'}
            </span>
          ) : (
            <EditableField
              value={projet.engagement ?? ''}
              onSave={onSaveEngagement}
              type="select"
              options={engagementOptions}
              className="text-fg"
            />
          )}
        </span>

        {projet.track === 'LABEL' && (
          <>
            <span className="flex items-center gap-2">
              <span className="uppercase tracking-wide">Format</span>
              {readOnly ? (
                <span className="text-fg">{projet.format || '—'}</span>
              ) : (
                <EditableField value={projet.format ?? ''} onSave={onSaveFormat} className="text-fg" />
              )}
            </span>
            <span className="flex items-center gap-2">
              <span className="uppercase tracking-wide">Diffusion</span>
              {readOnly ? (
                <span className="text-fg">{projet.statutDiffusion || '—'}</span>
              ) : (
                <EditableField
                  value={projet.statutDiffusion ?? ''}
                  onSave={onSaveStatutDiffusion}
                  className="text-fg"
                />
              )}
            </span>
          </>
        )}
      </div>
    </Card>
  );
}
