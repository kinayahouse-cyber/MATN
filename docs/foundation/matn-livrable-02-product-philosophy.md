# MATN — Product Philosophy & Principles

> Livrable 02 · Phase 1 Foundation · Claude Strategist · 06 août 2026

---

## 1. Valeurs du produit

- **La mémoire prime sur l'interface.** Toute interface est jetable et reconstructible ; la connaissance qu'elle expose ne l'est pas.
- **La retenue est une qualité de conception**, pas seulement une posture de marque Kinaya. Un système qui capture tout sans discernement produit du bruit, pas de la mémoire. MATN capture ce qui a de la valeur de rappel, pas tout ce qui est capturable.
- **La simplicité opérationnelle prime sur l'exhaustivité fonctionnelle** tant que MATN est utilisé par une seule personne.
- **Aucun outil, modèle ou fournisseur n'est indispensable** — sauf la mémoire elle-même.

## 2. Principes de conception

1. **Simplicité avant sophistication.** Une fonctionnalité qui demande une explication pour être utilisée a échoué.
2. **Modularité et séparation des responsabilités.** Chaque couche a un rôle unique ; aucune couche ne fait le travail d'une autre par commodité.
3. **Traçabilité de toute décision structurante**, au moment où elle est prise.
4. **Données comme source de vérité unique.** Aucune donnée métier ne vit uniquement dans une interface, un export, ou la tête d'un utilisateur.
5. **MVP avant complétude.** Chaque module se construit d'abord dans son périmètre minimal validé (PRD, section Périmètre), jamais dans sa version cible dès le départ.

## 3. Règles d'architecture

- Toute logique métier vit dans MATN, à l'exception de la logique de décision propre à Hermes (ADR 8.1, formalisée en Livrable 05).
- Le cloisonnement Studio/Atelier est une propriété du schéma de données, pas une convention d'usage (ADR 8.2).
- Aucun composant, à l'exception de la couche mémoire, n'est considéré permanent. Tout élément d'architecture doit pouvoir être remplacé sans perte de connaissance.
- L'accès aux données passe toujours par la couche logique métier — jamais d'accès direct à la donnée brute depuis une interface ou un agent IA.

## 4. Règles de développement

- Aucune ligne de code n'est écrite avant qu'une spécification correspondante soit validée (cycle documentation-first).
- Toute spécification destinée à l'implémentation doit être suffisamment précise pour qu'une ambiguïté déclenche une question, jamais une supposition.
- Toute décision structurante est enregistrée sous forme d'ADR (Livrable 10), au moment où elle est prise.
- Les documents de fondation sont versionnés ; une décision qui change une version antérieure remplace le contenu, elle ne l'accumule pas en couches de doutes.

## 5. Principes IA

- Les modèles de langage (Claude, GPT, DeepSeek, Gemini, futurs modèles) sont interchangeables par construction — accessibles via une couche d'abstraction commune (LLM Gateway, Livrable 05).
- Hermes porte une logique de décision propre et n'est donc pas interchangeable au même titre que les modèles qu'il orchestre (ADR 8.1) — cette asymétrie est assumée, pas un défaut à corriger.
- L'IA explique, recommande, détecte des risques et rappelle du contexte. Elle ne décide jamais seule sur les sujets à enjeu : pricing, engagement client, arbitrage stratégique.
- Aucun modèle n'est fine-tuné sur les données de Kinaya. La mémoire vit dans le système, pas dans les poids d'un modèle.
- Tout accès d'un agent IA à la mémoire respecte le cloisonnement Studio/Atelier, sans exception liée à l'urgence ou à la commodité du prompt.

## 6. Principes UX

- Chaque interface est conçue pour un rôle et une décision précise, pas comme vue générique sur la donnée.
- Un dashboard explique un chiffre ou un risque ; il ne se contente pas de l'afficher.
- Pour un utilisateur solo (MVP), la priorité est la vitesse de rappel de contexte, pas la richesse de visualisation.
- Aucune interface ne doit demander une reformulation manuelle de ce que le système sait déjà.

---

*MATN · Product Philosophy & Principles · Livrable 02 · Claude Strategist*
