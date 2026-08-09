import Link from 'next/link';

const LINKS = [
  { href: '/clients', label: 'Client' },
  { href: '/projets', label: 'Projects' },
  { href: '/orbit', label: 'Orbit' },
  { href: '/knowledge-hub', label: 'Knowledge Hub' },
];

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-xl font-medium">Tableau de bord</h1>
      <p className="mt-2 text-sm text-neutral-400">Socle en place — navigation minimale ci-dessous.</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-md border border-neutral-800 p-4 text-sm hover:border-neutral-600"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
