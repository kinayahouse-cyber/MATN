import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/current-user';
import { STATUT_DOCUMENT_LABELS, STATUT_DOCUMENT_TONE } from '@/lib/labels';
import { updateDocumentField, updateLigneDocumentField, deleteLigneDocument, deleteDevis } from '../../../actions';
import { resolveFileUrl } from '@/lib/supabase/admin';
import { EditableField } from '@/components/EditableField';
import { DeleteButton } from '@/components/DeleteButton';
import { TagSelect } from '@/components/ui/TagSelect';
import { Card } from '@/components/ui/Card';
import { AddLigneDevisRow } from '@/components/AddLigneDevisRow';

const statutOptions = Object.entries(STATUT_DOCUMENT_LABELS).map(([value, label]) => ({ value, label }));

function formatDZD(n: number) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n) + ' DZD';
}

// Éditeur de devis : le Document (numéro/statut/fichier) existait déjà, ses LigneDocument
// (libellé/quantité/prix unitaire) aussi dans le schéma — mais rien ne les exposait jusqu'ici,
// addDocument ne fait qu'attacher un fichier ou un lien. Ici, les lignes se saisissent et le
// total se calcule, comme les Dépenses d'un projet.
export default async function DevisPage({
  params,
}: {
  params: Promise<{ id: string; docId: string }>;
}) {
  await requireAdmin();
  const { id, docId } = await params;

  const [document, projet] = await Promise.all([
    prisma.document.findUnique({
      where: { id: docId },
      include: { lignes: { orderBy: { ordre: 'asc' } } },
    }),
    prisma.projet.findUnique({ where: { id }, select: { id: true, nom: true, code: true } }),
  ]);

  if (!document || !projet || document.projetId !== projet.id || document.type !== 'DEVIS') notFound();

  const resolvedUrl = await resolveFileUrl(document.url);
  const total = document.lignes.reduce((sum, l) => sum + Number(l.quantite) * Number(l.prixUnitaire), 0);

  return (
    <div className="max-w-3xl">
      <nav aria-label="Fil d'Ariane" className="flex flex-wrap items-center gap-2 text-sm text-muted">
        <Link href={`/projets/${projet.id}`} className="hover:text-fg hover:underline">
          {projet.code} — {projet.nom}
        </Link>
        <span aria-hidden>/</span>
        <span>Devis</span>
      </nav>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <EditableField
          value={document.numero ?? ''}
          onSave={updateDocumentField.bind(null, document.id, 'numero')}
          placeholder="Sans numéro"
          className="font-display text-2xl tracking-tight text-fg"
        />
        <TagSelect
          value={document.statut}
          options={statutOptions}
          onSave={updateDocumentField.bind(null, document.id, 'statut')}
          tone={STATUT_DOCUMENT_TONE[document.statut] ?? 'neutral'}
          ariaLabel="Statut du devis"
        />
      </div>

      {resolvedUrl && (
        <a href={resolvedUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs text-accent hover:underline">
          Ouvrir le fichier joint
        </a>
      )}

      <Card padded={false} className="mt-6 p-5">
        <table className="w-full table-fixed text-left text-sm">
          <thead>
            <tr className="border-b border-line text-[10px] uppercase tracking-wide text-muted">
              <th className="w-[46%] pb-2 pr-2 font-normal">Libellé</th>
              <th className="w-[12%] pb-2 pr-2 font-normal">Qté</th>
              <th className="w-[18%] pb-2 pr-2 font-normal">Prix unitaire</th>
              <th className="w-[18%] pb-2 pr-2 text-right font-normal">Total</th>
              <th className="w-[6%] pb-2 font-normal" />
            </tr>
          </thead>
          <tbody>
            {document.lignes.map((l) => {
              const ligneTotal = Number(l.quantite) * Number(l.prixUnitaire);
              return (
                <tr key={l.id} className="border-b border-line">
                  <td className="py-1.5">
                    <EditableField
                      value={l.libelle}
                      onSave={updateLigneDocumentField.bind(null, l.id, 'libelle')}
                    />
                  </td>
                  <td className="py-1.5 text-muted">
                    <EditableField
                      value={String(l.quantite)}
                      onSave={updateLigneDocumentField.bind(null, l.id, 'quantite')}
                      type="number"
                    />
                  </td>
                  <td className="py-1.5 text-muted">
                    <EditableField
                      value={String(l.prixUnitaire)}
                      onSave={updateLigneDocumentField.bind(null, l.id, 'prixUnitaire')}
                      type="number"
                    />
                  </td>
                  <td className="py-1.5 text-right tabular-nums text-muted">{formatDZD(ligneTotal)}</td>
                  <td className="py-1.5">
                    <DeleteButton action={deleteLigneDocument.bind(null, l.id)} />
                  </td>
                </tr>
              );
            })}
            <AddLigneDevisRow documentId={document.id} />
          </tbody>
        </table>

        <div className="mt-4 flex items-center justify-end gap-3 border-t border-line pt-4">
          <span className="text-xs uppercase tracking-wide text-muted">Total</span>
          <span className="font-display text-xl tracking-tight text-fg tabular-nums">{formatDZD(total)}</span>
        </div>
      </Card>

      <section className="mt-8">
        <DeleteButton
          action={deleteDevis.bind(null, document.id, projet.id)}
          confirmMessage="Supprimer ce devis ? Ses lignes seront aussi supprimées."
          label="Supprimer le devis"
          className="text-xs uppercase tracking-wide text-muted hover:text-accent"
        />
      </section>
    </div>
  );
}
