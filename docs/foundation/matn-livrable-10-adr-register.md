# MATN — Architecture Decision Records

> Livrable 10 · Phase 1 Foundation · Claude Strategist · 06 août 2026
> Registre vivant — chaque nouvelle décision structurante s'ajoute ici, jamais réécrite rétroactivement.

---

## ADR-001 — Hermes porte une logique métier propre

**Contexte** : le brief fondateur de MATN décrit à la fois Hermes comme dépourvu de logique métier et comme décisionnaire ("Hermes décide, n8n exécute").

**Problème** : ambiguïté structurante pour l'architecture technique — un orchestrateur sans logique de décision est un simple routeur statique ; un orchestrateur qui décide porte nécessairement une forme de logique métier.

**Options étudiées** :
1. Hermes exécute uniquement des règles définies et stockées dans MATN, sans capacité de décision propre.
2. Hermes porte une logique de décision propre, distincte de la logique métier de fond.

**Décision retenue** : option 2.

**Justification** : un orchestrateur purement statique ne peut pas arbitrer entre agents/skills/modèles selon un contexte réellement variable sans devenir un enchaînement de règles trop rigide à maintenir.

**Conséquences** : Hermes n'est plus interchangeable au même titre que les modèles IA qu'il orchestre (System Architecture, Livrable 04 ; AI Architecture, Livrable 05). Le principe de remplaçabilité totale s'applique à la Couche Modèles IA, pas à Hermes.

**Alternatives futures** : isoler la logique de décision de Hermes dans une couche de règles externalisée et versionnée, pour restaurer une forme de remplaçabilité si le besoin se confirme à l'usage.

---

## ADR-002 — Cloisonnement Studio/Atelier natif dans la mémoire

**Contexte** : la grille tarifaire de Kinaya impose de ne jamais croiser les portfolios Studio et Atelier. MATN prévoit une mémoire unique partagée entre MATN OS et MATN Creative.

**Problème** : une mémoire unique crée un risque structurel de croisement dès qu'un agent IA interroge la mémoire pour produire du contenu portfolio.

**Options étudiées** :
1. Cloisonnement par convention d'usage (documentation, discipline opérationnelle).
2. Cloisonnement structurel au niveau de l'architecture (attribut Track, filtrage obligatoire).

**Décision retenue** : option 2.

**Justification** : une règle de process peut être oubliée sous pression ou automatisée par erreur ; une contrainte d'architecture ne peut pas l'être.

**Conséquences** : toute entité liée à un Client ou un Projet porte un Track obligatoire (Business Ontology, Livrable 03). Toute requête de contexte est filtrée par Track au niveau de la Couche Logique Métier (System Architecture, Livrable 04 ; Knowledge Architecture, Livrable 06).

**Alternatives futures** : aucune identifiée à ce stade — le cloisonnement reste non négociable indépendamment de l'échelle future de MATN.

---

## ADR-003 — MVP Mémoire comme périmètre du premier build

**Contexte** : le brief fondateur vise un système d'exploitation d'entreprise complet sur dix ans. Kinaya, aujourd'hui, est en phase de génération de cash pure, sans structure ni équipe.

**Problème** : risque de documentation et de développement disproportionnés par rapport au stade réel de l'entreprise.

**Options étudiées** :
1. Documenter et construire l'OS complet dès la Phase 2.
2. Documenter la vision complète en Phase 1, mais limiter le build de Phase 2 à un périmètre MVP resserré.

**Décision retenue** : option 2.

**Justification** : documenter large ne coûte que du temps de rédaction ; construire large avant validation d'usage coûte du temps de développement sur des modules potentiellement mal calibrés.

**Conséquences** : le PRD (Livrable 01, section 6) définit le MVP Mémoire — Gestion Clients, Projets, Journal de décisions, Documents, Recherche contextuelle. Tout le reste (CRM, Finance, Client Portal, Hermes, MATN Creative) est documenté mais différé à la Phase 3.

**Alternatives futures** : réévaluer le périmètre de Phase 3 une fois le MVP en usage réel (Product Roadmap, Livrable 11).

---

## ADR-004 — Structure Phase 1 à 12 livrables comme critère de sortie

