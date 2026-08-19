'use client';

import { useState } from 'react';

type Tab = { id: string; label: string; content: React.ReactNode };

// Onglets de premier niveau pour la page Projet (référence : mockups Frame 41/60 — la page se
// limite à ce que montrent les frames, le reste des sections est déplacé ici plutôt que supprimé.
// Distinct des sous-vues Card/List/Timeline à l'intérieur de l'onglet Tâches.
export function ProjectSectionTabs({ tabs, defaultTab }: { tabs: Tab[]; defaultTab: string }) {
  const [active, setActive] = useState(defaultTab);
  const current = tabs.find((t) => t.id === active) ?? tabs[0];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-line-strong px-8 py-4">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActive(t.id)}
            className={`border-b pb-1 text-sm uppercase tracking-[0.08em] transition-colors duration-fast ${
              current.id === t.id
                ? 'border-accent text-fg'
                : 'border-transparent text-muted hover:text-fg'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="p-8">{current.content}</div>
    </div>
  );
}
