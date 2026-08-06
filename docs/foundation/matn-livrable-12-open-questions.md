# MATN — Open Questions Register

> Livrable 12 · Phase 1 Foundation · Claude Strategist · 06 août 2026
> Registre vivant. C'est le seul document où les questions non résolues sont consignées — les autres livrables restent décisifs.

---

| # | Question | Catégorie | Priorité | Impact | Stratégie de résolution |
|---|---|---|---|---|---|
| 01 | Comment réconcilier les 15 entités existantes (matn-rust) avec l'ontologie du Livrable 03 ? | Architecture | Haute | Bloque le démarrage effectif de la Phase 2 | Audit de l'implémentation existante en ouverture de Phase 2, avant tout nouveau développement |
| 02 | Le schéma Supabase actuel supporte-t-il nativement le filtrage par Track requis par le cloisonnement Studio/Atelier (ADR-002) ? | Technique | Haute | Peut nécessiter une refonte de schéma avant tout module Phase 2 | Vérification technique en ouverture de Phase 2, en parallèle de la question 01 |
| 03 | Quel modèle sert de LLM Gateway par défaut au lancement du MVP ? | IA | Basse | Le MVP n'a pas d'usage agent IA structuré — question pertinente seulement à l'entrée en Phase 3 | À trancher à l'ouverture de la Phase 3 |
| 04 | Le MVP a-t-il besoin d'un accès mobile, ou une interface web suffit-elle pour un usage solo ? | UX | Moyenne | Influence l'effort de Phase 2 | À trancher avant la conception détaillée de Project Workspace / Knowledge Hub |
| 05 | À quel volume d'activité le passage à une gestion multi-utilisateurs (ADR-005) devient-il nécessaire ? | Business | Moyenne | Déclenche l'entrée en Phase 3 sur ce volet | Réévalué au moment du recrutement BD ou de l'intégration d'un premier freelance |
| 06 | Une éventuelle commercialisation de MATN à d'autres agences change-t-elle des choix d'architecture pris maintenant pour Kinaya seule ? | Business | Basse | Risque de sur-ingénierie si traité trop tôt | Non traité avant la Phase 4 — délibérément écarté du cadrage actuel |
| 07 | Comment la logique de décision de Hermes (ADR-001) sera-t-elle testée et validée, sachant qu'elle n'est pas une simple règle statique ? | IA | Moyenne | Conditionne la fiabilité de l'orchestration en Phase 3 | À traiter au moment de la conception détaillée de Hermes, en ouverture de Phase 3 |
| 08 | Le module Creative Workflow (Business Process Maps, Livrable 07) et l'app nodale IA suivent des paliers séparés — à quel moment leurs données doivent-elles converger dans l'ontologie MATN ? | Produit | Basse | Risque de double capture de connaissance si non traité | À évaluer une fois l'app nodale IA au Palier 1 (génération image) |

---

*MATN · Open Questions Register · Livrable 12 · Claude Strategist*