**Contexte** : le cycle documentation-first ne définissait initialement aucun critère explicite de fin de Phase 1, créant un risque de documentation sans fin.

**Problème** : absence de définition opérationnelle de "fondations suffisamment solides".

**Options étudiées** :
1. Fixer un nombre réduit de documents obligatoires avant de démarrer l'implémentation.
2. Adopter une structure exhaustive à 12 livrables avec critère de sortie explicite, telle que définie dans le document "MATN — Phase 1: Foundation".

**Décision retenue** : option 2.

**Justification** : la structure proposée couvre tous les axes nécessaires (produit, ontologie, architecture, IA, connaissance, process, modules, interfaces, décisions, roadmap, questions ouvertes) sans ambiguïté sur ce qui reste à faire.

**Conséquences** : ce registre ADR et les onze autres livrables constituent désormais la structure officielle de Phase 1.

**Alternatives futures** : aucune à ce stade.

---

## ADR-005 — MVP mono-utilisateur, sans gestion de permissions

**Contexte** : MATN est actuellement opéré par une seule personne. Le brief envisage à terme des interfaces multi-rôles (Team Workspace, Client Portal).

**Problème** : construire une gestion de permissions avant d'avoir un second utilisateur réel ajoute de la complexité sans valeur immédiate.

**Options étudiées** :
1. Concevoir un système de rôles et permissions dès le MVP.
2. MVP mono-utilisateur, un seul rôle, sans permissions différenciées.

**Décision retenue** : option 2.

**Justification** : cohérente avec le principe "simplicité avant sophistication" (Product Philosophy, Livrable 02) et avec le périmètre MVP Mémoire (ADR-003).

**Conséquences** : l'entité Utilisateur reste minimale dans le MVP (Business Ontology, Livrable 03, section 11). La notion de Rôle devient une entité à part entière au moment du recrutement BD ou de l'intégration d'un premier freelance.

**Alternatives futures** : réévaluer au moment du premier recrutement.

---

---

## ADR-006 — Réconciliation de l'implémentation existante (audit du 06/08)

**Contexte** : l'audit de réconciliation (`docs/foundation/audit-reconciliation.md`) confronte les 15 entités Prisma existantes à l'ontologie (Livrable 03) et à l'exigence de cloisonnement Track (Livrables 04, 06). Il confirme trois lacunes structurelles (entité Décision absente, Track filtrable uniquement sur Projet, monde Label dupliqué via ProductionLabel) et soulève cinq points de modélisation nécessitant un arbitrage avant toute migration.

**Problème** : cinq décisions de modélisation devaient être prises avant que Claude Code puisse migrer le schéma — fusionner ou non Opportunite et ProductionLabel dans Projet, statut de Division.GENERALITES, généricité de Devis, cardinalité Contact↔Organisation.

**Décisions retenues** :

1. **Opportunite reste une entité séparée**, hors périmètre MVP (module CRM, Post-MVP — PRD section 6.3). Le cycle de vie du Projet (Livrable 03, section 4) est corrigé pour démarrer à *Devis envoyé* — la prospection amont vit dans Opportunite, pas dans Projet.
2. **ProductionLabel fusionne dans Projet** (Track=Label). Asset et SectionDossier deviennent respectivement Actif Créatif et Document, rattachés à ce Projet.
3. **Division.GENERALITES devient un Track nul**, conforme au mécanisme de connaissance transverse déjà défini (Livrable 06, §7) — pas une quatrième valeur d'énumération.
4. **Devis migre vers l'entité Document générique** déjà spécifiée dans l'ontologie (types devis/contrat/guideline/livrable/compte-rendu). Le système d'avenants devient le mécanisme de version générique de Document.
5. **Contact.organisationId devient nullable**, et une relation directe Contact↔Projet est ajoutée.

**Justification** : dans chaque cas, soit l'implémentation antérieure divergeait d'un choix déjà motivé dans l'ontologie (4, 5), soit elle dupliquait une structure que les principes de simplicité et de non-duplication interdisent (2, 3), soit elle correspondait à un objet métier réellement distinct que l'ontologie n'avait pas explicitement positionné (1).

