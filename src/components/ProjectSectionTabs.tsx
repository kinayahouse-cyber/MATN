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
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line px-5 py-3.5">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActive(t.id)}
            className={`rounded-md px-2 py-1 text-xs uppercase tracking-[0.08em] transition-colors duration-fast ${
              current.id === t.id
                ? 'bg-line/60 text-fg'
                : 'text-muted hover:bg-line/30 hover:text-fg'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="p-5">{current.content}</div>
    </div>
  );
}
