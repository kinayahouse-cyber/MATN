'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import type { Track, Engagement, TypeDocument, Prisma } from '@prisma/client';

export async function createProjet(formData: FormData) {
  const code = String(formData.get('code') ?? '').trim();
  const nom = String(formData.get('nom') ?? '').trim();
  if (!code || !nom) throw new Error('Code et nom requis');

  const organisationId = String(formData.get('organisationId') ?? '').trim() || null;
  const trackRaw = String(formData.get('track') ?? '');
  const engagementRaw = String(formData.get('engagement') ?? '');
  const description = String(formData.get('description') ?? '').trim() || null;

  const projet = await prisma.projet.create({
    data: {
      code,
      nom,
      organisationId,
      track: trackRaw ? (trackRaw as Track) : null,
      engagement: engagementRaw ? (engagementRaw as Engagement) : null,
      description,
    },
  });

  revalidatePath('/projets');
  redirect(`/projets/${projet.id}`);
}

export async function createProjetInline(
  code: string,
  nom: string,
  organisationId: string,
  track: string
) {
  const trimmedCode = code.trim();
  const trimmedNom = nom.trim();
  if (!trimmedCode || !trimmedNom) throw new Error('Code et nom requis');

  await prisma.projet.create({
    data: {
      code: trimmedCode,
      nom: trimmedNom,
      organisationId: organisationId || null,
      track: track ? (track as Track) : null,
    },
  });

  revalidatePath('/projets');
}

export async function addJalon(formData: FormData) {
  const projetId = String(formData.get('projetId') ?? '').trim();
  const libelle = String(formData.get('libelle') ?? '').trim();
  const dateRaw = String(formData.get('date') ?? '').trim();
  if (!projetId || !libelle || !dateRaw) throw new Error('Champs requis manquants');

  await prisma.jalon.create({
    data: { projetId, libelle, date: new Date(dateRaw) },
  });

  revalidatePath(`/projets/${projetId}`);
  redirect(`/projets/${projetId}`);
}

const JALON_EDITABLE_FIELDS = ['libelle', 'date', 'atteint'] as const;
type JalonField = (typeof JALON_EDITABLE_FIELDS)[number];
const JALON_DATE_FIELDS = new Set(['date']);
const JALON_REQUIRED_FIELDS = new Set(['libelle', 'date']);

export async function updateJalonField(id: string, field: JalonField, value: string) {
  if (!JALON_EDITABLE_FIELDS.includes(field)) throw new Error('Champ invalide');

  const trimmed = value.trim();
  if (!trimmed && JALON_REQUIRED_FIELDS.has(field)) throw new Error('Champ requis');

  let parsed: string | boolean | Date | null = trimmed || null;
  if (parsed !== null && JALON_DATE_FIELDS.has(field)) parsed = new Date(trimmed);
  if (field === 'atteint') parsed = trimmed === 'true';

  const jalon = await prisma.jalon.update({
    where: { id },
    data: { [field]: parsed } as Prisma.JalonUpdateInput,
  });

  revalidatePath(`/projets/${jalon.projetId}`);
}

export async function deleteJalon(id: string) {
  const jalon = await prisma.jalon.delete({ where: { id } });
  revalidatePath(`/projets/${jalon.projetId}`);
}

export async function addDocument(formData: FormData) {
  const projetId = String(formData.get('projetId') ?? '').trim();
  const type = String(formData.get('type') ?? '').trim() as TypeDocument;
  if (!projetId || !type) throw new Error('Champs requis manquants');

  const numero = String(formData.get('numero') ?? '').trim() || null;
  const url = String(formData.get('url') ?? '').trim() || null;

  await prisma.document.create({
    data: { projetId, type, numero, url },
  });

  revalidatePath(`/projets/${projetId}`);
  redirect(`/projets/${projetId}`);
}

const DOCUMENT_EDITABLE_FIELDS = ['type', 'numero', 'statut', 'url'] as const;
type DocumentField = (typeof DOCUMENT_EDITABLE_FIELDS)[number];
const DOCUMENT_REQUIRED_FIELDS = new Set(['type', 'statut']);

