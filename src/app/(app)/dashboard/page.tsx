import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';

const LINKS = [
  { href: '/clients', label: 'Clients' },
  { href: '/projets', label: 'Projects' },
  { href: '/orbit', label: 'Orbit' },
  { href: '/taches', label: 'Tasks' },
  { href: '/knowledge-hub', label: 'Knowledge Hub' },
];

export default function DashboardPage() {
  return (
    <div>
      <PageHeader title="Home" meta="Socle en place — navigation minimale ci-dessous" />
      <div className="divide-y divide-line">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="block py-3 text-sm text-muted transition-colors duration-fast hover:text-fg"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
