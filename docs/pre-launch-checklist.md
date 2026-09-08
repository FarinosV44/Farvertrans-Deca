# Pre-launch regression & finish checklist (#79)

> This issue adds no features. It is the systematic pass over everything built,
> to decide the product is ready for production. Two columns: what the automated
> suites already cover, and what a human must walk on the deployed site.

Generated 2026-09-08 · commit range: the #59–#83 launch batches (D-114…D-139).

## 1. Automated coverage (green at this commit)

| Suite | Command | State |
|---|---|---|
| Types | `npm run typecheck` | ✅ clean |
| Lint | `npm run lint` | ✅ (3 pre-existing `<img>` warnings only) |
| Format | `npm run format:check` | ✅ |
| Unit | `npm run test:unit` | ✅ 180 / 180 |
| E2E | `npm run test:e2e` | ✅ 206 / 206 (0 flaky this run) |
| Compliance R-1…R-13 | `npm run test:compliance` | ✅ 8 / 8 |
| Keel gate | `npm run keel:verify` | ✅ |

Documented parallel-only flakes (pass at `--workers=1`): `admin-2fa.spec.ts:109`,
`content-cms.spec.ts:60`, `driver-delivery.spec.ts:96`, `workspace.spec.ts:273`,
`nav-links.spec.ts:11`.

The e2e suite already exercises, end to end: landing → create DeCA (anon + authed),
company signup + email verification, the 3-step wizard + pre-generation check (#71),
generation → compliant PDF + QR + `/d/[token]`, Modo Inspección (#69), one-tap share (#77),
history + filters + CSV export, duplicate, correction/versioning + "what changed" diff,
templates + saved master-data (build a DeCA from dropdowns), favourites (#78), drafts
autosave/resume (#76), team invite + roles + read-only gate, `/panel/empresa` completeness
gate (#59), account lifecycle (block/deactivate/anonymize) (#62), panel nav no-scroll at
360/768/1280/1440 (#70), admin shell + funnel + "empresas a contactar" (#72/#80), system
health (#73), segmentation chips (#82), Customer 360 + timeline (#81/#83), integration
requests (#74), cross-tenant isolation, security headers, axe on every public screen.

## 2. Live walk — the user's, on `decaprofesional.es` after redeploy

These need a real deployed environment and a human eye; the suites cannot stand in.

### Flow
- [ ] Landing → CREAR DECA GRATIS → 3 steps (no signup) → GENERAR → real PDF opens, QR scans on a phone to the public URL, PDF downloads.
- [ ] Register a fresh company, verify the email from the real inbox, complete the ficha.
- [ ] Create a DeCA from scratch; the pre-generation check shows "Listo para generar".
- [ ] Open the generated PDF — **check the load/unload address: no stray field like "Soltero" (#75)**, postal code + town present, province only if given.
- [ ] Modo inspección from the detail, from a history row, and from the result screen — same reference/version/QR as the PDF.
- [ ] Share by WhatsApp + copy link from a history row on a phone — no horizontal scroll.
- [ ] Duplicate a DeCA; correct one (new version, new token/QR); confirm the old version is not offered as current anywhere.
- [ ] Templates: save one, use it. Datos habituales: add a company / vehicle / location, star a favourite, build a DeCA from the dropdowns (favourite first).
- [ ] Leave a DeCA half-done, return to the panel → "Borrador pendiente" → Continuar restores it; Descartar asks first.
- [ ] Equipo: invite a user, accept from a second browser, check the role gates.
- [ ] Ayuda: the support + legal channels render (WhatsApp buttons hidden until `lib/brand.ts` is filled).
- [ ] Exportar CSV from the history.
- [ ] `/panel/integraciones`: send a request → it appears in `/admin/integraciones`.

### Responsive (360 / 768 / 1280 / 1440)
- [ ] No accidental horizontal scroll on any main navigation.
- [ ] "Crear DeCA" reachable everywhere; the language menu drops under the globe, not across the screen.
- [ ] Tables adapt (history has a mobile-card view); QR legible; no overlapping buttons.

### Security / isolation
- [ ] Company A cannot see company B's documents or data (URL-guessing a `/panel/deca/<id>` → 404).
- [ ] A `read_only` member sees history but no create/duplicate/favourite/edit controls.
- [ ] A normal customer hitting `/admin` gets the 404 page.
- [ ] `/d/[token]` still needs no login and no interstitial; a superseded version's token still resolves (legal inspection).
- [ ] No secrets, tokens, hashes or DB ids surfaced in the UI (checked on Modo Inspección, admin Sistema, Customer 360).

### Text quality
- [ ] `cargador contractual` / `transportista efectivo` used consistently (#61).
- [ ] **No "Próximamente" on any available feature** — the landing free-value grid and the API/ERP card are all active (#74).
- [ ] "Modo inspección · Incluido gratis durante el lanzamiento" wording present (coordinate with #43).
- [ ] No dev text, placeholders, Lorem Ipsum, or spelling errors on visible screens.
- [ ] Support email / phone correct in `lib/brand.ts`.

### Superadmin
- [ ] Resumen answers "is it working / who uses it / what needs attention" in under a minute.
- [ ] "Empresas a contactar" and the activation funnel show real numbers that match `/admin/empresas`.
- [ ] Sistema: generation health + recent incidents; a check that fails shows text, not just a colour.
- [ ] Segment chips filter and combine with search; a company's Customer 360 loads with its timeline.
- [ ] Fix the `praetoria sl` company NIF to `B21810452` via "Editar ficha".

## 3. Blocking operational items before "launched"

- [ ] **`prisma migrate deploy` on production** — pending migrations `20260907235352_deca_draft`,
      `20260908000514_favorites`, `20260908002549_integration_request`. The Hostinger build runs
      `migrate deploy`; the currently-deployed build queries none of these tables, so there is no
      ahead-of-schema window — but the redeploy MUST happen before the new code is live.
- [ ] **Redeploy Hostinger** (startup file `server.cjs`).
- [ ] **#60 backup** — object-store bucket + `age` key + repo secrets, run the workflow once, full
      restore-test, log in `docs/07-release.md` §6. (Not "verified" until the restore test runs.)
- [ ] **Rotate** every secret pasted in chat this session — Supabase DB password,
      `SUPABASE_SERVICE_ROLE_KEY`, Supabase Storage S3 keys, `FVD_ADMIN_TOKEN`, `RESEND_API_KEY`,
      `GOOGLE_CLIENT_SECRET`, `FVD_HASH_SECRET` (rotating the last logs everyone out — do it in a
      quiet window and replace the weak value with `openssl rand -hex 32`).

## 4. Sign-off

`#79` is closed by the user after the live walk in §2 passes and §3 is done — Keel never closes an
issue on the assistant's reading of the code.
