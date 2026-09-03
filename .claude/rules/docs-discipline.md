---
paths:
  - "app/**/*.ts"
  - "app/**/*.tsx"
  - "lib/**/*.ts"
  - "prisma/**/*.prisma"
  - "content/**/*.mdx"
---

# Build discipline — Farvertrans DeCA

- Before writing ANY new function/method/class: grep `docs/api/INDEX.md` first; reuse or generalize an existing fit — a near-duplicate is a defect.
- Every public surface is documented at the moment it changes, in the same slice:
  - **created** — full entry in `docs/api/` or `docs/reference/` + its `INDEX.md` row + a runnable example;
  - **modified** — its existing doc, example and INDEX row updated to the as-built signature, params, return, errors, permissions (a doc describing the old signature is a slice defect);
  - **removed** — doc and row deleted if never released; marked deprecated/removed with its replacement if released.
- Consult `docs/03-technical-plan.md` §"Change map" before every change — it lists every artifact each change type must touch (new DeCA field, new API route, new SEO page, new event, new env var, etc.).
- Every bug fix starts from a failing reproduction test (holds regardless of the `pure-logic` test-first policy). Pure logic in `lib/deca`, `lib/attribution`, `lib/abuse` and zod schemas gets its test written and seen failing before the code.
- A test derived from an `AC-nn` or a reproduced bug is NEVER edited to make it pass — if it is wrong, the requirement is wrong (a `docs/decisions.md` entry or a Design Request).
- The `tests/compliance/` suite (R-1…R-13) is sacred: it is the Phase 7 release gate. Never weaken an assertion to go green.
- Update `docs/PROGRESS.md` and `docs/decisions.md` at the moment of change, never later.
