'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { uploadToStorage } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/current-user';
import type { Track, Engagement, TypeDocument, TypeAsset, StadeProjet, StatutTache, Prisma } from '@prisma/client';

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

export async function addDocument(formData: FormData) {
  const projetId = String(formData.get('projetId') ?? '').trim();
  const type = String(formData.get('type') ?? '').trim() as TypeDocument;
  if (!projetId || !type) throw new Error('Champs requis manquants');

  const numero = String(formData.get('numero') ?? '').trim() || null;
  const file = formData.get('file');
  let url = String(formData.get('url') ?? '').trim() || null;
  if (file instanceof File && file.size > 0) {
    url = await uploadToStorage(file, `projets/${projetId}/documents`);
  }

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

// ---------------------------------------------------------------------------
// Devis — Document de type DEVIS + ses LigneDocument (déjà prévues par le schéma, jamais
// exposées côté UI jusqu'ici : addDocument ne fait qu'attacher un fichier/lien, sans lignes
// chiffrées). Réservé à ADMIN, comme le reste du financier.
// ---------------------------------------------------------------------------

export async function createDevis(formData: FormData) {
  await requireAdmin();
  const projetId = String(formData.get('projetId') ?? '').trim();
  if (!projetId) throw new Error('Projet requis');

  const devis = await prisma.document.create({
    data: { projetId, type: 'DEVIS', statut: 'BROUILLON' },
  });

  revalidatePath(`/projets/${projetId}`);
  redirect(`/projets/${projetId}/devis/${devis.id}`);
}

export async function addLigneDocument(documentId: string, libelle: string, quantite: string, prixUnitaire: string) {
  await requireAdmin();
  const trimmedLibelle = libelle.trim();
  const parsedQuantite = quantite.trim() ? Number(quantite) : 1;
  const parsedPrix = Number(prixUnitaire);
  if (!trimmedLibelle || !prixUnitaire.trim() || Number.isNaN(parsedPrix) || Number.isNaN(parsedQuantite)) {
    throw new Error('Champs requis manquants');
  }

  const count = await prisma.ligneDocument.count({ where: { documentId } });

  const ligne = await prisma.ligneDocument.create({
    data: {
      documentId,
      libelle: trimmedLibelle,
      quantite: parsedQuantite,
      prixUnitaire: parsedPrix,
      ordre: count,
    },
  });

  const document = await prisma.document.findUnique({ where: { id: documentId } });
  if (document?.projetId) revalidatePath(`/projets/${document.projetId}/devis/${documentId}`);
  return ligne.id;
}

const LIGNE_DOCUMENT_EDITABLE_FIELDS = ['libelle', 'quantite', 'prixUnitaire'] as const;
type LigneDocumentField = (typeof LIGNE_DOCUMENT_EDITABLE_FIELDS)[number];
const LIGNE_DOCUMENT_DECIMAL_FIELDS = new Set(['quantite', 'prixUnitaire']);

export async function updateLigneDocumentField(id: string, field: LigneDocumentField, value: string) {
  await requireAdmin();
  if (!LIGNE_DOCUMENT_EDITABLE_FIELDS.includes(field)) throw new Error('Champ invalide');

  const trimmed = value.trim();
  if (!trimmed) throw new Error('Champ requis');

  const parsed: string | number = LIGNE_DOCUMENT_DECIMAL_FIELDS.has(field) ? Number(trimmed) : trimmed;
  if (LIGNE_DOCUMENT_DECIMAL_FIELDS.has(field) && Number.isNaN(parsed)) throw new Error('Valeur invalide');

  const ligne = await prisma.ligneDocument.update({
    where: { id },
    data: { [field]: parsed } as Prisma.LigneDocumentUpdateInput,
    include: { document: { select: { projetId: true } } },
  });

  if (ligne.document.projetId) revalidatePath(`/projets/${ligne.document.projetId}/devis/${ligne.documentId}`);
}

export async function deleteLigneDocument(id: string) {
  await requireAdmin();
  const ligne = await prisma.ligneDocument.delete({
    where: { id },
    include: { document: { select: { projetId: true } } },
  });
  if (ligne.document.projetId) revalidatePath(`/projets/${ligne.document.projetId}/devis/${ligne.documentId}`);
}

// Variante de deleteDocument avec redirection : contrairement à la suppression depuis l'onglet
// Files (on reste sur la page projet), supprimer depuis l'éditeur de devis fait disparaître la
// page en cours — sans redirect, DeleteButton laisserait l'utilisateur sur une route qui n'existe
// plus.
export async function deleteDevis(id: string, projetId: string) {
  await requireAdmin();
  await prisma.document.delete({ where: { id } });
  revalidatePath(`/projets/${projetId}`);
  redirect(`/projets/${projetId}`);
}

export async function addAsset(formData: FormData) {
  const projetId = String(formData.get('projetId') ?? '').trim();
  const type = String(formData.get('type') ?? '').trim() as TypeAsset;
  const nom = String(formData.get('nom') ?? '').trim();
  const sourceGenerateurIa = formData.get('sourceGenerateurIa') === 'on';
  const file = formData.get('file');
  if (!projetId || !type || !nom || !(file instanceof File) || file.size === 0) {
    throw new Error('Champs requis manquants');
  }

  const url = await uploadToStorage(file, `projets/${projetId}/assets`);

  await prisma.asset.create({
    data: { projetId, type, nom, url, sourceGenerateurIa },
  });

  revalidatePath(`/projets/${projetId}`);
}

const ASSET_EDITABLE_FIELDS = ['nom', 'type', 'sourceGenerateurIa'] as const;
type AssetField = (typeof ASSET_EDITABLE_FIELDS)[number];

export async function updateAssetField(id: string, field: AssetField, value: string) {
  if (!ASSET_EDITABLE_FIELDS.includes(field)) throw new Error('Champ invalide');

  const trimmed = value.trim();
  if (!trimmed && field !== 'sourceGenerateurIa') throw new Error('Champ requis');

  const data: Prisma.AssetUpdateInput =
    field === 'sourceGenerateurIa' ? { sourceGenerateurIa: trimmed === 'true' } : { [field]: trimmed };

  const asset = await prisma.asset.update({ where: { id }, data });
  revalidatePath(`/projets/${asset.projetId}`);
}

export async function deleteAsset(id: string) {
  const asset = await prisma.asset.delete({ where: { id } });
  revalidatePath(`/projets/${asset.projetId}`);
}

const PROJET_EDITABLE_FIELDS = [
  'nom',
  'description',
  'track',
  'engagement',
  'stade',
  'budget',
  'budgetInterne',
  'budgetEncaisse',
  'dateDebut',
  'dateFinPrevue',
  'organisationId',
  'stadeLabel',
  'format',
  'statutDiffusion',
] as const;
type ProjetField = (typeof PROJET_EDITABLE_FIELDS)[number];

const PROJET_DATE_FIELDS = new Set(['dateDebut', 'dateFinPrevue']);
const PROJET_DECIMAL_FIELDS = new Set(['budget', 'budgetInterne', 'budgetEncaisse']);
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
  revalidatePath('/finance');
}

