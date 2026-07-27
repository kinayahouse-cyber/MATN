'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

export async function createDevis(formData: FormData) {
  const projetId = String(formData.get('projetId') ?? '');
  if (!projetId) return;

  const count = await prisma.devis.count();
  const numero = `DEV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

  const libelles = formData.getAll('ligneLibelle') as string[];
  const quantites = formData.getAll('ligneQuantite') as string[];
  const prix = formData.getAll('lignePrix') as string[];

  const lignes = libelles
    .map((libelle, i) => ({
      libelle,
      quantite: Number(quantites[i] || 1),
      prixUnitaire: Number(prix[i] || 0),
      ordre: i,
    }))
    .filter((l) => l.libelle.trim());

  await prisma.devis.create({
    data: {
      projetId,
      numero,
      lignes: { create: lignes },
    },
  });

  revalidatePath('/argent');
  revalidatePath(`/projets/${projetId}`);
}

export async function updateDevisStatut(formData: FormData) {
  const id = String(formData.get('id') ?? '');
  const statut = formData.get('statut') as any;
  if (!id || !statut) return;
  await prisma.devis.update({ where: { id }, data: { statut } });
  revalidatePath('/argent');
}

export async function createFacture(formData: FormData) {
  const projetId = String(formData.get('projetId') ?? '');
  const montant = Number(formData.get('montant'));
  if (!projetId || !montant) return;

  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const count = await prisma.facture.count({ where: { numero: { startsWith: `FAC-${yyyy}-${mm}-` } } });
  const numero = `FAC-${yyyy}-${mm}-${String(count + 1).padStart(3, '0')}`;

  await prisma.facture.create({
    data: {
      projetId,
      numero,
      montant,
      exonerationTva: formData.get('exonerationTva') === 'on',
      dateEcheance: formData.get('dateEcheance') ? new Date(String(formData.get('dateEcheance'))) : null,
    },
  });

  revalidatePath('/argent');
  revalidatePath(`/projets/${projetId}`);
}

export async function createPaiement(formData: FormData) {
  const factureId = String(formData.get('factureId') ?? '');
  const montant = Number(formData.get('montant'));
  if (!factureId || !montant) return;

  await prisma.paiement.create({
    data: { factureId, montant, moyen: (formData.get('moyen') as string) || null },
  });

  const facture = await prisma.facture.findUnique({
    where: { id: factureId },
    include: { paiements: true },
  });
  if (facture) {
    const totalPaye = facture.paiements.reduce((s, p) => s + Number(p.montant), 0);
    const statut = totalPaye >= Number(facture.montant) ? 'PAYEE' : totalPaye > 0 ? 'PARTIELLEMENT_PAYEE' : 'EMISE';
    await prisma.facture.update({ where: { id: factureId }, data: { statut } });
  }

  revalidatePath('/argent');
}

export async function createDepenseGenerale(formData: FormData) {
  const categorie = String(formData.get('categorie') ?? '').trim();
  const montant = Number(formData.get('montant'));
  if (!categorie || !montant) return;
  await prisma.depense.create({ data: { categorie, montant } });
  revalidatePath('/argent');
}
