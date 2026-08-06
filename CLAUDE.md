# MATN — Instructions pour Claude Code

MATN est la couche centrale de fonctionnement de Kinaya (agence créative, Alger) : mémoire organisationnelle, cockpit de décision, orchestration entre outils métier et modèles IA. Deux plateformes à terme (MATN OS, MATN Creative) partageant une mémoire unique — mais le build actuel ne couvre que le MVP Mémoire (voir périmètre ci-dessous).

Documentation complète : `docs/foundation/`. Lire le livrable concerné avant toute tâche qui touche son domaine — ne pas travailler de mémoire sur l'architecture.

## Règle absolue

**Toute ambiguïté dans une spécification déclenche une question. Jamais une supposition.** Si un point n'est pas couvert par `docs/foundation/`, demander avant d'implémenter.

## Périmètre actuel (MVP Mémoire — PRD, section 6.2)

Dans le périmètre : Gestion Clients, Gestion Projets/Engagements, Journal de décisions, Documents, Recherche/mémoire contextuelle. Mono-utilisateur, sans gestion de permissions (ADR-005).

Hors périmètre — ne pas implémenter sans validation explicite : CRM, Finance, Client Portal, Dashboards exécutifs, Hermes (orchestrateur multi-agents), automatisations n8n, MATN Creative.

## Règles d'architecture non négociables

1. **Toute donnée qui atteint une interface, un modèle IA, ou un workflow d'automatisation passe par la Couche Logique Métier.** Aucun accès direct à la Couche Données depuis ailleurs. (`docs/foundation/matn-livrable-04-system-architecture.md`)
2. **Cloisonnement Track (Studio / Atelier / Label) obligatoire et natif au schéma**, pas une convention d'usage. Toute entité liée à un Client ou un Projet porte un Track. Toute requête de contexte est filtrée par Track avant sortie. (`matn-livrable-06-knowledge-architecture.md`, ADR-002)
3. **Aucune Décision ne se modifie rétroactivement.** Une nouvelle Décision qui fait évoluer une précédente la référence explicitement. (`matn-livrable-03-business-ontology.md`)
4. **Aucun modèle IA n'est fine-tuné sur les données Kinaya.** La mémoire vit dans le système, pas dans les poids d'un modèle. (`matn-livrable-02-product-philosophy.md`)
5. **Hermes n'existe pas dans le périmètre actuel** — ne pas construire de couche d'orchestration multi-agents pour le MVP.

## Ontologie de référence

Entités MVP : Client, Contact, Projet/Engagement, Document, Décision, Note/Apprentissage, Utilisateur (minimal). Détail complet, propriétés, relations, cycles de vie : `matn-livrable-03-business-ontology.md`.

L'implémentation existante (15 entités, Supabase) doit être auditée et réconciliée avec cette ontologie avant tout nouveau développement — voir `matn-livrable-12-open-questions.md`, question 01 et 02.

## Décisions structurantes

Historique complet et justifications : `matn-livrable-10-adr-register.md`. Ne pas rouvrir une décision actée sans repasser par Claude Strategist.

## Index des livrables

| Fichier | Contenu |
|---|---|
| `matn-prd-livrable-01.md` | Vision, mission, périmètre, critères de succès |
| `matn-livrable-02-product-philosophy.md` | Principes de conception, règles de dev, principes IA/UX |
| `matn-livrable-03-business-ontology.md` | Entités, propriétés, relations, cycles de vie |
| `matn-livrable-04-system-architecture.md` | Couches, responsabilités, dépendances autorisées |
| `matn-livrable-05-ai-architecture.md` | Hermes, LLM Gateway, agents, skills, memory |
| `matn-livrable-06-knowledge-architecture.md` | Capture, validation, cloisonnement |
| `matn-livrable-07-business-process-maps.md` | Processus métier, actuel vs cible |
| `matn-livrable-08-product-modules.md` | Modules, responsabilités, dépendances |
| `matn-livrable-09-intelligent-interfaces.md` | Interfaces, données, décisions facilitées |
| `matn-livrable-10-adr-register.md` | Décisions structurantes justifiées |
| `matn-livrable-11-product-roadmap.md` | Phases, dépendances, critères de réussite |
| `matn-livrable-12-open-questions.md` | Questions non résolues, priorité, stratégie |
| `matn-livrable-13-ui-direction.md` | Direction visuelle, typographie, couleur, composants MVP |
