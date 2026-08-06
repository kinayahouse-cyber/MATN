# Audit de réconciliation — MATN Phase 2, étape 0

> Réconciliation des 15 entités existantes (Next.js/Prisma/Supabase, dernier état applicatif avant l'archivage du code) avec le Business Ontology (Livrable 03) et vérification du support du cloisonnement Track (Livrables 04 et 06).
>
> Statut : rapport d'écart uniquement. Aucun code modifié, aucune migration exécutée.

**Sources consultées** :
- `prisma/schema.prisma` et `CLAUDE.md`, tels qu'ils existaient au dernier commit applicatif (`8257030`) avant l'archivage du code sur ce repo — récupérés depuis l'historique git, ils n'existent plus dans l'arborescence courante.
- `docs/foundation/matn-livrable-03-business-ontology.md`
- `docs/foundation/matn-livrable-04-system-architecture.md`
- `docs/foundation/matn-livrable-06-knowledge-architecture.md`

---

## 1. Réconciliation des 15 entités existantes

| # | Entité Prisma | Entité ontologie MVP | Écarts de propriétés |
|---|---|---|---|
| 1 | `Utilisateur` | **Utilisateur** — MVP | Ontologie attend `nom, rôle`. Le schéma a `nom, email` — pas de champ `rôle` du tout ; `email` non prévu par l'ontologie (probablement nécessaire pour l'auth, à documenter comme extension). |
| 2 | `Organisation` | **Client** — MVP | Écart majeur : pas de champ **Track dominant** (requis par l'ontologie et par la règle de cloisonnement) ; pas de champ **statut** de cycle de vie (prospect/actif/dormant/archivé) — le seul champ proche, `type` (CLIENT_DIRECT/AGENCE/PRESCRIPTEUR), est un axe différent (nature de la relation, pas cycle de vie) ; pas de **date de premier contact** explicite (`createdAt` n'est pas sémantiquement équivalent). Champs hors ontologie : `nif/nis/rc/ai/rib` (identifiants légaux Algérie), `notes`. |
| 3 | `Contact` | **Contact** — MVP | Bonne correspondance : `nom`, `role`, `canal` (`CanalContact`), `registre` (`Registre` tu/vous) couvrent les propriétés clés de l'ontologie. Écart de cardinalité : `organisationId` est **obligatoire** (`onDelete: Cascade`) alors que l'ontologie prévoit un Contact rattaché à *zéro ou un* Client (cas du « prescripteur indépendant »). Pas de relation directe Contact↔Projet alors que l'ontologie l'autorise (« peut être lié à plusieurs Projets ») — seulement transitif via l'Organisation. |
| 4 | `Opportunite` | Aucune entité MVP directe — voir §2 | Le plus proche est **Interaction CRM (Post-MVP)**, mais `Opportunite` est un objet de pipeline commercial (kanban), pas un « point de contact hors projet signé ». Autre lecture possible : l'ontologie traite `Projet` comme couvrant tout le cycle dès la Prospection, alors que le schéma sépare `Opportunite` (avant signature) et `Projet` (après) — écart de modélisation à trancher, pas seulement un écart de propriétés. |
| 5 | `Projet` | **Projet / Engagement** — MVP | `engagement` ✓, `division` ✓ (Track, voir §3), `budget` (montant) ✓. Écarts : pas de champ **palier** — présent dans les propriétés clés de l'ontologie, et explicitement listé comme *hook réservé, non implémenté* dans l'ancien `CLAUDE.md` (`Palier (P0–P4)`). Le cycle de vie ontologique (Prospection → Devis envoyé → Signé → En cours → Livré → Clos, + Abandonné) ne correspond pas à `StadeProjet` (Cadrage/Préprod/Production/Livraison/Clôture), qui ne couvre que les étapes post-signature — les étapes commerciales vivent dans `Opportunite`/`Devis`. Pas de champ **date de signature** ni **jalons** (seulement `dateDebut`/`dateFinPrevue`). `organisationId` est **nullable** (« projets internes/label »), alors que l'ontologie dit qu'un Projet est « rattaché à un Client » — cohérent uniquement si l'on considère les projets Label comme hors du périmètre de cette règle. |
| 6 | `Devis` | Sous-type de **Document** — MVP | L'ontologie définit un Document générique (types : devis/contrat/guideline/livrable/compte-rendu) avec statuts brouillon→validé→envoyé→signé et un mécanisme de versionnement générique. Le schéma n'implémente que le type « devis », via une table dédiée avec un système de versionnement ad hoc (`avenantDe`/`avenants`, auto-relation) plutôt que le mécanisme générique attendu. Statuts (`BROUILLON/ENVOYE/ACCEPTE/REFUSE`) partiellement alignés (`REFUSE` n'a pas d'équivalent ontologique, `signé` de l'ontologie ≈ `ACCEPTE`). |
| 7 | `LigneDevis` | Aucune — détail d'implémentation de `Devis` | Ligne de facturation, non représentée à ce niveau de granularité dans l'ontologie. Voir §2. |
| 8 | `Facture` | **Facture / Paiement** — Post-MVP | Correspondance directe par le nom ; explicitement Post-MVP dans l'ontologie. |
| 9 | `Paiement` | **Facture / Paiement** — Post-MVP | Idem. |
| 10 | `ProductionLabel` | Aucune entité MVP directe — voir §2 | Recouvre implicitement `Projet` avec Track=Label, mais c'est une table entièrement séparée (pas de Track/`division` propre, pas de lien à une Organisation) plutôt qu'un `Projet` avec Track=Label. Duplique une partie de la forme de `Projet` (`code`, titre, budget, stade, taches, depenses) sans unification. |
| 11 | `SectionDossier` | Aucune — voir §2 | Contenu structuré propre au monde Label (dossier de développement), sans équivalent dans le Document ontologique orienté commercial/légal. |
| 12 | `Asset` | **Actif Créatif** — Post-MVP | Bonne correspondance conceptuelle (« livrable créatif versionné… dépend du cloisonnement Track pour la constitution de portfolio »). Écart critique : `Asset` est rattaché uniquement à `ProductionLabel` (donc au monde Label), alors que l'ontologie le définit comme produit « dans le cadre d'un Projet » en général ; et ni `Asset` ni `ProductionLabel` ne portent de champ Track exploitable (voir §3). |
| 13 | `Concept` | **Note / Apprentissage** — MVP (correspondance la plus solide, avec réserves) | L'ancien `CLAUDE.md` décrit `Concept` comme « espace de notes/idées libre, rattaché à un Projet » — proche de la définition ontologique de Note. Écarts : rattachable uniquement à un `Projet`, jamais à un `Client` (l'ontologie permet les deux) ; pas de champ **tag libre** ; pas de mécanisme de promotion Note→Décision. |
| 14 | `Tache` | Aucune — voir §2 | Entité opérationnelle (gestion de tâches), absente de l'ontologie métier (Livrable 03 ne couvre pas la gestion de tâches). |
| 15 | `Depense` | Aucune correspondance exacte — proche de **Facture/Paiement** (Post-MVP) par le domaine (finance), sens inverse | Suivi de dépense interne (sortant), alors que Facture/Paiement couvre l'encaissement client (entrant). Domaine voisin, entité distincte. |

