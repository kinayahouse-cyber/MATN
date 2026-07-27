import * as XLSX from 'xlsx';
import { prisma } from '@/lib/prisma';
import { DIVISION_LABEL, STADE_PROJET_LABEL } from '@/lib/format';

export async function GET() {
  const projets = await prisma.projet.findMany({
    include: { organisation: true, factures: { include: { paiements: true } } },
    orderBy: { code: 'asc' },
  });

  const rows = projets.map((p) => {
    const facture = p.factures.reduce((s, f) => s + Number(f.montant), 0);
    const encaisse = p.factures.reduce((s, f) => s + f.paiements.reduce((ss, pay) => ss + Number(pay.montant), 0), 0);
    return {
      Code: p.code,
      Projet: p.nom,
      Organisation: p.organisation?.nom ?? 'Interne',
      Division: DIVISION_LABEL[p.division] ?? p.division,
      Stade: STADE_PROJET_LABEL[p.stade] ?? p.stade,
      'Budget (DA)': p.budget ? Number(p.budget) : '',
      'Facturé (DA)': facture,
      'Encaissé (DA)': encaisse,
    };
  });

  const sheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'Projets');
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  return new Response(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="matn-projets.xlsx"',
    },
  });
}
