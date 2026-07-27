-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "TypeOrganisation" AS ENUM ('CLIENT_DIRECT', 'AGENCE', 'PRESCRIPTEUR');

-- CreateEnum
CREATE TYPE "CanalContact" AS ENUM ('EMAIL', 'TELEPHONE', 'WHATSAPP', 'AUTRE');

-- CreateEnum
CREATE TYPE "Registre" AS ENUM ('TU', 'VOUS');

-- CreateEnum
CREATE TYPE "Division" AS ENUM ('STUDIO', 'ATELIER', 'LABEL', 'GENERALITES');

-- CreateEnum
CREATE TYPE "StatutPipeline" AS ENUM ('NOUVEAU', 'QUALIFICATION', 'PROPOSITION', 'NEGOCIATION', 'GAGNEE', 'PERDUE');

-- CreateEnum
CREATE TYPE "Engagement" AS ENUM ('LECTURE', 'IDENTITE', 'FILM', 'EDITION', 'CAPSULES', 'MODULE_ATELIER');

-- CreateEnum
CREATE TYPE "StadeProjet" AS ENUM ('CADRAGE', 'PREPROD', 'PRODUCTION', 'LIVRAISON', 'CLOTURE');

-- CreateEnum
CREATE TYPE "StatutDevis" AS ENUM ('BROUILLON', 'ENVOYE', 'ACCEPTE', 'REFUSE');

-- CreateEnum
CREATE TYPE "StatutFacture" AS ENUM ('EMISE', 'PARTIELLEMENT_PAYEE', 'PAYEE', 'EN_RETARD');

-- CreateEnum
CREATE TYPE "StadeProductionLabel" AS ENUM ('DEVELOPPEMENT', 'PREPROD', 'PROD', 'DISTRIBUTION', 'ARCHIVE');

-- CreateEnum
CREATE TYPE "TypeSectionDossier" AS ENUM ('NOTE_INTENTION', 'PITCH', 'REFERENCES', 'TRAITEMENT', 'SCRIPT');

-- CreateEnum
CREATE TYPE "TypeAsset" AS ENUM ('IMAGE', 'VIDEO', 'SON', 'DOC');

-- CreateEnum
CREATE TYPE "StatutTache" AS ENUM ('A_FAIRE', 'EN_COURS', 'FAIT');