export async function updateDocumentField(id: string, field: DocumentField, value: string) {
  if (!DOCUMENT_EDITABLE_FIELDS.includes(field)) throw new Error('Champ invalide');

  const trimmed = value.trim();
  if (!trimmed && DOCUMENT_REQUIRED_FIELDS.has(field)) throw new Error('Champ requis');

  const document = await prisma.document.update({
    where: { id },
    data: { [field]: trimmed || null } as Prisma.DocumentUpdateInput,
  });

  if (document.projetId) revalidatePath(`/projets/${document.projetId}`);
}

export async function deleteDocument(id: string) {
  const document = await prisma.document.delete({ where: { id } });
  if (document.projetId) revalidatePath(`/projets/${document.projetId}`);
}

const PROJET_EDITABLE_FIELDS = [
  'nom',
  'description',
  'track',
  'engagement',
  'stade',
  'budget',
  'budgetInterne',
  'dateDebut',
  'dateFinPrevue',
  'organisationId',
  'stadeLabel',
  'format',
  'statutDiffusion',
] as const;
type ProjetField = (typeof PROJET_EDITABLE_FIELDS)[number];

const PROJET_DATE_FIELDS = new Set(['dateDebut', 'dateFinPrevue']);
const PROJET_DECIMAL_FIELDS = new Set(['budget', 'budgetInterne']);
const PROJET_REQUIRED_FIELDS = new Set(['nom', 'stade']);

export async function updateProjetField(id: string, field: ProjetField, value: string) {
  if (!PROJET_EDITABLE_FIELDS.includes(field)) throw new Error('Champ invalide');

  const trimmed = value.trim();
  if (!trimmed && PROJET_REQUIRED_FIELDS.has(field)) throw new Error('Champ requis');

  let parsed: string | number | Date | null = trimmed || null;
  if (parsed !== null && PROJET_DATE_FIELDS.has(field)) parsed = new Date(trimmed);
  if (parsed !== null && PROJET_DECIMAL_FIELDS.has(field)) parsed = Number(trimmed);

  await prisma.projet.update({
    where: { id },
    data: { [field]: parsed } as Prisma.ProjetUpdateInput,
  });

  revalidatePath('/projets');
  revalidatePath(`/projets/${id}`);
}

export async function deleteProjet(id: string) {
  await prisma.projet.delete({ where: { id } });
  revalidatePath('/projets');
  redirect('/projets');
}

export async function addContactToProjet(projetId: string, contactId: string) {
  if (!contactId) throw new Error('Contact requis');

  await prisma.projet.update({
    where: { id: projetId },
    data: { contacts: { connect: { id: contactId } } },
  });

  revalidatePath(`/projets/${projetId}`);
}

export async function removeContactFromProjet(projetId: string, contactId: string) {
  await prisma.projet.update({
    where: { id: projetId },
    data: { contacts: { disconnect: { id: contactId } } },
  });

  revalidatePath(`/projets/${projetId}`);
}

export async function createTacheInline(
  projetId: string,
  libelle: string,
  echeance: string,
  assigneAId: string
) {
  const trimmed = libelle.trim();
  if (!trimmed) throw new Error('Libellé requis');

  await prisma.tache.create({
    data: {
      projetId,
      libelle: trimmed,
      echeance: echeance ? new Date(echeance) : null,
      assigneAId: assigneAId || null,
    },
  });

  revalidatePath(`/projets/${projetId}`);
}

const TACHE_EDITABLE_FIELDS = [
  'libelle',
  'description',
  'statut',
  'echeance',
  'assigneAId',
] as const;
type TacheField = (typeof TACHE_EDITABLE_FIELDS)[number];
const TACHE_DATE_FIELDS = new Set(['echeance']);
const TACHE_REQUIRED_FIELDS = new Set(['libelle', 'statut']);

