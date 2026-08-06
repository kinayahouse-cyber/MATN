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
