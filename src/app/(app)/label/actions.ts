'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export async function createProductionLabel(formData: FormData) {
  const titre = String(formData.get('titre') ?? '').trim();
  if (!titre) return;

  const count = await prisma.productionLabel.count();
  const code = `KIN-26-L-${String(count + 1).padStart(3, '0')}`;

  const production = await prisma.productionLabel.create({
    data: {
      code,
      titre,
      format: (formData.get('format') as string) || null,
      budgetAlloue: formData.get('budgetAlloue') ? Number(formData.get('budgetAlloue')) : null,
    },
  });

  revalidatePath('/label');
  redirect(`/label/${production.id}`);
}

export async function updateStadeProduction(formData: FormData) {
  const id = String(formData.get('id') ?? '');
  const stadeProduction = formData.get('stadeProduction') as any;
  if (!id || !stadeProduction) return;
  await prisma.productionLabel.update({ where: { id }, data: { stadeProduction } });
  revalidatePath(`/label/${id}`);
  revalidatePath('/label');
}

export async function createSectionDossier(formData: FormData) {
  const productionLabelId = String(formData.get('productionLabelId') ?? '');
  const type = formData.get('type') as any;
  const contenu = String(formData.get('contenu') ?? '').trim();
  if (!productionLabelId || !type) return;
  await prisma.sectionDossier.create({
    data: { productionLabelId, type, contenu, titre: (formData.get('titre') as string) || null },
  });
  revalidatePath(`/label/${productionLabelId}`);
}

export async function createAsset(formData: FormData) {
  const productionLabelId = String(formData.get('productionLabelId') ?? '');
  const nom = String(formData.get('nom') ?? '').trim();
  const url = String(formData.get('url') ?? '').trim();
  const type = formData.get('type') as any;
  if (!productionLabelId || !nom || !url || !type) return;
  await prisma.asset.create({ data: { productionLabelId, nom, url, type } });
  revalidatePath(`/label/${productionLabelId}`);
}

export async function createTacheLabel(formData: FormData) {
  const productionLabelId = String(formData.get('productionLabelId') ?? '');
  const libelle = String(formData.get('libelle') ?? '').trim();
  if (!productionLabelId || !libelle) return;
  await prisma.tache.create({
    data: {
      productionLabelId,
      libelle,
      echeance: formData.get('echeance') ? new Date(String(formData.get('echeance'))) : null,
    },
  });
  revalidatePath(`/label/${productionLabelId}`);
}

export async function updateTacheLabelStatut(formData: FormData) {
  const id = String(formData.get('id') ?? '');
  const productionLabelId = String(formData.get('productionLabelId') ?? '');
  const statut = formData.get('statut') as any;
  if (!id || !statut) return;
  await prisma.tache.update({ where: { id }, data: { statut } });
  revalidatePath(`/label/${productionLabelId}`);
}

export async function createDepenseLabel(formData: FormData) {
  const productionLabelId = String(formData.get('productionLabelId') ?? '');
  const categorie = String(formData.get('categorie') ?? '').trim();
  const montant = Number(formData.get('montant'));
  if (!productionLabelId || !categorie || !montant) return;
  await prisma.depense.create({ data: { productionLabelId, categorie, montant } });
  revalidatePath(`/label/${productionLabelId}`);
}
