# Sistema Vía — DeCA Profesional visual identity (#67)

Proposal artifact (for approval): https://claude.ai/code/artifact/a275359c-16ff-4bbc-b25f-b4fd99a1e8f5

> Status: **awaiting the user's approval of the direction** before implementation.
> Once approved, this file is the implementation source of truth. #67 lands first
> (tokens + components + nav + DeCA flow), then #65 on top, then #66.

## The idea

Vignelli's transit-map language, translated to an original system — not a copy of any
map. It fits the DeCA: dense technical information that must be read fast and without
error. Retícula estricta, pocas tipografías, **el color como código, no como adorno**.
Distinct from Farvertrans: own named palette, `Archivo` instead of Inter, and the
"línea" motif (a 2–3 px coloured rule) as the recurring signature.

## Tokens (redefine the existing `app/globals.css` values; add the functional set)

| Token | Light | Dark | Role — the ONLY role |
|---|---|---|---|
| `--color-bg` (paper) | `#FBFAF7` | `#14151A` | page ground (warm) |
| `--color-surface` | `#F1EFE9` | `#1C1E24` | raised panels, table headers |
| `--color-text` (ink) | `#16181D` | `#ECEBE6` | text, heavy rules |
| `--color-text-muted` | `#5C5F66` | `#9DA0A7` | secondary text |
| `--color-border` | `#D8D4CB` | `#33353D` | hairline borders |
| `--color-border-soft` | `#E7E4DC` | `#26282F` | row rules |
| `--color-primary` | `#0A3D91` | `#6E9BE6` | **línea DeCA** — primary action, links, active nav |
| `--color-primary-contrast` | `#FFFFFF` | `#0B1220` | text on primary |
| `--color-route` | `#C8531E` | `#E4864F` | **línea de creación** — ONLY the DeCA-creation flow + progress |
| `--color-ok` | `#1B7A47` | `#58B37E` | vigente · activa · verificación correcta |
| `--color-warn` | `#B26B00` | `#D79A3C` | pendiente · datos incompletos · periodo de cortesía |
| `--color-danger` | `#B4271F` | `#E0655C` | bloqueada · error · **acción destructiva** |
| `--color-rest` | `#6B7178` | `#9298A0` | baja · deshabilitado · dato ausente |

Each status colour also has a `-bg` tint (see the artifact CSS). Neutrals are biased
slightly toward the primary blue. `--radius-sm: 2px`, `--radius-md: 3px`,
`--radius-lg: 4px` — geometric, not soft. Shadows removed except one subtle lift on
menus/popovers.

## Type

- **`Archivo`** (Google Fonts, weights 400/500/600/700) — display, headings, UI, labels.
  Replaces Inter as the structural face.
- **`IBM Plex Mono`** (400/500) — the technical layer only: reference codes, NIF/CIF,
  tokens, timestamps, amounts, connection strings.
- Scale (short): 12 · 14 · 16 · 20 · 28 · 40. Weights used: 400 / 500 / 600 / 700.
- Labels: 12px, weight 600, `text-transform: uppercase`, `letter-spacing: 0.12–0.14em`.
- Headings: `letter-spacing: -0.02em`, `text-wrap: balance`, line-height ~1.12.
- Keep `--font-inter` fallback wiring; add `--font-archivo`.

## Layout & the "línea" motif

- 8px base grid; strong columnar alignment; tables and definition-lists lead.
- **Signature:** a `kicker` (uppercase eyebrow) preceded by a 28×3px bar in the
  context's line colour, above every section/screen header. The same bar runs down
  the left edge of status cards / alerts (3px, `border-left`).
- Cards: hairline border only, no shadow. Tables: 2px `--color-text` top rule,
  1px `--color-border-soft` row rules, uppercase 10.5px headers.
- Status = pill: geometric glyph (check / triangle / minus-circle / bar) **+ text**,
  never colour alone. Same pill in the table, the detail sheet and the PDF.

## Components (centralised — this replaces the ad-hoc styling)

`components/ui/` (new): `Button` (primary / secondary / ghost / **danger** tiers),
`Pill` (ok/warn/stop/rest), `Field` (label + input + hint + error), `Alert`
(warn/stop), `Progress` (the route line — DeCA flow), `EmptyState`, `Kicker`, `Card`,
`DataTable`. Panel and admin both consume these — no second isolated admin design (#65).

## Screens the redesign touches (#67 scope)

Navigation · panel dashboard · all forms · the `/crear` DeCA flow · states/alerts/
validation · buttons & CTAs · cards/tables/lists · empty & confirmation screens ·
icons (`components/panel/icons.tsx` — extend consistently, 1.75px stroke, 24-grid) ·
mobile.

## Rules that do not move

- No legal or business logic changes (#67 AC).
- WCAG AA contrast, visible focus, keyboard nav, `prefers-reduced-motion` respected
  — verified per screen with axe + the guided pass.
- Every user-facing string stays in `t.*` across all 8 locales.
- `/d/[token]` behaviour untouched.

## #66 — the generated PDF (separate slice, after #67)

CMR-inspired *structure* only: numbered delimited cells, clear separation of
intervinientes / transporte / mercancía / fechas / validación. Still a DeCA — its
content and terminology, never a CMR form. Postal code + town shown where they belong
(#59). A4 + B/W + mobile, no overflow with long Spanish names/addresses, keep every
legal field + traceability + id + generation date. Add PDF snapshot tests; compare
old vs new with real anonymised data. Mockup in the artifact ("Documento generado").

## #65 — the admin panel (separate slice, after #67)

Same `components/ui/` system. States by text + icon. Destructive actions in a
visually distinct group (danger tier, red border, typed confirmation) — already the
shape built in #62's `<AccountActions>`, restyled. Faster search/filter. List +
detail mockups in the artifact ("Superadministración").
