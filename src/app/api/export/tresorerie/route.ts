import * as XLSX from 'xlsx';
import { prisma } from '@/lib/prisma';
import { STATUT_FACTURE_LABEL } from '@/lib/format';

export async function GET() {
  const [factures, paiements, depenses] = await Promise.all([
    prisma.facture.findMany({ include: { projet: true }, orderBy: { numero: 'asc' } }),
    prisma.paiement.findMany({ include: { facture: { include: { projet: true } } }, orderBy: { date: 'asc' } }),
    prisma.depense.findMany({ include: { projet: true, production: true }, orderBy: { date: 'asc' } }),
  ]);

  const facturesRows = factures.map((f) => ({
    'N° Facture': f.numero,
    Projet: f.projet.nom,
    Statut: STATUT_FACTURE_LABEL[f.statut] ?? f.statut,
    'Montant (DA)': Number(f.montant),
    'Émise le': f.dateEmission.toISOString().slice(0, 10),
    Échéance: f.dateEcheance ? f.dateEcheance.toISOString().slice(0, 10) : '',
  }));

  const paiementsRows = paiements.map((p) => ({
    Date: p.date.toISOString().slice(0, 10),
    Projet: p.facture.projet.nom,
    'N° Facture': p.facture.numero,
    'Montant (DA)': Number(p.montant),
    Moyen: p.moyen ?? '',
  }));

  const depensesRows = depenses.map((d) => ({
    Date: d.date.toISOString().slice(0, 10),
    Catégorie: d.categorie,
    Rattachement: d.projet?.nom ?? d.production?.titre ?? 'Générale',
    'Montant (DA)': Number(d.montant),
  }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(facturesRows), 'Factures');
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(paiementsRows), 'Paiements');
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(depensesRows), 'Dépenses');
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="matn-tresorerie.xlsx"',
    },
  });
}
