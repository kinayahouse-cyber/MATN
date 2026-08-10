import Link from 'next/link';
import { TRACK_LABELS, TYPE_ORGANISATION_LABELS, STADE_PROJET_LABELS } from '@/lib/labels';
import {
  createContact,
  updateOrganisationField,
  updateContactField,
  deleteOrganisation,
  deleteContact,
} from '@/app/(app)/clients/actions';
import { EditableField } from '@/components/EditableField';
import { DeleteButton } from '@/components/DeleteButton';
import { FieldRow } from '@/components/properties/FieldRow';
import { StructuralLine } from '@/components/grid/StructuralLine';

const inputClass =
  'mt-1 w-full border border-line bg-bg px-3 py-2 text-sm text-fg focus:outline-none focus:border-accent';
const labelClass = 'text-sm text-muted';

const typeOptions = Object.entries(TYPE_ORGANISATION_LABELS).map(([value, label]) => ({
  value,
  label,
}));
const trackOptions = Object.entries(TRACK_LABELS).map(([value, label]) => ({ value, label }));

type Contact = {
  id: string;
  nom: string;
  role: string | null;
  email: string | null;
  telephone: string | null;
  projets: { id: string; nom: string }[];
};

type Client = {
  id: string;
  nom: string;
  type: string;
  track: string | null;
  secteur: string | null;
  nif: string | null;
  nis: string | null;
  rc: string | null;
  ai: string | null;
  rib: string | null;
  notes: string | null;
  contacts: Contact[];
  projets: { id: string; nom: string; stade: string }[];
  decisions: { id: string; intitule: string }[];
  notesMatn: { id: string; titre: string | null; contenu: string }[];
};

export function ClientDetail({ client }: { client: Client }) {
  return (
    <div className="space-y-8">
      {/* Identité */}
      <div>
        <EditableField
          value={client.nom}
          onSave={updateOrganisationField.bind(null, client.id, 'nom')}
          className="font-display text-3xl tracking-tight [&_button]:border-b-2 [&_button]:border-fg [&_button]:pb-1"
        />
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] uppercase tracking-[0.08em] text-muted">
          <EditableField
            value={client.type}
            onSave={updateOrganisationField.bind(null, client.id, 'type')}
            type="select"
            options={typeOptions}
          />
          <span aria-hidden>·</span>
          <EditableField
            value={client.track ?? ''}
            onSave={updateOrganisationField.bind(null, client.id, 'track')}
            type="select"
            options={trackOptions}
            placeholder="Track"
          />
          <span aria-hidden>·</span>
          <EditableField
            value={client.secteur ?? ''}
            onSave={updateOrganisationField.bind(null, client.id, 'secteur')}
            placeholder="Secteur"
          />
        </div>
      </div>

      <StructuralLine weight="primary" />

      {/* Informations fiscales, en grammaire label/valeur */}
      <section>
        <p className="text-[11px] uppercase tracking-[0.08em] text-muted">Fiscal</p>
        <div className="mt-3 divide-y divide-line">
          {(['nif', 'nis', 'rc', 'ai', 'rib'] as const).map((field) => (
            <FieldRow key={field} label={field}>
              <EditableField
                value={client[field] ?? ''}
                onSave={updateOrganisationField.bind(null, client.id, field)}
                className="font-mono text-xs"
              />
            </FieldRow>
          ))}
        </div>
      </section>

      {/* Contacts — noms en capitales, rôle en dessous (référence « initiatives ») */}
      <section>
        <p className="text-[11px] uppercase tracking-[0.08em] text-muted">Contacts</p>
        {client.contacts.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Aucun contact.</p>
        ) : (
          <ul className="mt-3 space-y-4">
            {client.contacts.map((contact) => (
              <li key={contact.id}>
                <div className="flex items-start justify-between gap-2">
                  <EditableField
                    value={contact.nom}
                    onSave={updateContactField.bind(null, contact.id, 'nom')}
                    className="flex-1 text-base uppercase tracking-[0.04em]"
                  />
                  <DeleteButton
                    action={deleteContact.bind(null, contact.id)}
                    confirmMessage={`Supprimer le contact ${contact.nom} ?`}
                  />
                </div>
                <div className="mt-0.5 space-y-0.5 text-xs text-muted">
                  <EditableField
                    value={contact.role ?? ''}
                    onSave={updateContactField.bind(null, contact.id, 'role')}
                    placeholder="Rôle"
                  />
                  <EditableField
                    value={contact.email ?? ''}
                    onSave={updateContactField.bind(null, contact.id, 'email')}
                    placeholder="Email"
                  />
                  <EditableField
                    value={contact.telephone ?? ''}
                    onSave={updateContactField.bind(null, contact.id, 'telephone')}
                    placeholder="Téléphone"
                  />
                </div>
                {contact.projets.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.08em] text-muted">
                    {contact.projets.map((p) => (
                      <Link key={p.id} href={`/projets/${p.id}`} className="hover:text-fg">
                        {p.nom}
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-muted hover:text-fg">
            + Ajouter un contact
          </summary>
          <form action={createContact} className="mt-3 space-y-3">
            <input type="hidden" name="organisationId" value={client.id} />
            <div>
              <label className={labelClass}>Nom</label>
              <input name="nom" required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Rôle</label>
              <input name="role" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input name="email" type="email" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Téléphone</label>
              <input name="telephone" className={inputClass} />
            </div>
            <button type="submit" className="bg-fg px-4 py-2 text-sm font-medium text-bg">
              Ajouter
            </button>
          </form>
        </details>
      </section>

      {/* Projets */}
      <section>
        <p className="text-[11px] uppercase tracking-[0.08em] text-muted">Projets</p>
        {client.projets.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Aucun projet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line">
            {client.projets.map((p) => (
              <li key={p.id} className="flex items-center justify-between py-2 text-sm">
                <Link href={`/projets/${p.id}`} className="hover:underline">
                  {p.nom}
                </Link>
                <span className="text-[11px] uppercase tracking-[0.08em] text-muted">
                  {STADE_PROJET_LABELS[p.stade] ?? p.stade}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Notes libres */}
      <section>
        <p className="text-[11px] uppercase tracking-[0.08em] text-muted">Notes</p>
        <EditableField
          value={client.notes ?? ''}
          onSave={updateOrganisationField.bind(null, client.id, 'notes')}
          type="textarea"
          className="mt-2 text-sm text-muted"
        />
      </section>

      {/* Décisions & notes rattachées */}
      {(client.decisions.length > 0 || client.notesMatn.length > 0) && (
        <section>
          <p className="text-[11px] uppercase tracking-[0.08em] text-muted">
            Décisions &amp; notes
          </p>
          <ul className="mt-3 space-y-2">
            {client.decisions.map((d) => (
              <li key={d.id} className="text-sm">
                <span className="mr-2 text-[10px] uppercase tracking-[0.08em] text-muted">
                  Décision
                </span>
                {d.intitule}
              </li>
            ))}
            {client.notesMatn.map((n) => (
              <li key={n.id} className="text-sm">
                <span className="mr-2 text-[10px] uppercase tracking-[0.08em] text-muted">
                  Note
                </span>
                {n.titre ?? n.contenu.slice(0, 80)}
              </li>
            ))}
          </ul>
        </section>
      )}

      <StructuralLine weight="primary" />
      <DeleteButton
        action={deleteOrganisation.bind(null, client.id)}
        confirmMessage={`Supprimer ${client.nom} ? Les projets liés seront détachés, pas supprimés.`}
        label="Supprimer le client"
        className="text-[11px] uppercase tracking-[0.08em] text-muted hover:text-accent"
      />
    </div>
  );
}
