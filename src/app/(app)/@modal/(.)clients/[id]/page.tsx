import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ClientDetail } from '@/components/ClientDetail';
import { SlideOver } from '@/components/SlideOver';

export const dynamic = 'force-dynamic';

export default async function ClientModal({ params }: { params: Promise<{ id: string }> }) {
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
