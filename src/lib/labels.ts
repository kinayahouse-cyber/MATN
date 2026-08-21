export const TRACK_LABELS: Record<string, string> = {
  STUDIO: 'Studio',
  ATELIER: 'Atelier',
  LABEL: 'Label',
};

export const SECTEUR_LABELS: Record<string, string> = {
  ARCHITECTURE: 'Architecture',
  MODE_BEAUTE: 'Mode / Beauté',
  FOOD_BEVERAGE: 'Food & Beverage',
  TECH: 'Tech / Startup',
  COMMUNICATION: 'Communication / Publicité',
  PRODUCTION: 'Production',
  CULTURE_EVENEMENTIEL: 'Culture / Événementiel',
  IMMOBILIER: 'Immobilier',
  INSTITUTIONNEL: 'Institutionnel / Public',
  SANTE: 'Santé',
  EDUCATION: 'Éducation',
  AUTRE: 'Autre',
};

// Couleur fixe par secteur — même logique que Track/État de prospection : une catégorie doit se
// reconnaître d'un coup d'œil, pas dépendre d'une couleur dérivée par hash.
export const SECTEUR_TONE: Record<
  string,
  'sky' | 'fuchsia' | 'amber' | 'violet' | 'emerald' | 'rose' | 'teal' | 'slate'
> = {
  ARCHITECTURE: 'slate',
  MODE_BEAUTE: 'fuchsia',
  FOOD_BEVERAGE: 'amber',
  TECH: 'sky',
  COMMUNICATION: 'violet',
  PRODUCTION: 'teal',
  CULTURE_EVENEMENTIEL: 'rose',
  IMMOBILIER: 'slate',
  INSTITUTIONNEL: 'slate',
  SANTE: 'emerald',
  EDUCATION: 'sky',
  AUTRE: 'slate',
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
  FACTURE: 'Facture',
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

// Cycle de vie d'un Document (devis notamment) : brouillon → validé/envoyé → signé (terminal
// positif) ou refusé (terminal négatif).
export const STATUT_DOCUMENT_TONE: Record<string, 'slate' | 'sky' | 'amber' | 'emerald' | 'rose'> = {
  BROUILLON: 'slate',
  VALIDE: 'sky',
  ENVOYE: 'amber',
  SIGNE: 'emerald',
  REFUSE: 'rose',
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
  EN_PAUSE: 'En pause',
  FAIT: 'Fait',
};

export const PRIORITE_TACHE_LABELS: Record<string, string> = {
  HIGH: 'High',
  CHILL: 'Chill',
  OSEF: 'Osef',
};

// Chaud → froid : High retient l'oeil, Osef s'efface dans le neutre.
export const PRIORITE_TACHE_TONE: Record<string, 'rose' | 'amber' | 'slate'> = {
  HIGH: 'rose',
  CHILL: 'amber',
  OSEF: 'slate',
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
