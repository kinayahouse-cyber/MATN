# MATN — Product Requirements Document

> Livrable 01 · Phase 1 Foundation · Rédigé par Claude Strategist · 06 août 2026
> Référence : `matn-vision-principes-fondateurs.md` (doc-cadre v1)

---

## 1. Vision

MATN est la couche centrale de fonctionnement de Kinaya : la mémoire, le système nerveux et le cockpit de l'entreprise. Il centralise ce qui aujourd'hui vit dans la tête d'une seule personne, se perd d'un projet à l'autre, ou se re-déduit à chaque décision faute d'avoir été capitalisé.

## 2. Mission

Transformer la connaissance implicite de Kinaya (opérations, clients, décisions, apprentissages créatifs) en un actif structuré, interrogeable, et qui survit aux individus — sans jamais retirer à l'humain la responsabilité des décisions à enjeu.

## 3. Problèmes à résoudre

| Problème actuel | Coût si non résolu |
|---|---|
| La connaissance métier vit dans la tête du fondateur | Dépendance totale, rien ne survit à une indisponibilité |
| Les décisions passées (pricing, arbitrages Studio/Atelier, préférences client) ne sont pas capitalisées | Chaque décision similaire se re-raisonne de zéro |
| Aucun lien structuré entre projets, clients, décisions, actifs créatifs | Pas de vue d'ensemble, pas de détection de patterns |
| Les outils IA n'ont pas de mémoire du contexte métier au-delà d'une conversation | Travail répétitif de recontextualisation à chaque usage |
| Croissance à venir (freelances, recrutement BD) sans système pour transmettre le contexte | Onboarding lent, erreurs de cohérence (ex. tarifs, positionnement) |

## 4. Utilisateurs

**MVP (Phase 2 build)** : un seul utilisateur réel — le fondateur de Kinaya, sur les deux plateformes (OS et Creative).

**Cible moyen terme** : freelances/collaborateurs ponctuels avec accès restreint (lecture projet, pas accès mémoire stratégique complète).

**Cible long terme** (hors MVP, documentée mais non construite en premier) : clients via Client Portal, éventuel business developer à temps partiel avec accès CRM/prescripteurs.

Le MVP fonctionne en mono-utilisateur : un seul rôle, un seul niveau d'accès. La gestion multi-utilisateurs et les permissions arrivent avec le recrutement BD ou l'intégration du premier freelance, hors périmètre MVP.

## 5. Objectifs

1. Devenir la source unique de vérité pour tout projet actif (remplace la dispersion Notion/Excel/mémoire actuelle).
2. Capturer chaque décision structurante (pricing, positionnement, arbitrage Studio/Atelier) au moment où elle est prise, pas après coup.
3. Réduire à zéro le temps de recontextualisation quand on revient sur un projet ou un client après plusieurs semaines.
4. Poser une fondation qui n'a pas à être repensée quand l'entreprise grandit (freelances, BD, éventuelle Label).

## 6. Périmètre

### 6.1 Principe de scoping

**La documentation de Phase 1 couvre la vision complète** (MATN OS + MATN Creative, tous les modules et interfaces listés dans le brief). **Le build de Phase 2 ne couvre que le MVP Mémoire.** Documenter large ne veut pas dire construire large — ça veut dire ne pas avoir à redéfinir les fondations quand le périmètre du build s'étend.

### 6.2 MVP Mémoire — dans le périmètre du premier build

- **Entités cœur** : Clients, Projets/Engagements, Décisions, Documents, Notes/Apprentissages — sur la base des 15 entités déjà définies dans l'implémentation existante (matn-rust / Supabase), à auditer et rationaliser plutôt qu'à redéfinir de zéro.
- **Navigation Studio/Label** existante (world-switcher) : conservée, à étendre à Atelier si le cloisonnement mémoire (voir Livrable 06) le permet proprement.
- **Capture de décision** : un mécanisme simple pour logger une décision structurante liée à un projet ou un client (quoi, pourquoi, alternatives écartées) — la brique la plus directement liée à la mission du produit.
- **Recherche / rappel de contexte** : retrouver rapidement l'historique d'un client ou d'un projet.

