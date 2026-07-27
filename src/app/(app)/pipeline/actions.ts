'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export async function createOrganisation(formData: FormData) {
  const nom = String(formData.get('nom') ?? '').trim();
  if (!nom) return;
  await prisma.organisation.create({
    data: {
      nom,
      type: (formData.get('type') as any) || 'CLIENT_DIRECT',
      secteur: (formData.get('secteur') as string) || null,
    },
  });
  revalidatePath('/pipeline');
}

export async function createOpportunite(formData: FormData) {
  const titre = String(formData.get('titre') ?? '').trim();
  const organisationId = String(formData.get('organisationId') ?? '');
  if (!titre || !organisationId) return;

  await prisma.opportunite.create({
    data: {
      titre,
      organisationId,
      divisionPressentie: (formData.get('divisionPressentie') as any) || null,
      valeurEstimee: formData.get('valeurEstimee') ? Number(formData.get('valeurEstimee')) : null,
    },
  });
  revalidatePath('/pipeline');
}

export async function updateOpportuniteStatut(formData: FormData) {
  const id = String(formData.get('id') ?? '');
  const statut = formData.get('statut') as any;
  if (!id || !statut) return;
  await prisma.opportunite.update({ where: { id }, data: { statut } });
  revalidatePath('/pipeline');
}

export async function convertOpportuniteToProjet(formData: FormData) {
  const id = String(formData.get('id') ?? '');
  const opp = await prisma.opportunite.findUnique({ where: { id } });
  if (!opp) return;

  const division = opp.divisionPressentie ?? 'GENERALITES';
  const letter = { STUDIO: 'S', ATELIER: 'A', LABEL: 'L', GENERALITES: 'G' }[division];
  const year = new Date().getFullYear().toString().slice(-2);
  const count = await prisma.projet.count({ where: { code: { startsWith: `KIN-${year}-${letter}-` } } });
  const code = `KIN-${year}-${letter}-${String(count + 1).padStart(3, '0')}`;

  const projet = await prisma.projet.create({
    data: {
      code,
      nom: opp.titre,
      division,
      budget: opp.valeurEstimee,
      organisationId: opp.organisationId,
    },
  });

  await prisma.opportunite.update({
    where: { id },
    data: { statut: 'GAGNEE', projetId: projet.id },
  });

  revalidatePath('/pipeline');
  redirect(`/projets/${projet.id}`);
}
