'use client';

// Rendu imprimable d'un devis/facture — clair, noir pur, fidèle à la référence choisie par
// l'utilisateur (pas de variante sombre, pas d'accent MATN). Toute la palette vient du scope
// `.imprimable` (src/app/imprimer/print.css) : ce composant ne réutilise que les classes Tailwind
// bg-bg/text-fg/border-line habituelles, qui retombent ici sur du blanc/noir.

type AgenceInfo = {
  nom: string;
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
    <div className="imprimable min-h-screen bg-bg text-fg">
      <button
        type="button"
        onClick={() => window.print()}
        className="print:hidden fixed right-6 top-6 border border-line px-4 py-2 text-xs uppercase tracking-[0.1em] text-fg hover:bg-fg hover:text-bg"
      >
        Imprimer
      </button>

      <div className="mx-auto max-w-2xl px-10 py-14">
        {/* En-tête */}
        <div className="flex items-start justify-between">
          <h1 className="font-display text-3xl font-bold tracking-tight text-fg">{agence.nom}</h1>
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.15em] text-muted">{label}</p>
            <p className="mt-0.5 font-display text-lg tracking-tight text-fg">{numero || '—'}</p>
            <p className="mt-0.5 text-xs text-muted">{formatDate(date)}</p>
          </div>
        </div>

        <div className="mt-1 h-px w-full bg-line-strong" />

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
            <p className="mt-1.5 text-sm font-medium text-fg">{agence.nom}</p>
            {agence.adresse && <p className="text-xs text-muted">{agence.adresse}</p>}
            {agence.nif && <p className="text-xs text-muted">NIF {agence.nif}</p>}
            {agence.nis && <p className="text-xs text-muted">NIS {agence.nis}</p>}
            {agence.rc && <p className="text-xs text-muted">RC {agence.rc}</p>}
            {agence.ai && <p className="text-xs text-muted">AI {agence.ai}</p>}
          </div>
        </div>

        {/* Lignes */}
        <table className="mt-10 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line-strong text-[10px] uppercase tracking-[0.1em] text-muted">
              <th className="pb-2 font-normal">Description</th>
              <th className="pb-2 pl-4 text-right font-normal">Qté</th>
              <th className="pb-2 pl-4 text-right font-normal">Prix unitaire</th>
              <th className="pb-2 pl-4 text-right font-normal">Montant</th>
            </tr>
          </thead>
          <tbody>
            {lignes.map((l) => (
              <tr key={l.id} className="border-b border-line/20">
                <td className="py-2 pr-4 text-fg">{l.libelle}</td>
                <td className="py-2 pl-4 text-right tabular-nums text-muted">{l.quantite}</td>
                <td className="py-2 pl-4 text-right tabular-nums text-muted">
                  {formatDZD(l.prixUnitaire)}
                </td>
                <td className="py-2 pl-4 text-right tabular-nums text-fg">
                  {formatDZD(l.quantite * l.prixUnitaire)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totaux */}
        <div className="ml-auto mt-4 w-64 space-y-1.5">
          <div className="flex items-center justify-between text-sm text-muted">
            <span>Sous-total HT</span>
            <span className="tabular-nums">{formatDZD(totaux.ht)}</span>
          </div>
          {!!remisePct && (
            <div className="flex items-center justify-between text-sm text-muted">
              <span>Réduction ({remisePct}%)</span>
              <span className="tabular-nums">− {formatDZD(totaux.remise)}</span>
            </div>
          )}
          <div className="flex items-center justify-between text-sm text-muted">
            <span>TVA ({tauxTva ?? 0}%)</span>
            <span className="tabular-nums">{formatDZD(totaux.tva)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-line-strong pt-1.5 text-base font-medium text-fg">
            <span>Total TTC</span>
            <span className="tabular-nums">{formatDZD(totaux.ttc)}</span>
          </div>
        </div>

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

        {/* Pied */}
        {(agence.email || agence.telephone) && (
          <p className="mt-12 text-center text-[11px] text-muted">
            {[agence.email, agence.telephone].filter(Boolean).join(' · ')}
          </p>
        )}
      </div>
    </div>
  );
}