### 6.3 Hors périmètre MVP — documenté, pas construit en premier

- Executive Dashboard, Finance Dashboard, Business Dashboard
- Client Portal
- CRM structuré avec pipeline de prospection automatisé (le suivi actuel en outreach manuel suffit tant que le volume reste gérable)
- Automatisations n8n
- Orchestration Hermes multi-agents / multi-modèles
- Gestion multi-utilisateurs et permissions
- Génération créative intégrée (l'app nodale IA suit son propre palier de développement séparé, non dépendante de MATN pour son Palier 0-1)

### 6.4 Frontière stricte

Le cloisonnement Studio/Atelier (acté dans le doc-cadre, section 8.2) s'applique dès le MVP, même minimal : si Atelier entre dans la mémoire avant que ce cloisonnement soit conçu (Livrable 06), il n'entre pas du tout. On ne rattrape pas une fuite de portfolio après coup.

## 7. Principes

Repris du doc-cadre (section 7), rappelés ici car ils contraignent directement le scoping MVP :

- Simplicité avant sophistication — le MVP doit rester simple à opérer seul, sans équipe technique dédiée
- Données comme source de vérité unique
- Traçabilité de toute décision
- Humain responsable des décisions à enjeu — MATN capture et rappelle, il ne décide pas du pricing ou de l'engagement client à la place du fondateur
- Cloisonnement Studio/Atelier non négociable, même en MVP

## 8. Modules

| Module | Plateforme | Statut MVP |
|---|---|---|
| Gestion Clients | MATN OS | ✅ MVP |
| Gestion Projets/Engagements | MATN OS | ✅ MVP |
| Journal de décisions | MATN OS | ✅ MVP |
| Documents (devis, contrats, livrables) | MATN OS | ✅ MVP (stockage + lien, pas génération automatisée) |
| Recherche / mémoire contextuelle | MATN OS | ✅ MVP |
| CRM / Business Development | MATN OS | ⏸ Post-MVP |
| Finance / Trésorerie | MATN OS | ⏸ Post-MVP |
| Client Portal | MATN OS | ⏸ Post-MVP |
| Dashboards exécutifs | MATN OS | ⏸ Post-MVP |
| Brief / Recherche créative | MATN Creative | ⏸ Post-MVP |
| Génération image/vidéo | MATN Creative | ⏸ Suit son propre palier (app nodale IA) |
| Bibliothèque créative | MATN Creative | ⏸ Post-MVP |
| Hermes (orchestrateur) | Transverse | ⏸ Post-MVP — le MVP fonctionne sans orchestrateur multi-agents |

## 9. Critères de succès

**Pour le MVP (mesurables)** :

- Le fondateur consulte MATN, pas Notion/Excel/mémoire, comme premier réflexe pour retrouver l'état d'un projet ou d'un client.
- Toute décision de pricing ou de positionnement prise après le lancement du MVP est loguée au moment où elle est prise (pas reconstituée après coup).
- Reprise d'un projet dormant depuis plusieurs semaines : contexte complet retrouvé en moins de 2 minutes.
- Zéro incident de croisement Studio/Atelier dans la mémoire, dès le premier jour d'usage.

**Pour la Phase 1 documentation** : voir critère de sortie défini dans le document "MATN — Phase 1: Foundation" (12 livrables validés, décisions structurantes documentées, architecture cohérente, périmètre stabilisé).

## 10. Roadmap

**Phase 1 — Foundation** (en cours) : 12 livrables documentaires, ce PRD est le premier validé.

**Phase 2 — Core Platform (MVP Mémoire)** : implémentation du périmètre défini en 6.2, sur la base de l'existant (matn-rust, Supabase, 15 entités).

**Phase 3 — Extension** (hors périmètre de ce PRD, à redéfinir via Livrable 11 une fois le MVP en usage réel) : CRM, Finance, Client Portal, Hermes multi-agents, MATN Creative.

---

*MATN · PRD · Livrable 01 · Claude Strategist*
