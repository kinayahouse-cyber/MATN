'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import type { TypeOrganisation, Track, CanalContact, Registre, Prisma } from '@prisma/client';

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

const ORGANISATION_EDITABLE_FIELDS = [
  'nom',
  'type',
  'etatProspection',
  'secteur',
  'track',
  'nif',
  'nis',
  'rc',
  'ai',
  'rib',
  'notes',
] as const;
type OrganisationField = (typeof ORGANISATION_EDITABLE_FIELDS)[number];
const ORGANISATION_REQUIRED_FIELDS = new Set(['nom', 'type', 'etatProspection']);

export async function updateOrganisationField(id: string, field: OrganisationField, value: string) {
  if (!ORGANISATION_EDITABLE_FIELDS.includes(field)) throw new Error('Champ invalide');

  const trimmed = value.trim();
  if (!trimmed && ORGANISATION_REQUIRED_FIELDS.has(field)) throw new Error('Champ requis');

  await prisma.organisation.update({
    where: { id },
    data: { [field]: trimmed || null } as Prisma.OrganisationUpdateInput,
  });

  revalidatePath('/clients');
  revalidatePath(`/clients/${id}`);
}

export async function deleteOrganisation(id: string) {
  await prisma.organisation.delete({ where: { id } });
  revalidatePath('/clients');
  redirect('/clients');
}

const CONTACT_EDITABLE_FIELDS = [
  'nom',
  'role',
  'canal',
  'registre',
  'email',
  'telephone',
  'notes',
] as const;
type ContactField = (typeof CONTACT_EDITABLE_FIELDS)[number];
const CONTACT_REQUIRED_FIELDS = new Set(['nom', 'canal', 'registre']);

export async function updateContactField(id: string, field: ContactField, value: string) {
  if (!CONTACT_EDITABLE_FIELDS.includes(field)) throw new Error('Champ invalide');

  const trimmed = value.trim();
  if (!trimmed && CONTACT_REQUIRED_FIELDS.has(field)) throw new Error('Champ requis');

  const contact = await prisma.contact.update({
    where: { id },
    data: { [field]: trimmed || null } as Prisma.ContactUpdateInput,
  });

  if (contact.organisationId) revalidatePath(`/clients/${contact.organisationId}`);
}

export async function deleteContact(id: string) {
  const contact = await prisma.contact.delete({ where: { id } });
  if (contact.organisationId) revalidatePath(`/clients/${contact.organisationId}`);
}
