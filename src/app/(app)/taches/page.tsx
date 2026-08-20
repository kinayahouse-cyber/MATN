import { prisma } from '@/lib/prisma';
import { PageHeader } from '@/components/PageHeader';
import { GlobalTacheList } from '@/components/GlobalTacheList';

export const dynamic = 'force-dynamic';

export default async function TachesPage() {
  const [taches, utilisateurs] = await Promise.all([
    prisma.tache.findMany({
      include: { projet: { select: { id: true, nom: true, code: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.utilisateur.findMany({ orderBy: { email: 'asc' } }),
  ]);

  const rows = taches.map((t) => ({
    id: t.id,
    libelle: t.libelle,
    description: t.description,
    statut: t.statut,
    dateDebut: t.dateDebut,
    echeance: t.echeance,
    assigneAId: t.assigneAId,
    projetId: t.projet.id,
    projetNom: t.projet.nom,
    projetCode: t.projet.code,
  }));

  // Calculé côté serveur puis passé en prop : les vues Timeline/Calendrier client doivent partir
  // du même jour que le rendu serveur, sinon l'hydratation diverge selon le fuseau du navigateur.
  const todayISO = new Date().toISOString().slice(0, 10);

  return (
    <div>
      <PageHeader
        title="Tâches"
        meta={`${rows.length} tâche${rows.length > 1 ? 's' : ''} sur tous les projets`}
      />
      <GlobalTacheList taches={rows} utilisateurs={utilisateurs} todayISO={todayISO} />
    </div>
  );
}
