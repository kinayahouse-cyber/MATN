# CLAUDE.md — Matn

Instructions de build pour Claude Code. Matn est l'outil de gestion interne de Kinaya (« le corps du texte » — là où toute l'activité se tient). Ce fichier est la référence projet ; `DESIGN_SYSTEM.md` est la référence visuelle. **Lire les deux avant de coder quoi que ce soit.**

## Ce qu'on construit

L'outil de gestion interne de Kinaya, agence créative à Alger. Deux sections à terme :
1. **Gestion** (ce build) — CRM/pipeline, projets, finances, label de production.
2. **Générateur IA nodal** (plus tard) — chaîne créative texte + image. Hors scope de ce build ; prévoir un crochet, ne rien coder.

Mono-utilisateur pour l'instant, architecture qui doit scaler vers le multi-utilisateur sans réécriture. Mono-devise : **DZD HT**.

## Stack

Next.js (App Router) · **déployé sur Vercel dès le départ** · Tailwind (config fournie).

**Base de données : Postgres hébergé — PAS de SQLite.** Le système de fichiers de Vercel est éphémère : une base SQLite sur fichier ne persiste pas entre déploiements ni entre invocations serverless. On va donc directement sur Postgres managé (la cible qui était de toute façon prévue), sans étape SQLite ni migration.

- **Recommandé : Supabase** — Postgres + auth intégrée + stockage de fichiers, tier gratuit généreux. Couvre d'un coup la base, la protection d'accès (voir ci-dessous) et la future bibliothèque d'assets Label.
- Alternative : **Neon** — Postgres pur, léger, si tu ne veux que la base et gères l'accès autrement.
- ORM : Prisma recommandé (schéma typé, migrations propres, portable entre Neon/Supabase).
- Ne jamais utiliser localStorage comme base de données. Variables sensibles (URL DB, clés) en variables d'environnement Vercel, jamais commitées ni exposées côté client.

**Protection d'accès (exigence, pas option).** L'app porte des données financières sur une URL publique Vercel : elle DOIT être protégée dès le premier déploiement. Mono-utilisateur ne veut pas dire ouvert. Minimum : un mur d'authentification (l'auth Supabase si Supabase est choisi, sinon un mot de passe applicatif simple + session). Ne pas déployer l'app accessible sans authentification. Structurer l'auth pour pouvoir accueillir plusieurs comptes plus tard sans réécriture.

## Design system

Le dossier `kinaya-design-system/` est la source de vérité visuelle. Importer `styles/tokens.css`, fusionner `tailwind.config.ts`, charger Spectral + Archivo (next/font/google). **Ne jamais hardcoder couleur/radius/taille** : toujours via les tokens. Sombre par défaut (`<html data-theme="dark">`), mode clair disponible. Détail des règles dans `DESIGN_SYSTEM.md`.

## Modèle de données — 14 entités

Deux mondes + des ponts transverses.

**Monde commercial**
- `Organisation` — client direct / agence / prescripteur ; secteur ; identifiants légaux (NIF, NIS, RC, AI, RIB) ; notes.
- `Contact` — appartient à une Organisation ; rôle ; canal ; registre (tu/vous) ; notes.
- `Opportunité` — appartient à une Organisation ; secteur ; division pressentie ; statut de pipeline ; valeur estimée. Se convertit en `Projet` si signée.
- `Projet` — voir détail plus bas.
- `Devis` + `LigneDevis` — appartiennent à un Projet. Un projet peut porter plusieurs devis (initial + avenants).
- `Facture` — format `FAC-AAAA-MM-NNN`, appartient à un Projet. Plusieurs factures possibles par projet (facturation mensuelle sprint/rétainer). Mention exonération TVA explicite.
- `Paiement` — encaissement réel rattaché à une Facture → alimente la trésorerie (+).

**Monde label (autonome)**
- `ProductionLabel` — entité indépendante, PAS un projet client. Voir détail plus bas. Aucun devis/facture/paiement.
- `SectionDossier` — sections typées du dossier de développement d'une ProductionLabel (note d'intention, pitch, références, traitement, script/chemin de fer).
- `Asset` — bibliothèque (image/vidéo/son/doc) rattachée à une ProductionLabel. **Crochet réservé** : réception depuis le générateur IA (ne pas coder le lien maintenant).

**Transverses**
- `Concept` — espace de notes/idées libre, rattaché à un `Projet` (côté Label, remplacé par le dossier structuré).
- `Tâche` — rattachable à un `Projet` **ou** une `ProductionLabel`. Libellé, statut (à faire/en cours/fait), échéance optionnelle, assignation optionnelle (pour le multi-user futur).
- `Dépense` — rattachable à un `Projet`, une `ProductionLabel`, **ou** générale (loyer, salaire). Catégorie, montant, date → alimente la trésorerie (−).

**Réservés (crochets, ne pas implémenter)** : `Version` (itérations), `NoteJournal` (décisions), `Palier` (P0–P4).

