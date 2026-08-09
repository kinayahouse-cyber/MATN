'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// IA alignée sur le wireframe Project Workspace (Figma, 08/08) : Décisions/Documents/Recherche
// se regroupent sous Knowledge Hub plutôt que d'être des items séparés. Label Workspace n'est pas
// une entrée de nav distincte : c'est une vue filtrée (Track=Label) de Projects (ADR-006 pt.2).
// Tasks a rejoint la nav (spec front-end) — vue transverse à venir en Phase 4, distincte des
// tâches par projet déjà dans le Project Workspace.
const NAV_ITEMS = [
  { href: '/dashboard', label: 'Home' },
  { href: '/clients', label: 'Clients' },
  { href: '/projets', label: 'Projects' },
  { href: '/orbit', label: 'Orbit' },
  { href: '/taches', label: 'Tasks' },
  { href: '/knowledge-hub', label: 'Knowledge Hub' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex w-52 shrink-0 flex-col gap-0.5 px-4 py-6">
      <span className="mb-8 px-2 font-display text-sm tracking-tight text-fg">MATN</span>
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 px-2 py-1.5 text-sm transition-colors duration-fast ${
              active ? 'text-fg' : 'text-muted hover:text-fg'
            }`}
          >
            <span
              className={`h-1 w-1 shrink-0 rounded-full transition-colors duration-fast ${
                active ? 'bg-accent' : 'bg-transparent'
              }`}
            />
            {item.label}
          </Link>
        );
      })}
      <form action="/api/auth/logout" method="post" className="mt-auto pt-6">
        <button
          type="submit"
          className="w-full px-2 py-1.5 text-left text-xs text-muted transition-colors duration-fast hover:text-fg"
        >
          Se déconnecter
        </button>
      </form>
    </nav>
  );
}
