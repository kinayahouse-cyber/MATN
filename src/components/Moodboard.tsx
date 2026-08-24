'use client';

import { useRef, useState, useTransition } from 'react';
import { EditableField } from '@/components/EditableField';
import { DeleteButton } from '@/components/DeleteButton';
import { addMoodboardImages, deleteAsset, updateMoodboardLegende } from '@/app/(app)/projets/actions';

export type ImageMoodboard = { id: string; url: string | null; nom: string; legende: string | null };

// Grille de planche d'inspiration. `columns-*` plutôt qu'une grille régulière : les références
// visuelles arrivent dans tous les formats, et un empilement en colonnes les montre à leur
// proportion réelle au lieu de les rogner à une hauteur commune.
const COLONNES = 'columns-2 gap-3 sm:columns-3 [&>*]:mb-3 [&>*]:break-inside-avoid';

/** Lecture seule — portail client, et Collaborateur côté interne. */
export function MoodboardReadOnly({ images }: { images: ImageMoodboard[] }) {
  if (images.length === 0) return <p className="text-sm text-muted">Aucune référence.</p>;

  return (
    <div className={COLONNES}>
      {images.map((img) =>
        img.url ? (
          <figure key={img.id}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.url} alt={img.legende || img.nom} className="w-full rounded-md border border-line" />
            {img.legende && <figcaption className="mt-1 text-xs text-muted">{img.legende}</figcaption>}
          </figure>
        ) : null
      )}
    </div>
  );
}

export function Moodboard({ projetId, images }: { projetId: string; images: ImageMoodboard[] }) {
  const [pending, startTransition] = useTransition();
  const [erreur, setErreur] = useState<string | null>(null);
  const champFichier = useRef<HTMLInputElement>(null);

  const envoyer = (fichiers: FileList | null) => {
    if (!fichiers || fichiers.length === 0) return;
    setErreur(null);

    const form = new FormData();
    form.append('projetId', projetId);
    for (const f of fichiers) form.append('files', f);

    startTransition(async () => {
      try {
        await addMoodboardImages(form);
        // Le champ est remis à zéro pour que redéposer le même fichier redéclenche bien un change.
        if (champFichier.current) champFichier.current.value = '';
      } catch (e) {
        setErreur(e instanceof Error ? e.message : String(e));
      }
    });
  };

  return (
    <div>
      <div className={pending ? 'opacity-60' : ''}>
        {images.length === 0 ? (
          <p className="text-sm text-muted">Aucune référence pour l’instant.</p>
        ) : (
          <div className={COLONNES}>
            {images.map((img) => (
              <figure key={img.id} className="group overflow-hidden rounded-md border border-line">
                {img.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img.url} alt={img.legende || img.nom} className="w-full" />
                ) : (
                  <div className="flex h-24 items-center justify-center bg-line/40 text-xs text-muted">
                    Image indisponible
                  </div>
                )}
                <figcaption className="flex items-center justify-between gap-2 p-2">
                  <EditableField
                    value={img.legende ?? ''}
                    onSave={updateMoodboardLegende.bind(null, img.id)}
                    placeholder="Ajouter une légende"
                    className="text-xs text-muted"
                  />
                  <DeleteButton action={deleteAsset.bind(null, img.id)} />
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>

      <label className="mt-3 block cursor-pointer rounded-md border border-dashed border-line px-3 py-4 text-center text-xs text-muted transition-colors duration-fast hover:border-accent hover:text-fg">
        {pending ? 'Envoi en cours…' : 'Déposer des images de référence'}
        <input
          ref={champFichier}
          type="file"
          accept="image/*"
          multiple
          disabled={pending}
          onChange={(e) => envoyer(e.target.files)}
          className="hidden"
        />
      </label>

      {erreur && <p className="mt-2 text-xs text-rose-300">{erreur}</p>}
    </div>
  );
}