### Constat prioritaire : l'entité **Décision** n'existe nulle part

Aucune des 15 entités ne couvre l'entité **Décision**, pourtant qualifiée par l'ontologie d'« entité centrale de la mission de MATN » (Livrable 03, §6) et de priorité absolue en cas d'arbitrage MVP. Ce n'est pas un oubli : l'ancien `CLAUDE.md` liste explicitement `NoteJournal (décisions)` parmi les « réservés (crochets, ne pas implémenter) », aux côtés de `Version` (versionnement générique de Document) et `Palier` (P0–P4). Les trois hooks réservés à l'époque correspondent exactement aux trois lacunes structurelles les plus importantes identifiées dans ce rapport.

---

## 2. Entités existantes sans équivalent dans l'ontologie MVP

| Entité | Recommandation proposée | Justification |
|---|---|---|
| `Opportunite` | **Reporter en Post-MVP**, sous réserve de clarification | Se rapproche d'Interaction CRM (Post-MVP) mais le mapping n'est pas exact — implique une décision de modélisation (fusionner dans le cycle de vie de `Projet`, ou conserver comme entité de pipeline distincte pour le Post-MVP CRM). À trancher avant migration, pas à cette étape. |
| `LigneDevis` | **Garder telle quelle** | Détail d'implémentation de `Devis`/Document, pas un sujet ontologique en soi. |
| `ProductionLabel` | **Décision requise avant Post-MVP Label** — ne pas archiver sans arbitrage | Question ouverte : doit-elle devenir un `Projet` avec Track=Label (cohérent avec le principe « Track porté par toute entité rattachée à un Projet »), ou rester une entité distincte documentée séparément dans une future extension de l'ontologie ? Impacte directement la faisabilité du cloisonnement Track (voir §3). |
| `SectionDossier` | **Reporter en Post-MVP**, lié au sort de `ProductionLabel` | Suit la même logique que `ProductionLabel` — pas d'équivalent Document tant que le monde Label n'est pas re-questionné. |
| `Tache` | **Garder telle quelle, hors périmètre ontologie** | Outil opérationnel (gestion de tâches), indépendant du modèle de connaissance/mémoire visé par la Phase 2. Ne bloque pas la réconciliation. |
| `Depense` | **Reporter en Post-MVP**, avec `Facture`/`Paiement` | Même domaine (module Finance, explicitement Post-MVP), entité miroir côté dépenses plutôt que recettes. |

