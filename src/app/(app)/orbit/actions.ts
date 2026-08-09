'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

export async function createFournisseur(formData: FormData) {
  const nom = String(formData.get('nom') ?? '').trim();
  if (!nom) throw new Error('Nom requis');

  const categorie = String(formData.get('categorie') ?? '').trim() || null;
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
