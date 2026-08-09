import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { TRACK_LABELS, TYPE_ORGANISATION_LABELS, STADE_PROJET_LABELS } from '@/lib/labels';
import {
  createContact,
  updateOrganisationField,
  updateContactField,
  deleteOrganisation,
  deleteContact,
} from '../actions';
import { EditableField } from '@/components/EditableField';
import { DeleteButton } from '@/components/DeleteButton';

const inputClass =
  'mt-1 w-full rounded-md border border-neutral-800 bg-transparent px-3 py-2 text-sm';
const labelClass = 'text-sm text-neutral-400';

const typeOptions = Object.entries(TYPE_ORGANISATION_LABELS).map(([value, label]) => ({
  value,
  label,
}));
const trackOptions = Object.entries(TRACK_LABELS).map(([value, label]) => ({ value, label }));

export default async function ClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const client = await prisma.organisation.findUnique({
    where: { id },
    include: {
      contacts: { orderBy: { nom: 'asc' }, include: { projets: { select: { id: true, nom: true } } } },
      projets: { orderBy: { createdAt: 'desc' } },
      decisions: { orderBy: { date: 'desc' }, take: 5 },
      notesMatn: { orderBy: { createdAt: 'desc' }, take: 5 },
    },
  });

  if (!client) notFound();

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-start justify-between gap-2">
          <EditableField
            value={client.nom}
            onSave={updateOrganisationField.bind(null, client.id, 'nom')}
            className="flex-1 text-xl font-medium"
          />
          <DeleteButton
            action={deleteOrganisation.bind(null, client.id)}
            confirmMessage={`Supprimer ${client.nom} ? Les projets liés seront détachés, pas supprimés.`}
            label="Supprimer"
            className="mt-1 shrink-0 text-xs text-neutral-600 hover:text-red-400"
          />
        </div>
        <div className="mt-2 flex flex-wrap gap-4 text-sm text-neutral-400">
          <EditableField
            value={client.type}
            onSave={updateOrganisationField.bind(null, client.id, 'type')}
            type="select"
            options={typeOptions}
          />
          <EditableField
            value={client.track ?? ''}
            onSave={updateOrganisationField.bind(null, client.id, 'track')}
            type="select"
            options={trackOptions}
            placeholder="Track —"
          />
          <EditableField
            value={client.secteur ?? ''}
            onSave={updateOrganisationField.bind(null, client.id, 'secteur')}
            placeholder="Secteur —"
          />
        </div>
      </div>

      <section className="grid grid-cols-2 gap-4 border-t border-neutral-800 pt-4 text-sm sm:grid-cols-3 md:grid-cols-6">
        {(['nif', 'nis', 'rc', 'ai', 'rib'] as const).map((field) => (
          <div key={field}>
            <p className="text-xs uppercase tracking-wide text-neutral-500">{field.toUpperCase()}</p>
            <EditableField
              value={client[field] ?? ''}
              onSave={updateOrganisationField.bind(null, client.id, field)}
              className="mt-1"
            />
          </div>
        ))}
      </section>
      <div>
        <p className="text-xs uppercase tracking-wide text-neutral-500">Notes</p>
        <EditableField
          value={client.notes ?? ''}
          onSave={updateOrganisationField.bind(null, client.id, 'notes')}
          type="textarea"
          className="mt-1 text-sm text-neutral-400"
        />
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <section>
          <h2 className="text-sm font-medium uppercase tracking-wide">Contacts</h2>
          {client.contacts.length === 0 ? (
            <p className="mt-3 text-sm text-neutral-600">Aucun contact.</p>
          ) : (
            <ul className="mt-3 divide-y divide-neutral-800">
              {client.contacts.map((contact) => (
                <li key={contact.id} className="py-2 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <EditableField
                      value={contact.nom}
                      onSave={updateContactField.bind(null, contact.id, 'nom')}
                      className="flex-1 font-medium"
                    />
                    <DeleteButton
                      action={deleteContact.bind(null, contact.id)}
                      confirmMessage={`Supprimer le contact ${contact.nom} ?`}
                    />
                  </div>
                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-neutral-500">
                    <EditableField
                      value={contact.role ?? ''}
                      onSave={updateContactField.bind(null, contact.id, 'role')}
                      placeholder="Rôle —"
                    />
                    <EditableField
                      value={contact.email ?? ''}
                      onSave={updateContactField.bind(null, contact.id, 'email')}
                      placeholder="Email —"
                    />
                    <EditableField
                      value={contact.telephone ?? ''}
                      onSave={updateContactField.bind(null, contact.id, 'telephone')}
                      placeholder="Téléphone —"
                    />
                  </div>
                  {contact.projets.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-2 text-xs text-neutral-600">
                      {contact.projets.map((p) => (
                        <Link key={p.id} href={`/projets/${p.id}`} className="hover:underline">
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
            <summary className="cursor-pointer text-sm text-neutral-500 hover:text-neutral-300">
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
              <button
                type="submit"
                className="rounded-md bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-950"
              >
                Ajouter
              </button>
            </form>
          </details>
        </section>

        <section>
          <h2 className="text-sm font-medium uppercase tracking-wide">Projets</h2>
          {client.projets.length === 0 ? (
            <p className="mt-3 text-sm text-neutral-600">Aucun projet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-neutral-800">
              {client.projets.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-2 text-sm">
                  <Link href={`/projets/${p.id}`} className="hover:underline">
                    {p.nom}
                  </Link>
                  <span className="text-xs text-neutral-500">
                    {STADE_PROJET_LABELS[p.stade] ?? p.stade}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="border-t border-neutral-800 pt-6">
        <h2 className="text-sm font-medium uppercase tracking-wide">Décisions &amp; Notes récentes</h2>
        {client.decisions.length === 0 && client.notesMatn.length === 0 ? (
          <p className="mt-3 text-sm text-neutral-600">Rien pour l&rsquo;instant.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {client.decisions.map((d) => (
              <li key={d.id} className="text-sm">
                <span className="mr-2 rounded-full bg-neutral-800 px-2 py-0.5 text-[10px] uppercase text-neutral-400">
                  Décision
                </span>
                {d.intitule}
              </li>
            ))}
            {client.notesMatn.map((n) => (
              <li key={n.id} className="text-sm">
                <span className="mr-2 rounded-full bg-neutral-800 px-2 py-0.5 text-[10px] uppercase text-neutral-400">
                  Note
                </span>
                {n.titre ?? n.contenu.slice(0, 80)}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
