import { EditableField } from '@/components/EditableField';
import { DeleteButton } from '@/components/DeleteButton';
import { TacheDoneCheckbox } from '@/components/TacheDoneCheckbox';
import { AddTacheRow } from '@/components/AddTacheRow';
import { updateTacheField, deleteTache } from '@/app/(app)/projets/actions';
import { STATUT_TACHE_LABELS } from '@/lib/labels';

const statutTacheOptions = Object.entries(STATUT_TACHE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

type Utilisateur = { id: string; nom: string | null; email: string };
type Tache = {
  id: string;
  libelle: string;
  description: string | null;
  statut: string;
  echeance: Date | null;
  assigneAId: string | null;
};

// Liste type « flux » plutôt que tableau (référence inbox) : identité forte à gauche, métadonnées
// en pastilles sous le libellé, barre d'accent sur la tâche en cours.
export function TacheList({
  projetId,
  taches,
  utilisateurs,
}: {
  projetId: string;
  taches: Tache[];
  utilisateurs: Utilisateur[];
}) {
  const userOptions = utilisateurs.map((u) => ({ value: u.id, label: u.nom ?? u.email }));

  return (
    <div>
      <ul className="divide-y divide-line">
        {taches.map((t) => {
          const enCours = t.statut === 'EN_COURS';
          const fait = t.statut === 'FAIT';
          return (
            <li key={t.id} className="relative flex gap-3 py-3 pl-3">
              {enCours && (
                <span aria-hidden className="absolute bottom-3 left-0 top-3 w-0.5 bg-accent" />
              )}
              <div className="pt-0.5">
                <TacheDoneCheckbox id={t.id} statut={t.statut} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <EditableField
                    value={t.libelle}
                    onSave={updateTacheField.bind(null, t.id, 'libelle')}
                    className={`flex-1 text-sm font-medium ${fait ? 'text-muted line-through' : ''}`}
                  />
                  <DeleteButton action={deleteTache.bind(null, t.id)} />
                </div>

                <EditableField
                  value={t.description ?? ''}
                  onSave={updateTacheField.bind(null, t.id, 'description')}
                  type="textarea"
                  placeholder="+ description"
                  className="text-xs text-muted"
                />

                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <EditableField
                    value={t.statut}
                    onSave={updateTacheField.bind(null, t.id, 'statut')}
                    type="select"
                    options={statutTacheOptions}
                    className={`border px-1.5 text-[10px] uppercase tracking-[0.08em] ${
                      enCours ? 'border-accent text-accent' : 'border-line text-muted'
                    }`}
                  />
                  <EditableField
                    value={t.echeance ? t.echeance.toISOString().slice(0, 10) : ''}
                    onSave={updateTacheField.bind(null, t.id, 'echeance')}
                    type="date"
                    placeholder="échéance"
                    className="border border-line px-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-muted"
                  />
                  <EditableField
                    value={t.assigneAId ?? ''}
                    onSave={updateTacheField.bind(null, t.id, 'assigneAId')}
                    type="select"
                    options={userOptions}
                    placeholder="non assigné"
                    className="border border-line px-1.5 text-[10px] uppercase tracking-[0.08em] text-muted"
                  />
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <table className="w-full">
        <tbody>
          <AddTacheRow projetId={projetId} utilisateurs={utilisateurs} />
        </tbody>
      </table>
    </div>
  );
}
