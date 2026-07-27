export function formatMontant(value: number | { toString(): string } | null | undefined): string {
  if (value === null || value === undefined) return '—';
  const n = typeof value === 'number' ? value : Number(value.toString());
  return `${new Intl.NumberFormat('fr-FR').format(n)} DA`;
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(d);
}

export const DIVISION_LABEL: Record<string, string> = {
  STUDIO: 'Studio',
  ATELIER: 'Atelier',
  LABEL: 'Label',
  GENERALITES: 'Généralités',
};

export const DIVISION_LETTER: Record<string, string> = {
  STUDIO: 'S',
  ATELIER: 'A',
  LABEL: 'L',
  GENERALITES: 'G',
};

export const STADE_PROJET_LABEL: Record<string, string> = {
  CADRAGE: 'Cadrage',
  PREPROD: 'Préprod',
  PRODUCTION: 'Production',
  LIVRAISON: 'Livraison',
  CLOTURE: 'Clôturé',
};

export const STATUT_PIPELINE_LABEL: Record<string, string> = {
  NOUVEAU: 'Nouveau',
  QUALIFICATION: 'Qualification',
  PROPOSITION: 'Proposition',
  NEGOCIATION: 'Négociation',
  GAGNEE: 'Gagnée',
  PERDUE: 'Perdue',
};

export const STATUT_FACTURE_LABEL: Record<string, string> = {
  EMISE: 'Émise',
  PARTIELLEMENT_PAYEE: 'Partiellement payée',
  PAYEE: 'Payée',
  EN_RETARD: 'En retard',
};
