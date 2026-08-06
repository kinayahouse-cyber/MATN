# Plan de migration — ADR-006

> MATN Phase 2, étape 1 · Plan de migration uniquement — **aucun schéma modifié, aucune migration exécutée**.
>
> Sources : `docs/foundation/matn-livrable-10-adr-register.md` (ADR-006, ADR-007), `docs/foundation/audit-reconciliation.md`, `docs/foundation/matn-livrable-03-business-ontology.md`, `docs/foundation/matn-livrable-06-knowledge-architecture.md`.
>
> Base : `prisma/schema.prisma` tel qu'il existait au dernier commit applicatif (`8257030`), récupéré depuis l'historique git — c'est le schéma de référence pour tous les mappings champ par champ ci-dessous.

Ce document couvre, dans l'ordre demandé, les chantiers de migration issus d'ADR-006. Pour chacun : schéma cible, script de migration proposé (sketch, non exécuté), stratégie de backfill, risques. Les 7 décisions produit qui bloquaient l'exécution ont été tranchées par **ADR-007** — intégrées ci-dessous ; le champ `palier` (§7) sort du périmètre de cette migration suite à cet arbitrage (voir §7 et « Décisions produit » en fin de document).

**Note sur l'ordre** : l'ordre ci-dessous est l'ordre de priorité produit (Décision d'abord). L'ordre d'**exécution technique** diffère par endroits à cause de dépendances de données — voir « Ordre d'exécution recommandé » en fin de document.

---

## 1. Entité Décision (nouvelle, priorité absolue)

### Schéma cible

```prisma
enum Track {
  STUDIO
  ATELIER
  LABEL
}

model Decision {
  id              String   @id @default(cuid())
  intitule        String
  contexte        String?
  optionsEcartees String?
  justification   String
  date            DateTime @default(now())
  track           Track?   // nul = décision stratégique transverse (Livrable 06, §7)

  // Entité liée : Projet OU Client OU aucune (jamais les deux à la fois)
  projet   Projet?       @relation(fields: [projetId], references: [id])
  projetId String?
  client   Organisation? @relation(fields: [clientId], references: [id])
  clientId String?

  // Une décision qui évolue devient une nouvelle Décision qui référence la précédente (Livrable 03, §6)
  remplace     Decision?  @relation("DecisionRevision", fields: [remplaceId], references: [id])
  remplaceId   String?    @unique
  remplaceePar Decision?  @relation("DecisionRevision")

  createdAt DateTime @default(now())

  @@map("decisions")
}
```

`optionsEcartees` est modélisé en texte libre (une option écartée par ligne, ou markdown) plutôt qu'en table enfant — cohérent avec la contrainte de friction de capture du Livrable 06 (« une Décision qui prend plus de trente secondes à logger ne sera pas loguée »). À revoir en table enfant seulement si un besoin de structuration par option apparaît en usage réel.

### Script de migration proposé

```sql
CREATE TYPE "Track" AS ENUM ('STUDIO', 'ATELIER', 'LABEL');

CREATE TABLE "decisions" (
  id                TEXT PRIMARY KEY,
  intitule          TEXT NOT NULL,
  contexte          TEXT,
  options_ecartees  TEXT,
  justification     TEXT NOT NULL,
  date              TIMESTAMP NOT NULL DEFAULT now(),
  track             "Track",
  projet_id         TEXT REFERENCES projets(id),
  client_id         TEXT REFERENCES organisations(id),
  remplace_id       TEXT UNIQUE REFERENCES decisions(id),
  created_at        TIMESTAMP NOT NULL DEFAULT now(),

  -- Prisma ne déclare pas nativement de contrainte XOR : à ajouter en SQL brut
  -- dans le fichier de migration généré (Prisma migrate accepte le SQL édité manuellement).
  CONSTRAINT decision_entite_unique CHECK (
    projet_id IS NULL OR client_id IS NULL
  )
);
```

L'immutabilité (« jamais modifiée rétroactivement ») n'est pas imposable nativement au niveau base de données sans trigger dédié ; à ce stade, elle reste une règle de la future Couche Logique Métier (Livrable 04), pas une contrainte SQL. À documenter comme dette explicite plutôt qu'un trigger prématuré, tant que cette couche n'existe pas.