export async function updateTacheField(id: string, field: TacheField, value: string) {
  if (!TACHE_EDITABLE_FIELDS.includes(field)) throw new Error('Champ invalide');

  const trimmed = value.trim();
  if (!trimmed && TACHE_REQUIRED_FIELDS.has(field)) throw new Error('Champ requis');

  let parsed: string | Date | null = trimmed || null;
  if (parsed !== null && TACHE_DATE_FIELDS.has(field)) parsed = new Date(trimmed);

  const tache = await prisma.tache.update({
    where: { id },
    data: { [field]: parsed } as Prisma.TacheUpdateInput,
  });

  revalidatePath(`/projets/${tache.projetId}`);
}

export async function deleteTache(id: string) {
  const tache = await prisma.tache.delete({ where: { id } });
  revalidatePath(`/projets/${tache.projetId}`);
}

export async function createDepenseInline(projetId: string, categorie: string, montant: string) {
  const trimmedCategorie = categorie.trim();
  const parsedMontant = Number(montant);
  if (!trimmedCategorie || !montant.trim() || Number.isNaN(parsedMontant)) {
    throw new Error('Champs requis manquants');
  }

  await prisma.depense.create({
    data: { projetId, categorie: trimmedCategorie, montant: parsedMontant },
  });

  revalidatePath(`/projets/${projetId}`);
}

const DEPENSE_EDITABLE_FIELDS = ['categorie', 'montant', 'date', 'notes'] as const;
type DepenseField = (typeof DEPENSE_EDITABLE_FIELDS)[number];
const DEPENSE_DATE_FIELDS = new Set(['date']);
const DEPENSE_DECIMAL_FIELDS = new Set(['montant']);
const DEPENSE_REQUIRED_FIELDS = new Set(['categorie', 'montant', 'date']);

export async function updateDepenseField(id: string, field: DepenseField, value: string) {
  if (!DEPENSE_EDITABLE_FIELDS.includes(field)) throw new Error('Champ invalide');

  const trimmed = value.trim();
  if (!trimmed && DEPENSE_REQUIRED_FIELDS.has(field)) throw new Error('Champ requis');

  let parsed: string | number | Date | null = trimmed || null;
  if (parsed !== null && DEPENSE_DATE_FIELDS.has(field)) parsed = new Date(trimmed);
  if (parsed !== null && DEPENSE_DECIMAL_FIELDS.has(field)) parsed = Number(trimmed);

  const depense = await prisma.depense.update({
    where: { id },
    data: { [field]: parsed } as Prisma.DepenseUpdateInput,
  });

  if (depense.projetId) revalidatePath(`/projets/${depense.projetId}`);
}

export async function deleteDepense(id: string) {
  const depense = await prisma.depense.delete({ where: { id } });
  if (depense.projetId) revalidatePath(`/projets/${depense.projetId}`);
}

// Capture à friction minimale (Livrable 06 §3) : intitulé + justification suffisent pour logger
// une Décision ; contexte/optionsEcartees restent optionnels pour ne pas bloquer la capture.
export async function addDecision(formData: FormData) {
  const projetId = String(formData.get('projetId') ?? '').trim();
  const intitule = String(formData.get('intitule') ?? '').trim();
  const justification = String(formData.get('justification') ?? '').trim();
  if (!projetId || !intitule || !justification) throw new Error('Champs requis manquants');

  const contexte = String(formData.get('contexte') ?? '').trim() || null;
  const optionsEcartees = String(formData.get('optionsEcartees') ?? '').trim() || null;

  await prisma.decision.create({
    data: { projetId, intitule, justification, contexte, optionsEcartees },
  });

  revalidatePath(`/projets/${projetId}`);
  redirect(`/projets/${projetId}`);
}

export async function addNote(formData: FormData) {
  const projetId = String(formData.get('projetId') ?? '').trim();
  const contenu = String(formData.get('contenu') ?? '').trim();
  if (!projetId || !contenu) throw new Error('Contenu requis');

  const titre = String(formData.get('titre') ?? '').trim() || null;
  const tag = String(formData.get('tag') ?? '').trim() || null;

  await prisma.note.create({ data: { projetId, contenu, titre, tag } });

  revalidatePath(`/projets/${projetId}`);
  redirect(`/projets/${projetId}`);
}
