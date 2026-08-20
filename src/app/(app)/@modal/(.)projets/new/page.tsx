import { prisma } from '@/lib/prisma';
import { ProjetForm } from '@/components/ProjetForm';
import { SlideOver } from '@/components/SlideOver';
import { requireAdmin } from '@/lib/auth/current-user';

export const dynamic = 'force-dynamic';

export default async function NewProjetModal() {
  await requireAdmin();
  const clients = await prisma.organisation.findMany({ orderBy: { nom: 'asc' } });

  return (
    <SlideOver>
      <ProjetForm clients={clients} />
    </SlideOver>
  );
}
