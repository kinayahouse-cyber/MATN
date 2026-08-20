import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { FournisseurDetail } from '@/components/FournisseurDetail';
import { requireAdmin } from '@/lib/auth/current-user';

export default async function FournisseurPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const fournisseur = await prisma.fournisseur.findUnique({ where: { id } });
  if (!fournisseur) notFound();

  return <FournisseurDetail fournisseur={fournisseur} />;
}
