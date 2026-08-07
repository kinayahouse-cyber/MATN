# Dry-run ProductionLabel → Projet — rapport de blocage

> MATN Phase 2, étape 1bis · Dry-run demandé en lecture seule contre la base de données actuelle.
>
> **Statut : non nécessaire — confirmé, pas seulement bloqué.** Confirmé par le fondateur (07/08) : aucune donnée n'a jamais été chargée dans une base de production MATN. L'hypothèse 3 ci-dessous est donc actée. Ce document ne contient aucune donnée réelle ni aucun chiffre inventé — uniquement le constat de ce qui a été vérifié.

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

## Ce qui a été envisagé, puis tranché

Trois hypothèses avaient été posées pour expliquer l'absence de ces tables :

1. Les données existent dans un **autre projet Supabase**, distinct de `scjpjpluanwuaulvtaxz`.
2. Les données existent dans une **autre base Postgres** (l'ancien `CLAUDE.md` mentionnait Neon comme alternative envisagée à Supabase).
3. Le schéma applicatif **n'a jamais été migré nulle part**.

**Tranché (fondateur, 07/08) : hypothèse 3.** Aucune donnée n'a jamais été chargée dans une base de production MATN. Les 15 entités de l'audit de réconciliation (`docs/foundation/audit-reconciliation.md`) n'ont existé que sous forme de code (`prisma/schema.prisma`, commit `8257030`), jamais comme base de données vivante.

## Ce que ça change pour le plan de migration

Confirmé : `docs/foundation/plan-migration-adr006.md` reste valide comme **plan de schéma cible**, mais toute la partie « stratégie de backfill » de chacun de ses 7 chantiers est **sans objet** — il n'y a rien à migrer, seulement un schéma à créer directement dans son état cible (`CREATE TABLE`/`CREATE TYPE`, pas d'`ALTER`/`UPDATE` sur des lignes existantes). Le dry-run demandé n'a donc plus de raison d'être : il n'existe aucune donnée sur laquelle détecter des collisions, des écarts budgétaires ou des anomalies de Track.

## Requêtes préparées (conservées pour mémoire, sans usage prévu)

Les 7 requêtes en lecture seule (a, b, b bis, c, c bis, c ter, d) restaient valides contre toute base qui aurait implémenté le schéma de `prisma/schema.prisma` (commit `8257030`) — elles n'ont plus d'objet compte tenu de la confirmation ci-dessus, et ne seront pas rejouées sauf si cette confirmation devait un jour être révisée.

---

*MATN · Dry-run ProductionLabel → Projet · Phase 2, étape 1bis · Claude*
