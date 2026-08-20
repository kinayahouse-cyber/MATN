import { prisma } from '@/lib/prisma';
import { ClientsList } from '@/components/ClientsList';
import { PageHeader } from '@/components/PageHeader';
import { requireAdmin } from '@/lib/auth/current-user';

export const dynamic = 'force-dynamic';

export default async function ClientsPage() {
  await requireAdmin();

  const clients = await prisma.organisation.findMany({ orderBy: { nom: 'asc' } });

  return (
    <div>
      <PageHeader
        title="Clients"
        meta={`${clients.length} client${clients.length > 1 ? 's' : ''}`}
      />
      <ClientsList clients={clients} />
    </div>
  );
}
