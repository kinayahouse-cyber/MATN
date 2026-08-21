'use client';

import { useRef, useState, useTransition } from 'react';
import { addPaiement } from '@/app/(app)/projets/actions';

// Calque d'AddLigneDevisRow, pour les encaissements d'une facture. `resteDu` pré-remplit le
// montant : le cas courant est le solde intégral, la saisie partielle reste possible en éditant.
export function AddPaiementRow({ documentId, resteDu }: { documentId: string; resteDu: number }) {
  const [open, setOpen] = useState(false);
  const [montant, setMontant] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [methode, setMethode] = useState('');
  const [pending, startTransition] = useTransition();
  const montantRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setMontant('');
    setDate(new Date().toISOString().slice(0, 10));
    setMethode('');
  };

  const submit = () => {
    if (!montant.trim() || Number(montant) <= 0 || pending) return;
    startTransition(async () => {
      await addPaiement(documentId, montant, date, methode);
      reset();
      setOpen(false);
    });
  };

  const cellInputClass =
    'w-full rounded border border-line bg-bg px-1.5 py-1 text-sm focus:outline-none focus:border-accent';

  if (!open) {
    return (
      <tr>
        <td colSpan={4} className="py-2">
          <button
            type="button"
            onClick={() => {
              setOpen(true);
              // Le solde restant est la saisie la plus probable — proposé, pas imposé.
              if (resteDu > 0) setMontant(String(Math.round(resteDu)));
            }}
            className="text-sm text-muted hover:text-fg"
          >
            + Enregistrer un paiement
          </button>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-line">
      <td className="py-1">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          className={cellInputClass}
        />
      </td>
      <td className="py-1">
        <input
          value={methode}
          onChange={(e) => setMethode(e.target.value)}
          placeholder="Virement, chèque…"
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
            if (e.key === 'Escape') {
              setOpen(false);
              reset();
            }
          }}
          className={cellInputClass}
        />
      </td>
      <td className="py-1">
        <input
          ref={montantRef}
          type="number"
          value={montant}
          onChange={(e) => setMontant(e.target.value)}
          placeholder="Montant"
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          className={`${cellInputClass} text-right`}
        />
      </td>
      <td className="py-1">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={submit}
            disabled={pending || !montant.trim() || Number(montant) <= 0}
            className="rounded bg-fg px-2 py-1 text-xs font-medium text-bg disabled:opacity-40"
          >
            OK
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              reset();
            }}
            className="text-xs text-muted hover:text-fg"
          >
            Annuler
          </button>
        </div>
      </td>
    </tr>
  );
}
