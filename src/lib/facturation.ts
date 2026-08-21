// Calcul HT / remise / TVA / TTC — partagé par l'éditeur (documents/[docId]/page.tsx) et la page
// d'impression (/imprimer/[docId]) pour qu'un seul endroit fasse ce calcul, jamais deux qui
// pourraient diverger.

export type Totaux = {
  ht: number;
  remise: number;
  baseApresRemise: number;
  tva: number;
  ttc: number;
};

export function computeTotaux(
  lignes: { quantite: number; prixUnitaire: number }[],
  tauxTva: number | null,
  remisePct: number | null
): Totaux {
  const ht = lignes.reduce((sum, l) => sum + l.quantite * l.prixUnitaire, 0);
  const remise = ht * ((remisePct ?? 0) / 100);
  const baseApresRemise = ht - remise;
  const tva = baseApresRemise * ((tauxTva ?? 0) / 100);
  const ttc = baseApresRemise + tva;

  return { ht, remise, baseApresRemise, tva, ttc };
}

// État d'une créance client. Volontairement dérivé à chaque lecture plutôt que stocké : la
// vérité, c'est le TTC de la facture et la liste de ses paiements. Un statut stocké se
// désynchroniserait dès qu'on ajoute/supprime un paiement ou qu'on modifie une ligne.
export type StatutCreance = 'PAYEE' | 'PARTIELLE' | 'IMPAYEE' | 'EN_RETARD';

export type Creance = {
  ttc: number;
  montantPaye: number;
  reste: number;
  statut: StatutCreance;
  joursDeRetard: number | null;
};

// Tolérance d'un centime : les montants transitent par des Decimal convertis en float, un reste
// résiduel de 0,004 DZD ne doit pas faire passer une facture soldée pour « partielle ».
const EPSILON = 0.01;

export function computeCreance(
  ttc: number,
  paiements: { montant: number }[],
  dateEcheance: Date | null,
  maintenant: Date = new Date()
): Creance {
  const montantPaye = paiements.reduce((sum, p) => sum + p.montant, 0);
  const reste = Math.max(0, ttc - montantPaye);

  const joursDeRetard =
    dateEcheance && reste > EPSILON
      ? Math.floor((maintenant.getTime() - dateEcheance.getTime()) / 86_400_000)
      : null;

  let statut: StatutCreance;
  if (reste <= EPSILON) statut = 'PAYEE';
  else if (joursDeRetard !== null && joursDeRetard > 0) statut = 'EN_RETARD';
  else if (montantPaye > EPSILON) statut = 'PARTIELLE';
  else statut = 'IMPAYEE';

  return { ttc, montantPaye, reste, statut, joursDeRetard };
}
