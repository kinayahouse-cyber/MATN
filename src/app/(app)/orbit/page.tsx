import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { OrbitList } from '@/components/OrbitList';
import { PageHeader } from '@/components/PageHeader';

export const dynamic = 'force-dynamic';

export default async function OrbitPage() {
  const fournisseurs = await prisma.fournisseur.findMany({ orderBy: { nom: 'asc' } });

  return (
    <div>
      <PageHeader
        title="Orbit"
        meta="Annuaire des fournisseurs et intervenants — pas de rattachement Projet en MVP (ADR-008)"
        actions={
          <Link href="/orbit/new" className="text-sm text-muted hover:text-fg">
            + Nouveau
          </Link>
        }
      />
      <OrbitList fournisseurs={fournisseurs} />
    </div>
  );
}
