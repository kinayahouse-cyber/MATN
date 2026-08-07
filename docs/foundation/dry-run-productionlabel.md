# Dry-run ProductionLabel → Projet — rapport de blocage

> MATN Phase 2, étape 1bis · Dry-run demandé en lecture seule contre la base de données actuelle.
>
> **Statut : non exécutable en l'état.** Ce document ne contient aucune donnée réelle ni aucun chiffre inventé — uniquement le constat de ce qui a été vérifié, et ce qui manque pour aller plus loin.

## Ce qui était demandé

Un dry-run en lecture seule (aucune écriture) contre la base Supabase de production, couvrant :

a. Détection des collisions de code `KIN-26-L-XXX` entre la séquence `Projet` et la séquence `ProductionLabel`.
b. Prévisualisation du mapping `ProductionLabel → Projet` (track=Label) pour chaque ligne existante, avec signalement des écarts `budget`/`budgetInterne`.
c. Prévisualisation du rattachement de chaque `Asset` et `SectionDossier` au `Projet` résultant.
d. Comptage des Organisations à `Projet.track` (via `division`, pré-migration) non nul et multiple (ADR-007, point 7).

## Ce qui a été vérifié

1. **Accès réseau direct (psql)** : indisponible depuis cette session — le sandbox ne route que le HTTPS (port 443) et le git-over-SSH, pas de connexion TCP brute vers un port Postgres (5432). Confirmé via le statut du proxy réseau de l'environnement et un test de connexion direct (timeout).
2. **Accès via le SQL Editor Supabase** (interface web, HTTPS) : fonctionnel — les 7 requêtes préparées (a, b, b bis, c, c bis, c ter, d) ont été transmises pour exécution.
3. **Résultat de la première requête** (`SELECT ... FROM projets`) : `ERROR: 42P01: relation "projets" does not exist`.
4. **Requête d'introspection** (`information_schema.tables`, tous schémas hors système) exécutée sur le projet `scjpjpluanwuaulvtaxz` : **le schéma `public` ne contient aucune table**. Seuls les schémas internes de Supabase sont présents : `auth`, `realtime`, `storage`, `vault` — aucune des 15 tables applicatives (`projets`, `organisations`, `productions_label`, `contacts`, `devis`, etc.) n'existe dans ce projet.

## Conséquence directe

Les points a, b, c, d sont **irréalisables contre cette base** — pas parce que les requêtes proposées seraient incorrectes (elles sont écrites contre le schéma reconstitué depuis `prisma/schema.prisma`, commit `8257030`), mais parce qu'il n'y a aucune donnée à interroger : la base ne contient pas — ou plus — le schéma applicatif de MATN.

## Ce qui reste ouvert, et n'a délibérément pas été deviné

Trois hypothèses sont possibles pour expliquer l'absence de ces tables, et rien dans les livrables consultés ne permet de trancher entre elles :

1. Les données existent dans un **autre projet Supabase**, distinct de `scjpjpluanwuaulvtaxz`.
2. Les données existent dans une **autre base Postgres** (l'ancien `CLAUDE.md` mentionnait Neon comme alternative envisagée à Supabase).
3. Le schéma applicatif **n'a jamais été migré nulle part**, ou a été supprimé indépendamment de ce repo — auquel cas les 15 entités de l'audit de réconciliation (`docs/foundation/audit-reconciliation.md`) n'ont peut-être jamais existé que sous forme de code (le `schema.prisma` du commit `8257030`), sans base de données vivante correspondante.

Aucune de ces trois pistes n'est vérifiable depuis cette session sans information supplémentaire (identifiant d'un autre projet, autre chaîne de connexion). Ce rapport ne tranche pas entre elles.

## Ce que ça change pour le plan de migration

Si l'hypothèse 3 se confirme (aucune base vivante), `docs/foundation/plan-migration-adr006.md` reste valide comme **plan de schéma cible**, mais toute la partie « stratégie de backfill » de chacun de ses 7 chantiers devient sans objet — il n'y aurait rien à migrer, seulement un schéma à créer directement dans son état cible. C'est une différence structurante, pas un détail : à confirmer avant toute autre étape sur ce chantier.

## Requêtes préparées (réutilisables dès qu'une base réelle est identifiée)

Les 7 requêtes en lecture seule (a, b, b bis, c, c bis, c ter, d) restent valides telles quelles contre toute base qui implémenterait effectivement le schéma de `prisma/schema.prisma` (commit `8257030`) — à rejouer contre la bonne base dès qu'elle est identifiée, sans modification.

---

*MATN · Dry-run ProductionLabel → Projet · Phase 2, étape 1bis · Claude*
