'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { uploadToStorage } from '@/lib/supabase/admin';
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
// Rien n'est requis : la dénomination sociale et les identifiants légaux restent vides tant que
// l'admin ne les a pas saisis (pas de "Kinaya" par défaut, voir schema.prisma).

export async function updateAgenceInfoField(id: string, field: AgenceInfoField, value: string) {
  await requireAdmin();
  if (!AGENCE_INFO_EDITABLE_FIELDS.includes(field)) throw new Error('Champ invalide');

  const trimmed = value.trim();

  await prisma.agenceInfo.update({
    where: { id },
    data: { [field]: trimmed || null } as Prisma.AgenceInfoUpdateInput,
  });

  revalidatePath('/parametres');
}

// Logo affiché en grand en pied des devis/factures imprimés — même mécanique que addAsset/
// addDocument (upload direct vers Supabase Storage, pas de champ de formulaire caché superflu).
export async function updateAgenceLogo(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get('id') ?? '').trim();
  const file = formData.get('file');
  if (!id || !(file instanceof File) || file.size === 0) throw new Error('Fichier requis');

  const url = await uploadToStorage(file, 'agence/logo');

  await prisma.agenceInfo.update({ where: { id }, data: { logoUrl: url } });
  revalidatePath('/parametres');
}
