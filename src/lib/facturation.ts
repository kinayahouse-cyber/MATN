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
