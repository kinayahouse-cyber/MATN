import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { ClientsList } from '@/components/ClientsList';
import { PageHeader } from '@/components/PageHeader';

export const dynamic = 'force-dynamic';

export default async function ClientsPage() {
  const clients = await prisma.organisation.findMany({ orderBy: { nom: 'asc' } });

  return (
    <div>
      <PageHeader
        title="Clients"
        meta={`${clients.length} client${clients.length > 1 ? 's' : ''}`}
        actions={
          <Link href="/clients/new" className="text-sm text-muted hover:text-fg">
            + Nouveau
          </Link>
        }
      />
      <ClientsList clients={clients} />
    </div>
  );
}