### Stratégie de backfill

**Aucune possible.** L'entité Décision n'a jamais existé : ni sous forme de table dédiée, ni sous forme de champ exploitable ailleurs (les statuts de `Opportunite`/`Devis`/`Projet` sont des transitions d'état, pas des décisions au sens de l'ontologie — ils ne portent ni justification, ni options écartées). Toute Décision antérieure à cette migration restera absente de la base sauf reconstitution manuelle par un humain (à partir de `Concept`/notes existantes, hors scope de cette migration).

### Risques

- **Aucun risque de perte de données** (rien à migrer), mais **risque de trou historique** : les décisions structurantes prises avant cette migration ne seront jamais consultables comme telles — à signaler explicitement à l'équipe produit, ce n'est pas un défaut du plan mais une limite factuelle.
- Contrainte XOR (`projet_id`/`client_id`) non native à Prisma : dépend d'une édition manuelle du SQL généré, à ne pas oublier lors de l'exécution réelle.

---

## 2. Track — Organisation, migration de GENERALITES, dénormalisation sur Document

### Schéma cible

```prisma
model Organisation {
  // ... champs existants inchangés ...
  track Track?   // nullable dans un premier temps ; NOT NULL visé après résolution des anomalies (voir backfill)
}

model Projet {
  // ...
  track Track?   // remplace `division Division` (obligatoire) ; nullable car un Projet "généralités" reste possible
  // le champ `division` et l'enum `Division` (4 valeurs) sont supprimés au profit de `Track` (3 valeurs, §1)
}
```

### Script de migration proposé

```sql
-- 1. Ajout nullable
ALTER TABLE organisations ADD COLUMN track "Track";
ALTER TABLE projets ADD COLUMN track "Track";

-- 2. Backfill Projet.track depuis l'ancien Division, GENERALITES -> NULL
UPDATE projets SET track = CASE division
  WHEN 'STUDIO' THEN 'STUDIO'::"Track"
  WHEN 'ATELIER' THEN 'ATELIER'::"Track"
  WHEN 'LABEL' THEN 'LABEL'::"Track"
  WHEN 'GENERALITES' THEN NULL
END;

-- 3. Backfill Organisation.track depuis les Projets liés (voir stratégie ci-dessous, logique applicative
--    recommandée plutôt que pur SQL — les cas d'anomalie doivent être journalisés, pas juste résolus silencieusement)

-- 4. Une fois toutes les anomalies résolues manuellement :
ALTER TABLE projets DROP COLUMN division;
DROP TYPE "Division";
```

### Stratégie de backfill

Pour `Projet.track` : mapping direct 1:1 depuis `division`, `GENERALITES → NULL` (décision ADR-006 point 3). Mécanique, sans ambiguïté.

Pour `Organisation.track`, aucune donnée directe n'existe (le champ n'a jamais existé côté Client) — dérivation par ordre de priorité :

1. Si l'Organisation a au moins un `Projet` et que tous ses `Projet.track` non nuls sont identiques → backfill à cette valeur.
2. Si l'Organisation a des `Projet.track` non nuls **différents** entre eux → **anomalie** : cela viole la règle ontologique « un Client ne peut porter qu'un seul Track dominant à la fois » (Livrable 03, §2), qui n'a jamais été appliquée par l'ancien schéma. Laisser `track = NULL`, journaliser la liste des Organisations concernées avec le détail des Track en conflit, pour arbitrage manuel avant de pouvoir passer la colonne en `NOT NULL`.
3. Si l'Organisation n'a aucun `Projet` mais a des `Opportunite.divisionPressentie` cohérentes → backfill à cette valeur, en la marquant comme signal faible (pressenti, non confirmé) dans le rapport de migration.
4. Sinon → `NULL`, assignation manuelle requise.

