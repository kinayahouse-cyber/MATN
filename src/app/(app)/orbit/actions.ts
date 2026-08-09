'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import type { CategorieFournisseur, Prisma } from '@prisma/client';

export async function createFournisseur(formData: FormData) {
  const nom = String(formData.get('nom') ?? '').trim();
  if (!nom) throw new Error('Nom requis');

  const categorieRaw = String(formData.get('categorie') ?? '').trim();
  const categorie = categorieRaw ? (categorieRaw as CategorieFournisseur) : null;
  const contact = String(formData.get('contact') ?? '').trim() || null;
  const email = String(formData.get('email') ?? '').trim() || null;
  const telephone = String(formData.get('telephone') ?? '').trim() || null;
  const notes = String(formData.get('notes') ?? '').trim() || null;

  await prisma.fournisseur.create({
    data: { nom, categorie, contact, email, telephone, notes },
  });

  revalidatePath('/orbit');
  redirect('/orbit');
}

const FOURNISSEUR_EDITABLE_FIELDS = [
  'nom',
  'categorie',
  'contact',
  'email',
  'telephone',
  'notes',
] as const;
type FournisseurField = (typeof FOURNISSEUR_EDITABLE_FIELDS)[number];

export async function updateFournisseurField(id: string, field: FournisseurField, value: string) {
  if (!FOURNISSEUR_EDITABLE_FIELDS.includes(field)) throw new Error('Champ invalide');

  const trimmed = value.trim();
  if (!trimmed && field === 'nom') throw new Error('Nom requis');

  await prisma.fournisseur.update({
    where: { id },
    data: { [field]: trimmed || null } as Prisma.FournisseurUpdateInput,
  });

  revalidatePath('/orbit');
  revalidatePath(`/orbit/${id}`);
}

export async function deleteFournisseur(id: string) {
  await prisma.fournisseur.delete({ where: { id } });
  revalidatePath('/orbit');
  redirect('/orbit');
}