export async function deleteProjet(id: string) {
  await prisma.projet.delete({ where: { id } });
  revalidatePath('/projets');
  redirect('/projets');
}

// Variantes sans redirect, pour les actions groupées depuis la liste (sélection multiple) —
// deleteProjet/updateProjetField redirigent ou sont pensés pour un seul enregistrement à la fois.
export async function deleteProjets(ids: string[]) {
  if (ids.length === 0) return;
  await prisma.projet.deleteMany({ where: { id: { in: ids } } });
  revalidatePath('/projets');
}

export async function moveProjets(ids: string[], stade: string) {
  if (ids.length === 0) return;
  await prisma.projet.updateMany({
    where: { id: { in: ids } },
    data: { stade: stade as StadeProjet },
  });
  revalidatePath('/projets');
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
  assigneAId: string,
  statut?: StatutTache
) {
  const trimmed = libelle.trim();
  if (!trimmed) throw new Error('Libellé requis');

  await prisma.tache.create({
    data: {
      projetId,
      libelle: trimmed,
      echeance: echeance ? new Date(echeance) : null,
      assigneAId: assigneAId || null,
      statut: statut ?? 'A_FAIRE',
    },
  });

  revalidatePath(`/projets/${projetId}`);
}

const TACHE_EDITABLE_FIELDS = [
  'libelle',
  'description',
  'statut',
  'priorite',
  'dateDebut',
  'echeance',
  'assigneAId',
] as const;
type TacheField = (typeof TACHE_EDITABLE_FIELDS)[number];
const TACHE_DATE_FIELDS = new Set(['dateDebut', 'echeance']);
const TACHE_REQUIRED_FIELDS = new Set(['libelle', 'statut', 'priorite']);

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
  revalidatePath('/taches');
}

