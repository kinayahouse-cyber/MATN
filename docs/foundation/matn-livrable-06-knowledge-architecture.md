# MATN — Knowledge Architecture

> Livrable 06 · Phase 1 Foundation · Claude Strategist · 06 août 2026

---

## 1. Sources de connaissance

- **Décisions** capturées au moment où elles sont prises (Business Ontology, Livrable 03).
- **Notes / apprentissages** libres, rattachés à un Projet ou un Client.
- **Documents** validés (devis, contrats, livrables) — la connaissance qu'ils portent est indexée, pas seulement stockée.
- **Grille tarifaire et référentiels internes** — versionnés, source de vérité pour le pricing.
- **Historique projet** — statuts, jalons, écarts entre devis et réalisation.

Post-MVP : imports semi-automatisés (emails, notes de réunion, transcripts d'appels) — hors périmètre du build MVP Mémoire.

## 2. Structure des connaissances

Chaque entrée de connaissance (Décision, Note) est rattachée à une ou plusieurs entités de l'ontologie (Client, Projet) et porte un **Track** obligatoire (Studio / Atelier / Label).

La connaissance n'est pas stockée comme texte libre non structuré : chaque entrée porte un type, une entité liée, une date, et pour les Décisions, un champ "options écartées" — c'est ce qui la rend réutilisable plutôt que simple journal.

## 3. Méthodes de capture

- **Capture manuelle directe** (MVP) : l'utilisateur logue une Décision ou une Note au fil de l'eau, depuis l'interface de travail sur le Projet concerné.
- **Capture assistée** (Post-MVP) : un agent propose une entrée à partir d'un échange ou d'un document, l'utilisateur valide avant intégration.

La friction de capture doit rester minimale — une Décision qui prend plus de trente secondes à logger ne sera pas loguée. C'est une contrainte de conception, pas une option.

## 4. Méthodes de validation

Toute entrée de connaissance a un statut : **Brouillon** (proposée, non confirmée) ou **Actif** (confirmée par l'utilisateur). Seules les entrées Actives sont mobilisables par un agent IA pour informer une réponse ou une recommandation. Le principe "l'humain tranche" (Livrable 02) s'applique aussi à la validation de la mémoire elle-même.

## 5. Mécanismes d'apprentissage

Sans fine-tuning : l'apprentissage se fait par accumulation d'entrées structurées et par leur mobilisation contextuelle (Context Engineering, Livrable 05), pas par modification des modèles.

Post-MVP : détection de patterns récurrents entre Décisions similaires (ex. arbitrages de pricing comparables) pour surfacer un rappel proactif — fonctionnalité qui dépend de volume d'usage réel, non prioritaire en MVP.

## 6. Règles d'évolution

- Une Décision ne se modifie jamais rétroactivement : une nouvelle Décision qui la fait évoluer la référence explicitement (Business Ontology, section 6).
- Un Projet archivé conserve toute sa connaissance liée, accessible mais exclue des recommandations actives par défaut.
- Toute règle de cloisonnement (section 7) prime sur toute règle d'apprentissage : un pattern ne peut jamais être surfacé en traversant deux Track différents, même si la corrélation serait utile.

## 7. Cloisonnement Studio/Atelier — formalisation (ADR 8.2)

Contrainte fondatrice : *"Ne jamais croiser le portfolio Atelier Capsules et le portfolio Studio Capsules"* (grille tarifaire, section 12).

**Mécanisme** : chaque entrée de connaissance hérite du Track de l'entité à laquelle elle est rattachée (Client ou Projet). Toute requête de contexte — humaine ou agent IA — est filtrée par Track avant assemblage, au niveau de la Couche Logique Métier (System Architecture, Livrable 04). Un agent configuré sur une tâche Studio ne reçoit structurellement aucune entrée Track=Atelier, quelle que soit la formulation de la requête.

**Exception explicite** : les connaissances stratégiques transverses (ex. principes de pricing génériques, règles de marge internes) ne portent pas de Track — elles sont accessibles aux deux, car elles ne révèlent aucune information spécifique à un portfolio client.

**Cas non couvert à ce stade** : un Projet qui changerait de Track en cours de route. La règle actuelle (Business Ontology, section 4) l'interdit — un Projet hérite du Track de son Client à la création et n'en change pas.

---

*MATN · Knowledge Architecture · Livrable 06 · Claude Strategist*
