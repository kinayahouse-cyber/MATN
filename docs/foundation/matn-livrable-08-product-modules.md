# MATN — Product Modules

> Livrable 08 · Phase 1 Foundation · Claude Strategist · 06 août 2026

---

## Modules MVP (Phase 2)

### Gestion Clients

**Mission** : centraliser Client et Contact comme référence unique.
**Responsabilités** : création, mise à jour de statut, historique.
**Utilisateurs** : fondateur (Utilisateur unique en MVP).
**Interactions** : alimente Gestion Projets, Journal de décisions.
**Dépendances** : aucune — module fondation.
**Évolutions futures** : rôles et permissions différenciées, rattachement CRM.

### Gestion Projets/Engagements

**Mission** : suivre chaque Projet de la prospection à la livraison.
**Responsabilités** : cycle de vie du Projet (Business Ontology, section 4), rattachement Documents/Décisions/Notes.
**Utilisateurs** : fondateur.
**Interactions** : dépend de Gestion Clients, alimente Journal de décisions et Documents.
**Dépendances** : Gestion Clients.
**Évolutions futures** : rattachement Finance (facturation par jalon), Client Portal.

### Journal de décisions

**Mission** : capturer toute Décision structurante au moment où elle est prise.
**Responsabilités** : formulaire de capture à friction minimale, historique consultable et non modifiable rétroactivement.
**Utilisateurs** : fondateur.
**Interactions** : rattaché à Projet et/ou Client ; cœur du Knowledge Architecture (Livrable 06).
**Dépendances** : Gestion Clients, Gestion Projets.
**Évolutions futures** : suggestions proactives basées sur des patterns de décisions passées (Post-MVP, dépend d'Hermes).

### Documents

**Mission** : stocker et versionner devis, contrats, livrables, guidelines.
**Responsabilités** : gestion de version, statut (brouillon/validé/envoyé/signé).
**Utilisateurs** : fondateur.
**Interactions** : rattaché à Projet et/ou Client.
**Dépendances** : Gestion Clients, Gestion Projets.
**Évolutions futures** : génération assistée de devis à partir de la grille tarifaire.

### Label Workspace

**Mission** : donner au monde Label (Track=Label) une vue de travail adaptée à son cycle de production propre, distincte de la fiche Projet générique Studio/Atelier.
**Responsabilités** : dossier de développement (Documents rattachés) + bibliothèque d'assets (Actifs Créatifs) + suivi du stade de production dédié (Développement/Préprod/Prod/Distribution/Archive), format, statut de diffusion (ADR-008).
**Utilisateurs** : fondateur.
**Interactions** : consomme les mêmes entités que Gestion Projets (Projet, Track=Label) avec une présentation dédiée ; alimente Documents et Journal de décisions comme tout Projet.
**Dépendances** : Gestion Projets (mêmes données, vue différente — pas de nouvelle entité).
**Évolutions futures** : réception directe depuis le générateur IA nodal pour les Actifs Créatifs (crochet réservé, non codé en MVP).

### Orbit

**Mission** : annuaire des fournisseurs et intervenants externes à Kinaya (hors relation client).
**Responsabilités** : création, consultation, mise à jour d'une fiche Fournisseur (nom, catégorie/spécialité, contact, notes).
**Utilisateurs** : fondateur.
**Interactions** : aucune avec les autres modules en MVP — annuaire autonome (ADR-008).
**Dépendances** : aucune — module fondation, comme Gestion Clients.
**Évolutions futures** : rattachement à Projet (qui a travaillé sur quoi) si le besoin se confirme en usage réel.

### Recherche / Mémoire contextuelle

**Mission** : retrouver en moins de deux minutes le contexte complet d'un Client ou d'un Projet, y compris dormant.
**Responsabilités** : indexation et rappel cross-entités.
**Utilisateurs** : fondateur.
**Interactions** : interroge toutes les entités MVP.
**Dépendances** : tous les modules MVP ci-dessus.
**Évolutions futures** : accès agent IA filtré par Track (Post-MVP, dépend de Livrable 05).

---

## Modules Post-MVP

| Module | Mission résumée | Dépendances principales |
|---|---|---|
| CRM / Business Development | Pipeline de prospection et relance structurée | Gestion Clients |
| Finance / Trésorerie | Facturation, échéanciers, suivi de trésorerie | Gestion Projets |
| Client Portal | Accès client à l'avancement et aux livrables | Gestion Projets, Documents |
| Dashboards exécutifs | Vue consolidée décisionnelle | Tous modules OS |
| Brief / Recherche créative | Cadrage créatif structuré | MATN Creative |
| Génération image/vidéo | Production d'actifs créatifs assistée IA | App nodale IA (palier séparé) |
| Bibliothèque créative | Catalogue versionné des Actifs Créatifs | Génération image/vidéo |
| Hermes (orchestrateur) | Coordination multi-agents | AI Architecture (Livrable 05) |

---

*MATN · Product Modules · Livrable 08 · Claude Strategist*
