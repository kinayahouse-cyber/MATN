import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { requireAdmin } from '@/lib/auth/current-user';

const STAT_ACCENTS = [
  'bg-violet-500/10 text-violet-300',
  'bg-sky-500/10 text-sky-300',
  'bg-emerald-500/10 text-emerald-300',
  'bg-amber-500/10 text-amber-300',
];

const LINKS = [
  { href: '/clients', label: 'Client' },
  { href: '/projets', label: 'Projects' },
  { href: '/orbit', label: 'Orbit' },
  { href: '/knowledge-hub', label: 'Knowledge Hub' },
];

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  await requireAdmin();

  const [projetsEnCours, clients, tachesEnCours, documents] = await Promise.all([
    prisma.projet.count({ where: { stade: 'EN_COURS' } }),
    prisma.organisation.count(),
    prisma.tache.count({ where: { statut: { in: ['A_FAIRE', 'EN_COURS'] } } }),
    prisma.document.count(),
  ]);

  const stats = [
    { label: 'Projets en cours', value: projetsEnCours },
    { label: 'Clients', value: clients },
    { label: 'Tâches ouvertes', value: tachesEnCours },
    { label: 'Documents', value: documents },
  ];

  return (
    <div>
      <p className="text-sm text-muted">Vue d&rsquo;ensemble</p>
      <h1 className="mt-1 font-display text-3xl tracking-tight text-fg">Home</h1>

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s, i) => (
          <Card key={s.label} className={STAT_ACCENTS[i % STAT_ACCENTS.length]}>
            <p className="font-display text-3xl tracking-tight">{s.value}</p>
            <p className="mt-1 text-xs opacity-80">{s.label}</p>
          </Card>
        ))}
      </div>

      <p className="mb-3 mt-10 text-xs uppercase tracking-wide text-muted">Navigation</p>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-lg border border-line bg-surface p-4 text-sm text-fg transition-colors duration-fast hover:border-line-strong"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
