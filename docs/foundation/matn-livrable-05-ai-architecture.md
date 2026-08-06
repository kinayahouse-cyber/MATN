# MATN — AI Architecture

> Livrable 05 · Phase 1 Foundation · Claude Strategist · 06 août 2026

---

## 1. LLM Gateway

Point d'accès unique et interchangeable aux modèles de langage (Claude, GPT, DeepSeek, Gemini, futurs modèles). Expose une interface commune indépendante du fournisseur : un appel entrant, un modèle configurable, une sortie normalisée.

Aucun modèle n'est fine-tuné sur les données Kinaya. Le changement de modèle par défaut est une configuration, jamais une réécriture de logique.

## 2. Hermes

Orchestrateur du système. Décide quel agent, quel skill, quel modèle et quel workflow mobiliser pour une tâche donnée.

Porte une logique de décision propre (ADR 8.1) : le routage n'est pas un simple if/else statique, c'est une couche qui interprète le contexte métier pour choisir la meilleure combinaison d'outils. Cette logique est distincte de la logique métier de fond (règles de l'ontologie, cloisonnement), qui reste entièrement dans la Couche Logique Métier (Livrable 04) — Hermes consomme cette couche, il ne la duplique pas.

Conséquence architecturale : Hermes est moins remplaçable que les modèles qu'il orchestre. C'est assumé. La remplaçabilité totale décrite dans les principes fondateurs (Livrable 02) s'applique à la Couche Modèles IA, pas à Hermes lui-même.

## 3. Agents

Un agent est une combinaison configurée de : un rôle, un accès à un sous-ensemble de la mémoire (filtré par Track), un ou plusieurs skills, et un accès au LLM Gateway.

Les agents ne stockent aucun état métier propre — leur mémoire de travail est reconstituée à chaque exécution à partir de la Couche Logique Métier. Un agent qui disparaît n'emporte aucune connaissance avec lui.

## 4. Skills

Une skill est une capacité réutilisable et versionnée (ex. rédaction de devis selon la grille tarifaire, structuration d'un compte-rendu de décision, recherche de contexte client). Les skills sont composables entre agents — une même skill peut servir à plusieurs agents sans duplication.

## 5. Memory

La mémoire exposée aux modèles IA n'est jamais la Couche Données brute (Livrable 04) : c'est un sous-ensemble filtré, assemblé par la Couche Logique Métier selon la tâche et le Track autorisé.

Deux modes d'accès :
- **Lecture contextuelle** : un agent demande le contexte pertinent pour une tâche (ex. historique d'un client) — la Couche Logique Métier assemble la réponse.
- **Écriture structurée** : un agent propose une entrée (ex. une Note) — elle est validée selon les règles de l'entité concernée avant d'intégrer la Couche Données.

## 6. Knowledge

La connaissance capitalisée (Décisions, Notes, apprentissages) est distincte de la donnée transactionnelle (Client, Projet, Document) bien que stockée dans la même Couche Données. Le détail de sa structure et de ses règles d'évolution est traité dans le Livrable 06.

## 7. Orchestration

Le flux type d'une tâche : Interface ou déclencheur → Hermes évalue le contexte et sélectionne agent(s)/skill(s) → agent(s) interrogent la Couche Logique Métier pour le contexte nécessaire → LLM Gateway exécute → résultat repasse par la Couche Logique Métier pour validation/écriture → retour à l'Interface.

## 8. Context Engineering

Principe : un agent ne reçoit que le contexte nécessaire à sa tâche, jamais un accès mémoire ouvert. La sélection du contexte est une responsabilité de la Couche Logique Métier (filtrage par Track, par entité liée, par pertinence temporelle), pas du prompt de l'agent.

## 9. Portée pour le MVP

Le MVP Mémoire (PRD, section 6.2) n'implémente ni Hermes, ni agents multiples, ni skills formalisées. L'utilisateur interagit avec un modèle unique via la Couche Interface pour la capture et le rappel de contexte. L'architecture ci-dessus est la cible vers laquelle le MVP évolue en Phase 3, sans refonte — les couches Logique Métier et Données sont conçues dès le MVP pour supporter cet accès filtré.

---

*MATN · AI Architecture · Livrable 05 · Claude Strategist*
