import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ClientDetail } from '@/components/ClientDetail';
import { SlideOver } from '@/components/SlideOver';
import { requireAdmin } from '@/lib/auth/current-user';

export const dynamic = 'force-dynamic';

export default async function ClientModal({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const client = await prisma.organisation.findUnique({
    where: { id },
    include: {
      contacts: {
        orderBy: { nom: 'asc' },
        include: { projets: { select: { id: true, nom: true } } },
      },
      projets: { orderBy: { createdAt: 'desc' } },
      decisions: { orderBy: { date: 'desc' }, take: 5 },
      notesMatn: { orderBy: { createdAt: 'desc' }, take: 5 },
    },
  });

  if (!client) notFound();

  return (
    <SlideOver>
      <ClientDetail client={client} />
    </SlideOver>
  );
}
