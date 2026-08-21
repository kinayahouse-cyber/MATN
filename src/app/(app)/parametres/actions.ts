'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/current-user';
import type { Prisma } from '@prisma/client';

const AGENCE_INFO_EDITABLE_FIELDS = [
  'nom',
  'adresse',
  'email',
  'telephone',
  'nif',
  'nis',
  'rc',
  'ai',
  'banqueNom',
  'rib',
  'conditionsPaiement',
] as const;
type AgenceInfoField = (typeof AGENCE_INFO_EDITABLE_FIELDS)[number];
const AGENCE_INFO_REQUIRED_FIELDS = new Set(['nom']);

export async function updateAgenceInfoField(id: string, field: AgenceInfoField, value: string) {
  await requireAdmin();
  if (!AGENCE_INFO_EDITABLE_FIELDS.includes(field)) throw new Error('Champ invalide');

  const trimmed = value.trim();
  if (!trimmed && AGENCE_INFO_REQUIRED_FIELDS.has(field)) throw new Error('Champ requis');

  await prisma.agenceInfo.update({
    where: { id },
    data: { [field]: trimmed || null } as Prisma.AgenceInfoUpdateInput,
  });

  revalidatePath('/parametres');
}
