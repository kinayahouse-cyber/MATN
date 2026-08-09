import { PageHeader } from '@/components/PageHeader';

export default function TachesPage() {
  return (
    <div>
      <PageHeader title="Tasks" meta="Vue transverse — à venir" />
      <p className="text-sm text-muted">
        Vue globale des tâches, tous projets confondus. Les tâches existent déjà par projet dans
        le Project Workspace ; cette vue transverse arrive en phase 4 de la refonte front-end.
      </p>
    </div>
  );
}
