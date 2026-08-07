# MATN — Business Ontology

> Livrable 03 · Phase 1 Foundation · Claude Strategist · 06 août 2026

Cette ontologie est la référence canonique du langage métier de MATN. L'implémentation existante (matn-rust, 15 entités, Supabase) est réconciliée avec cette structure au moment du Livrable 04 (System Architecture) et de son passage en implémentation.

Chaque entité porte un statut : **MVP** (dans le périmètre du build de Phase 2) ou **Post-MVP** (documentée, construite plus tard).

---

## 1. Track *(attribut transverse, pas une entité)*

Valeur énumérée : `Studio` · `Atelier` · `Label`.

Porté par toute entité rattachée à un client ou un projet (Client, Projet, Document, Actif Créatif). C'est le mécanisme qui opérationnalise le cloisonnement Studio/Atelier (ADR 8.2) : aucune requête, aucun agent IA, ne peut croiser deux valeurs de Track dans une même sortie destinée à un portfolio.

## 2. Client — MVP

**Définition** : une entité externe (entreprise, institution, particulier) avec laquelle Kinaya a une relation commerciale actuelle ou passée.

**Propriétés clés** : nom, secteur, Track dominant, statut (prospect / actif / dormant / archivé), date de premier contact.

**Relations** : possède plusieurs Contacts, plusieurs Projets, plusieurs Documents.

**Cycle de vie** : Prospect → Actif → Dormant → Archivé. Un client peut revenir d'Archivé à Actif ; il ne peut pas sauter directement de Prospect à Dormant.

**Règles métier** : un Client ne peut porter qu'un seul Track dominant à la fois (cohérent avec la frontière Studio/Atelier — un même client ne mélange pas les deux portfolios).

## 3. Contact — MVP

**Définition** : une personne physique rattachée à un Client ou agissant comme prescripteur indépendant.

**Propriétés clés** : nom, rôle chez le client, canal de contact préféré, registre relationnel (tu/vous).

**Relations** : rattaché à zéro ou un Client ; peut être lié à plusieurs Projets.

**Cycle de vie** : créé à la première interaction, jamais supprimé (seulement archivé) — c'est un point de mémoire relationnelle, pas juste un champ CRM.

## 4. Projet / Engagement — MVP

**Définition** : une mission commerciale délimitée, correspondant à un engagement de la grille tarifaire (Lecture, Identité, Film, Édition, Capsules & Content côté Studio ; AI, Motion/3D, Capsules, capacité hybride côté Atelier).

**Propriétés clés** : type d'engagement, Track, montant (plafond facturable, suivi contre devis/factures), montant interne (enveloppe d'investissement, optionnel — principalement Track Label, non facturable), statut, dates clés (signature, jalons, livraison). Le champ palier est différé jusqu'à définition de sa sémantique (Livrable 12, question ouverte).

**Relations** : rattaché à un Client, porte plusieurs Documents, génère des Décisions et des Notes.

**Cycle de vie** : Devis envoyé → Signé → En cours → Livré → Clos. Statut "Abandonné" possible depuis n'importe quelle étape avant Signé. La phase amont (prospection, avant devis) est portée par l'entité Opportunité, module CRM (Post-MVP) — un Projet, au sens de cette ontologie, existe à partir de l'émission d'un devis.

**Règles métier** : un Projet hérite du Track de son Client au moment de la création et ne peut pas en changer en cours de route. Un Projet de Track Label suit exactement la même structure que tout autre Projet — aucune entité distincte pour le monde Label (ADR-006). Il porte cependant trois propriétés structurées propres au monde Label, peuplées uniquement pour Track=Label : un stade de production dédié (Développement/Préprod/Prod/Distribution/Archive, distinct du statut commercial général), un format, un statut de diffusion (ADR-008).

## 5. Document — MVP

**Définition** : tout artefact écrit rattaché à un Projet ou un Client — devis, contrat, guideline, livrable final, compte-rendu.

