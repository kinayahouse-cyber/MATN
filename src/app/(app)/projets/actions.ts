'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import type { Track, Engagement, StadeProjet, TypeDocument } from '@prisma/client';

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

export async function updateStade(formData: FormData) {
  const projetId = String(formData.get('projetId') ?? '').trim();
  const stade = String(formData.get('stade') ?? '').trim() as StadeProjet;
  if (!projetId || !stade) throw new Error('Champs requis manquants');

  await prisma.projet.update({ where: { id: projetId }, data: { stade } });

  revalidatePath(`/projets/${projetId}`);
  redirect(`/projets/${projetId}`);
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
