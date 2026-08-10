'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  IconHome,
  IconClient,
  IconProjects,
  IconOrbit,
  IconKnowledge,
} from '@/components/icons/nav';

// IA alignée sur le wireframe Project Workspace (Figma, 08/08) : Décisions/Documents/Recherche
// se regroupent sous Knowledge Hub plutôt que d'être des items séparés. Label Workspace n'est pas
// une entrée de nav distincte : c'est une vue filtrée (Track=Label) de Projects (ADR-006 pt.2).
const NAV_ITEMS = [
  { href: '/dashboard', label: 'Home', Icon: IconHome },
  { href: '/clients', label: 'Client', Icon: IconClient },
  { href: '/projets', label: 'Projects', Icon: IconProjects },
  { href: '/orbit', label: 'Orbit', Icon: IconOrbit },
  { href: '/knowledge-hub', label: 'Knowledge Hub', Icon: IconKnowledge },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex w-56 shrink-0 flex-col py-8">
      <span className="mb-12 px-6 font-display text-lg tracking-tight text-fg">MATN</span>

      <div className="flex flex-col">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname?.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex items-center gap-3 px-6 py-3 text-base transition-colors duration-fast ${
                active ? 'text-fg' : 'text-muted hover:text-fg'
              }`}
            >
              {/* Marqueur d'état actif : barre d'accent sur le bord de la nav */}
              {active && <span className="absolute left-0 top-0 h-full w-1 bg-accent" />}
              <Icon className="h-[18px] w-[18px] shrink-0" />
              {label}
            </Link>
          );
        })}
      </div>

      <form action="/api/auth/logout" method="post" className="mt-auto px-6 pt-8">
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
