# MATN — Intelligent Interfaces

> Livrable 09 · Phase 1 Foundation · Claude Strategist · 06 août 2026

---

## Interfaces MVP

### Project Workspace

**Objectif** : vue de travail unique sur un Projet — statut, jalons, Documents, Décisions, Notes liées.
**Utilisateur** : fondateur.
**Données affichées** : cycle de vie du Projet, historique de connaissance rattaché.
**Décisions facilitées** : où en est ce projet, quelle a été la dernière décision prise et pourquoi.
**Actions disponibles** : logguer une Décision ou une Note, mettre à jour un statut, rattacher un Document.

### Knowledge Hub

**Objectif** : point d'entrée pour retrouver le contexte d'un Client ou d'un Projet, actif ou dormant.
**Utilisateur** : fondateur.
**Données affichées** : Décisions et Notes indexées, filtrables par Client/Projet/Track.
**Décisions facilitées** : reprise rapide de contexte, rappel de préférence client ou d'arbitrage passé.
**Actions disponibles** : recherche, consultation, navigation vers le Projet ou Client source.

---

## Sitemap MVP

Cinq routes couvrent le périmètre MVP. Pas de page Documents autonome — un Document n'existe jamais hors du Client ou du Projet auquel il est rattaché (Business Ontology, Livrable 03).

```
/                → Home (bento : tuiles Clients, Projets, Recherche, Capture rapide)
/clients         → Liste des Clients (filtrable par Track, statut)
/clients/:id     → Fiche Client — Contacts, Projets liés, Décisions/Notes liées
                   (variante de Project Workspace appliquée à l'entité Client)
/projets         → Liste des Projets (filtrable par Track, statut)
/projets/:id     → Project Workspace — statut, jalons, Documents, Décisions, Notes
/recherche       → Knowledge Hub — recherche complète
```

**Navigation persistante** : le world-switcher existant (Studio/Label) s'étend à trois positions Studio/Atelier/Label pour couvrir l'ensemble des valeurs de Track (Business Ontology, Livrable 03, section 1), coloré selon le mapping défini en UI Direction (Livrable 13). Il filtre toutes les listes et fiches sans exception — c'est la traduction en navigation du cloisonnement défini en ADR-002.

**Accès à la recherche** : le Knowledge Hub est accessible depuis la tuile bento de la Home et depuis un point d'entrée persistant sur toute page.

---

## Interfaces Post-MVP

| Interface | Objectif | Utilisateur cible |
|---|---|---|
| Executive Dashboard | Vue consolidée santé de l'entreprise (pipeline, trésorerie, risques) | Fondateur, à mesure que la structure grandit |
| Business Dashboard | Suivi commercial (taux de conversion, pipeline par Track) | Fondateur, futur BD |
| Finance Dashboard | Trésorerie, facturation, échéances | Fondateur |
| CRM | Suivi prescripteurs et relances | Fondateur, futur BD |
| Creative Studio | Cadrage et production créative assistée | Fondateur, futurs collaborateurs créatifs |
| Client Portal | Suivi d'avancement et livrables pour le client | Client final |
| Team Workspace | Coordination multi-collaborateurs | Fondateur + freelances/BD, une fois recrutés |

Chaque interface Post-MVP suit le même principe que les interfaces MVP : elle explique une donnée ou un risque, elle ne se contente pas de l'afficher (Product Philosophy, Livrable 02, section 6). Leur conception détaillée est différée à leur mise en chantier respective, pour ne pas figer une UX avant qu'un usage réel existe.

---

*MATN · Intelligent Interfaces · Livrable 09 · Claude Strategist*
