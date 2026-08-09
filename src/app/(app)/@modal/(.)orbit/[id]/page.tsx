import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { FournisseurDetail } from '@/components/FournisseurDetail';
import { SlideOver } from '@/components/SlideOver';

export default async function FournisseurModal({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const fournisseur = await prisma.fournisseur.findUnique({ where: { id } });
  if (!fournisseur) notFound();

  return (
    <SlideOver>
      <FournisseurDetail fournisseur={fournisseur} />
    </SlideOver>
  );
}
