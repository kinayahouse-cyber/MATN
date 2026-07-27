# Kinaya OS — components

All markup below assumes `tokens.css` is loaded. Classes are the `.k-*` primitives; everything else is layout you write yourself. Tailwind equivalents in parentheses where useful.

---

## Frame — the base primitive

Every block is a closed hairline frame. The background never changes; only the line divides.

```html
<div class="k-frame">…</div>                    <!-- radius 20, large blocks -->
<div class="k-frame k-frame--sm">…</div>        <!-- radius 12, stat/entity cards -->
<div class="k-frame k-frame--warm">…</div>      <!-- warm line, creative zones -->
```

Rules: no `background` on frames. Section rules use `--border-strong`, row rules `--border`. Hierarchy comes from line weight, never fill or shadow.

---

## Buttons

One primary per screen. Pill radius always.

```html
<button class="k-btn k-btn--primary">Nouveau projet</button>
<button class="k-btn k-btn--secondary">Exporter</button>
<button class="k-btn k-btn--ghost">Annuler</button>
```

Sizes: `sm` = `7px 16px / 12px`, `md` (default) = `11px 22px / 13px`, `lg` = `15px 30px / 15px`.

Variants beyond the three base ones:
- **Icon + label** — secondary button, icon in `--accent`, `gap: 8px`.
- **Icon only** — 38×38 circle, `border: 1px solid var(--border-strong)`.
- **Disabled** — `color: var(--border-strong)`, `border-color: var(--border)`, `cursor: not-allowed`.
- **Destructive** — `color: var(--state-late)`, `border: 1px solid rgba(180,71,46,0.45)`, hover fill `rgba(180,71,46,0.12)`.
- **Link** — no border except a 1px bottom rule in `rgba(232,85,42,0.4)`, color `--accent`.

### Segmented control

```html
<div style="display:inline-flex;border:1px solid var(--border-strong);border-radius:var(--radius-pill);padding:3px">
  <button class="k-btn k-btn--ghost" style="padding:7px 18px;font-size:12px">Semaine</button>
  <button class="k-btn" style="padding:7px 18px;font-size:12px;background:var(--accent-muted);color:var(--fg-primary)">Mois</button>
</div>
```

Active option = `--accent-muted` background, ivory text. Never a solid vermillion fill.

### Filter chips

Pill, transparent, `border: 1px solid var(--border-strong)`, 12px Archivo. Active chip: border `--fg-secondary`, text `--fg-primary`.

---

## Fields

```html
<input class="k-field" placeholder="Nom du projet" />
```

Focus = `border-color: var(--accent)` + `box-shadow: 0 0 0 3px var(--accent-ring)`. No filled input backgrounds in the linear system.

---

## Badges

```html
<span class="k-badge k-badge--paid">Payé</span>
<span class="k-badge k-badge--due">Échéance</span>
<span class="k-badge k-badge--late">Retard</span>
<span class="k-badge k-badge--neutral">En cours</span>

<span class="k-badge k-badge--division" style="background:var(--div-studio)">S</span>
```

Status badges are muted tint-on-transparent. **Division badges are filled** — one of the three intentional exceptions.

---

## Table

Full rounded outer frame; horizontal hairlines inside; no vertical grid.

```html
<div class="k-frame" style="overflow:hidden">
  <div style="padding:18px 24px;border-bottom:1px solid var(--border-strong)">
    <span style="font-family:var(--font-serif);font-size:20px">Projets en cours</span>
  </div>
  <div class="k-th" style="display:grid;grid-template-columns:2.2fr 1fr .8fr 1fr 1fr;padding:10px 24px;border-bottom:1px solid var(--border)">
    <div>Projet</div><div>Code</div><div>Division</div><div>Statut</div><div class="k-td-num">Montant</div>
  </div>
  <div style="display:grid;grid-template-columns:2.2fr 1fr .8fr 1fr 1fr;padding:11px 24px;align-items:center;border-bottom:1px solid var(--border);font-size:var(--text-13)">
    <div style="font-family:var(--font-serif);font-size:16px">Sloughi Nocturne</div>
    <div class="k-code">KIN-26-S-014</div>
    <div><span class="k-badge k-badge--division" style="background:var(--div-studio)">S</span></div>
    <div><span class="k-badge k-badge--neutral">En cours</span></div>
    <div class="k-td-num" style="color:var(--fg-secondary)">2 400 000 DA</div>
  </div>
</div>
```

