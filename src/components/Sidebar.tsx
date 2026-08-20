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
    <nav className="flex w-64 shrink-0 flex-col gap-6 p-4">
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
  );
}
