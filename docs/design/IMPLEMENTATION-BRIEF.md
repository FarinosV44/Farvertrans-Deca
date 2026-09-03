# Implementation-first design brief — Farvertrans DeCA

This brief intentionally compresses Phase 3 so implementation can start immediately without reopening
discovery (D-019). Part 1 is the product/screen brief; Part 2 is the concrete build-directly design system.

---

# Part 1 — Product & screen brief

## Product promise
**DECA GRATIS** — create a compliant electronic control document in seconds. Free at least until
31/12/2026. No card. No sales call. No pricing page.

## Product personality
- Modern B2B SaaS, sober and highly trustworthy.
- Fast, calm, legible, legally credible.
- No visual clichés: no stock truck photos, no dashboards full of vanity charts.
- The interface itself is the marketing visual.

## Primary user journey
Landing → Create DeCA anonymously → Generate valid PDF + QR → Download/share → Create company account to
keep/manage it → reuse saved entities and duplicate future documents.

## Screens required for launch
1. `/` Landing.
2. `/crear` 3-step guided DeCA creator.
3. Anonymous result/claim screen.
4. Auth/signup screen with company creation.
5. `/app` workspace/home.
6. `/app/deca/[id]` detail + version/share.
7. `/app/historico` history/search.
8. Saved companies/vehicles/addresses management (integrated rather than separate if simpler).
9. `/operadores` internal acquisition dashboard.
10. Public SEO/core informational pages.

## Landing hierarchy
Hero above the fold:
- Eyebrow optional: `Documento Electrónico de Control`
- H1: `DeCA GRATIS`
- Supporting copy: `Crea tu Documento Electrónico de Control en segundos. PDF nativo, QR y conservación online.`
- CTA primary: `CREAR DECA GRATIS`
- Trust line: `Sin tarjeta · Sin límite · Gratis al menos hasta el 31/12/2026`
- Real product preview alongside/below hero.

Then only:
1. `Hazlo en 3 pasos` — introducir, generar, compartir.
2. Three benefits: gratis / rápido / preparado para inspección.
3. Real interface preview showing autofill + generated document.
4. Legal trust block with BOE source and concise requirements.
5. FAQ written for search intent.
6. Final CTA.

## `/crear`
- Mobile-first wizard with visible progress 1/3, 2/3, 3/3.
- Keep every mandatory field obvious and grouped semantically.
- Anonymous use is the default; no login wall.
- Secondary text at top: `No necesitas registrarte para crear tu primer DeCA.`
- Final CTA: `GENERAR DECA`.
- Inline validation, never modal validation.
- Disable double-submit and show deterministic progress while generating.

## Result screen
Large success state: `DeCA generado`. Actions in this order:
1. `Ver / descargar PDF`
2. `Compartir con el conductor`
3. `Copiar enlace`
4. `Guardar este DeCA creando una cuenta`

Account creation must feel like saving work, not a sales conversion.

## Signed-in workspace
Header action always visible: `+ Crear DeCA`. Home shows useful actions, not analytics:
- Repetir último DeCA
- Últimos documentos
- Empresas / transportistas habituales
- Vehículos habituales

History table/cards: date, origin → destination, carrier, plate, status; actions: view, duplicate, share, download.

## Visual rules
- Strong contrast, generous whitespace, 8px spacing rhythm.
- One accent colour only.
- Clear typography; system/OSS webfont only, no paid licensing dependency.
- Border radius restrained, not playful.
- Icons only where they reduce reading effort. No dark mode in v1.

## Breakpoints
- 360px mobile baseline · 768px tablet · 1280px desktop

## Accessibility
WCAG 2.2 AA minimum: keyboard support, visible focus, semantic labels/fieldset/legend for forms, error
summary + inline errors, 44px-ish touch targets where practical, sufficient contrast, no colour-only state.

## Conversion rule
No page may insert `solicitar información`, `pedir presupuesto`, demo forms, pricing, or sales gating
between search traffic and `/crear`.

## Definition of quality
A first-time visitor should understand the proposition in <5 seconds and begin the DeCA flow with one
click. A returning registered user should be able to duplicate a previous DeCA and generate the next one
with minimal typing.

---

# Part 2 — Concrete design system (build-directly)

> Values live as CSS custom properties in `app/globals.css` (`@theme`). A later polish pass may adjust
> them — a restyle, not drift.

