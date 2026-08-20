'use client';

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

// IA alignée sur le wireframe Project Workspace (Figma, 08/08) : Décisions/Documents/Recherche
// se regroupent sous Knowledge Hub plutôt que d'être des items séparés. Label Workspace n'est pas
// une entrée de nav distincte : c'est une vue filtrée (Track=Label) de Projects (ADR-006 pt.2).
// Tâches/Finance sont des vues agrégées inter-projets, ajoutées après Orbit.
const NAV_ITEMS = [
  { href: '/dashboard', label: 'Home', Icon: IconHome },
  { href: '/clients', label: 'Client', Icon: IconClient },
  { href: '/projets', label: 'Projects', Icon: IconProjects },
  { href: '/orbit', label: 'Orbit', Icon: IconOrbit },
  { href: '/taches', label: 'Tâches', Icon: IconTasks },
  { href: '/finance', label: 'Finance', Icon: IconFinance },
  { href: '/knowledge-hub', label: 'Knowledge Hub', Icon: IconKnowledge },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex w-64 shrink-0 flex-col gap-6 p-4">
      <div className="flex items-center gap-2.5 px-2 pt-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent font-display text-sm text-bg">
          M
        </span>
        <span className="font-display text-base tracking-tight text-fg">MATN</span>
      </div>

      <div className="flex flex-col gap-0.5">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
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
  );
}
