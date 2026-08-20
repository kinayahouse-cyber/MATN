import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { FournisseurDetail } from '@/components/FournisseurDetail';
import { SlideOver } from '@/components/SlideOver';
import { requireAdmin } from '@/lib/auth/current-user';

export default async function FournisseurModal({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const fournisseur = await prisma.fournisseur.findUnique({ where: { id } });
  if (!fournisseur) notFound();

  return (
    <SlideOver>
      <FournisseurDetail fournisseur={fournisseur} />
    </SlideOver>
  );
}