**Précision (ADR-007)** : le `NULL` issu du cas 2 ci-dessus est **transitoire** — il doit être résolu par un arbitrage manuel avant de pouvoir imposer `NOT NULL` sur `Organisation.track`. Il est de nature différente du `NULL` **permanent** que portent les connaissances stratégiques transverses (`Decision`/`Note`, Livrable 06 §7), qui n'est jamais destiné à être résolu. Les deux partagent le même type de colonne (`Track?`), mais ne doivent pas être confondus dans l'interprétation opérationnelle — le plan de résolution (journalisation + arbitrage manuel) reste inchangé, cette précision ne fait qu'expliciter sa portée.

**`Organisation.track` reste nullable après cette migration.** Le passage en `NOT NULL` est une migration de suivi distincte, déclenchée seulement une fois toutes les anomalies de l'étape 2 résolues — ne pas le faire dans la même migration pour ne pas bloquer le reste du plan sur un arbitrage produit.

Pour la dénormalisation de `track` sur Document (ex-Devis) : voir §4, dépendance explicite sur cette étape (le Projet doit avoir son `track` renseigné avant de pouvoir le copier sur ses Documents).

### Risques

- **Risque principal** : des Organisations avec des Projets de Track différents existent probablement (rien ne l'empêchait avant). Le nombre exact n'est pas connu sans interroger la base réelle — le plan doit prévoir une requête de reconnaissance en amont de l'exécution (compter les Organisations concernées) pour dimensionner l'effort d'arbitrage manuel avant de lancer quoi que ce soit.
- **Ambiguïté sémantique** : après migration, `track = NULL` signifie à la fois « projet Généralités » (ancien usage volontaire) et « Track inconnu/non résolu » (nouveau cas issu du backfill Organisation). Ces deux significations sont désormais indistinguables au niveau du schéma — à documenter comme limite acceptée (ADR-006 l'a tranché ainsi), mais à surveiller si elle crée de la confusion en usage.
- Suppression de l'enum `Division` et de la valeur `GENERALITES` : toute requête ou export existant qui filtre explicitly sur `division = 'GENERALITES'` doit être identifié et adapté avant la suppression de la colonne — audit de code applicatif nécessaire (hors scope de ce plan de schéma).

---

## 3. Fusion ProductionLabel → Projet (track = LABEL)

C'est le chantier le plus risqué du plan : fusion d'entité avec mappings partiellement approximatifs et champs sans destination.

### Mapping champ par champ

| Champ `ProductionLabel` | Destination `Projet` | Nature du mapping |
|---|---|---|
| `id` | nouvel `id` Projet (cuid généré) | Nécessite une table de correspondance temporaire `ancien_id → nouvel_id` pour réécrire les FK des enfants |
| `code` (`KIN-26-L-XXX`) | `code` | **Risque de collision** — voir Risques |
| `titre` | `nom` | Direct |
| `format` | `metadonneesMigration` (champ JSON temporaire) | Conservé, pas de perte — ADR-007 |
| `budgetAlloue` | `budgetInterne` (nouveau champ dédié) | Direct, pas de fusion avec `budget` — ADR-007 |
| `stadeProduction` | `stade` | Mapping de valeurs approximatif — voir table ci-dessous |
| `statutDiffusion` | `metadonneesMigration` (champ JSON temporaire) | Conservé, pas de perte — ADR-007 |
| `sections` (SectionDossier) | Document rattachés au Projet résultant | Voir §4 |
| `assets` (Asset) | Actif Créatif rattaché au Projet résultant | Table `Asset` conservée telle quelle dans un premier temps, FK repointée (voir Risques) |
| `taches` (Tache) | `Tache.projetId` (au lieu de `productionLabelId`) | Direct, mécanique |
| `depenses` (Depense) | `Depense.projetId` (au lieu de `productionLabelId`) | Direct, mécanique |
| — | `track` | `LABEL` pour toutes les lignes fusionnées |
| — | `organisationId` | `NULL` — aucune Organisation cliente n'existait côté ProductionLabel. Reste une exception à la règle « un Projet est rattaché à un Client » (déjà notée dans l'audit, non résolue par ADR-006). |
| — | `engagement` | `NULL` — aucune valeur de l'enum `Engagement` actuel ne correspond au monde Label ; à trancher séparément (hors scope ADR-006) |

**Champs ajoutés à `Projet` pour cette fusion (ADR-007)** :

```prisma
model Projet {
  // ... champs existants, plus track (§2) ...
  budgetInterne        Decimal? @db.Decimal(14, 2)
  // enveloppe d'investissement interne, non facturable — distinct de `budget` (plafond facturable
  // suivi contre devis/factures). Alimenté uniquement pour les Projets issus de la fusion Label.

  metadonneesMigration Json?
  // champ temporaire : préserve `format` et `statutDiffusion` de l'ancien ProductionLabel le temps
  // d'une revue produit. Pas de date de suppression fixée dans ce plan — voir Risques.
}
```

**Mapping `stadeProduction → stade`** :

| `StadeProductionLabel` | `StadeProjet` cible | Fidélité |
|---|---|---|
| `DEVELOPPEMENT` | `CADRAGE` | Approximation raisonnable |
| `PREPROD` | `PREPROD` | Exact |
| `PROD` | `PRODUCTION` | Exact |
| `DISTRIBUTION` | `LIVRAISON` | Approximation — une production en distribution active n'est pas forcément « livrée » au sens client |
| `ARCHIVE` | `CLOTURE` | Approximation raisonnable |

### Script de migration proposé (sketch)

```sql
-- 1. Table de correspondance temporaire
CREATE TEMP TABLE migration_productionlabel_to_projet (
  old_id TEXT PRIMARY KEY,
  new_id TEXT NOT NULL
);

-- 2. Détection des collisions de code AVANT toute écriture
SELECT pl.code FROM productions_label pl
JOIN projets p ON p.code = pl.code;
-- -> doit retourner 0 ligne avant de continuer ; sinon, résolution manuelle (renommage) au préalable

-- 3. Création des nouveaux Projet + remplissage de la table de correspondance
-- (fait applicativement plutôt qu'en SQL pur, pour générer des cuid côté Prisma)
-- budget_interne <- production_label.budget_alloue (champ dédié, pas de fusion avec budget)
-- metadonnees_migration <- jsonb_build_object('format', format, 'statutDiffusion', statut_diffusion)

-- 4. Repointage des enfants
UPDATE taches   t SET projet_id = m.new_id, production_label_id = NULL
  FROM migration_productionlabel_to_projet m WHERE t.production_label_id = m.old_id;
UPDATE depenses d SET projet_id = m.new_id, production_label_id = NULL
  FROM migration_productionlabel_to_projet m WHERE d.production_label_id = m.old_id;
-- sections_dossier et assets : voir §4 pour sections_dossier ; assets traité en 3bis ci-dessous
UPDATE assets a SET projet_id = m.new_id
  FROM migration_productionlabel_to_projet m WHERE a.production_label_id = m.old_id;

-- 5. Vérification de réconciliation (comptages avant/après) avant de dropper productions_label
-- 6. DROP TABLE productions_label (uniquement après validation manuelle du rapport de réconciliation)
```

### Stratégie de backfill

Il ne s'agit pas d'un backfill au sens classique (pas de nouvelle colonne à peupler depuis une donnée existante) mais d'une **fusion d'entité** : chaque ligne `ProductionLabel` devient une ligne `Projet`, sans perte de ligne (1 pour 1). Le point de vigilance est la **réconciliation** : le nombre de nouveaux `Projet` créés doit être strictement égal au nombre de `ProductionLabel` existants, et la somme des `Tache`/`Depense`/`SectionDossier`/`Asset` repointés doit correspondre exactement à ce qui existait avant, ligne par ligne — recommandé : générer un rapport de réconciliation (comptages avant/après, par table) comme condition de validation avant tout `DROP TABLE`.

### Risques

- **Collision de code** : `CLAUDE.md` (ancien) indique que `ProductionLabel.code` suit « une séquence propre » — indépendante de celle de `Projet` — alors que les deux utilisent le même format `KIN-26-L-XXX`. Une collision entre un `Projet` Studio/Atelier/Label existant et une `ProductionLabel` fusionnée est plausible et bloquerait la contrainte d'unicité sur `code`. **À vérifier avant toute exécution**, avec une stratégie de renommage déterministe si des collisions sont trouvées.
- **`budgetAlloue` vs `budget`** — résolu par ADR-007 : `budgetInterne` devient un champ dédié sur `Projet`, distinct de `budget`. Plus de conflation. Risque résiduel : rien n'empêche au niveau du schéma qu'un futur devis/facture référence par erreur `budgetInterne` au lieu de `budget` — distinction à faire respecter par la Couche Logique Métier, pas par une contrainte SQL.
- **`format` et `statutDiffusion`** — résolus par ADR-007 : préservés dans `metadonneesMigration` (JSON), un champ explicitement temporaire. Risque résiduel : ce plan ne fixe **aucune échéance** de nettoyage — un champ « temporaire » sans date de revue devient facilement permanent par défaut. À corriger au moment de l'exécution réelle (fixer un jalon ou un ticket de suivi), pas seulement le documenter comme temporaire ici.
- **Dépendance à l'entité Actif Créatif** (pour `Asset`) et à la fusion `SectionDossier → Document` (§4) : ce chantier n'est réellement terminé que si ces deux dépendances sont elles-mêmes exécutées dans la même fenêtre de migration — sinon des `Asset`/`SectionDossier` orphelins subsistent après le `DROP TABLE productions_label`.
- C'est la migration la plus difficile à annuler proprement (fusion, pas simple ajout de colonne) : **recommandation forte** de l'exécuter d'abord en mode dry-run (génération du rapport de réconciliation sans écriture), avec sauvegarde complète de la base avant toute exécution réelle.

---

## 4. Devis → Document générique

### Schéma cible

```prisma
enum TypeDocument {
  DEVIS
  CONTRAT
  GUIDELINE
  LIVRABLE
  COMPTE_RENDU
}

enum StatutDocument {
  BROUILLON
  VALIDE
  ENVOYE
  SIGNE
  REFUSE   // 5e statut, ajouté par ADR-007 — terminal, au même titre que SIGNE
}

model Document {
  id       String        @id @default(cuid())
  projet   Projet?       @relation(fields: [projetId], references: [id], onDelete: Cascade)
  projetId String?
  client   Organisation? @relation(fields: [clientId], references: [id])
  clientId String?

  type   TypeDocument
  numero String?          // conservé pour devis/factures numérotés ; optionnel pour guideline/compte-rendu
  statut StatutDocument   @default(BROUILLON)
  track  Track?           // dénormalisé depuis Projet.track à la création (§2)

  lignes LigneDocument[]  // vide pour les types hors devis

  versionDe   Document?  @relation("DocumentVersions", fields: [versionDeId], references: [id])
  versionDeId String?
  versions    Document[] @relation("DocumentVersions")

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("documents")
}

model LigneDocument {
  id         String   @id @default(cuid())
  document   Document @relation(fields: [documentId], references: [id], onDelete: Cascade)
  documentId String
  libelle      String
  quantite     Decimal @default(1) @db.Decimal(10, 2)
  prixUnitaire Decimal @db.Decimal(14, 2)
  ordre        Int     @default(0)

  @@map("lignes_document")
}
```

Contrainte d'unicité sur `numero` : à passer en index unique **partiel** (`WHERE numero IS NOT NULL`) plutôt qu'une contrainte unique classique, puisque les types hors devis n'auront généralement pas de numéro.

`SIGNE` et `REFUSE` sont tous deux des statuts **terminaux** (ADR-007) : un Document dans l'un ou l'autre de ces états n'est pas censé transitionner à nouveau. Comme pour l'immutabilité de `Decision` (§1), rien n'impose mécaniquement cette règle au niveau du schéma — elle reste une règle de la future Couche Logique Métier, pas une contrainte SQL.

### Mapping des statuts

| `StatutDevis` | `StatutDocument` cible | Note |
|---|---|---|
| `BROUILLON` | `BROUILLON` | Direct |
| `ENVOYE` | `ENVOYE` | Direct |
| `ACCEPTE` | `SIGNE` | Rapprochement sémantique (audit §1) |
| `REFUSE` | `REFUSE` | Direct — 5e statut ajouté par ADR-007, terminal comme `SIGNE` |

### Script de migration proposé

```sql
CREATE TYPE "TypeDocument" AS ENUM ('DEVIS','CONTRAT','GUIDELINE','LIVRABLE','COMPTE_RENDU');
CREATE TYPE "StatutDocument" AS ENUM ('BROUILLON','VALIDE','ENVOYE','SIGNE','REFUSE');

CREATE TABLE documents ( ... );
CREATE UNIQUE INDEX documents_numero_unique ON documents(numero) WHERE numero IS NOT NULL;
CREATE TABLE lignes_document ( ... );

-- Migration des lignes existantes
INSERT INTO documents (id, projet_id, type, numero, statut, track, version_de_id, created_at, updated_at)
SELECT id, projet_id, 'DEVIS', numero,
  CASE statut
    WHEN 'BROUILLON' THEN 'BROUILLON'
    WHEN 'ENVOYE' THEN 'ENVOYE'
    WHEN 'ACCEPTE' THEN 'SIGNE'
    WHEN 'REFUSE' THEN 'REFUSE'
  END,
  (SELECT track FROM projets WHERE projets.id = devis.projet_id),  -- dénormalisation, dépend de §2
  avenant_de_id, created_at, updated_at
FROM devis;

INSERT INTO lignes_document (id, document_id, libelle, quantite, prix_unitaire, ordre)
SELECT id, devis_id, libelle, quantite, prix_unitaire, ordre FROM lignes_devis;

DROP TABLE lignes_devis;
DROP TABLE devis;
```

### Stratégie de backfill

Mécanique pour tout sauf le statut `REFUSE` : copie directe des lignes `Devis`/`LigneDevis` vers `Document`/`LigneDocument`, `type = DEVIS` pour toutes les lignes migrées. Le `track` est copié depuis le `Projet` parent — **dépendance explicite** : cette migration doit s'exécuter après que §2 (Track sur Projet) et §3 (fusion Label, pour que les Documents issus de `SectionDossier` aient aussi un Projet/track valides) soient terminés.

`SectionDossier → Document` (mentionné en §3) suit le même mécanisme, avec `type` à déterminer par un mapping `TypeSectionDossier → TypeDocument` (aucun des deux ne se recouvre parfaitement : `NOTE_INTENTION/PITCH/REFERENCES/TRAITEMENT/SCRIPT` n'ont pas d'équivalent direct dans `DEVIS/CONTRAT/GUIDELINE/LIVRABLE/COMPTE_RENDU`). **Confirmé par ADR-007** : mapper l'ensemble vers `LIVRABLE` par défaut (le plus proche conceptuellement d'un contenu créatif versionné), en conservant le `type` d'origine dans un champ `notes`/titre pour ne pas perdre l'information — plan inchangé, décision actée.

