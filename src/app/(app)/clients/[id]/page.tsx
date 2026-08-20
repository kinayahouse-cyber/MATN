import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ClientDetail } from '@/components/ClientDetail';
import { requireAdmin } from '@/lib/auth/current-user';

export const dynamic = 'force-dynamic';

export default async function ClientPage({ params }: { params: Promise<{ id: string }> }) {
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
    <div className="max-w-2xl">
      <ClientDetail client={client} />
    </div>
  );
}
