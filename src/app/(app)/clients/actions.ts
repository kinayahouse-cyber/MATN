'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import type { TypeOrganisation, Track, CanalContact, Registre } from '@prisma/client';

export async function createClient(formData: FormData) {
  const nom = String(formData.get('nom') ?? '').trim();
  if (!nom) throw new Error('Nom requis');

  const type = String(formData.get('type') ?? 'CLIENT_DIRECT') as TypeOrganisation;
  const trackRaw = String(formData.get('track') ?? '');
  const secteur = String(formData.get('secteur') ?? '').trim() || null;

  const client = await prisma.organisation.create({
    data: {
      nom,
      type,
      track: trackRaw ? (trackRaw as Track) : null,
      secteur,
    },
  });

  revalidatePath('/clients');
  redirect(`/clients/${client.id}`);
}

export async function createContact(formData: FormData) {
  const organisationId = String(formData.get('organisationId') ?? '').trim();
  const nom = String(formData.get('nom') ?? '').trim();
  if (!organisationId || !nom) throw new Error('Champs requis manquants');

  const role = String(formData.get('role') ?? '').trim() || null;
  const email = String(formData.get('email') ?? '').trim() || null;
  const telephone = String(formData.get('telephone') ?? '').trim() || null;
  const canal = String(formData.get('canal') ?? 'EMAIL') as CanalContact;
  const registre = String(formData.get('registre') ?? 'VOUS') as Registre;

  await prisma.contact.create({
    data: { organisationId, nom, role, email, telephone, canal, registre },
  });

  revalidatePath(`/clients/${organisationId}`);
  redirect(`/clients/${organisationId}`);
}