---

## 3. Le schéma actuel supporte-t-il un champ Track filtrable au niveau de la Couche Logique Métier ?

**Non, pas en l'état.** Constat détaillé :

- Le seul champ Track existant est `Projet.division` (enum `Division` : `STUDIO | ATELIER | LABEL | GENERALITES`) — **4 valeurs**, alors que l'ontologie n'en définit que 3 (`Studio | Atelier | Label`). La valeur `GENERALITES` n'a pas de statut défini dans l'ontologie (à rapprocher de la notion de « connaissances stratégiques transverses, sans Track » du Livrable 06, mais ce n'est pas formalisé).
- `Organisation` (= Client) **n'a aucun champ Track**. L'ontologie exige pourtant qu'un Client porte un Track dominant, et que le Projet « hérite du Track de son Client à la création ». Dans le schéma actuel, `Projet.division` est saisi indépendamment, sans lien ni contrainte avec une quelconque valeur côté `Organisation` — l'héritage et son immutabilité ne sont pas mécaniquement garantis, ils dépendraient uniquement d'une discipline applicative non présente dans le schéma.
- `Devis` (le seul sous-type de Document implémenté) **n'a aucun champ Track** propre — filtrable uniquement via une jointure sur `Projet.division`, pas au niveau dénormalisé qu'implique l'architecture (Livrable 04 : la Couche Logique Métier doit filtrer *avant* que la donnée ne sorte vers les autres couches).
- Le monde Label (`ProductionLabel`, `SectionDossier`, `Asset`) **n'a aucun champ Track nulle part dans la chaîne**. Son appartenance au Track « Label » est purement implicite (table dédiée), pas un attribut filtrable au sens de l'ontologie — un `Asset` (Actif Créatif) ne peut donc pas être filtré par Track par une requête générique au niveau de la Couche Logique Métier, contrairement à ce qu'exige le Livrable 03 (« Actif Créatif… dépend du cloisonnement Track pour la constitution de portfolio »).
- Aucune entité `Décision` ni `Note` (au sens strict de l'ontologie) n'existe : la question de leur Track est donc sans objet pour l'instant, mais toute création devra l'inclure dès le départ.

### Migration minimale nécessaire (à valider, non exécutée)

1. Ajouter un champ `track` (aligné sur l'énumération à 3 valeurs de l'ontologie) à `Organisation`, avec backfill et statut à définir pour les organisations existantes sans Track connu.
2. Trancher le sort de `Division.GENERALITES` : le retirer (migration des lignes concernées vers une des 3 valeurs, ou vers « aucun Track » façon connaissance transverse), ou documenter formellement une 4ᵉ valeur dans une prochaine révision de l'ontologie.
3. Dénormaliser `track` sur `Devis` (copié depuis le `Projet` parent à la création), pour permettre un filtrage direct sans jointure au niveau de la Couche Logique Métier.
4. Ajouter `track` à `ProductionLabel` et propager (directement ou via jointure) jusqu'à `Asset` et `SectionDossier` — **sous réserve de l'arbitrage du §2** sur la fusion ou non de `ProductionLabel` dans `Projet`.
5. Ajouter une contrainte applicative (au niveau de la future Couche Logique Métier — rien de tel n'existe au niveau base de données aujourd'hui) garantissant que `Projet.track = Organisation.track` à la création et que le champ est immuable ensuite.
6. Prévoir, dès la création des tables `Décision` et `Note` (actuellement inexistantes), un champ `track` nullable (nul = connaissance stratégique transverse, conformément au Livrable 06 §7).

---

## Synthèse

Trois lacunes structurelles ressortent, et les trois étaient déjà identifiées — mais explicitement mises de côté — au moment du premier build :

1. **Décision** : aucune implémentation. Entité la plus critique de l'ontologie, entièrement à construire.
2. **Track** : présent seulement sur `Projet`, absent de `Client`, `Document` (Devis), et de tout le monde Label — le cloisonnement Studio/Atelier/Label n'est aujourd'hui mécaniquement applicable nulle part ailleurs que sur les Projets pris isolément.
3. **Monde Label dupliqué** (`ProductionLabel` vs `Projet`) : nécessite un arbitrage de modélisation avant toute migration, faute de quoi le point 2 ne peut pas être résolu proprement pour ce monde.

Aucune implémentation n'est proposée à ce stade — ce rapport attend validation avant toute suite (migration ou build).

---

*MATN · Audit de réconciliation · Phase 2, étape 0 · Claude*
