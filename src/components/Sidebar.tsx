import Link from 'next/link';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Tableau de bord' },
  { href: '/clients', label: 'Clients' },
  { href: '/projets', label: 'Projets' },
  { href: '/label', label: 'Label Workspace' },
  { href: '/orbit', label: 'Orbit' },
  { href: '/decisions', label: 'Décisions' },
  { href: '/documents', label: 'Documents' },
  { href: '/recherche', label: 'Recherche' },
];

export function Sidebar() {
  return (
    <nav className="flex w-56 shrink-0 flex-col gap-1 border-r border-neutral-800 p-4">
      <span className="mb-4 px-2 text-sm font-medium text-neutral-400">Matn</span>
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="rounded-md px-2 py-1.5 text-sm text-neutral-300 hover:bg-neutral-900 hover:text-neutral-100"
        >
          {item.label}
        </Link>
      ))}
      <form action="/api/auth/logout" method="post" className="mt-auto pt-4">
        <button
          type="submit"
          className="w-full rounded-md px-2 py-1.5 text-left text-sm text-neutral-500 hover:bg-neutral-900 hover:text-neutral-100"
        >
          Se déconnecter
        </button>
      </form>
    </nav>
  );
}
