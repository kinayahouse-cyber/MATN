import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/current-user';
import { computeTotaux } from '@/lib/facturation';
import { nombreEnLettres } from '@/lib/nombre-en-lettres';
import { getOrCreateAgenceInfo } from '@/lib/agence-info';
import { resolveFileUrl } from '@/lib/supabase/admin';
import { DocumentImprimable } from '@/components/DocumentImprimable';
import '../print.css';

// Hors groupe (app) : pas de Sidebar, plein cadre pour l'impression (même schéma d'implantation
// que /portail/[token]). Pas public comme le portail : document financier interne, identifié par
// l'id réel du Document — donc requireAdmin() en première ligne, pas un lien magique.
export default async function ImprimerPage({ params }: { params: Promise<{ docId: string }> }) {
  await requireAdmin();
  const { docId } = await params;

  const document = await prisma.document.findUnique({
    where: { id: docId },
    include: {
      lignes: { orderBy: { ordre: 'asc' } },
      // Document.clientId n'est jamais renseigné côté UI — le client réel d'un devis/facture est
      // celui du Projet auquel il est rattaché.
      projet: { select: { nom: true, organisation: true } },
    },
  });

  if (!document || (document.type !== 'DEVIS' && document.type !== 'FACTURE')) notFound();

  const agence = await getOrCreateAgenceInfo();
  const logoUrl = await resolveFileUrl(agence.logoUrl);

  const lignes = document.lignes.map((l) => ({
    id: l.id,
    libelle: l.libelle,
    quantite: Number(l.quantite),
    prixUnitaire: Number(l.prixUnitaire),
  }));
  const tauxTva = document.tauxTva !== null ? Number(document.tauxTva) : null;
  const remisePct = document.remisePct !== null ? Number(document.remisePct) : null;
  const totaux = computeTotaux(lignes, tauxTva, remisePct);
  const montantEnLettres = nombreEnLettres(totaux.ttc);

  const organisation = document.projet?.organisation;

  return (
    <DocumentImprimable
      type={document.type}
      numero={document.numero}
      objet={document.objet}
      date={document.createdAt}
      projetNom={document.projet?.nom ?? ''}
      client={
        organisation
          ? { nom: organisation.nom, nif: organisation.nif, nis: organisation.nis, rc: organisation.rc, ai: organisation.ai }
          : null
      }
      agence={{
        nom: agence.nom,
        logoUrl,
        adresse: agence.adresse,
        email: agence.email,
        telephone: agence.telephone,
        nif: agence.nif,
        nis: agence.nis,
        rc: agence.rc,
        ai: agence.ai,
        banqueNom: agence.banqueNom,
        rib: agence.rib,
        conditionsPaiement: agence.conditionsPaiement,
      }}
      lignes={lignes}
      tauxTva={tauxTva}
      remisePct={remisePct}
      totaux={totaux}
      montantEnLettres={montantEnLettres}
    />
  );
}
