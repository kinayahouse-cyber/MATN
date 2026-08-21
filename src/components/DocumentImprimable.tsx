'use client';

// Rendu imprimable d'un devis/facture — clair, noir pur, fidèle à la référence choisie par
// l'utilisateur (pas de variante sombre, pas d'accent MATN). Toute la palette vient du scope
// `.imprimable` (src/app/imprimer/print.css) : ce composant ne réutilise que les classes Tailwind
// bg-bg/text-fg/border-line habituelles, qui retombent ici sur du blanc/noir.

type AgenceInfo = {
  nom: string | null;
  logoUrl: string | null;
  adresse: string | null;
  email: string | null;
  telephone: string | null;
  nif: string | null;
  nis: string | null;
  rc: string | null;
  ai: string | null;
  banqueNom: string | null;
  rib: string | null;
  conditionsPaiement: string | null;
};

type ClientInfo = {
  nom: string;
  nif: string | null;
  nis: string | null;
  rc: string | null;
  ai: string | null;
} | null;

type Ligne = { id: string; libelle: string; quantite: number; prixUnitaire: number };

type Totaux = { ht: number; remise: number; tva: number; ttc: number };

function formatDZD(n: number) {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n) + ' DZD';
}

function formatDate(d: Date) {
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
}

export function DocumentImprimable({
  type,
  numero,
  objet,
  date,
  projetNom,
  client,
  agence,
  lignes,
  tauxTva,
  remisePct,
  totaux,
  montantEnLettres,
}: {
  type: 'DEVIS' | 'FACTURE';
  numero: string | null;
  objet: string | null;
  date: Date;
  projetNom: string;
  client: ClientInfo;
  agence: AgenceInfo;
  lignes: Ligne[];
  tauxTva: number | null;
  remisePct: number | null;
  totaux: Totaux;
  montantEnLettres: string;
}) {
  const label = type === 'FACTURE' ? 'Facture' : 'Devis';

  return (
    // font-sans (Space Grotesk) porte tout le document ; font-display (Bricolage) est réservé
    // aux deux moments d'affichage — le numéro en en-tête et le Total TTC.
    <div className="imprimable min-h-screen bg-bg py-10 font-sans text-fg print:min-h-0 print:bg-bg print:py-0">
      <button
        type="button"
        onClick={() => window.print()}
        className="print:hidden fixed right-6 top-6 border border-line px-4 py-2 text-xs uppercase tracking-[0.1em] text-fg hover:bg-fg hover:text-bg"
      >
        Imprimer
      </button>

      {/* Format A4 fixe à l'écran (mêmes proportions que @page dans print.css) : ce qu'on voit à
          l'écran est déjà la mise en page réelle imprimée, pas une approximation. */}
      <div className="mx-auto flex min-h-[297mm] w-[210mm] max-w-full flex-col bg-bg p-[15mm] shadow-[0_0_0_1px_rgb(var(--matn-line)/0.15),0_8px_30px_-8px_rgb(0_0_0/0.25)] print:m-0 print:min-h-0 print:w-auto print:p-0 print:shadow-none">
        {/* En-tête */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.15em] text-muted">{label}</p>
            <p className="mt-0.5 font-display text-lg tracking-tight text-fg">{numero || '—'}</p>
          </div>
          <p className="text-xs text-muted">{formatDate(date)}</p>
        </div>

        <div className="mt-1 h-px w-full bg-line-strong" />

        {objet && (
          <div className="mt-4">
            <p className="text-[10px] uppercase tracking-[0.15em] text-muted">Objet</p>
            <p className="mt-1 text-sm text-fg">{objet}</p>
          </div>
        )}

        {/* Client / Prestataire */}
        <div className="mt-8 grid grid-cols-2 gap-8">
          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-muted">Client</p>
            <p className="mt-1.5 text-sm font-medium text-fg">{client?.nom ?? projetNom}</p>
            {client?.nif && <p className="text-xs text-muted">NIF {client.nif}</p>}
            {client?.nis && <p className="text-xs text-muted">NIS {client.nis}</p>}
            {client?.rc && <p className="text-xs text-muted">RC {client.rc}</p>}
            {client?.ai && <p className="text-xs text-muted">AI {client.ai}</p>}
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-muted">Prestataire</p>
            {agence.nom && <p className="mt-1.5 text-sm font-medium text-fg">{agence.nom}</p>}
            {agence.adresse && <p className="text-xs text-muted">{agence.adresse}</p>}
            {agence.nif && <p className="text-xs text-muted">NIF {agence.nif}</p>}
            {agence.nis && <p className="text-xs text-muted">NIS {agence.nis}</p>}
            {agence.rc && <p className="text-xs text-muted">RC {agence.rc}</p>}
            {agence.ai && <p className="text-xs text-muted">AI {agence.ai}</p>}
          </div>
        </div>

        {/* Lignes — Space Grotesk (font-sans) et corps réduit : le détail des articles se lit,
            il ne domine pas. Cellules alignées en bas (align-bottom) pour que les montants
            reposent sur la même ligne de pied qu'un libellé passé sur deux lignes. */}
        <table className="mt-10 w-full text-left font-sans text-xs">
          <thead>
            <tr className="border-b border-line-strong text-[9px] uppercase tracking-[0.1em] text-muted">
              <th className="pb-2 align-bottom font-normal">Description</th>
              <th className="pb-2 pl-4 text-right align-bottom font-normal">Qté</th>
              <th className="pb-2 pl-4 text-right align-bottom font-normal">Prix unitaire</th>
              <th className="pb-2 pl-4 text-right align-bottom font-normal">Montant</th>
            </tr>
          </thead>
          <tbody>
            {lignes.map((l) => (
              <tr key={l.id} className="border-b border-line/20">
                <td className="py-2 pr-4 align-bottom text-fg">{l.libelle}</td>
                <td className="py-2 pl-4 text-right align-bottom tabular-nums text-muted">
                  {l.quantite}
                </td>
                <td className="py-2 pl-4 text-right align-bottom tabular-nums text-muted">
                  {formatDZD(l.prixUnitaire)}
                </td>
                <td className="py-2 pl-4 text-right align-bottom tabular-nums text-fg">
                  {formatDZD(l.quantite * l.prixUnitaire)}
                </td>
              </tr>
            ))}
          </tbody>

          {/* Les totaux sont des lignes du même tableau (tfoot), pas un bloc flottant à côté :
              leurs montants tombent ainsi exactement dans la colonne Montant des articles, et
              tout le tableau partage une seule grille de colonnes alignée en bas. */}
          <tfoot className="align-bottom">
            <tr>
              <td colSpan={3} className="pt-6 pr-4 text-right align-bottom text-lg text-muted">
                Sous-total HT
              </td>
              <td className="pt-6 pl-4 text-right align-bottom text-lg tabular-nums text-muted">
                {formatDZD(totaux.ht)}
              </td>
            </tr>
            {!!remisePct && (
              <tr>
                <td colSpan={3} className="pt-2.5 pr-4 text-right align-bottom text-lg text-muted">
                  Réduction ({remisePct}%)
                </td>
                <td className="pt-2.5 pl-4 text-right align-bottom text-lg tabular-nums text-muted">
                  − {formatDZD(totaux.remise)}
                </td>
              </tr>
            )}
            <tr>
              <td colSpan={3} className="pb-3 pt-2.5 pr-4 text-right align-bottom text-lg text-muted">
                TVA ({tauxTva ?? 0}%)
              </td>
              <td className="pb-3 pt-2.5 pl-4 text-right align-bottom text-lg tabular-nums text-muted">
                {formatDZD(totaux.tva)}
              </td>
            </tr>
            {/* Le libellé reste sobre, seul le montant passe en grand : à taille égale les deux
                se disputaient la largeur et « Total TTC » repassait à la ligne. */}
            <tr className="border-t border-line-strong">
              <td
                colSpan={3}
                className="pt-3 pr-4 text-right align-bottom text-sm uppercase tracking-[0.12em] text-fg"
              >
                Total TTC
              </td>
              <td className="whitespace-nowrap pt-3 pl-4 text-right align-bottom font-display text-4xl font-bold tracking-tight text-fg tabular-nums">
                {formatDZD(totaux.ttc)}
              </td>
            </tr>
          </tfoot>
        </table>

        {/* Montant en lettres */}
        <p className="mt-8 border-t border-b border-line/30 py-3 text-sm italic text-fg">
          Arrêté {type === 'FACTURE' ? 'la' : 'le'} présent{type === 'FACTURE' ? 'e' : ''} {label.toLowerCase()} à la
          somme de : {montantEnLettres}.
        </p>

        {/* Bancaire + conditions */}
        {(agence.banqueNom || agence.rib || agence.conditionsPaiement) && (
          <div className="mt-8 grid grid-cols-2 gap-8 text-xs text-muted">
            {(agence.banqueNom || agence.rib) && (
              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-muted">Paiement</p>
                {agence.banqueNom && <p className="mt-1.5">{agence.banqueNom}</p>}
                {agence.rib && <p className="font-mono">{agence.rib}</p>}
              </div>
            )}
            {agence.conditionsPaiement && (
              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-muted">Conditions</p>
                <p className="mt-1.5 whitespace-pre-wrap">{agence.conditionsPaiement}</p>
              </div>
            )}
          </div>
        )}

        {/* Logo en grand + contact, poussés en pied de page (mt-auto dans le conteneur flex-col). */}
        <div className="mt-auto pt-12 text-center">
          {agence.logoUrl && (
            // Largeur pilotée plutôt que hauteur : le logo Kinaya est un lettrage très large
            // (~6,5:1) — le caler en hauteur le ferait déborder la colonne de texte.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={agence.logoUrl}
              alt={agence.nom ?? 'Logo'}
              className="block w-full object-contain"
            />
          )}
          {(agence.email || agence.telephone) && (
            <p className="mt-3 text-[11px] text-muted">
              {[agence.email, agence.telephone].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
