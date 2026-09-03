# Continuation prompt — Farvertrans DeCA

Repo: FarinosV44/Farvertrans-Deca
Branch: develop
Generated: 2026-09-03
Keel: v5.19.2
Position: implementation-first build authorised; execute working vertical slices.

User direction for this continuation:

> The discovery/spec work is sufficient. Do not spend another session expanding theory. The priority now is a working product: an excellent SEO/conversion landing, anonymous DeCA creation, real compliant PDF + QR, company signup/claim, saved entities/history/duplicate, referral attribution by Farvertrans operator, and an internal acquisition dashboard. Keep the product radically simple. Free at least until 31/12/2026. The public message is DECA GRATIS. Build in vertical slices and make each issue end in something executable/testable.

Read CLAUDE.md and the full Keel skill first, then `docs/PROGRESS.md`, `docs/decisions.md`, `docs/design/IMPLEMENTATION-BRIEF.md`, `docs/02-functional-spec.md` and only the relevant fragments of `docs/03-technical-plan.md`. Existing EPICs #1–#4 remain binding product constraints.

Do not reopen settled decisions unless implementation evidence requires a Design Request. Do not add pricing, Stripe, demo request, sales forms, ERP/TMS scope, fleet tracking, invoicing, or unrelated logistics modules.

## Execute in this order
1. **#5** — runnable Next.js + Supabase/Prisma scaffold.
2. **#6** — production `DeCA GRATIS` landing connected to the real creator.
3. **#7** — anonymous three-step DeCA creator with real validation.
4. **#8** — compliant native PDF + QR + direct public inspection URL + anonymous result.
5. **#9** — company signup and claim of already-generated anonymous DeCA.
6. **#10** — registered workspace: history, saved entities, autocomplete and duplicate.
7. **#11** — referral/UTM attribution per Farvertrans operator.
8. **#12** — internal operator acquisition dashboard.
9. **#13** — sharing, corrections/versioning and abuse controls.
10. **#14** — SEO technical base + core search pages.
11. **#15** — launch gate: compliance, mobile, security, performance and deployment.

Start implementing #5 immediately. Where #6 can be built against a stubbed `/crear` shell without blocking #5, keep momentum; but never fake compliance or claim a generated document is valid before #8 passes its tests.

Definition of progress: working code + tests + browser-verifiable behavior. Documentation is only updated to keep the project state accurate; it is not the deliverable.