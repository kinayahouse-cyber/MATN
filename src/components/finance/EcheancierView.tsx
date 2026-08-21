import Link from 'next/link';
import { Tag } from '@/components/ui/Tag';
import { Card } from '@/components/ui/Card';
import { STATUT_CREANCE_LABELS, STATUT_CREANCE_TONE } from '@/lib/labels';
import type { StatutCreance } from '@/lib/facturation';

export type CreanceRow = {
  id: string;
  numero: string | null;
  projetId: string | null;
  projetNom: string | null;
  clientNom: string | null;
  dateEcheance: Date | null;
  ttc: number;
  montantPaye: number;
  reste: number;
  statut: StatutCreance;
  joursDeRetard: number | null;
};

function formatDZD(n: number) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n) + ' DZD';
}

function formatDate(d: Date | null) {
  if (!d) return '—';
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(d);
}

// Créances clients : ce que les factures émises doivent encore rapporter. Lecture seule — la
// saisie d'un encaissement se fait sur la facture elle-même, là où le reste dû est en contexte.
export function EcheancierView({ rows }: { rows: CreanceRow[] }) {
  const totalDu = rows.reduce((s, r) => s + r.reste, 0);
  const totalEnRetard = rows
    .filter((r) => r.statut === 'EN_RETARD')
    .reduce((s, r) => s + r.reste, 0);

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <Card className="min-w-[12rem] flex-1">
          <p className="text-[10px] uppercase tracking-[0.15em] text-muted">Reste à encaisser</p>
          <p className="mt-1 font-display text-2xl tracking-tight text-fg tabular-nums">
            {formatDZD(totalDu)}
          </p>
        </Card>
        <Card className="min-w-[12rem] flex-1">
          <p className="text-[10px] uppercase tracking-[0.15em] text-muted">Dont en retard</p>
          <p
            className={`mt-1 font-display text-2xl tracking-tight tabular-nums ${
              totalEnRetard > 0 ? 'text-accent' : 'text-fg'
            }`}
          >
            {formatDZD(totalEnRetard)}
          </p>
        </Card>
      </div>

      {rows.length === 0 ? (
        <p className="mt-6 text-sm text-muted">Aucune facture émise.</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-[10px] uppercase tracking-wide text-muted">
                <th className="pb-2 pr-4 font-normal">Facture</th>
                <th className="pb-2 pr-4 font-normal">Client</th>
                <th className="pb-2 pr-4 font-normal">Échéance</th>
                <th className="pb-2 pr-4 text-right font-normal">Total TTC</th>
                <th className="pb-2 pr-4 text-right font-normal">Reste dû</th>
                <th className="pb-2 font-normal">État</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-line">
                  <td className="py-2 pr-4">
                    {r.projetId ? (
                      <Link
                        href={`/projets/${r.projetId}/documents/${r.id}`}
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
                  <td className="py-2 pr-4 text-muted">
                    {formatDate(r.dateEcheance)}
                    {r.joursDeRetard !== null && r.joursDeRetard > 0 && (
                      <span className="block text-xs text-accent">+{r.joursDeRetard} j</span>
                    )}
                  </td>
                  <td className="py-2 pr-4 text-right tabular-nums text-muted">{formatDZD(r.ttc)}</td>
                  <td className="py-2 pr-4 text-right tabular-nums text-fg">{formatDZD(r.reste)}</td>
                  <td className="py-2">
                    <Tag tone={STATUT_CREANCE_TONE[r.statut] ?? 'neutral'}>
                      {STATUT_CREANCE_LABELS[r.statut]}
                    </Tag>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
