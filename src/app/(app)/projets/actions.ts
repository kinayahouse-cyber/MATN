'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export async function createProjet(formData: FormData) {
  const nom = String(formData.get('nom') ?? '').trim();
  const division = formData.get('division') as any;
  if (!nom || !division) return;

  const letter = { STUDIO: 'S', ATELIER: 'A', LABEL: 'L', GENERALITES: 'G' }[division as string];
  const year = new Date().getFullYear().toString().slice(-2);
  const count = await prisma.projet.count({ where: { code: { startsWith: `KIN-${year}-${letter}-` } } });
  const code = `KIN-${year}-${letter}-${String(count + 1).padStart(3, '0')}`;

  const organisationId = formData.get('organisationId');

  const projet = await prisma.projet.create({
    data: {
      code,
      nom,
      division,
      engagement: (formData.get('engagement') as any) || null,
      budget: formData.get('budget') ? Number(formData.get('budget')) : null,
      organisationId: organisationId ? String(organisationId) : null,
    },
  });

  revalidatePath('/projets');
  redirect(`/projets/${projet.id}`);
}

export async function updateProjetStade(formData: FormData) {
  const id = String(formData.get('id') ?? '');
  const stade = formData.get('stade') as any;
  if (!id || !stade) return;
  await prisma.projet.update({ where: { id }, data: { stade } });
  revalidatePath(`/projets/${id}`);
  revalidatePath('/projets');
}

export async function createConcept(formData: FormData) {
  const projetId = String(formData.get('projetId') ?? '');
  const contenu = String(formData.get('contenu') ?? '').trim();
  if (!projetId || !contenu) return;
  await prisma.concept.create({
    data: { projetId, contenu, titre: (formData.get('titre') as string) || null },
  });
  revalidatePath(`/projets/${projetId}`);
}

export async function createTache(formData: FormData) {
  const projetId = String(formData.get('projetId') ?? '');
  const libelle = String(formData.get('libelle') ?? '').trim();
  if (!projetId || !libelle) return;
  await prisma.tache.create({
    data: {
      projetId,
      libelle,
      echeance: formData.get('echeance') ? new Date(String(formData.get('echeance'))) : null,
    },
  });
  revalidatePath(`/projets/${projetId}`);
}

export async function updateTacheStatut(formData: FormData) {
  const id = String(formData.get('id') ?? '');
  const projetId = String(formData.get('projetId') ?? '');
  const statut = formData.get('statut') as any;
  if (!id || !statut) return;
  await prisma.tache.update({ where: { id }, data: { statut } });
  revalidatePath(`/projets/${projetId}`);
}

export async function createDepense(formData: FormData) {
  const projetId = String(formData.get('projetId') ?? '');
  const categorie = String(formData.get('categorie') ?? '').trim();
  const montant = Number(formData.get('montant'));
  if (!projetId || !categorie || !montant) return;
  await prisma.depense.create({ data: { projetId, categorie, montant } });
  revalidatePath(`/projets/${projetId}`);
}
