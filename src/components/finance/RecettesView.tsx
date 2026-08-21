import Link from 'next/link';
import { Card } from '@/components/ui/Card';

export type RecetteRow = {
  id: string;
  date: Date;
  montant: number;
  methode: string | null;
  documentId: string;
  numero: string | null;
  projetId: string | null;
  projetNom: string | null;
  clientNom: string | null;
};

function formatDZD(n: number) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n) + ' DZD';
}

// Encaissements réellement reçus, tous projets confondus — le pendant de Dépenses côté entrées.
// Contrairement à l'échéancier (ce qui est dû), c'est de la trésorerie constatée.
export function RecettesView({
  rows,
  totalAnnee,
}: {
  rows: RecetteRow[];
  totalAnnee: number;
}) {
  const total = rows.reduce((s, r) => s + r.montant, 0);

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <Card className="min-w-[12rem] flex-1">
          <p className="text-[10px] uppercase tracking-[0.15em] text-muted">Encaissé (12 mois)</p>
          <p className="mt-1 font-display text-2xl tracking-tight text-fg tabular-nums">
            {formatDZD(total)}
          </p>
        </Card>
        <Card className="min-w-[12rem] flex-1">
          <p className="text-[10px] uppercase tracking-[0.15em] text-muted">
            Encaissé cette année
          </p>
          <p className="mt-1 font-display text-2xl tracking-tight text-fg tabular-nums">
            {formatDZD(totalAnnee)}
          </p>
        </Card>
      </div>

      {rows.length === 0 ? (
        <p className="mt-6 text-sm text-muted">
          Aucun encaissement enregistré. Les paiements se saisissent sur chaque facture.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-[10px] uppercase tracking-wide text-muted">
                <th className="pb-2 pr-4 font-normal">Date</th>
                <th className="pb-2 pr-4 font-normal">Facture</th>
                <th className="pb-2 pr-4 font-normal">Client</th>
                <th className="pb-2 pr-4 font-normal">Méthode</th>
                <th className="pb-2 text-right font-normal">Montant</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-line">
                  <td className="py-2 pr-4 text-muted">
                    {new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(r.date)}
                  </td>
                  <td className="py-2 pr-4">
                    {r.projetId ? (
                      <Link
                        href={`/projets/${r.projetId}/documents/${r.documentId}`}
                        className="text-fg hover:text-accent hover:underline"
                      >
                        {r.numero || 'Sans numéro'}
                      </Link>
                    ) : (
                      <span className="text-fg">{r.numero || 'Sans numéro'}</span>
                    )}
                    {r.projetNom && <span className="block text-xs text-muted">{r.projetNom}</span>}
                  </td>
                  <td className="py-2 pr-4 text-muted">{r.clientNom ?? '—'}</td>
                  <td className="py-2 pr-4 text-muted">{r.methode || '—'}</td>
                  <td className="py-2 text-right tabular-nums text-fg">{formatDZD(r.montant)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
