---
paths:
  - "app/**/*.ts"
  - "app/**/*.tsx"
  - "lib/**/*.ts"
  - "prisma/**/*.prisma"
  - "content/**/*.mdx"
---

# Code style — Farvertrans DeCA

Source of truth: `docs/03-technical-plan.md` §Conventions. On any conflict, the plan wins — fix this file.

- No global prefix (module-scoped TS). DB tables singular-snake (`deca`, `deca_version`, `operator`). Env vars `FVD_*`; client-exposed `NEXT_PUBLIC_FVD_*`.
- Naming: files kebab-case; React components PascalCase; functions camelCase; zod schemas `xSchema`; unit tests `*.test.ts`, e2e `*.spec.ts`.
- Error handling — ONE strategy, never mixed: `lib/` throws typed errors (`DecaValidationError`, `AbuseLimitError`, `StorageError`); Route Handlers catch and return `{ error: { code, message } }` with the right HTTP status; never leak internals to the client. The DeCA engine **fails closed** — a validation/render/storage failure emits NO document, never a partial or non-compliant one.
- Logging: `pino`, levels error/warn/info/debug, `FVD_DEBUG=1` for debug. Never log personal data of shippers/carriers/drivers, tokens, Supabase keys, or session cookies. `/d/` access log stores only hashed IP + timestamp + version id.
- Base language of source strings: Spanish es-ES (D-002), centralised in `lib/i18n/es.ts` by key. NEVER inline or concatenate a user-facing string at the use site.
- Timestamps: UTC in the DB; creation and every modification recorded on `deca_version` (R-11); never client-supplied.
- Comments: every public `lib/` surface carries a JSDoc block (purpose, params, return, throws). Comment the *why* on non-obvious decisions, not the *what*. English (docs language, D-002).
- Dependencies: permissive licences only (MIT/BSD/Apache-2.0/ISC — D-003); a new one needs a `docs/decisions.md` entry.
