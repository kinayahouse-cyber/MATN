'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavItem = { href: string; label: string };
type NavGroup = { caption: string; items: NavItem[] };

const GROUPS: NavGroup[] = [
  { caption: 'Aperçu', items: [{ href: '/dashboard', label: 'Tableau de bord' }] },
  { caption: 'Commercial', items: [{ href: '/pipeline', label: 'Pipeline + CRM' }] },
  {
    caption: 'Production',
    items: [
      { href: '/projets', label: 'Projets' },
      { href: '/timeline', label: 'Timeline' },
      { href: '/calendrier', label: 'Calendrier' },
    ],
  },
  {
    caption: 'Ressources',
    items: [
      { href: '/argent', label: 'Argent' },
      { href: '/label', label: 'Label' },
      { href: '/concepts', label: 'Concepts' },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-[248px] shrink-0 flex-col border-r border-hairline-strong px-4 py-6">
      <div className="mb-8 px-2 font-serif text-[32px] leading-none text-accent">،</div>

      <nav className="flex flex-1 flex-col gap-6 overflow-y-auto">
        {GROUPS.map((group) => (
          <div key={group.caption}>
            <p className="mb-2 px-2 text-label uppercase text-fg-muted">{group.caption}</p>
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`block rounded-sm border-l-2 px-2 py-2 text-body transition-colors ${
                        active
                          ? 'border-accent bg-accent-muted text-fg'
                          : 'border-transparent text-fg-secondary hover:text-fg'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <form action="/api/auth/logout" method="POST" className="px-2">
        <button type="submit" className="k-btn k-btn--ghost -ml-4 text-data">
          Déconnexion
        </button>
      </form>
    </aside>
  );
}
