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

---

## ADR-007 — Arbitrages du plan de migration (7 décisions ouvertes)

**Contexte** : le plan de migration (`docs/foundation/plan-migration-adr006.md`, branche `claude/plan-migration-adr006-s1sc1n`) liste 7 décisions produit bloquantes, non couvertes par ADR-006.

**Décisions retenues** :

1. **Statut Document `Refusé`** : 5ᵉ statut terminal, au même niveau que `Signé` (option b du plan). Ontologie corrigée (Livrable 03, section 5).
2. **budgetAlloue / budget** : pas de fusion. Projet garde deux champs distincts — `budget` (plafond facturable) et `budgetInterne` (enveloppe d'investissement, optionnel, principalement Track Label). Ontologie corrigée (Livrable 03, section 4).
3. **format / statutDiffusion** : préservés dans un champ métadonnées libres (option b du plan), le temps d'un cycle de release. Ontologie corrigée (Livrable 03, section 5).
4. **TypeSectionDossier → TypeDocument** : mapping par défaut vers `LIVRABLE`, type d'origine conservé en notes. Recommandation du plan actée sans modification.
5. **Contact↔Projet** : relation laissée vide à la migration, peuplée au fil de l'eau, pas d'auto-inférence depuis l'Organisation. Recommandation du plan actée sans modification.
6. **Palier P0–P4** : retiré du périmètre de cette migration. Sa sémantique n'a jamais été documentée, y compris à la conception initiale (hook réservé sans définition) — aucune décision de modélisation ne peut être prise sans fabriquer une logique métier inexistante. Nouvelle question ouverte au Livrable 12.
7. **Organisations à Track multiple** : recommandation du plan actée (Track laissé `NULL`, liste journalisée, arbitrage manuel avant contrainte `NOT NULL`), avec une précision : ce `NULL` est transitoire et doit être résolu avant la contrainte finale — à ne pas confondre avec le `NULL` permanent des connaissances transverses (Livrable 06, §7), qui est un mécanisme distinct et non lié à cette anomalie de données.

**Justification** : quatre points (1, 4, 5, 7) reprennent la recommandation déjà motivée dans le plan sans changement — pas de désaccord de fond. Deux points (2, 3) corrigent une perte de nuance métier que la fusion aurait causée silencieusement. Un point (6) est retiré plutôt que tranché arbitrairement, faute de toute information permettant une décision de bonne foi.

**Conséquences** : le plan de migration doit être mis à jour pour refléter ces sept points avant merge sur `main` — en particulier retirer `palier` du périmètre de cette migration et ajouter les champs `budgetInterne` et métadonnées libres au schéma cible. Le champ temporaire de métadonnées de migration (préservant `format`/`statutDiffusion`) est revu au plus tard à l'ouverture de la Phase 3 (Livrable 11) — pas de délai flottant sans échéance fixée.

**Alternatives futures** : la sémantique de Palier P0–P4 sera définie par le fondateur puis réintroduite dans une migration ultérieure, une fois le champ retiré ne bloque plus rien.

---

## ADR-008 — Label Workspace (champs structurés sur Projet) et entité Fournisseur (Orbit)

**Contexte** : avant l'écriture du `schema.prisma` cible, le fondateur signale que Label a des besoins qui débordent du Projet unifié tel que fusionné par ADR-006 point 2, et demande l'ajout d'une nouvelle entité (annuaire de fournisseurs/intervenants, module « Orbit »).

**Problème** : deux ajouts à trancher avant le schéma cible — (1) jusqu'où va la spécificité Label dans un Projet resté unifié, sans revenir sur la fusion ADR-006 pt.2 ; (2) le périmètre minimal de l'entité Fournisseur.

**Décisions retenues** :

1. **Label reste un Projet (Track=Label), pas une entité séparée** — la fusion d'ADR-006 point 2 n'est pas défaite. En revanche, `Projet` gagne trois champs structurés propres au monde Label, peuplés uniquement pour Track=Label :
   - `stadeLabel` (enum dédié, repris de l'ancien `StadeProductionLabel` : Développement/Préprod/Prod/Distribution/Archive) — coexiste avec le `stade` général du Projet (cycle commercial) plutôt que de le remplacer, faute de recouvrement propre entre les deux cycles.
   - `format` (texte structuré).
   - `statutDiffusion` (texte structuré).
   Ces trois champs **remplacent** le champ `metadonneesMigration` (JSON temporaire) prévu par ADR-007 point 3 — `format` et `statutDiffusion` ont désormais une destination définitive, la préservation temporaire en JSON n'a plus lieu d'être.
2. **Nouvelle entité `Fournisseur`** (module produit « Orbit ») : annuaire simple — nom, catégorie/spécialité, contact, notes. **Aucune relation structurelle vers `Projet` dans ce MVP** — explicitement écarté par le fondateur, à réévaluer plus tard si le besoin de traçabilité « qui a travaillé sur quel Projet » émerge en usage réel.

**Justification** : Label a un cycle de production réel (développement → distribution) que le cycle commercial générique de Projet ne représente pas fidèlement — l'ancien mapping approximatif (plan de migration, §3) le confirmait déjà. Lui donner des champs structurés dédiés plutôt que de le forcer dans `stade` ou de le reléguer en JSON règle ce problème sans dupliquer toute l'entité Projet. Fournisseur reste volontairement minimal (pas de relation) pour ne pas anticiper un besoin non confirmé — cohérent avec le principe de simplicité déjà appliqué ailleurs dans l'ontologie (Product Philosophy, Livrable 02).

**Conséquences** :
- Business Ontology (Livrable 03) : ajout de la section Fournisseur (nouvelle entité MVP) ; note sur les champs Label de Projet.
- Product Modules (Livrable 08) : ajout de deux modules MVP — Label Workspace, Orbit.
- `docs/foundation/plan-migration-adr006.md` §3 : le champ `metadonneesMigration` y est décrit comme temporaire ; cette description est supersédée ici pour le cas Label spécifiquement (le plan garde sa valeur historique, cette ADR prime pour le schéma cible réel).
- `prisma/schema.prisma` (à écrire) intègre ces deux décisions directement dans le schéma cible, sans étape de migration intermédiaire (aucune donnée existante, cf. `docs/foundation/dry-run-productionlabel.md`).

**Alternatives futures** : si Fournisseur a besoin d'un rattachement à Projet plus tard, ajouter une relation many-to-many à ce moment-là — pas de table de jointure prématurée aujourd'hui.

---

*MATN · ADR Register · Livrable 10 · Claude Strategist*