-- CreateTable
CREATE TABLE "utilisateurs" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nom" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "utilisateurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organisations" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "type" "TypeOrganisation" NOT NULL DEFAULT 'CLIENT_DIRECT',
    "secteur" TEXT,
    "nif" TEXT,
    "nis" TEXT,
    "rc" TEXT,
    "ai" TEXT,
    "rib" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organisations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "role" TEXT,
    "canal" "CanalContact" NOT NULL DEFAULT 'EMAIL',
    "registre" "Registre" NOT NULL DEFAULT 'VOUS',
    "email" TEXT,
    "telephone" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opportunites" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "secteur" TEXT,
    "divisionPressentie" "Division",
    "statut" "StatutPipeline" NOT NULL DEFAULT 'NOUVEAU',
    "valeurEstimee" DECIMAL(14,2),
    "notes" TEXT,
    "projetId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "opportunites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projets" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "division" "Division" NOT NULL,
    "engagement" "Engagement",
    "stade" "StadeProjet" NOT NULL DEFAULT 'CADRAGE',
    "budget" DECIMAL(14,2),
    "dateDebut" TIMESTAMP(3),
    "dateFinPrevue" TIMESTAMP(3),
    "organisationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devis" (
    "id" TEXT NOT NULL,
    "projetId" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "statut" "StatutDevis" NOT NULL DEFAULT 'BROUILLON',
    "avenantDeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "devis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lignes_devis" (
    "id" TEXT NOT NULL,
    "devisId" TEXT NOT NULL,
    "libelle" TEXT NOT NULL,
    "quantite" DECIMAL(10,2) NOT NULL DEFAULT 1,
    "prixUnitaire" DECIMAL(14,2) NOT NULL,
    "ordre" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "lignes_devis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "factures" (
    "id" TEXT NOT NULL,
    "projetId" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "montant" DECIMAL(14,2) NOT NULL,
    "statut" "StatutFacture" NOT NULL DEFAULT 'EMISE',
    "exonerationTva" BOOLEAN NOT NULL DEFAULT true,
    "dateEmission" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateEcheance" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "factures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paiements" (
    "id" TEXT NOT NULL,
    "factureId" TEXT NOT NULL,
    "montant" DECIMAL(14,2) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "moyen" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "paiements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productions_label" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "format" TEXT,
    "budgetAlloue" DECIMAL(14,2),
    "stadeProduction" "StadeProductionLabel" NOT NULL DEFAULT 'DEVELOPPEMENT',
    "statutDiffusion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "productions_label_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sections_dossier" (
    "id" TEXT NOT NULL,
    "productionLabelId" TEXT NOT NULL,
    "type" "TypeSectionDossier" NOT NULL,
    "titre" TEXT,
    "contenu" TEXT,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sections_dossier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assets" (
    "id" TEXT NOT NULL,
    "productionLabelId" TEXT NOT NULL,
    "type" "TypeAsset" NOT NULL,
    "nom" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sourceGenerateurIa" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "concepts" (
    "id" TEXT NOT NULL,
    "projetId" TEXT NOT NULL,
    "titre" TEXT,
    "contenu" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "concepts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "taches" (
    "id" TEXT NOT NULL,
    "projetId" TEXT,
    "productionLabelId" TEXT,
    "libelle" TEXT NOT NULL,
    "statut" "StatutTache" NOT NULL DEFAULT 'A_FAIRE',
    "echeance" TIMESTAMP(3),
    "assigneAId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "taches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "depenses" (
    "id" TEXT NOT NULL,
    "projetId" TEXT,
    "productionLabelId" TEXT,
    "categorie" TEXT NOT NULL,
    "montant" DECIMAL(14,2) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "depenses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "utilisateurs_email_key" ON "utilisateurs"("email");

-- CreateIndex
CREATE UNIQUE INDEX "opportunites_projetId_key" ON "opportunites"("projetId");

-- CreateIndex
CREATE UNIQUE INDEX "projets_code_key" ON "projets"("code");

-- CreateIndex
CREATE UNIQUE INDEX "devis_numero_key" ON "devis"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "factures_numero_key" ON "factures"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "productions_label_code_key" ON "productions_label"("code");

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunites" ADD CONSTRAINT "opportunites_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opportunites" ADD CONSTRAINT "opportunites_projetId_fkey" FOREIGN KEY ("projetId") REFERENCES "projets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projets" ADD CONSTRAINT "projets_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "organisations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devis" ADD CONSTRAINT "devis_projetId_fkey" FOREIGN KEY ("projetId") REFERENCES "projets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devis" ADD CONSTRAINT "devis_avenantDeId_fkey" FOREIGN KEY ("avenantDeId") REFERENCES "devis"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lignes_devis" ADD CONSTRAINT "lignes_devis_devisId_fkey" FOREIGN KEY ("devisId") REFERENCES "devis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "factures" ADD CONSTRAINT "factures_projetId_fkey" FOREIGN KEY ("projetId") REFERENCES "projets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paiements" ADD CONSTRAINT "paiements_factureId_fkey" FOREIGN KEY ("factureId") REFERENCES "factures"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sections_dossier" ADD CONSTRAINT "sections_dossier_productionLabelId_fkey" FOREIGN KEY ("productionLabelId") REFERENCES "productions_label"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_productionLabelId_fkey" FOREIGN KEY ("productionLabelId") REFERENCES "productions_label"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "concepts" ADD CONSTRAINT "concepts_projetId_fkey" FOREIGN KEY ("projetId") REFERENCES "projets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taches" ADD CONSTRAINT "taches_projetId_fkey" FOREIGN KEY ("projetId") REFERENCES "projets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taches" ADD CONSTRAINT "taches_productionLabelId_fkey" FOREIGN KEY ("productionLabelId") REFERENCES "productions_label"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "taches" ADD CONSTRAINT "taches_assigneAId_fkey" FOREIGN KEY ("assigneAId") REFERENCES "utilisateurs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "depenses" ADD CONSTRAINT "depenses_projetId_fkey" FOREIGN KEY ("projetId") REFERENCES "projets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "depenses" ADD CONSTRAINT "depenses_productionLabelId_fkey" FOREIGN KEY ("productionLabelId") REFERENCES "productions_label"("id") ON DELETE CASCADE ON UPDATE CASCADE;

