import { prisma } from '@/lib/prisma';

// Infos de Kinaya elle-même (le "prestataire" imprimé sur les devis/factures) — singleton : une
// seule ligne, sans id fixe codé en dur, créée vide à la première consultation. Jamais de données
// pré-remplies : l'admin les saisit via /parametres après déploiement.
export async function getOrCreateAgenceInfo() {
  const existing = await prisma.agenceInfo.findFirst();
  if (existing) return existing;
  return prisma.agenceInfo.create({ data: {} });
}
