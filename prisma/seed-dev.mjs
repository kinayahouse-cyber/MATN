// Jeu de données de développement pour inspecter l'UI en local (variations volontaires :
// noms longs/courts, champs vides, statuts multiples). Ne jamais exécuter sur la base distante.
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.depense.deleteMany();
  await prisma.tache.deleteMany();
  await prisma.jalon.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.document.deleteMany();
  await prisma.decision.deleteMany();
  await prisma.note.deleteMany();
  await prisma.projet.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.organisation.deleteMany();
  await prisma.fournisseur.deleteMany();
  await prisma.utilisateur.deleteMany();

  const [kamil, sarah] = await Promise.all([
    prisma.utilisateur.create({ data: { email: 'kamil@kinaya.house', nom: 'Kamil' } }),
    prisma.utilisateur.create({ data: { email: 'sarah@kinaya.house', nom: 'Sarah' } }),
  ]);

  const hydra = await prisma.organisation.create({
    data: {
      nom: 'Torréfacteur d’Hydra',
      type: 'CLIENT_DIRECT',
      track: 'STUDIO',
      secteur: 'Café de spécialité',
      nif: '0987654321098',
      nis: '1234567890123',
      rc: '16/00-1234567B',
      notes: 'Contact principal très réactif. Préfère WhatsApp.',
    },
  });

  const agence = await prisma.organisation.create({
    data: { nom: 'Meridian', type: 'AGENCE', track: 'ATELIER', secteur: 'Publicité' },
  });

  const [amine, lyna] = await Promise.all([
    prisma.contact.create({
      data: {
        organisationId: hydra.id,
        nom: 'Amine Benali',
        role: 'Fondateur',
        email: 'amine@hydra-cafe.dz',
        telephone: '+213 555 01 02 03',
        canal: 'WHATSAPP',
        registre: 'TU',
      },
    }),
    prisma.contact.create({
      data: { organisationId: agence.id, nom: 'Lyna M.', role: 'Directrice de création' },
    }),
  ]);

  const projet = await prisma.projet.create({
    data: {
      code: 'KIN-26-S-014',
      nom: 'Identité Torréfacteur d’Hydra',
      description:
        'Refonte complète de l’identité d’un torréfacteur d’Hydra : marque verbale, logotype, packaging des trois origines et signalétique de la boutique. Le café est un lieu de quartier — l’identité doit tenir sur une devanture, un sac kraft et un compte Instagram sans jamais perdre sa main.',
      track: 'STUDIO',
      engagement: 'IDENTITE',
      stade: 'EN_COURS',
      budget: 480000,
      budgetInterne: 120000,
      dateDebut: new Date('2026-06-01'),
      dateFinPrevue: new Date('2026-09-15'),
      organisationId: hydra.id,
      contacts: { connect: [{ id: amine.id }] },
    },
  });

  await prisma.projet.create({
    data: {
      code: 'KIN-26-L-002',
      nom: 'Court-métrage — Sable',
      track: 'LABEL',
      stade: 'DEVIS_ENVOYE',
      stadeLabel: 'DEVELOPPEMENT',
      format: '16:9 — 12 min',
      statutDiffusion: 'Festivals, non diffusé',
      budget: 1250000,
    },
  });

  await prisma.projet.create({
    data: {
      code: 'KIN-26-A-007',
      nom: 'Module Atelier — Typographie arabe appliquée au packaging contemporain',
      track: 'ATELIER',
      engagement: 'MODULE_ATELIER',
      stade: 'LIVRE',
      organisationId: agence.id,
      contacts: { connect: [{ id: lyna.id }] },
    },
  });

  await prisma.projet.create({
    data: { code: 'KIN-25-S-041', nom: 'Refonte site', stade: 'CLOS', track: 'STUDIO' },
  });
  await prisma.projet.create({
    data: { code: 'KIN-26-S-019', nom: 'Capsules réseaux', stade: 'SIGNE', track: 'STUDIO' },
  });
  await prisma.projet.create({
    data: { code: 'KIN-25-S-003', nom: 'Projet annulé', stade: 'ABANDONNE' },
  });

  await prisma.jalon.createMany({
    data: [
      { projetId: projet.id, libelle: 'Cadrage & moodboard', date: new Date('2026-06-12'), atteint: true, ordre: 0 },
      { projetId: projet.id, libelle: 'Présentation logotype V1', date: new Date('2026-07-03'), atteint: true, ordre: 1 },
      { projetId: projet.id, libelle: 'Packaging trois origines', date: new Date('2026-08-20'), ordre: 2 },
      { projetId: projet.id, libelle: 'Signalétique boutique', date: new Date('2026-09-10'), ordre: 3 },
    ],
  });

  await prisma.document.createMany({
    data: [
      { projetId: projet.id, type: 'DEVIS', numero: 'DEV-26-014', statut: 'SIGNE', url: 'https://example.com/devis.pdf' },
      { projetId: projet.id, type: 'CONTRAT', numero: 'CTR-26-014', statut: 'SIGNE' },
      { projetId: projet.id, type: 'GUIDELINE', numero: 'Charte v2', statut: 'BROUILLON' },
      { projetId: projet.id, type: 'LIVRABLE', statut: 'ENVOYE', url: 'https://example.com/logo.zip' },
    ],
  });

  await prisma.tache.createMany({
    data: [
      { projetId: projet.id, libelle: 'Explorer 3 pistes de logotype', description: 'Une piste calligraphique, une géométrique, une hybride.', statut: 'FAIT', assigneAId: kamil.id, echeance: new Date('2026-06-28') },
      { projetId: projet.id, libelle: 'Tester la lisibilité en devanture', statut: 'EN_COURS', assigneAId: sarah.id, echeance: new Date('2026-08-14') },
      { projetId: projet.id, libelle: 'Chiffrer l’impression des sacs kraft', statut: 'A_FAIRE' },
    ],
  });

  await prisma.depense.createMany({
    data: [
      { projetId: projet.id, categorie: 'Licences typographiques', montant: 42000, date: new Date('2026-06-20') },
      { projetId: projet.id, categorie: 'Prototypes packaging', montant: 68500, date: new Date('2026-07-28') },
      { projetId: projet.id, categorie: 'Photographe', montant: 55000, date: new Date('2026-08-05') },
    ],
  });

  await prisma.decision.createMany({
    data: [
      { projetId: projet.id, intitule: 'Devis renvoyé avec palette resserrée', justification: 'Le client trouvait la première proposition trop large ; on resserre à trois teintes.', date: new Date(Date.now() - 2 * 864e5) },
      { projetId: projet.id, intitule: 'Abandon de la piste calligraphique', justification: 'Trop difficile à décliner en petite taille sur le packaging.', contexte: 'Test réalisé sur sac 250g.', date: new Date(Date.now() - 6 * 864e5) },
    ],
  });

  await prisma.note.create({
    data: { projetId: projet.id, titre: 'Retour visite boutique', contenu: 'La devanture est très étroite, le logotype doit fonctionner en vertical.', tag: 'terrain', createdAt: new Date(Date.now() - 864e5) },
  });

  await prisma.fournisseur.createMany({
    data: [
      { nom: 'Studio Nord', categorie: 'MOTION', contact: 'Yacine', email: 'contact@studionord.dz' },
      { nom: 'Atelier Impression Belouizdad', categorie: 'AUTRE', telephone: '+213 555 44 33 22' },
      { nom: 'Rania K.', categorie: 'COPYWRITING', email: 'rania@example.com' },
      { nom: 'Collectif Zellige', categorie: 'CINEMA' },
    ],
  });

  console.log('Seed terminé.');
}

main().finally(() => prisma.$disconnect());
