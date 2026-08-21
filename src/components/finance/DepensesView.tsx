import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { EditableField } from '@/components/EditableField';
import { DeleteButton } from '@/components/DeleteButton';
import { AddDepenseGlobaleRow } from './AddDepenseGlobaleRow';
import { updateDepenseField, deleteDepense } from '@/app/(app)/projets/actions';

export type DepenseRow = {
  id: string;
  date: Date;
  categorie: string;
  montant: number;
  projetId: string | null;
  projetCode: string | null;
  projetNom: string | null;
};

function formatDZD(n: number) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n) + ' DZD';
}

// Toutes les dépenses, projets confondus — y compris les dépenses générales (projetId NULL),
// que le schéma autorisait mais qu'aucun écran ne permettait de saisir jusqu'ici.
export function DepensesView({
  rows,
  projets,
  totalAnnee,
}: {
  rows: DepenseRow[];
  projets: { id: string; code: string; nom: string }[];
  totalAnnee: number;
}) {
  const total = rows.reduce((s, r) => s + r.montant, 0);

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <Card className="min-w-[12rem] flex-1">
          <p className="text-[10px] uppercase tracking-[0.15em] text-muted">Total affiché</p>
          <p className="mt-1 font-display text-2xl tracking-tight text-fg tabular-nums">
            {formatDZD(total)}
          </p>
        </Card>
        <Card className="min-w-[12rem] flex-1">
          <p className="text-[10px] uppercase tracking-[0.15em] text-muted">Dépensé cette année</p>
          <p className="mt-1 font-display text-2xl tracking-tight text-fg tabular-nums">
            {formatDZD(totalAnnee)}
          </p>
        </Card>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-[10px] uppercase tracking-wide text-muted">
              <th className="w-[18%] pb-2 pr-2 font-normal">Date</th>
              <th className="w-[28%] pb-2 pr-2 font-normal">Catégorie</th>
              <th className="w-[26%] pb-2 pr-2 font-normal">Projet</th>
              <th className="w-[20%] pb-2 pr-2 text-right font-normal">Montant</th>
              <th className="w-[8%] pb-2 font-normal" />
            </tr>
          </thead>
          <tbody>
            {rows.map((d) => (
              <tr key={d.id} className="border-b border-line">
                <td className="py-1.5 pr-2 text-muted">
                  <EditableField
                    value={d.date.toISOString().slice(0, 10)}
                    onSave={updateDepenseField.bind(null, d.id, 'date')}
                    type="date"
                    displayValue={new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(
                      d.date
                    )}
                  />
                </td>
                <td className="py-1.5 pr-2">
                  <EditableField
                    value={d.categorie}
                    onSave={updateDepenseField.bind(null, d.id, 'categorie')}
                  />
                </td>
                <td className="py-1.5 pr-2 text-muted">
                  {d.projetId ? (
                    <Link
                      href={`/projets/${d.projetId}`}
                      className="hover:text-accent hover:underline"
                    >
                      {d.projetCode} — {d.projetNom}
                    </Link>
                  ) : (
                    <span className="text-xs uppercase tracking-wide text-muted">Générale</span>
                  )}
                </td>
                <td className="py-1.5 pr-2 text-right tabular-nums text-fg">
                  <EditableField
                    value={String(d.montant)}
                    onSave={updateDepenseField.bind(null, d.id, 'montant')}
                    type="number"
                    displayValue={formatDZD(d.montant)}
                  />
                </td>
                <td className="py-1.5">
                  <DeleteButton
                    action={deleteDepense.bind(null, d.id)}
                    confirmMessage="Supprimer cette dépense ?"
                  />
                </td>
              </tr>
            ))}
            <AddDepenseGlobaleRow projets={projets} />
          </tbody>
        </table>
      </div>
    </div>
  );
}