## Colour tokens (light; dark deferred — `prefers-color-scheme` hook left in place)
| Token | Value | Use |
|---|---|---|
| `--color-bg` | `#ffffff` | page background |
| `--color-surface` | `#f6f8fa` | cards, form panels |
| `--color-border` | `#d8dee4` | borders, dividers |
| `--color-text` | `#0f1720` | body text |
| `--color-text-muted` | `#5b6673` | secondary text |
| `--color-primary` | `#0b5cff` | primary CTA, links (the one accent) |
| `--color-primary-hover` | `#0847c9` | CTA hover |
| `--color-primary-contrast` | `#ffffff` | text on primary |
| `--color-success` | `#12805c` | "DeCA generado" |
| `--color-danger` | `#c0261d` | validation errors |
| `--color-focus` | `#1a73e8` | focus ring (3px, offset 2px) |

Contrast: `--color-text` on `--color-bg` ≈ 16:1; `--color-primary-contrast` on `--color-primary` ≈ 4.9:1 — both ≥ AA.

## Typography
- **Inter** (SIL OFL 1.1), fallback `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`. `font-display: swap`.
- Scale (rem): xs .8125 · sm .875 · base 1 · lg 1.125 · xl 1.375 · 2xl 1.75 · 3xl 2.25 · 4xl 3.
- Weights: 400 body, 500 UI labels, 700 headings. Line-height 1.6 body / 1.2 headings.

## Spacing & layout
- Space scale (px): 4 8 12 16 24 32 48 64 96. Container max-width 1120px; side padding 16 (mobile) / 24 (≥768).
- Radius: sm 6 · md 10 · lg 16. One elevation shadow: `0 1px 2px rgba(15,23,32,.06), 0 4px 16px rgba(15,23,32,.08)`.

## Components
- **Button primary:** `--color-primary` bg, contrast text, radius-md, min-height 48px, weight 500, hover `--color-primary-hover`, visible focus ring, `:disabled` 55% opacity + `not-allowed`.
- **Button secondary:** transparent bg, `--color-primary` text + 1px border.
- **Input / select:** min-height 48px, 1px border, radius-sm, focus ring; label always visible above; error = danger border + helper text via `aria-describedby`, never colour-only.
- **Card:** surface bg, 1px border, radius-lg, padding 24.
- **Wizard step header:** "Paso N de 3" + progress bar; step change moves focus to the step heading, announces via `aria-live="polite"`.
- **Persistent mobile CTA:** fixed bottom bar (<768 only), bg + top border + shadow, one primary button, `env(safe-area-inset-bottom)` padding, page reserves its height so it never overlaps the last control, never traps focus.
- **Success panel:** `--color-success` accent, large check, then the action list in priority order.

## Accessibility (every screen — WCAG 2.2 AA floor + EAA)
- One `<h1>`; correct heading order; landmarks (`header`/`nav`/`main`/`footer`); skip link.
- Full keyboard operability; the 3px visible focus ring; logical focus order.
- Forms: programmatic labels; error summary at top (focus moves there on submit) AND inline via `aria-describedby`; not colour-only.
- Target size ≥ 24px (aim 44–48). `prefers-reduced-motion` honoured. 200% zoom without loss.

## Iconography & imagery
- Icons: inline SVG, 1.5px stroke, 24px grid, `currentColor`, line style (default).
- Imagery: real product UI only. No stock photography, no truck illustrations. Hero "preview" = a styled non-interactive render of the real `/crear` step 1 + the result panel.

## Logo (interim)
- Wordmark "Farvertrans" (Inter 700) + a document-corner + check mark in `--color-primary`. `app/icon.svg` + `app/favicon.ico` shipped. A proper logo remains an open item.

## The compliant PDF layout (R-3/R-5 — real text, never an image)
- A4 portrait, 40pt margins, Inter embedded (subset).
- Header: "DOCUMENTO ELECTRÓNICO DE CONTROL (DeCA)" + document reference + version no + creation datetime (+ modification datetime on v2+).
- Body: two-column labelled field blocks — Cargador contractual / Transportista efectivo / Origen / Destino / Fecha del transporte / Mercancía / Peso o medida / Matrícula(s).
- Footer: the public URL as selectable text + the QR (~90pt) linking to it + "Generado por Farvertrans DeCA v<version>".
- Every value is real selectable text. Target < 300 KB, hard ceiling 5 MB.
