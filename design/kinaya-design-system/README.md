# Kinaya OS — design system package

Drop this folder into your repo (e.g. `design/kinaya-design-system/`). Claude Code reads it directly.

## Files

| File | Role |
| --- | --- |
| `tokens.css` | CSS custom properties + `.k-*` primitives (buttons, badges, fields, frame, radial). Import once, globally. |
| `tokens.json` | Machine-readable token source — for codegen, Style Dictionary, or design-tool sync. |
| `tailwind.config.ts` | Tailwind bridge: semantic color/type/radius scales mapped onto the CSS vars. |
| `DESIGN_SYSTEM.md` | The rules: non-negotiables, typography doctrine, surface recipes, what to avoid. Read this before writing UI. |
| `COMPONENTS.md` | Component-by-component spec with copy-paste markup (buttons, cards, tables, charts, timeline, calendar). |
| `reference/planche-systeme.html` | Self-contained visual reference sheet — open in a browser, no build step. |

## Install

```bash
# fonts
# next/font or a <link> in your root layout:
# https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Archivo:wght@400;500;600;700&display=swap
```

```ts
// app/layout.tsx
import '@/design/kinaya-design-system/tokens.css';
```

```ts
// tailwind.config.ts — extend or re-export
export { default } from './design/kinaya-design-system/tailwind.config';
```

Dark is the default. Light "atelier" mode: `<html data-theme="light">`.

## Prompt Claude Code with

> Use `design/kinaya-design-system/DESIGN_SYSTEM.md` as the binding visual spec and `tokens.css` for all colors, type and radii. Never introduce a color, font size or radius that is not a token. Blocks are closed hairline frames on `--bg-base` — no filled cards. The only filled elements are the primary button, the radial signature and division badges. Vermillion `--accent` is for primary action, active state and the "today" marker only.

## Token quick reference

Backgrounds `--bg-base #141715` · `--bg-surface #1C1F1D` · `--bg-elevated #252825` · `--bg-sunken #0F110F`
Text `--fg-primary #F2EFE9` · `--fg-secondary #A8A49B` · `--fg-muted #6E6B64`
Lines `--border #2E312E` · `--border-strong #3D423D` · `--border-warm #4A3A2E`
Accent `--accent #E8552A` · `--accent-hover #FF6A3D`
States paid `#6B8F5E` · due `#C9922E` · late `#B4472E`
Divisions Studio `#5C7A8A` · Atelier `#8A8455` · Label `#8A5C74` · Généralités `#5F7A66`
Radius 6 / 12 / 20 / 999 · grid 4px · scale 48/32/24/18/15/13/11