**Propriétés clés** : type (devis / contrat / livrable / guideline / autre), version, statut (brouillon / validé / envoyé / signé / refusé).

**Relations** : rattaché à un Projet et/ou un Client.

**Cycle de vie** : Brouillon → Validé → Envoyé → Signé ou Refusé (les deux sont terminaux). Chaque nouvelle version remplace l'ancienne en tête, l'historique reste consultable.

## 6. Décision — MVP

**Définition** : un choix structurant pris dans le cadre d'un Projet ou de la stratégie générale — pricing, positionnement, arbitrage Studio/Atelier, choix créatif engageant.

**Propriétés clés** : intitulé, contexte, options écartées, justification, date, entité liée (Projet / Client / aucune si stratégique).

**Relations** : peut être rattachée à un Projet, un Client, ou rester autonome (décision d'entreprise).

**Cycle de vie** : créée au moment de la décision, jamais modifiée rétroactivement — une décision qui change devient une nouvelle Décision qui référence la précédente.

**Règles métier** : c'est l'entité centrale de la mission de MATN (section 2 du PRD). Toute fonctionnalité qui facilite sa capture est prioritaire sur toute autre en cas d'arbitrage MVP.

## 7. Note / Apprentissage — MVP

**Définition** : une observation informelle liée à un Projet ou un Client — ce qui a bien ou mal fonctionné, une préférence client identifiée, un enseignement réutilisable.

**Propriétés clés** : contenu, entité liée, tag libre.

**Relations** : rattachée à un Projet ou un Client.

**Cycle de vie** : créée librement, jamais supprimée. Peut être promue en Décision si elle s'avère structurante.

## 8. Actif Créatif — Post-MVP

**Définition** : un livrable créatif versionné (image, vidéo, fichier de design) produit dans le cadre d'un Projet.

**Statut** : documentée ici, construite avec MATN Creative (hors MVP). Dépend du cloisonnement Track pour la constitution de portfolio.

## 9. Facture / Paiement — Post-MVP

**Définition** : transaction financière liée à un Projet, suivant les échéanciers définis dans la grille tarifaire (ex. 40% signature / 30% mi-projet / 30% livraison).

**Statut** : documentée ici, construite avec le module Finance (hors MVP).

## 10. Interaction CRM — Post-MVP

**Définition** : un point de contact commercial hors Projet signé — relance, outreach, prise de contact prescripteur.

**Statut** : documentée ici, construite avec le module CRM (hors MVP). Le suivi actuel reste manuel (outreach direct) tant que le volume le permet.

## 11. Utilisateur — MVP (minimal)

**Définition** : la personne opérant MATN.

**Propriétés clés** : nom, rôle.

**Règles métier** : un seul Utilisateur actif en MVP (PRD, section 4). La notion de Rôle avec permissions différenciées devient une entité à part entière en Post-MVP, au moment du recrutement BD ou de l'intégration d'un premier freelance.

## 12. Fournisseur — MVP (annuaire minimal)

**Définition** : une entité externe (personne ou structure) fournissant une prestation ou une ressource à Kinaya — sans lien commercial client, à l'inverse de Client. Sert de support au module Orbit.

**Propriétés clés** : nom, catégorie / spécialité, contact, notes.

**Relations** : aucune en MVP — pas de rattachement à Projet (ADR-008). Simple annuaire, indépendant du reste de l'ontologie pour l'instant.

**Cycle de vie** : créé librement, pas de statut ni de workflow en MVP.

**Règles métier** : ne porte pas de Track — n'est rattaché à aucun Client ni Projet, donc hors du périmètre du cloisonnement Studio/Atelier.

---

## Schéma relationnel simplifié (MVP)

```
Client 1──* Contact
Client 1──* Projet
Projet 1──* Document
Projet 1──* Décision
Projet 1──* Note
Client 1──* Décision (décisions non liées à un projet précis)
```

---

*MATN · Business Ontology · Livrable 03 · Claude Strategist*
