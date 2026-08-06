# MATN — Product Roadmap

> Livrable 11 · Phase 1 Foundation · Claude Strategist · 06 août 2026

---

## Phase 1 — Foundation *(en cours)*

**Objectif** : poser une documentation stratégique et architecturale complète, sans écrire de code.

**Fonctionnalités** : aucune — livrables documentaires uniquement (Livrables 01 à 12).

**Dépendances** : aucune.

**Critères de réussite** : les 12 livrables validés, décisions structurantes documentées (ADR Register, Livrable 10), architecture cohérente, périmètre stabilisé — une équipe technique peut démarrer sans redéfinir les fondations.

---

## Phase 2 — Core Platform (MVP Mémoire)

**Objectif** : construire le périmètre MVP défini dans le PRD (Livrable 01, section 6.2), en partant de l'implémentation existante (matn-rust, Supabase, 15 entités) plutôt que de zéro.

**Fonctionnalités** :
- Modules Gestion Clients, Gestion Projets, Journal de décisions, Documents, Recherche contextuelle (Product Modules, Livrable 08).
- Couche Données et Couche Logique Métier telles que définies (System Architecture, Livrable 04), avec cloisonnement Track opérant dès le départ.
- Interfaces Project Workspace et Knowledge Hub (Intelligent Interfaces, Livrable 09).

**Dépendances** : Livrables 03, 04, 06, 08, 09 validés ; audit et rationalisation des 15 entités existantes.

**Critères de réussite** : critères de succès MVP du PRD (Livrable 01, section 9) — MATN devient le premier réflexe de consultation, décisions loguées au moment où elles sont prises, reprise de contexte en moins de deux minutes, zéro croisement Studio/Atelier.

---

## Phase 3 — Extension

**Objectif** : étendre MATN OS et démarrer MATN Creative, une fois le MVP en usage réel et son périmètre validé par la pratique.

**Fonctionnalités** :
- CRM / Business Development, Finance / Trésorerie, Client Portal, Dashboards exécutifs.
- Couche Orchestration (Hermes) et Couche Automatisation (n8n) — System Architecture, Livrable 04.
- MATN Creative : Brief, génération créative, bibliothèque — en coordination avec le palier de développement propre à l'app nodale IA.

**Dépendances** : Phase 2 en usage depuis une durée suffisante pour valider les hypothèses du MVP ; recrutement BD ou premier freelance si la gestion multi-utilisateurs devient nécessaire (ADR-005).

**Critères de réussite** : à définir au démarrage de la Phase 3, sur la base des apprentissages de la Phase 2 (Open Questions Register, Livrable 12).

---

## Phase 4 — Scale *(hors périmètre de définition actuelle)*

**Objectif** : évolution vers une structure Kinaya élargie (équipe, Label actif) et évaluation d'une éventuelle commercialisation de MATN au-delà de Kinaya (Vision & Principes Fondateurs, section 3).

**Statut** : non documentée à ce stade — dépend entièrement des résultats des Phases 2 et 3.

---

*MATN · Product Roadmap · Livrable 11 · Claude Strategist*
