export const TRACK_LABELS: Record<string, string> = {
  STUDIO: 'Studio',
  ATELIER: 'Atelier',
  LABEL: 'Label',
};

export const TYPE_ORGANISATION_LABELS: Record<string, string> = {
  CLIENT_DIRECT: 'Client direct',
  AGENCE: 'Agence',
  PRESCRIPTEUR: 'Prescripteur',
};

export const STADE_PROJET_LABELS: Record<string, string> = {
  DEVIS_ENVOYE: 'Devis',
  SIGNE: 'Signé',
  EN_COURS: 'En cours',
  LIVRE: 'Livré',
  CLOS: 'Clos',
  ABANDONNE: 'Abandonné',
};

export const ENGAGEMENT_LABELS: Record<string, string> = {
  LECTURE: 'Lecture',
  IDENTITE: 'Identité',
  FILM: 'Film',
  EDITION: 'Édition',
  CAPSULES: 'Capsules',
  MODULE_ATELIER: 'Module Atelier',
};

export const TYPE_DOCUMENT_LABELS: Record<string, string> = {
  DEVIS: 'Devis',
  CONTRAT: 'Contrat',
  GUIDELINE: 'Guideline',
  LIVRABLE: 'Livrable',
  COMPTE_RENDU: 'Compte-rendu',
};

export const STATUT_DOCUMENT_LABELS: Record<string, string> = {
  BROUILLON: 'Brouillon',
  VALIDE: 'Validé',
  ENVOYE: 'Envoyé',
  SIGNE: 'Signé',
  REFUSE: 'Refusé',
};

export const CATEGORIE_FOURNISSEUR_LABELS: Record<string, string> = {
  CINEMA: 'Cinéma',
  MOTION: 'Motion',
  WEB: 'Web',
  COPYWRITING: 'Copywriting',
  PROJECT_MANAGEMENT: 'Project Management',
  AUTRE: 'Autre',
};

export const STATUT_TACHE_LABELS: Record<string, string> = {
  A_FAIRE: 'À faire',
  EN_COURS: 'En cours',
  FAIT: 'Fait',
};

export const STADE_PRODUCTION_LABEL_LABELS: Record<string, string> = {
  DEVELOPPEMENT: 'Développement',
  PREPROD: 'Préprod',
  PROD: 'Prod',
  DISTRIBUTION: 'Distribution',
  ARCHIVE: 'Archive',
};

export const TYPE_ASSET_LABELS: Record<string, string> = {
  IMAGE: 'Image',
  VIDEO: 'Vidéo',
  SON: 'Son',
  DOC: 'Doc',
};

export const ETAT_PROSPECTION_LABELS: Record<string, string> = {
  A_CONTACTER: 'À contacter',
  CONTACTE: 'Contacté',
  EN_DISCUSSION: 'En discussion',
  PROPOSITION_ENVOYEE: 'Proposition envoyée',
  CLIENT_ACTIF: 'Client actif',
  DORMANT: 'Dormant',
  PERDU: 'Perdu',
};

// Couleur fixe par Track — Studio / Atelier / Label doivent se distinguer d'un coup d'œil,
// donc un mapping explicite plutôt que la couleur dérivée par hash de `Tag`.
export const TRACK_TONE: Record<string, 'sky' | 'amber' | 'fuchsia'> = {
  STUDIO: 'sky',
  ATELIER: 'amber',
  LABEL: 'fuchsia',
};

// Couleur par état de prospection : progression froide → chaude, terminaux neutres/négatifs.
export const ETAT_PROSPECTION_TONE: Record<string, 'slate' | 'sky' | 'violet' | 'amber' | 'emerald' | 'rose'> = {
  A_CONTACTER: 'slate',
  CONTACTE: 'sky',
  EN_DISCUSSION: 'violet',
  PROPOSITION_ENVOYEE: 'amber',
  CLIENT_ACTIF: 'emerald',
  DORMANT: 'slate',
  PERDU: 'rose',
};

// Couleur par stade de production Label : cycle propre (coexiste avec StadeProjet, ADR-008),
// mis en avant sur le Project Workspace Label plutôt que noyé dans un onglet — voir
// ProjectInfoCard.
export const STADE_PRODUCTION_LABEL_TONE: Record<string, 'slate' | 'sky' | 'accent' | 'emerald' | 'neutral'> = {
  DEVELOPPEMENT: 'slate',
  PREPROD: 'sky',
  PROD: 'accent',
  DISTRIBUTION: 'emerald',
  ARCHIVE: 'neutral',
};
