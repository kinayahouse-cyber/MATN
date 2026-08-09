import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { ClientsList } from '@/components/ClientsList';

export const dynamic = 'force-dynamic';

export default async function ClientsPage() {
  const clients = await prisma.organisation.findMany({ orderBy: { nom: 'asc' } });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-medium">Client</h1>
        <Link
          href="/clients/new"
          className="rounded-md border border-neutral-800 px-3 py-1.5 text-sm hover:border-neutral-600"
        >
          + Nouveau
        </Link>
      </div>

      <ClientsList clients={clients} />
    </div>
  );
}
