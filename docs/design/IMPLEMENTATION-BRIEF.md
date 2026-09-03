# Implementation-first design brief — Farvertrans DeCA

This brief intentionally compresses Phase 3 so implementation can start immediately without reopening discovery.

## Product promise
**DECA GRATIS** — create a compliant electronic control document in seconds. Free at least until 31/12/2026. No card. No sales call. No pricing page.

## Product personality
- Modern B2B SaaS, sober and highly trustworthy.
- Fast, calm, legible, legally credible.
- No visual clichés: no stock truck photos, no dashboards full of vanity charts.
- The interface itself is the marketing visual.

## Primary user journey
Landing → Create DeCA anonymously → Generate valid PDF + QR → Download/share → Create company account to keep/manage it → reuse saved entities and duplicate future documents.

## Screens required for launch
1. `/` Landing.
2. `/crear` 3-step guided DeCA creator.
3. Anonymous result/claim screen.
4. Auth/signup screen with company creation.
5. `/app` workspace/home.
6. `/app/deca/[id]` detail + version/share.
7. `/app/historico` history/search.
8. Saved companies/vehicles/addresses management, preferably integrated rather than separate if simpler.
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
Large success state: `DeCA generado`.
Actions in this order:
1. `Ver / descargar PDF`
2. `Compartir con el conductor`
3. `Copiar enlace`
4. `Guardar este DeCA creando una cuenta`

Account creation must feel like saving work, not a sales conversion.

## Signed-in workspace
Header action always visible: `+ Crear DeCA`.
Home shows useful actions, not analytics:
- Repetir último DeCA
- Últimos documentos
- Empresas / transportistas habituales
- Vehículos habituales

History table/cards: date, origin → destination, carrier, plate, status; actions: view, duplicate, share, download.

## Visual rules
- Strong contrast, generous whitespace, 8px spacing rhythm.
- One accent colour only; exact token may be chosen during implementation provided AA contrast is met.
- Clear typography; system/OSS webfont only, no paid licensing dependency.
- Border radius restrained, not playful.
- Icons only where they reduce reading effort.
- No dark mode in v1.

## Breakpoints
- 360px mobile baseline
- 768px tablet
- 1280px desktop

## Accessibility
WCAG 2.2 AA minimum: keyboard support, visible focus, semantic labels/fieldset/legend for forms, error summary + inline errors, 44px-ish touch targets where practical, sufficient contrast, no colour-only state.

## Conversion rule
No page may insert `solicitar información`, `pedir presupuesto`, demo forms, pricing, or sales gating between search traffic and `/crear`.

## Definition of quality
A first-time visitor should understand the proposition in <5 seconds and begin the DeCA flow with one click. A returning registered user should be able to duplicate a previous DeCA and generate the next one with minimal typing.