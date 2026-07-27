# Matn

Outil de gestion interne de Kinaya, agence créative à Alger. CRM/pipeline, projets, finances, label de production.

Voir `CLAUDE.md` pour les instructions de build et `design/kinaya-design-system/DESIGN_SYSTEM.md` pour la référence visuelle.

## Démarrer en local

```bash
cp .env.example .env.local   # puis remplir les vraies valeurs
npm install
npm run db:push              # applique le schéma Prisma à la base
npm run dev
```
