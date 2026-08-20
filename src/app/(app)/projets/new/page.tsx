import { prisma } from '@/lib/prisma';
import { ProjetForm } from '@/components/ProjetForm';
import { requireAdmin } from '@/lib/auth/current-user';

export const dynamic = 'force-dynamic';

export default async function NewProjetPage() {
  await requireAdmin();
  const clients = await prisma.organisation.findMany({ orderBy: { nom: 'asc' } });

  return <ProjetForm clients={clients} />;
}