### Risques

- **`REFUSE`** — résolu par ADR-007 (5ᵉ statut, option b de la version précédente de ce plan, désormais actée). Cela amende le cycle de vie à 4 statuts initialement décrit dans l'ontologie (Livrable 03, §5) — l'amendement vit dans ADR-007, le Livrable 03 lui-même n'a pas été mis à jour à ce stade. Risque résiduel : tout endroit du futur code applicatif qui supposerait exactement 4 statuts (validations, transitions d'état codées en dur) devra tenir compte du 5ᵉ.
- Renommage `Devis → Document` et `LigneDevis → LigneDocument` : casse potentiellement des exports ou intégrations existants (l'ancien `CLAUDE.md` mentionne un export Excel générique par base) — audit du code applicatif nécessaire, hors scope de ce plan de schéma.
- Le mapping `SectionDossier → Document` (type `LIVRABLE` par défaut) est confirmé par ADR-007 — risque résiduel faible : le `type` d'origine (`NOTE_INTENTION`/`PITCH`/etc.) n'est conservé qu'en référence libre (notes/titre), pas dans un champ structuré filtrable ; une requête voulant isoler les anciens `PITCH` par exemple devra parser ce texte plutôt que filtrer une colonne typée.

---

## 5. Contact : `organisationId` nullable + relation directe Contact↔Projet

### Schéma cible

```prisma
model Contact {
  id             String        @id @default(cuid())
  organisation   Organisation? @relation(fields: [organisationId], references: [id], onDelete: SetNull)
  organisationId String?

  projets Projet[] @relation("ContactProjets")  // relation many-to-many implicite

  nom       String
  role      String?
  canal     CanalContact @default(EMAIL)
  registre  Registre     @default(VOUS)
  email     String?
  telephone String?
  notes     String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("contacts")
}

model Projet {
  // ...
  contacts Contact[] @relation("ContactProjets")
}
```

### Script de migration proposé

```sql
ALTER TABLE contacts ALTER COLUMN organisation_id DROP NOT NULL;
ALTER TABLE contacts DROP CONSTRAINT contacts_organisation_id_fkey;
ALTER TABLE contacts ADD CONSTRAINT contacts_organisation_id_fkey
  FOREIGN KEY (organisation_id) REFERENCES organisations(id) ON DELETE SET NULL;

CREATE TABLE "_ContactProjets" (
  "A" TEXT NOT NULL REFERENCES contacts(id),
  "B" TEXT NOT NULL REFERENCES projets(id)
);
CREATE UNIQUE INDEX "_ContactProjets_AB_unique" ON "_ContactProjets"("A", "B");
```

### Stratégie de backfill

- `organisationId` : aucun backfill nécessaire — toutes les lignes existantes ont déjà cette valeur renseignée, la migration ne fait que relâcher la contrainte `NOT NULL`.
- Relation `Contact↔Projet` : table de jointure **vide au départ**, car cette relation n'a jamais existé. **Confirmé par ADR-007** : pas de pré-peuplement automatique (ex. lier chaque Contact à tous les Projets de son Organisation) — la relation reste vide et se peuple au fil de l'eau à partir de la mise en service. Plan inchangé, décision actée.

### Risques

- Changement de comportement `onDelete` : `Cascade → SetNull`. Un Contact ne sera plus supprimé automatiquement si son Organisation est supprimée — cohérent avec le fait qu'un Contact peut désormais être indépendant, mais c'est un changement de comportement à valider explicitement (suppression d'une Organisation qui a des Contacts encore utilisés ailleurs ne les supprime plus).
- Risque global faible — relaxation de contrainte et ajout de relation, aucune donnée existante modifiée ou à risque de perte.

---

## 6. Note (ex-Concept) : rattachement Client + tag libre

### Schéma cible

```prisma
model Note {
  id       String        @id @default(cuid())
  projet   Projet?       @relation(fields: [projetId], references: [id], onDelete: Cascade)
  projetId String?
  client   Organisation? @relation(fields: [clientId], references: [id], onDelete: Cascade)
  clientId String?

  titre   String?
  contenu String
  tag     String?   // tag libre ; passage à String[] si un besoin de multi-tags émerge en usage

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("notes")
}
```

Même remarque qu'en §1 sur l'absence de contrainte XOR native (`projetId`/`clientId`) — à ajouter en SQL brut dans la migration générée.

### Script de migration proposé

```sql
ALTER TABLE concepts RENAME TO notes;
ALTER TABLE notes ALTER COLUMN projet_id DROP NOT NULL;
ALTER TABLE notes ADD COLUMN client_id TEXT REFERENCES organisations(id);
ALTER TABLE notes ADD COLUMN tag TEXT;
ALTER TABLE notes ADD CONSTRAINT note_entite_unique CHECK (
  projet_id IS NULL OR client_id IS NULL
);
```

### Stratégie de backfill

Aucune : `clientId` et `tag` sont de nouveaux champs nullables, toutes les lignes existantes restent valides avec ces colonnes à `NULL`. Renommage de table pur (`concepts → notes`), sans perte.

### Risques

- **Collision de nom produit** : l'ancien `CLAUDE.md` documente un module UI existant appelé « Concepts » (module 8, « espace notes/idées »). Renommer l'entité en `Note` côté schéma sans renommer le module côté interface crée un décalage nom-technique / nom-produit — à signaler comme point de coordination pour l'équipe produit/design, pas un risque de données.
- Risque de perte de données : nul (uniquement des ajouts de colonnes nullables + renommage de table).

---

## 7. Projet : champ `palier` — hors scope de cette migration

**Retiré du périmètre par ADR-007** (décision 6). Motif : la sémantique de `Palier` (P0–P4) n'est documentée nulle part dans les livrables consultés — ni sa définition, ni ce qui distingue un palier d'un autre pour un Projet (l'ancien `CLAUDE.md` le listait comme hook réservé, « Palier (P0–P4)… ne pas implémenter », sans détail ; le seul autre usage du mot « palier » dans `docs/foundation/` désigne un concept sans rapport, les étapes de développement de l'app nodale IA). Plutôt que de figer un schéma (enum ordinal simple) sur une hypothèse de structure non validée par le produit, ce chantier sort du périmètre de cette migration.

Aucun schéma cible, script ou stratégie de backfill n'est proposé ici tant que cette sémantique n'est pas clarifiée. Ce chantier sera repris dans une migration de suivi une fois la définition obtenue — le hook reste noté comme réservé, pas abandonné.

---

## Ordre d'exécution recommandé

L'ordre de priorité produit (1→7 ci-dessus) n'est pas directement l'ordre d'exécution technique sûr, à cause de dépendances de données :

1. **§2 (Track)** doit s'exécuter avant §3 et §4, car §3 assigne `track = LABEL` et §4 dénormalise `track` depuis `Projet`.
2. **§3 (fusion ProductionLabel → Projet)** doit s'exécuter avant la portion « SectionDossier → Document » de §4, puisque ces Documents ont besoin d'un `projetId` valide issu de la fusion.
3. **§1 (Décision), §5 (Contact), §6 (Note)** sont indépendants entre eux et des chantiers précédents — exécutables à tout moment, y compris en parallèle.
4. **§4 (Devis → Document)**, hors portion SectionDossier, ne dépend que de §2.
5. **§7 (palier)** est hors périmètre de cette migration (ADR-007) — ne figure plus dans l'ordre d'exécution.

Ordre technique proposé : **§2 → §3 → §4 → {§1, §5, §6 en parallèle}**.

Chaque étape nécessite une sauvegarde complète de la base avant exécution, et §3 en particulier nécessite un rapport de réconciliation validé manuellement avant toute suppression de table.

---

## Décisions produit — résolues par ADR-007

Les 7 décisions qui bloquaient l'exécution de ce plan ont été tranchées par **ADR-007** (`docs/foundation/matn-livrable-10-adr-register.md`) :

1. Statut `REFUSE` de `Devis` → devient un 5ᵉ statut de `StatutDocument`, terminal comme `SIGNE` (§4).
2. Conflation `budgetAlloue`/`budget` → deux champs distincts sur `Projet` (`budget`, `budgetInterne`), pas de fusion (§3).
3. Devenir de `format`/`statutDiffusion` → champ `metadonneesMigration` (JSON), temporaire (§3).
4. Mapping `TypeSectionDossier → TypeDocument` → confirmé tel que proposé : `LIVRABLE` par défaut, type d'origine conservé en référence (§4).
5. Pré-peuplement de la relation Contact↔Projet → confirmé vide au départ, peuplée au fil de l'eau (§5).
6. Sémantique de `Palier` P0–P4 → non documentée ; le champ est retiré du périmètre de cette migration (§7).
7. Organisations à Track multiple → plan existant conservé ; précision ajoutée : le `NULL` transitoire (à résoudre avant `NOT NULL`) est distinct du `NULL` permanent des connaissances stratégiques transverses (§2).

**Aucune exécution n'a eu lieu et ce plan n'est toujours pas mergé sur `main`.** La résolution de ces décisions lève le blocage de contenu du plan ; l'exécution reste soumise à une autorisation explicite distincte.

---

*MATN · Plan de migration ADR-006 · Phase 2, étape 1 · Claude*