### Projet (détail)
- `code` — `KIN-26-{S|A|L|G}-XXX` auto-généré (Studio / Atelier / Label / Généralités).
- `division`, `engagement` (Lecture/Identité/Film/Édition/Capsules ou module Atelier).
- `stade` — cycle client : **Cadrage → Préprod → Production → Livraison → Clôturé**.
- `budget` — plafond de référence (suivi devisé/facturé/encaissé contre lui).
- Axe stade ≠ axe statut financier : indépendants, filtrables séparément.
- Trois vues (voir Fiche projet).

### ProductionLabel (détail)
- `code` — `KIN-26-L-XXX`, séquence propre.
- `format`, `budget_alloué` (enveloppe d'investissement, pas un plafond facturable).
- `stade_production` — cycle propre, différent du projet : **Développement → Préprod → Prod → Distribution → Archive**.
- `statut_diffusion`.
- Deux faces dans la fiche : **Développement** (dossier structuré + bibliothèque d'assets) et **Suivi** (cycle + tâches + dépenses + budget alloué vs consommé). Continuité dev→prod : deux phases du même lieu, pas deux écrans.

## Modules — 8 (menu latéral)

Groupés : **Aperçu** (Tableau de bord) · **Commercial** (Pipeline+CRM, Devis) · **Production** (Projets, Timeline, Calendrier) · **Ressources** (Finances/Argent, Label, Concepts).

1. **Tableau de bord** — deux blocs distincts : activité commerciale / label. Tréso nette, projets actifs par stade, devis en attente, factures en retard, marge globale (hors projets internes/label).
2. **Pipeline + CRM** — kanban des opportunités + annuaire organisations/contacts.
3. **Projets** — liste filtrable (division, stade, financier) + fiche projet.
4. **Timeline** — Gantt : chaque barre = un projet du cadrage à la livraison, regroupé par division.
5. **Calendrier** — bascule semaine/mois.
6. **Argent** (module unifié) — Documents (devis, factures, échéanciers — projets uniquement) + Cash (encaissements, dépenses, solde net, marge par projet).
7. **Label** — écran et logique propres (dev + suivi).
8. **Concepts** — espace notes/idées.

**Export Excel** = bouton contextuel sur chaque base de données (pas un module à part). Reproduit la structure existante : codes KIN, dashboard trésorerie. Générer un vrai `.xlsx` (SheetJS côté client ou openpyxl côté serveur).

### Fiche projet — 3 vues (onglets)
- **Vue travail** — concepts, tâches, stade, dossier interne.
- **Vue client** — avancement lisible, livrables, jalons, docs partageables. PAS de marge/coûts/notes internes. **Crochet réservé** : partage lien lecture seule (lié au multi-user, ne pas coder).
- **Vue financière** — budget vs devisé vs facturé vs encaissé, dépenses, marge réelle.

Ces trois vues sont des présentations des données existantes : zéro nouvelle entité.

## Règles métier

- Grille tarifaire v4 = **suggestion modifiable** à la création d'un devis (proposer les lignes/paliers, afficher le plancher comme garde-fou visuel, tout reste éditable). La grille n'est pas une contrainte.
- Flux vital : Opportunité →(signature)→ Projet → Devis → Facture → Paiement → Tréso(+). Dépense → Tréso(−). ProductionLabel → Tréso(−) sans recette attendue.
- Tréso nette = Σ Paiements − Σ Dépenses.
- Marge réelle projet = encaissé − dépenses rattachées. Le Label est exclu des stats de conversion et de marge client.
- Outreach (messages, relances) = **hors app**. Un simple champ notes par contact suffit.

## Ordre de construction

Le Label est le plus riche mais le moins urgent (différé jusqu'à trésorerie établie). Construire dans cet ordre :

1. **Socle** — layout, menu latéral, theming, tokens, modèle de données + Postgres hébergé (Prisma), **mur d'authentification**, et **premier déploiement Vercel vérifié** (variables d'env configurées, base connectée, accès protégé) avant d'aller plus loin. Déployer tôt et souvent, pas à la fin.
2. **Vital cash** — Pipeline/CRM → Projets (avec 3 vues) → Argent. C'est la priorité.
3. **Tableau de bord** — une fois qu'il y a des données à agréger.
4. **Timeline + Calendrier**.
5. **Label** — en dernier (dossier + assets + suivi).
6. **Export Excel** contextuel.
7. Crochets réservés (générateur IA, paliers, partage client, versions/journal) : laissés en points d'extension, non codés.

## Quality floor

Responsive mobile (tu y accèdes depuis plusieurs appareils) · focus clavier visible (anneau vermillon) · `prefers-reduced-motion` respecté · contraste texte vérifié · code audité · secrets en variables d'environnement Vercel uniquement (URL DB, clés) · aucune route de données accessible sans authentification · pas de clé API côté client pour le futur générateur.
