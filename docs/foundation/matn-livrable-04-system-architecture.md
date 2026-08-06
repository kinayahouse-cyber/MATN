# MATN — System Architecture

> Livrable 04 · Phase 1 Foundation · Claude Strategist · 06 août 2026

Architecture conceptuelle. Aucun choix technologique détaillé — l'implémentation existante (Next.js, Supabase, matn-rust) est un point de départ pour la Phase 2, pas une contrainte de ce document.

---

## 1. Couches du système

```
┌─────────────────────────────────────────┐
│  Couche Interface                        │  Dashboards, portails, workspaces
├─────────────────────────────────────────┤
│  Couche Orchestration (Hermes)           │  Coordination agents / workflows / skills
├─────────────────────────────────────────┤
│  Couche Modèles IA (LLM Gateway)         │  Claude, GPT, DeepSeek, Gemini — interchangeables
├─────────────────────────────────────────┤
│  Couche Logique Métier (MATN core)       │  Ontologie, règles, cloisonnement, validation
├─────────────────────────────────────────┤
│  Couche Données                          │  Source de vérité — entités de l'ontologie
├─────────────────────────────────────────┤
│  Couche Automatisation (n8n)             │  Intégrations et exécution, transverse
└─────────────────────────────────────────┘
```

## 2. Responsabilités par couche

**Couche Données** : stocke les entités définies dans le Business Ontology (Livrable 03). N'exécute aucune règle métier — c'est un entrepôt structuré, pas un moteur de décision.

**Couche Logique Métier** : seule couche autorisée à lire et écrire directement la Couche Données. Applique toutes les règles métier : cycles de vie des entités, validation, et surtout le cloisonnement Track (Studio/Atelier/Label). C'est ici, pas ailleurs, que le cloisonnement de l'ADR 8.2 est mécaniquement appliqué — toute requête est filtrée par Track avant de sortir de cette couche.

**Couche Modèles IA (LLM Gateway)** : point d'accès unique aux modèles de langage. N'a jamais d'accès direct à la Couche Données — elle ne reçoit que ce que la Couche Logique Métier lui transmet, déjà filtré.

**Couche Orchestration (Hermes)** : coordonne quel agent, quel skill, quel modèle intervient pour une tâche donnée. Porte sa propre logique de décision (ADR 8.1), mais consomme la Couche Logique Métier via la même interface que tout autre composant — Hermes n'a pas de passe-droit d'accès à la donnée brute.

**Couche Automatisation (n8n)** : exécute des workflows déclenchés par Hermes ou par des événements métier. N'a pas de logique de décision propre — elle exécute ce qu'on lui demande.

**Couche Interface** : consomme exclusivement la Couche Logique Métier (jamais la Couche Données ni les Modèles IA directement). Chaque interface est jetable et reconstructible sans perte, conformément au principe fondateur.

## 3. Frontières et dépendances autorisées

| Depuis | Vers | Autorisé |
|---|---|---|
| Interface | Logique Métier | ✅ |
| Interface | Données | ❌ jamais direct |
| Orchestration (Hermes) | Logique Métier | ✅ |
| Orchestration (Hermes) | Données | ❌ jamais direct |
| Modèles IA | Logique Métier | ✅ (via Hermes ou appel direct filtré) |
| Modèles IA | Données | ❌ jamais direct |
| Logique Métier | Données | ✅ seule couche autorisée |
| Automatisation (n8n) | Logique Métier | ✅ (déclenché par Hermes) |
| Automatisation (n8n) | Données | ❌ jamais direct |

Règle unique et non négociable : **toute donnée qui atteint un modèle IA, une interface, ou un workflow d'automatisation est passée par la Couche Logique Métier.** C'est le mécanisme structurel qui rend le cloisonnement Studio/Atelier réel plutôt que déclaratif.

## 4. Portée pour le MVP (Phase 2)

Le MVP Mémoire (PRD, section 6.2) n'implémente pas la Couche Orchestration ni la Couche Automatisation dans leur forme complète : l'utilisateur interagit directement avec la Couche Interface, qui consomme la Couche Logique Métier, elle-même posée sur la Couche Données. Hermes et n8n rejoignent l'architecture active en Phase 3, sans que les couches déjà construites aient à être repensées — c'est la raison d'être de ce découpage en couches dès maintenant.

---

*MATN · System Architecture · Livrable 04 · Claude Strategist*
