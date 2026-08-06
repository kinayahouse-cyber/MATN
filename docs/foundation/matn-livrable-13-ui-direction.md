# MATN — UI Direction

> Livrable 13 · Phase 1 Foundation (extension) · Claude Strategist · 06 août 2026 · v1.1

---

## 1. Positionnement

MATN et le site Kinaya sortent de la même maison mais ne parlent pas au même moment de la journée. Le site Kinaya s'adresse à un prospect, une fois, dans un contexte de séduction éditoriale — voix Bruno-warm, matière, retenue. MATN s'adresse au fondateur, plusieurs dizaines de fois par jour, dans un contexte de vitesse et de rappel. Même maison, registre inverse : **Archivo compte, Spectral parle** s'applique dans l'autre sens que sur le site public — l'outil est massivement Archivo, Spectral n'apparaît que dans les moments de voix (une Décision loguée, une Note).

MATN n'est pas un produit à vendre visuellement. C'est un instrument de travail quotidien. La direction UI sert la vitesse de lecture et de rappel — la texture et la couleur y contribuent, elles ne décorent pas.

## 2. Principes visuels

1. **Densité avant respiration.** Priorité aux vues liste et tableau pour toute donnée. La texture et la couleur vivent sur les surfaces structurelles (navigation, fonds, tuiles), jamais dans les lignes de données.
2. **Le grain plutôt que l'illustration.** MATN n'utilise ni le sloughi ni le linocut — ces signes appartiennent au registre public. Il porte en revanche le principe qui les sous-tend (la texture comme marque de fabrication) sous une forme technique : le bitmap/demi-teinte (section 3).
3. **Chaque accent a un rôle, jamais une fonction décorative.** Chaque couleur au-delà du neutre de base signale quelque chose de précis — une action, un Track, un état. Aucune couleur n'est là pour "faire joli".
4. **La hiérarchie se lit en une passe.** Un utilisateur qui revient sur un Projet après trois semaines doit retrouver le statut, la dernière Décision et l'action suivante sans scroller.

## 3. Effet graphique principal : bitmap / demi-teinte

Le linocut du site public est une texture de reproduction — la trame demi-teinte (halftone/bitmap) en est l'équivalent technique : même famille de geste (une image réduite à une trame de points contrôlée), registre systémique plutôt qu'artisanal. C'est la signature graphique de MATN.

**Usage** : fonds de sections structurelles (Home, en-tête du World-switcher, écrans vides, états de chargement), jamais en fond des tables ou des blocs de texte — la trame ne doit jamais réduire la lisibilité d'une donnée. Dégradé de densité de points pour indiquer une transition ou une hiérarchie (plus dense = plus proche du point d'attention), à la manière d'un halo derrière le repère MATN sur la Home.

**Ce qu'elle remplace** : toute tentation d'illustration ou de photographie décorative — la trame est le seul motif autorisé dans l'outil.

## 4. Structure : bento box

La Home (`/`) est une grille bento de tuiles de navigation — pas un dashboard analytique. Chaque tuile mène à un point d'entrée du MVP : Clients, Projets, Recherche (Knowledge Hub), Capture rapide (logger une Décision ou une Note). Aucune tuile n'affiche de métrique chiffrée tant que les Dashboards exécutifs restent hors périmètre MVP (PRD, section 6.3) — une tuile peut afficher un compte ("12 Projets actifs"), jamais un indicateur de performance.

Chaque tuile porte une légère variation de teinte et, pour une ou deux tuiles clés, un fond en trame bitmap — assez pour distinguer visuellement la Home du reste de l'outil, sans que le bento se propage aux vues de détail (Fiche Client, Project Workspace), qui restent denses et tabulaires.

## 5. Typographie

- **Archivo** : typographie par défaut de toute l'interface — navigation, tableaux, statuts, formulaires, listes, libellés de tuiles bento.
- **Spectral** : réservée au contenu de voix — le texte d'une Décision loguée, une Note, un compte-rendu.
- Aucune troisième famille. Le contraste Archivo/Spectral porte à lui seul la hiérarchie de lecture.

## 6. Couleur

- **Base sombre** : mode par défaut, cohérent avec la texture bitmap qui se lit mieux sur fond sombre (voir références) et avec un usage quotidien prolongé.
- **Palette dédiée MATN**, distincte de la palette client Kinaya (sable/terracotta/olive/siène/ocre) : tons chauds façon 70s (rouille, moutarde, brun-orangé) contrebalancés par un bleu saturé — froid, technique, en rupture volontaire avec le reste de la maison.
- **Mapping fonctionnel du World-switcher (Track)** — la couleur rend le cloisonnement lisible d'un coup d'œil, pas seulement structurel (ADR-002) :
  - **Studio** → terracotta/rouille (cohérence avec la couleur d'action du site public)
  - **Atelier** → bleu saturé (rupture de teinte volontaire — impossible à confondre visuellement avec Studio)
  - **Label** → moutarde/ocre
- **Terracotta** reste la couleur d'action générale (bouton primaire) hors contexte de Track.
- **États fonctionnels** (actif/validé, en attente/brouillon, risque/retard) restent une troisième famille, distincte des couleurs de Track, pour ne jamais créer d'ambiguïté entre "quel Track" et "quel état".

## 7. Layout et densité

- **Home** : bento (section 4).
- **Listes** (Clients, Projets) : tables triables/filtrables, pas de cartes.
- **Fiches** (Project Workspace, Fiche Client) : deux zones — colonne principale (statut, jalons, contenu) et colonne latérale compacte (Décisions et Notes récentes).
- **World-switcher Studio/Atelier/Label** : toujours visible, position fixe, coloré selon le mapping de la section 6 — seul élément de navigation permanent avec l'accès à la Recherche.

## 8. Composants clés pour le MVP

| Composant | Usage |
|---|---|
| Tuile bento | Navigation Home vers Clients / Projets / Recherche / Capture rapide |
| Texture bitmap/demi-teinte | Fonds structurels (Home, en-têtes, états vides/chargement) — jamais sur donnée |
| Table triable/filtrable | Listes Clients, Projets |
| Fiche à deux colonnes | Project Workspace, Fiche Client |
| Bloc Décision | Affichage d'une Décision loguée (Spectral, contexte, options écartées, justification) |
| Bloc Note | Affichage d'une Note libre (Spectral) |
| Badge de statut | Cycle de vie Client/Projet — couleur des états fonctionnels (section 6) |
| Sélecteur de Track | World-switcher coloré Studio/Atelier/Label |
| Champ de capture rapide | Logging d'une Décision ou Note en un minimum de clics |

## 9. Ce qu'on n'utilise pas dans MATN

- La marque sloughi et ses déclinaisons linocut — signe du Studio/Atelier/Label vers l'extérieur, absent de l'outil interne.
- La tagline et la voix Bruno-warm en dehors du contenu Spectral (Décisions, Notes).
- Toute photographie ou illustration éditoriale — la trame bitmap est le seul motif.
- Les prix barrés, badges commerciaux, ou tout artifice visuel de vente — MATN n'a pas de public à convaincre.

---

*MATN · UI Direction · Livrable 13 · Claude Strategist*
