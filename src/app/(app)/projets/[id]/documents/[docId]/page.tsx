import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/current-user';
import {
  STATUT_DOCUMENT_LABELS,
  STATUT_DOCUMENT_TONE,
  STATUT_CREANCE_LABELS,
  STATUT_CREANCE_TONE,
} from '@/lib/labels';
import {
  updateDocumentField,
  updateLigneDocumentField,
  deleteLigneDocument,
  deleteDevis,
  deletePaiement,
} from '../../../actions';
import { resolveFileUrl } from '@/lib/supabase/admin';
import { computeTotaux, computeCreance } from '@/lib/facturation';
import { EditableField } from '@/components/EditableField';
import { DeleteButton } from '@/components/DeleteButton';
import { TagSelect } from '@/components/ui/TagSelect';
import { Tag } from '@/components/ui/Tag';
import { Card } from '@/components/ui/Card';
import { AddLigneDevisRow } from '@/components/AddLigneDevisRow';
import { AddPaiementRow } from '@/components/AddPaiementRow';

const statutOptions = Object.entries(STATUT_DOCUMENT_LABELS).map(([value, label]) => ({ value, label }));

function formatDZD(n: number) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n) + ' DZD';
}

// Éditeur commun devis/facture : mêmes lignes chiffrées (LigneDocument), mêmes champs TVA/remise —
// seul le libellé affiché (« Devis »/« Facture ») change selon document.type. Route sous
// documents/ (pas devis/) puisqu'elle sert les deux types depuis cette session.
export default async function DocumentFinancierPage({
  params,
}: {
  params: Promise<{ id: string; docId: string }>;
}) {
  await requireAdmin();
  const { id, docId } = await params;

  const [document, projet] = await Promise.all([
    prisma.document.findUnique({
      where: { id: docId },
      include: {
        lignes: { orderBy: { ordre: 'asc' } },
        paiements: { orderBy: { date: 'desc' } },
      },
    }),
    prisma.projet.findUnique({ where: { id }, select: { id: true, nom: true, code: true } }),
  ]);

  if (
    !document ||
    !projet ||
    document.projetId !== projet.id ||
    (document.type !== 'DEVIS' && document.type !== 'FACTURE')
  ) {
    notFound();
  }

  const label = document.type === 'FACTURE' ? 'Facture' : 'Devis';
  // Accord grammatical : "le devis" (masculin) / "la facture" (féminin).
  const article = document.type === 'FACTURE' ? 'la' : 'le';
  const resolvedUrl = await resolveFileUrl(document.url);
  const totaux = computeTotaux(
    document.lignes.map((l) => ({ quantite: Number(l.quantite), prixUnitaire: Number(l.prixUnitaire) })),
    document.tauxTva !== null ? Number(document.tauxTva) : null,
    document.remisePct !== null ? Number(document.remisePct) : null
  );

  // Créance : seulement pour une FACTURE — un devis n'est pas encaissable.
  const paiements = document.paiements.map((p) => ({
    id: p.id,
    montant: Number(p.montant),
    date: p.date,
    methode: p.methode,
  }));
  const creance =
    document.type === 'FACTURE'
      ? computeCreance(totaux.ttc, paiements, document.dateEcheance)
      : null;
  const echeanceRaw = document.dateEcheance
    ? document.dateEcheance.toISOString().slice(0, 10)
    : '';

  return (
    <div className="max-w-3xl">
      <nav aria-label="Fil d'Ariane" className="flex flex-wrap items-center gap-2 text-sm text-muted">
        <Link href={`/projets/${projet.id}`} className="hover:text-fg hover:underline">
          {projet.code} — {projet.nom}
        </Link>
        <span aria-hidden>/</span>
        <span>{label}</span>
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
          ariaLabel={`Statut ${article === 'la' ? 'de la' : 'du'} ${label.toLowerCase()}`}
        />
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
        {resolvedUrl && (
          <a href={resolvedUrl} target="_blank" rel="noreferrer" className="text-accent hover:underline">
            Ouvrir le fichier joint
          </a>
        )}
        <Link href={`/imprimer/${document.id}`} target="_blank" className="text-accent hover:underline">
          Imprimer / Exporter →
        </Link>
      </div>

      <div className="mt-4">
        <p className="text-[10px] uppercase tracking-[0.15em] text-muted">Objet</p>
        <EditableField
          value={document.objet ?? ''}
          onSave={updateDocumentField.bind(null, document.id, 'objet')}
          type="textarea"
          placeholder={`Description globale de l'objet ${article === 'la' ? 'de la' : 'du'} ${label.toLowerCase()}…`}
          className="mt-1 text-sm"
        />
      </div>

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

        <div className="mt-4 space-y-1.5 border-t border-line pt-4">
          <div className="flex items-center justify-between text-sm text-muted">
            <span>Sous-total HT</span>
            <span className="tabular-nums">{formatDZD(totaux.ht)}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-muted">
            <span className="flex items-center gap-1.5">
              Réduction
              <EditableField
                value={document.remisePct !== null ? String(document.remisePct) : ''}
                onSave={updateDocumentField.bind(null, document.id, 'remisePct')}
                type="number"
                placeholder="0"
                className="w-14"
              />
              %
            </span>
            <span className="tabular-nums">− {formatDZD(totaux.remise)}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-muted">
            <span className="flex items-center gap-1.5">
              TVA
              <EditableField
                value={document.tauxTva !== null ? String(document.tauxTva) : ''}
                onSave={updateDocumentField.bind(null, document.id, 'tauxTva')}
                type="number"
                placeholder="0"
                className="w-14"
              />
              %
            </span>
            <span className="tabular-nums">{formatDZD(totaux.tva)}</span>
          </div>
          <div className="flex items-center justify-end gap-3 pt-1.5">
            <span className="text-xs uppercase tracking-wide text-muted">Total TTC</span>
            <span className="font-display text-xl tracking-tight text-fg tabular-nums">
              {formatDZD(totaux.ttc)}
            </span>
          </div>
        </div>
      </Card>

      {creance && (
        <Card padded={false} className="mt-6 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-xs uppercase tracking-[0.08em] text-muted">Règlement</h2>
              <Tag tone={STATUT_CREANCE_TONE[creance.statut] ?? 'neutral'}>
                {STATUT_CREANCE_LABELS[creance.statut]}
              </Tag>
              {creance.joursDeRetard !== null && creance.joursDeRetard > 0 && (
                <span className="text-xs text-muted">{creance.joursDeRetard} j de retard</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted">
              Échéance
              <EditableField
                value={echeanceRaw}
                onSave={updateDocumentField.bind(null, document.id, 'dateEcheance')}
                type="date"
                placeholder="Non fixée"
                className="w-32"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-2 text-sm">
            <span className="text-muted">
              Encaissé{' '}
              <span className="tabular-nums text-fg">{formatDZD(creance.montantPaye)}</span>
            </span>
            <span className="text-muted">
              Reste dû{' '}
              <span className="tabular-nums text-fg">{formatDZD(creance.reste)}</span>
            </span>
          </div>

          <table className="mt-4 w-full text-left text-sm">
            <thead>
              <tr className="border-b border-line text-[10px] uppercase tracking-wide text-muted">
                <th className="w-[30%] pb-2 pr-2 font-normal">Date</th>
                <th className="w-[30%] pb-2 pr-2 font-normal">Méthode</th>
                <th className="w-[30%] pb-2 pr-2 text-right font-normal">Montant</th>
                <th className="w-[10%] pb-2 font-normal" />
              </tr>
            </thead>
            <tbody>
              {paiements.map((p) => (
                <tr key={p.id} className="border-b border-line">
                  <td className="py-1.5 text-muted">
                    {new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(p.date)}
                  </td>
                  <td className="py-1.5 text-muted">{p.methode || '—'}</td>
                  <td className="py-1.5 text-right tabular-nums text-fg">{formatDZD(p.montant)}</td>
                  <td className="py-1.5">
                    <DeleteButton
                      action={deletePaiement.bind(null, p.id)}
                      confirmMessage="Supprimer ce paiement ?"
                    />
                  </td>
                </tr>
              ))}
              <AddPaiementRow documentId={document.id} resteDu={creance.reste} />
            </tbody>
          </table>
        </Card>
      )}

      <section className="mt-8">
        <DeleteButton
          action={deleteDevis.bind(null, document.id, projet.id)}
          confirmMessage={`Supprimer ${article === 'la' ? 'cette' : 'ce'} ${label.toLowerCase()} ? Ses lignes seront aussi supprimées.`}
          label={`Supprimer ${article} ${label.toLowerCase()}`}
          className="text-xs uppercase tracking-wide text-muted hover:text-accent"
        />
      </section>
    </div>
  );
}
