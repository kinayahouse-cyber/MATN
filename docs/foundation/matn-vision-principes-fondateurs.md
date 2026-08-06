# MATN — Vision & Principes Fondateurs

> Doc-cadre v1 · Rédigé par Claude Strategist · 06 août 2026
> Statut : v1.1 — décisions structurantes actées le 06/08 (section 8), roadmap Phase 1 adoptée (section 9).

---

## 1. Vision

MATN est la couche centrale de fonctionnement de Kinaya. Pas un outil de plus dans la pile — la fondation sur laquelle tous les autres outils s'appuient.

L'objectif n'est pas d'automatiser des tâches. C'est de faire en sorte que la connaissance produite par chaque projet, chaque décision, chaque itération, ne disparaisse pas avec le projet — qu'elle s'accumule et améliore la qualité des décisions suivantes.

## 2. Le problème que MATN résout

Aujourd'hui à Kinaya :

- La connaissance métier vit dans la tête d'une seule personne.
- Les décisions passées (pricing, arbitrages Studio/Atelier, préférences clients) ne sont pas capitalisées — elles se re-déduisent à chaque fois.
- Les outils IA utilisés (Claude, génération créative) n'ont pas de mémoire du contexte métier au-delà d'une conversation.
- Il n'existe aucun système qui relie projets, clients, décisions et actifs créatifs entre eux.

MATN existe pour transformer cette connaissance implicite en un actif structuré et réutilisable.

## 3. Ce que MATN est — et n'est pas

**MATN est :**
- Une mémoire organisationnelle persistante.
- Un cockpit de décision (dashboards qui expliquent, pas qui affichent).
- Une couche d'orchestration entre les outils métier et les modèles IA.

**MATN n'est pas :**
- Un CRM de plus, un ERP de plus, un gestionnaire de tâches de plus — même s'il en absorbe certaines fonctions.
- Un fine-tune de modèle : la mémoire vit dans le système, pas dans les poids d'un modèle.
- Un produit destiné à d'autres agences dès le départ — MATN est construit *pour* Kinaya d'abord. Une éventuelle commercialisation est une conséquence possible, pas un objectif de conception initial (voir décision 8.3).

## 4. Philosophie

Trois convictions structurent tout le reste :

1. **La mémoire est l'actif, pas la fonctionnalité.** Un dashboard qui disparaît demain doit pouvoir être reconstruit sans perte, parce que les données et la logique métier ne vivent jamais dans l'interface.
2. **L'IA sert la décision, l'humain la tranche.** MATN explique, recommande, détecte des risques. Il ne décide pas à la place du fondateur sur les sujets critiques (pricing, engagement client, arbitrage stratégique).
3. **Rien n'est indispensable sauf la mémoire.** Modèles IA, orchestrateur, outils d'automatisation : tout est remplaçable. Seule la couche de connaissance capitalisée doit survivre aux choix technologiques.

## 5. Architecture à deux plateformes

**MATN OS** — le système d'exploitation de l'entreprise : CRM, business development, finance, trésorerie, projets, ressources, planning, documents, reporting, client portal, dashboards exécutifs.

**MATN Creative** — le studio de création augmenté : brief, recherche, direction créative, moodboards, prompt engineering, génération image/vidéo, présentations, livraison, bibliothèque créative.

Les deux partagent **une mémoire unique**, cloisonnée nativement entre Studio et Atelier (décision 8.2).

## 6. Hermes — orchestrateur, pas cerveau

Hermes coordonne agents, workflows, skills, outils, modèles IA et automatisations (décision 8.1 : Hermes porte une logique métier propre, distincte de la couche modèles IA interchangeable).

## 7. Principes non négociables

- Simplicité avant sophistication
- Modularité et séparation des responsabilités
- Traçabilité de toute décision
- Données comme source de vérité unique
- Modèles IA interchangeables, jamais un point de dépendance critique
- Humain responsable des décisions à enjeu (financier, contractuel, stratégique)
- Contexte algérien traité comme un ensemble de contraintes documentées au fil de l'eau, pas comme un module à "apprendre" en amont

## 8. Décisions structurantes

### 8.1 — Hermes contient une logique métier

Hermes n'est pas qu'un routeur interchangeable : c'est un composant avec une responsabilité métier propre. Conséquence pour Livrable 05 (AI Architecture) : le principe de remplaçabilité (section 7) s'applique à la couche modèles, pas à Hermes lui-même — à formaliser dans ce livrable.

### 8.2 — Cloisonnement Studio/Atelier natif dans la mémoire

La frontière Studio/Atelier documentée dans la grille tarifaire (*"Ne jamais croiser le portfolio Atelier Capsules et le portfolio Studio Capsules"*) est une contrainte d'architecture, pas une règle de process. La mémoire MATN doit cloisonner nativement Studio et Atelier. Formalisation complète dans le Livrable 06 (Knowledge Architecture).

### 8.3 — MVP Mémoire

Le build de Phase 2 cible un MVP Mémoire, pas l'OS complet. La documentation de Phase 1 couvre la vision large ; le périmètre du build est isolé dans le PRD (Livrable 01, section Périmètre).

### 8.4 — Critère de sortie de Phase 1

Défini par le document "MATN — Phase 1: Foundation" : 12 livrables validés, décisions structurantes documentées, architecture cohérente, périmètre stabilisé. Ce doc-cadre adopte cette structure comme roadmap officielle — section 9.

## 9. Roadmap Phase 1 (adoptée le 06/08)

Structure officielle, remplace la version précédente de cette section. Douze livrables, dans l'ordre :

01. **PRD** — vision, mission, problèmes, utilisateurs, objectifs, périmètre, principes, modules, critères de succès, roadmap
02. **Product Philosophy & Principles** — valeurs, principes de conception, règles d'architecture/dev, principes IA, principes UX
03. **Business Ontology** — langage métier : chaque entité (définition, propriétés, relations, cycle de vie, règles, responsabilités)
04. **System Architecture** — couches, responsabilités, interactions, frontières, dépendances (sans choix technologiques)
05. **AI Architecture** — Hermes, LLM Gateway, modèles, agents, skills, memory, knowledge, orchestration, context engineering
06. **Knowledge Architecture** — sources, structure, capture, validation, apprentissage, règles d'évolution (inclut le cloisonnement Studio/Atelier, 8.2)
07. **Business Process Maps** — Sales, CRM, Onboarding, Production, Creative Workflow, Finance, Procurement, Knowledge Mgmt, Delivery, Validation
08. **Product Modules** — mission, responsabilités, utilisateurs, interactions, dépendances, évolutions futures, par module
09. **Intelligent Interfaces** — objectif, utilisateur, données, décisions facilitées, actions, par interface
10. **ADR Register** — décisions structurantes documentées au fur et à mesure
11. **Product Roadmap** — phases, fonctionnalités, dépendances, critères de réussite (c'est ici que le périmètre MVP Mémoire vs OS complet se tranche concrètement)
12. **Open Questions Register** — questions non résolues, classées, priorisées, avec stratégie de résolution

**Critère de sortie de Phase 1** : les 12 livrables validés, décisions structurantes documentées, architecture cohérente, périmètre stabilisé — une équipe technique peut démarrer sans redéfinir les fondations.

### Articulation documentation / build

Phase 1 documente la vision large (12 livrables, OS complet inclus). Le PRD (Livrable 01) scope le MVP pour le build de Phase 2 — documentation large et build ciblé sont deux périmètres distincts. Détail dans `matn-prd-livrable-01.md`.

---

*MATN · Doc-cadre v1 · Claude Strategist*
