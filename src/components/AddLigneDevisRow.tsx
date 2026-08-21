'use client';

import { useRef, useState, useTransition } from 'react';
import { addLigneDocument } from '@/app/(app)/projets/actions';

export function AddLigneDevisRow({ documentId }: { documentId: string }) {
  const [open, setOpen] = useState(false);
  const [libelle, setLibelle] = useState('');
  const [quantite, setQuantite] = useState('1');
  const [prixUnitaire, setPrixUnitaire] = useState('');
  const [pending, startTransition] = useTransition();
  const libelleRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setLibelle('');
    setQuantite('1');
    setPrixUnitaire('');
  };

  const submit = () => {
    if (!libelle.trim() || !prixUnitaire.trim() || pending) return;
    startTransition(async () => {
      await addLigneDocument(documentId, libelle, quantite, prixUnitaire);
      reset();
      libelleRef.current?.focus();
    });
  };

  const cellInputClass =
    'w-full rounded border border-line bg-bg px-1.5 py-1 text-sm focus:outline-none focus:border-accent';

  if (!open) {
    return (
      <tr>
        <td colSpan={5} className="py-2">
          <button type="button" onClick={() => setOpen(true)} className="text-sm text-muted hover:text-fg">
            + Ajouter une ligne
          </button>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-line">
      <td className="py-1">
        <input
          ref={libelleRef}
          value={libelle}
          onChange={(e) => setLibelle(e.target.value)}
          placeholder="Libellé"
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
          type="number"
          value={quantite}
          onChange={(e) => setQuantite(e.target.value)}
          placeholder="Qté"
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          className={cellInputClass}
        />
      </td>
      <td className="py-1">
        <input
          type="number"
          value={prixUnitaire}
          onChange={(e) => setPrixUnitaire(e.target.value)}
          placeholder="Prix unitaire"
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          className={cellInputClass}
        />
      </td>
      <td className="py-1 text-right text-xs text-muted">
        {prixUnitaire.trim() && !Number.isNaN(Number(prixUnitaire))
          ? new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(
              Number(prixUnitaire) * (Number(quantite) || 0)
            )
          : ''}
      </td>
      <td className="py-1">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={submit}
            disabled={pending || !libelle.trim() || !prixUnitaire.trim()}
            className="rounded bg-fg px-2 py-1 text-xs font-medium text-bg disabled:opacity-40"
          >
            Ajouter
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
