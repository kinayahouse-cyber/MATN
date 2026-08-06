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

*MATN · ADR Register · Livrable 10 · Claude Strategist*
