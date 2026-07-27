# Kinaya OS — design language

Internal management tool for Kinaya, a creative agency in Algiers. Nocturnal, warm, sober, hand-made. A working tool, not a showcase.

Files: `tokens.css` (CSS custom properties + `.k-*` primitives), `tokens.json` (machine-readable), `tailwind.config.ts` (Tailwind bridge).

## Non-negotiables

1. **Linear system.** Every block is a closed hairline frame with rounded corners. The background stays `--bg-base` inside and outside the frame — the line is what divides, never a change of fill. Radius 20px for large blocks (hero, tables, panels), 12px for stat cards, 6px for fields, pill 999px for buttons/badges/timeline bars.
2. **Three filled exceptions only:** primary vermillion button, radial signature, division badges. Their scarcity is what makes them strong.
3. **Vermillion is reserved.** Primary action, active nav state, and the "today" marker. Never decorative, never a generic progress fill.
4. **Hierarchy by line weight,** not depth: section rules `--border-strong`, row rules `--border`. No shadows, no gradients, no multi-color.
5. **One graphic gesture:** the radial phenakistoscope disc (loading, project progress, studio load). Everything else disciplined and airy.
6. **No wordmark.** The Arabic comma ، is the anchor — alone at the top of the sidebar, recurring as bullet, separator, marker.

## Typography — Spectral speaks, Archivo counts

The serif/grotesque contrast **is** the hierarchy: serif = content, grotesque = mechanics.

- **Spectral** — section titles, record titles, hero amounts, project names, concept notes. Line-height 1.4–1.5, never tight.
- **Archivo** — table data, labels, buttons, meta, dates, statuses. `tabular-nums` on every aligned figure; `letter-spacing: -0.01em` on large titles.
- **Mono** — project codes `KIN-26-S-XXX` only.
- Scale 48 / 32 / 24 / 18 / 15 / 13 / 11. Body 15, data 13, column headers 11 uppercase tracking 0.04em.
- Same amount, two treatments: hero → Spectral 48 (a moment); in a table column → Archivo 13 tabular-nums right-aligned (a datum).

**Warmth gradient:** the more functional the surface (table, calendar), the more Archivo dominates and the tighter it gets; the more creative (concepts, Label, work view), the more Spectral enters and the more it breathes. This translates the Studio (sharp) / Label (warm) duality into type.

## State colors

Muted, never bright: paid = sage `#6B8F5E`, due = amber `#C9922E`, late = brick `#B4472E`, in progress = neutral. Progress bars and status badges take the **project's state tint** — not uniform vermillion. Pending-invoice amounts read amber.

## Division tints (one per division, never per project)

| Division | Token | Hex |
| --- | --- | --- |
| Studio (S) | `--div-studio` | `#5C7A8A` |
| Atelier (A) | `--div-atelier` | `#8A8455` |
| Label (L) | `--div-label` | `#8A5C74` |
| Généralités (G) | `--div-general` | `#5F7A66` |

## Surfaces

- **Tables.** Full rounded outer frame, horizontal hairlines inside, no vertical grid. Rows ~40px, hover a faint fill with no border. Density via line-height, not padding. Label block visually separated from the commercial block.
- **Timelines (Gantt).** Pill bars, division tint, denser fill segment for real progress, project name inside the bar in Spectral (the only serif on screen). Ticks and labels in Archivo `--fg-muted`. Vermillion only for the dotted "today" line with its pill date label.
- **Calendar.** Very light hairline time grid. Events = small framed cards, radius 6, title and time in Archivo (purely functional zone), color = division tint. Vermillion only for the current-hour line and current-day header (`--accent-muted` background).
- **Sticky notes / concepts.** The one place discipline relaxes: warm border, Spectral text, Spectral italic titles, ، as bullet.
- **Sidebar.** Thin, grouped by section; active item gets `--accent-muted` background plus a 2px vermillion left bar.

## Avoid

Generic SaaS look, default cream–terracotta pairing, decorative gradients, multi-color, filled cards, vertical table grids, drop shadows, emoji, wordmarks.
