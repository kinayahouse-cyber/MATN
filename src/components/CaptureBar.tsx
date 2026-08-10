'use client';

import { useState } from 'react';

type Entry = { kind: 'Décision' | 'Note'; id: string; titre: string; date: Date };

const inputClass =
  'w-full border border-line bg-bg px-2 py-1.5 text-sm text-fg placeholder:text-muted focus:outline-none focus:border-accent';

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
      <div className="grid grid-cols-1 gap-px bg-line sm:grid-cols-2">
        {feed.map((entry) => (
          <div key={`${entry.kind}-${entry.id}`} className="bg-accent p-3 text-bg">
            <div className="flex items-center gap-2">
              <span className="bg-bg px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-fg">
                {entry.kind}
              </span>
              <span className="text-[11px] opacity-80">{timeAgo(entry.date)}</span>
            </div>
            <p className="mt-3 text-sm font-medium leading-snug">{entry.titre}</p>
          </div>
        ))}

        <div className="flex items-center justify-center gap-3 bg-bg p-3">
          <button
            type="button"
            onClick={() => setOpen(open === 'decision' ? null : 'decision')}
            className={`border px-3 py-2 text-xs uppercase tracking-wide transition-colors duration-fast ${
              open === 'decision'
                ? 'border-accent bg-accent text-bg'
                : 'border-accent text-accent hover:bg-accent hover:text-bg'
            }`}
          >
            Capturer décision
          </button>
          <button
            type="button"
            onClick={() => setOpen(open === 'note' ? null : 'note')}
            className={`border px-3 py-2 text-xs uppercase tracking-wide transition-colors duration-fast ${
              open === 'note'
                ? 'border-accent bg-accent text-bg'
                : 'border-accent text-accent hover:bg-accent hover:text-bg'
            }`}
          >
            Note
          </button>
        </div>
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
          <button type="submit" className="bg-accent px-4 py-2 text-xs font-medium uppercase tracking-wide text-bg">
            Logger
          </button>
        </form>
      )}

      {open === 'note' && (
        <form action={addNote} className="mt-4 max-w-xl space-y-2">
          <input type="hidden" name="projetId" value={projetId} />
          <textarea name="contenu" required rows={2} placeholder="Contenu" className={inputClass} />
          <input name="tag" placeholder="Tag (optionnel)" className={inputClass} />
          <button type="submit" className="bg-accent px-4 py-2 text-xs font-medium uppercase tracking-wide text-bg">
            Ajouter
          </button>
        </form>
      )}
    </div>
  );
}