**Conséquences** :
- Le Business Ontology (Livrable 03, section 4) est corrigé.
- L'entité Décision reste la priorité absolue d'implémentation à l'ouverture du build (règle confirmée, pas modifiée).
- Le champ `track` doit être ajouté à Organisation et à Document (ex-Devis), et propagé au monde Label fusionné — périmètre de la prochaine migration.
- Questions 01 et 02 du Livrable 12 sont résolues et retirées du registre.

**Alternatives futures** : si le volume d'opportunités commerciales croît significativement avant l'arrivée du module CRM complet, réévaluer un stockage minimal d'Opportunite dans MATN plutôt que de dépendre d'un outil externe.

---

## ADR-007 — Résolution des décisions ouvertes du plan de migration ADR-006

**Contexte** : la déclinaison d'ADR-006 en plan de migration concret (`docs/foundation/plan-migration-adr006.md`) a fait apparaître 7 décisions produit non couvertes par ADR-006, bloquantes pour toute exécution — statut `REFUSE` sans équivalent, conflation `budgetAlloue`/`budget`, champs `format`/`statutDiffusion` sans destination, mapping `TypeSectionDossier → TypeDocument`, pré-peuplement de la relation Contact↔Projet, sémantique du champ `palier`, et résolution des Organisations à Track multiple détectées au backfill.

**Problème** : sept points de modélisation devaient être tranchés avant que le plan de migration puisse être considéré comme exécutable.

**Décisions retenues** :

1. **Statut `REFUSE`** devient un 5ᵉ statut de `StatutDocument`, terminal au même titre que `SIGNE` — amende le cycle de vie à 4 statuts initialement décrit dans l'ontologie (Livrable 03, §5).
2. **`budgetAlloue`/`budget`** : deux champs distincts sur `Projet` (`budget` = plafond facturable, `budgetInterne` = enveloppe d'investissement) — pas de fusion dans un seul champ.
3. **`format`/`statutDiffusion`** : conservés dans un champ de métadonnées libres temporaire sur `Projet`, en attendant une décision de destination définitive.
4. **Mapping `TypeSectionDossier → TypeDocument`** : confirmé tel que proposé dans le plan de migration — `LIVRABLE` par défaut, type d'origine conservé en référence.
5. **Relation Contact↔Projet** : confirmée vide au départ, peuplée au fil de l'eau — pas de pré-peuplement automatique.
6. **Champ `Palier` (P0–P4)** : retiré du périmètre de cette migration, faute de définition sémantique documentée dans les livrables existants. À reprendre dans une migration de suivi une fois cette définition clarifiée avec le produit.
7. **Organisations à Track multiple** (anomalies de backfill) : plan existant conservé (NULL + journalisation + arbitrage manuel avant passage en `NOT NULL`) — précision ajoutée : ce NULL transitoire est distinct par nature du NULL permanent que portent les connaissances stratégiques transverses (Livrable 06, §7).

**Justification** : dans chaque cas, soit un champ dédié préserve une nuance métier réelle que la fusion aurait effacée (2, 3), soit le plan initial était déjà la meilleure option et ne faisait que manquer une validation explicite (4, 5, 7), soit la donnée manquante pour trancher correctement (sémantique de `palier`) justifie de sortir le point du périmètre plutôt que de figer un schéma sur une hypothèse (6), soit le statut manquant se résout le plus simplement en complétant l'énumération plutôt qu'en la contournant (1).

**Conséquences** :
- Le plan de migration (`docs/foundation/plan-migration-adr006.md`) est mis à jour en conséquence : `StatutDocument` gagne `REFUSE`, `Projet` gagne `budgetInterne` et un champ de métadonnées temporaire, le §7 (`palier`) est marqué hors scope.
- Aucune des 7 décisions ne lève l'exigence de validation avant exécution — le plan reste non exécuté et non mergé sur `main` tant qu'une autorisation d'exécution distincte n'est pas donnée.

**Alternatives futures** : réintégrer `palier` dans une migration de suivi une fois sa sémantique définie ; réévaluer si `budgetInterne` doit fusionner avec `budget` si l'usage démontre que la distinction n'apporte pas de valeur ; réévaluer le champ de métadonnées temporaire (`format`/`statutDiffusion`) à la prochaine revue de schéma, avec une échéance de nettoyage à fixer à l'exécution.

---

*MATN · ADR Register · Livrable 10 · Claude Strategist*