export async function deleteTache(id: string) {
  const tache = await prisma.tache.delete({ where: { id } });
  revalidatePath(`/projets/${tache.projetId}`);
  revalidatePath('/taches');
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
  revalidatePath('/finance');
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
  revalidatePath('/finance');
}

export async function deleteDepense(id: string) {
  const depense = await prisma.depense.delete({ where: { id } });
  if (depense.projetId) revalidatePath(`/projets/${depense.projetId}`);
  revalidatePath('/finance');
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

// Brief rédigé en blocs typés. Le contenu est validé/normalisé ici plutôt que d'écrire tel quel
// ce que le client envoie : seuls les types de bloc connus sont acceptés.
const BRIEF_BLOCK_TYPES = ['h1', 'h2', 'h3', 'p1', 'p2', 'p3'] as const;
export type BriefBlockType = (typeof BRIEF_BLOCK_TYPES)[number];
export type BriefBlock = { id: string; type: BriefBlockType; text: string };

export async function saveBrief(projetId: string, blocks: BriefBlock[]) {
  const clean = blocks
    .filter((b) => BRIEF_BLOCK_TYPES.includes(b.type))
    .map((b) => ({ id: String(b.id), type: b.type, text: String(b.text ?? '') }));

  await prisma.projet.update({
    where: { id: projetId },
    data: { brief: clean },
  });

  revalidatePath(`/projets/${projetId}`);
}

// ---------------------------------------------------------------------------
// Membres du projet (accès Collaborateur) et portail client — réservés à ADMIN.
// ---------------------------------------------------------------------------

export async function addMembreToProjet(projetId: string, utilisateurId: string) {
  await requireAdmin();
  if (!utilisateurId) throw new Error('Utilisateur requis');

  await prisma.projet.update({
    where: { id: projetId },
    data: { membres: { connect: { id: utilisateurId } } },
  });

  revalidatePath(`/projets/${projetId}`);
}

export async function removeMembreFromProjet(projetId: string, utilisateurId: string) {
  await requireAdmin();

  await prisma.projet.update({
    where: { id: projetId },
    data: { membres: { disconnect: { id: utilisateurId } } },
  });

  revalidatePath(`/projets/${projetId}`);
}

// Lien magique : pas de compte client à créer, juste un jeton opaque dans l'URL. Regénérer
// invalide l'ancien lien (nouveau jeton) ; révoquer le met à NULL sans perdre le reste du projet.
export async function generatePortailToken(projetId: string) {
  await requireAdmin();
  const token = crypto.randomBytes(24).toString('hex');

  await prisma.projet.update({
    where: { id: projetId },
    data: { portailToken: token },
  });

  revalidatePath(`/projets/${projetId}`);
  return token;
}

export async function revokePortailToken(projetId: string) {
  await requireAdmin();

  await prisma.projet.update({
    where: { id: projetId },
    data: { portailToken: null },
  });

  revalidatePath(`/projets/${projetId}`);
}
