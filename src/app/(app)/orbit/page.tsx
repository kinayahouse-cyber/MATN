import { prisma } from '@/lib/prisma';
import { OrbitList } from '@/components/OrbitList';
import { PageHeader } from '@/components/PageHeader';
import { requireAdmin } from '@/lib/auth/current-user';

export const dynamic = 'force-dynamic';

export default async function OrbitPage() {
  await requireAdmin();

  const fournisseurs = await prisma.fournisseur.findMany({ orderBy: { nom: 'asc' } });

  return (
    <div>
      <PageHeader
        title="Orbit"
        meta="Annuaire des fournisseurs et intervenants — pas de rattachement Projet en MVP (ADR-008)"
      />
      <OrbitList fournisseurs={fournisseurs} />
    </div>
  );
}
