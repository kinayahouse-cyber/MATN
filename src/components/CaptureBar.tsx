'use client';

import { useState } from 'react';

type Entry = { kind: 'Décision' | 'Note'; id: string; titre: string; date: Date };

const inputClass =
  'w-full rounded-md border border-line bg-bg px-2 py-1.5 text-sm text-fg placeholder:text-muted focus:outline-none focus:border-accent';

function timeAgo(date: Date) {
  const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (days <= 0) return "aujourd'hui";
  if (days === 1) return 'il y a 1 jour';
  return `il y a ${days} jours`;
}

export function CaptureBar({
  projetId,
  feed,
  addDecision,
  addNote,
}: {
  projetId: string;
  feed: Entry[];
  addDecision: (formData: FormData) => Promise<void>;
  addNote: (formData: FormData) => Promise<void>;
}) {
  const [open, setOpen] = useState<'decision' | 'note' | null>(null);

  return (
    <div>
      <div className="space-y-2">
        {feed.map((entry) => (
          <div
            key={`${entry.kind}-${entry.id}`}
            className="rounded-md border border-line bg-bg/40 p-3"
          >
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                  entry.kind === 'Décision'
                    ? 'border-accent/30 bg-accent/15 text-accent'
                    : 'border-line bg-line/60 text-muted'
                }`}
              >
                {entry.kind}
              </span>
              <span className="text-[11px] text-muted">{timeAgo(entry.date)}</span>
            </div>
            <p className="mt-2 text-sm leading-snug text-fg">{entry.titre}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen(open === 'decision' ? null : 'decision')}
          className={`rounded-md border px-3 py-1.5 text-xs transition-colors duration-fast ${
            open === 'decision'
              ? 'border-accent bg-accent/15 text-accent'
              : 'border-line text-muted hover:border-accent/40 hover:text-fg'
          }`}
        >
          + Décision
        </button>
        <button
          type="button"
          onClick={() => setOpen(open === 'note' ? null : 'note')}
          className={`rounded-md border px-3 py-1.5 text-xs transition-colors duration-fast ${
            open === 'note'
              ? 'border-accent bg-accent/15 text-accent'
              : 'border-line text-muted hover:border-accent/40 hover:text-fg'
          }`}
        >
          + Note
        </button>
      </div>

      {open === 'decision' && (
        <form action={addDecision} className="mt-4 max-w-xl space-y-2">
          <input type="hidden" name="projetId" value={projetId} />
          <input name="intitule" required placeholder="Intitulé" className={inputClass} />
          <textarea
            name="justification"
            required
            rows={2}
            placeholder="Justification"
            className={inputClass}
          />
          <details>
            <summary className="cursor-pointer text-xs text-muted hover:text-fg">
              + Contexte / options écartées
            </summary>
            <textarea
              name="contexte"
              rows={2}
              placeholder="Contexte"
              className={`${inputClass} mt-2`}
            />
            <textarea
              name="optionsEcartees"
              rows={2}
              placeholder="Options écartées"
              className={`${inputClass} mt-2`}
            />
          </details>
          <button type="submit" className="rounded-md bg-accent px-4 py-2 text-xs font-medium text-bg">
            Logger
          </button>
        </form>
      )}

      {open === 'note' && (
        <form action={addNote} className="mt-4 max-w-xl space-y-2">
          <input type="hidden" name="projetId" value={projetId} />
          <textarea name="contenu" required rows={2} placeholder="Contenu" className={inputClass} />
          <input name="tag" placeholder="Tag (optionnel)" className={inputClass} />
          <button type="submit" className="rounded-md bg-accent px-4 py-2 text-xs font-medium text-bg">
            Ajouter
          </button>
        </form>
      )}
    </div>
  );
}
