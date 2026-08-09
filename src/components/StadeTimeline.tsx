import { STADE_PROJET_LABELS } from '@/lib/labels';

const STADE_ORDER = ['DEVIS_ENVOYE', 'SIGNE', 'EN_COURS', 'LIVRE', 'CLOS'] as const;

// Trois traitements de marqueur, pas trois couleurs : carré plein = franchi, losange plein accent
// = position courante, losange vide = à venir.
export function StadeTimeline({ stade }: { stade: string }) {
  const currentIndex = STADE_ORDER.indexOf(stade as (typeof STADE_ORDER)[number]);

  return (
    <div>
      <div className="flex items-center">
        {STADE_ORDER.map((s, i) => {
          const passed = i < currentIndex;
          const current = i === currentIndex;
          return (
            <div key={s} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-2">
                {current ? (
                  <span className="h-2.5 w-2.5 rotate-45 bg-accent" />
                ) : passed ? (
                  <span className="h-2 w-2 bg-fg" />
                ) : (
                  <span className="h-2.5 w-2.5 rotate-45 border border-accent" />
                )}
                <span
                  className={`text-[11px] ${current ? 'text-accent' : 'text-muted'}`}
                >
                  {STADE_PROJET_LABELS[s]}
                </span>
              </div>
              {i < STADE_ORDER.length - 1 && (
                <div className={`mx-2 h-px flex-1 ${passed ? 'bg-fg' : 'bg-line-strong'}`} />
              )}
            </div>
          );
        })}
      </div>
      {stade === 'ABANDONNE' && (
        <p className="mt-4 text-sm text-accent">Projet abandonné.</p>
      )}
    </div>
  );
}
