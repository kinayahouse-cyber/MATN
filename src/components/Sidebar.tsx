'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  IconHome,
  IconClient,
  IconProjects,
  IconOrbit,
  IconTasks,
  IconFinance,
  IconKnowledge,
} from '@/components/icons/nav';
import type { Role } from '@prisma/client';

// IA alignée sur le wireframe Project Workspace (Figma, 08/08) : Décisions/Documents/Recherche
// se regroupent sous Knowledge Hub plutôt que d'être des items séparés. Label Workspace n'est pas
// une entrée de nav distincte : c'est une vue filtrée (Track=Label) de Projects (ADR-006 pt.2).
// Tâches/Finance sont des vues agrégées inter-projets, ajoutées après Orbit.
// `adminOnly` : masqué pour un Collaborateur, qui ne doit voir que Projects (filtré à ses
// projets membre) et Tâches (idem) — pas de Finance, pas de CRM Client, pas de Knowledge Hub.
const NAV_ITEMS = [
  { href: '/dashboard', label: 'Home', Icon: IconHome, adminOnly: true },
  { href: '/clients', label: 'Client', Icon: IconClient, adminOnly: true },
  { href: '/projets', label: 'Projects', Icon: IconProjects, adminOnly: false },
  { href: '/orbit', label: 'Orbit', Icon: IconOrbit, adminOnly: true },
  { href: '/taches', label: 'Tâches', Icon: IconTasks, adminOnly: false },
  { href: '/finance', label: 'Finance', Icon: IconFinance, adminOnly: true },
  { href: '/knowledge-hub', label: 'Knowledge Hub', Icon: IconKnowledge, adminOnly: true },
];

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = NAV_ITEMS.filter((item) => role === 'ADMIN' || !item.adminOnly);

  return (
    <>
      {/* Desktop : colonne fixe, comme avant. Masquée en dessous de md — sur mobile, la nav vit
          dans la barre du bas (MobileTabBar) plutôt que dans un tiroir qu'il faudrait ouvrir à
          chaque fois. */}
      <nav className="hidden w-64 shrink-0 flex-col gap-6 p-4 md:flex">
        <div className="flex items-center gap-2.5 px-2 pt-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent font-display text-sm text-bg">
            M
          </span>
          <span className="font-display text-base tracking-tight text-fg">MATN</span>
        </div>

        <div className="flex flex-col gap-0.5">
          {items.map(({ href, label, Icon }) => {
            const active = pathname === href || pathname?.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors duration-fast ${
                  active ? 'bg-surface text-fg' : 'text-muted hover:bg-surface/60 hover:text-fg'
                }`}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                {label}
              </Link>
            );
          })}
        </div>

        <form action="/api/auth/logout" method="post" className="mt-auto px-3">
          <button
            type="submit"
            className="text-xs text-muted transition-colors duration-fast hover:text-fg"
          >
            Se déconnecter
          </button>
        </form>
      </nav>

      <MobileTabBar items={items} pathname={pathname} />
    </>
  );
}

// Barre d'onglets du bas, seulement sous md — jusqu'à 5 entrées à plat, sinon les moins prioritaires
// (Orbit, Knowledge Hub) se replient sous "Plus" pour garder des cibles tactiles confortables plutôt
// que de tasser 7 icônes illisibles. `pb-[env(safe-area-inset-bottom)]` : dégage la zone gestuelle
// iOS quand la PWA tourne en standalone (voir manifest.json).
function MobileTabBar({
  items,
  pathname,
}: {
  items: typeof NAV_ITEMS;
  pathname: string | null;
}) {
  const [primary, overflow] =
    items.length <= 5 ? [items, []] : [items.slice(0, 4), items.slice(4)];
  const [moreOpen, setMoreOpen] = useState(false);
  const overflowActive = overflow.some(
    (item) => pathname === item.href || pathname?.startsWith(`${item.href}/`)
  );

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] md:hidden">
      {moreOpen && overflow.length > 0 && (
        <>
          <button
            aria-label="Fermer"
            onClick={() => setMoreOpen(false)}
            className="fixed inset-0 z-40 bg-bg/60"
          />
          <div className="absolute inset-x-0 bottom-full z-50 border-t border-line bg-surface p-2">
            {overflow.map(({ href, label, Icon }) => {
              const active = pathname === href || pathname?.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMoreOpen(false)}
                  className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm ${
                    active ? 'bg-bg text-fg' : 'text-muted'
                  }`}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  {label}
                </Link>
              );
            })}
          </div>
        </>
      )}

      <div className="flex items-stretch justify-around">
        {primary.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname?.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-1 py-2 text-[10px] ${
                active ? 'text-fg' : 'text-muted'
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
        {overflow.length > 0 && (
          <button
            type="button"
            onClick={() => setMoreOpen((v) => !v)}
            aria-label="Plus"
            aria-expanded={moreOpen}
            className={`flex flex-1 flex-col items-center gap-1 py-2 text-[10px] ${
              overflowActive || moreOpen ? 'text-fg' : 'text-muted'
            }`}
          >
            <span className="flex h-5 w-5 items-center justify-center text-base leading-none">⋯</span>
            Plus
          </button>
        )}
      </div>
    </nav>
  );
}