Rows ~40px, hover `background: var(--bg-surface)` with no border change. Project name in Spectral (the row's only serif); code in mono; amount Archivo tabular-nums right-aligned. Separate the Label block from the commercial block with an italic Spectral caption + hairline.

---

## Cards

Six shapes, all radius 12 except the concept note's warm frame.

| Card | Content recipe |
| --- | --- |
| **Stat** | uppercase 11 label → Spectral 32 figure → 12px meta split by a 1px vertical hairline |
| **Project** | division badge + mono code row → Spectral 20 name → 12px stage/date → 5px progress rail in the state tint → 11px percent / amount |
| **Dense list** | uppercase 11 label → rows of 13px Archivo, value right-aligned tabular-nums, hairline between |
| **Radial** | 76px `.k-radial` + Spectral 18 centre, label and one line of copy beside it |
| **Person** | 38px ringed initials + Spectral 17 name → role → status pills |
| **Concept note** | `k-frame--warm`, ، in `--accent`, Spectral italic title, Spectral 15 body at line-height 1.5, muted meta |

---

## Data visualisation

Axes and gridlines are hairlines; series take **division tints**; vermillion marks only the current value.

- **Bar chart** — bars `border-radius: 6px 6px 0 0`, 1px stroke in the division tint over a 20% fill. Baseline `--border-strong`, no y-grid. Current period bar strokes `--accent`.
- **Sparkline** — 2px `--div-studio` polyline, area fill `rgba(92,122,138,0.18)`, three horizontal hairlines, 3.5px `--accent` dot on the last point.
- **Donut** — `conic-gradient` of division tints, 1px-ringed hole in `--bg-base`, legend rows with 9px square swatches and tabular-nums values.
- **Stacked bar** — 14px pill, 1px `--border` outline, segments in division tints.
- **Funnel rails** — label/amount row + 5px rail on `--border`; stage colors go neutral → division → amber → sage.
- **Heatmap** — 14-column grid, 2px squares, five steps of `rgba(92,122,138, .10→.62)`, top step `rgba(232,85,42,0.55)` for overload.

---

## Radial signature

```html
<div class="k-radial" style="--k-pct:68;--k-color:var(--accent);width:104px;height:104px;position:relative">
  <div style="position:absolute;inset:11px;border-radius:999px;background:var(--bg-base)"></div>
</div>
```

Three uses only: loading (`.k-radial--spin`), project progress (state tint), studio load (vermillion). The one graphic gesture in the system — don't reuse it decoratively.

---

## Timeline (Gantt)

Rows grouped by division (Studio → Atelier → Label). Bars are pills in the division tint at 22% opacity with a solid-tint progress segment inside; project name sits in the bar in Spectral 14 — the only serif on the screen. Week ticks and codes in Archivo `--fg-muted`, vertical gridlines `--border`.

The **today marker** is the only vermillon: a 1.5px dashed vertical line across the whole grid, with a pill date label in `--accent` / `--accent-fg` at its head.

---

## Calendar

Purely functional zone: everything Archivo except the screen title.

- **Week** — day columns, hour grid in `--border`. Events are 6px-radius framed cards, title + time in Archivo, line/tint from the project's division. Current-hour line 1px `--accent`; current-day header `--accent-muted`.
- **Month** — framed day cells, events condensed into thin division-tinted pills, current day cell marked `--accent-muted`. Day numbers Archivo tabular-nums.

---

## Sidebar

248px, `border-right: 1px solid var(--border-strong)`. The Arabic comma ، alone at the top in `--accent` 32px — no wordmark. Items grouped under uppercase 11 `--fg-muted` captions. Active item: `--accent-muted` background, 2px `--accent` left bar, ivory text.
