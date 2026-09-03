# Release — Farvertrans DeCA v1

## Status

v1 is on `main` (BUILD 05–15). This document is the deploy runbook and the compliance evidence for the
launch gate (issue #15). Two deploy paths are verified end-to-end locally (`/` 200, `/health` `db:up`,
anonymous create → `/d/[token]` returns a ~20 KB native PDF):
- **VPS + Docker:** `docker-compose.prod.yml` (§4) — self-contained, no Supabase.
- **Hostinger Cloud Startup:** startup file `server.cjs` (see "Hostinger Cloud Startup" below) — the
  standalone server is emitted as CommonJS so LiteSpeed's `require()` launcher works.

## Compliance matrix — evidence, not assertions

Every requirement is verified by an automated test, not a claim. Run `npm run test:compliance`.

| Req | What it requires | Verified by | Result |
|---|---|---|---|
| R-1 | Mandatory from 2026-10-05, interior transport | product scope; generator works today | n/a (dated obligation) |
| R-2 | Art. 6 FOM/2861/2012 data fields | `lib/deca/validate` + `tests/unit/deca-validate.test.ts` + compliance suite | PASS |
| R-3 | PDF native digital (not a scan) | `test:compliance` — pdfjs extracts every field as text; not a single image | PASS |
| R-4 | ≤ 5 MB | `test:compliance` — asserted (~20 KB typical) | PASS |
| R-5 | QR with the document URL | `tests/unit/deca-pdf-logic.test.ts` — jsQR decodes the QR back to the exact URL; compliance suite finds the URL as text | PASS |
| R-6 | HTTPS, TLS 1.2+ | `NEXT_PUBLIC_FVD_BASE_URL` + reverse proxy (VERIFY at deploy — see below) | PENDING DEPLOY |
| R-7 | URL needs no credentials/auth | `test:compliance` — `/d/[token]` returns the PDF, no `Set-Cookie`, no auth | PASS |
| R-8 | Direct download, no button/interstitial; non-enumerable | `test:compliance` — body is `%PDF-`, not HTML; `tests/e2e/launch-gate.spec.ts` — 256-bit tokens, adjacent guess → 404 | PASS |
| R-9 | Available during service; deactivable 7 natural days after | `lib/deca/deactivation` + unit test + `/d/[token]` 410 branch | PASS |
| R-10 | Kept ≥ 1 year (shipper + carrier) | documents + versions + PDFs are never deleted; retention job only flips public access | PASS (design) |
| R-11 | Record creation + modification date/time | `test:compliance` — PDF metadata `CreationDate` + `Creator`; `deca_version` rows; `/d/` access log | PASS |
| R-12 | Driver copy before the service (electronic or printed, with QR) | result screen + `/api/share` (link/WhatsApp/email) + the PDF is the printable copy | PASS |
| R-13 | Corrections keep prior versions + traceability | `POST /api/deca/[id]/version` + `tests/e2e/build13.spec.ts` — v1 stays retrievable with original data, v2 has the change, distinct tokens | PASS |

**Before public launch (not automatable):**
- **RGPD review** of retaining anonymous documents that contain third-party personal data vs the
  1-year obligation (D-016). Document the legal basis and an erasure-request procedure.
- **Legal / inspection check** of a real generated DeCA — see `Sample DeCA` below.
- Confirm HTTPS + TLS 1.2+ on the live domain (R-6).

## Quality gate

| Check | Command | Status |
|---|---|---|
| Type check | `npm run typecheck` | PASS |
| Lint | `npm run lint` | PASS |
| Format | `npm run format:check` | PASS |
| Unit tests | `npm run test:unit` | PASS (47) |
| E2E (browser) | `npm run test:e2e` | PASS (57 across chromium) |
| Compliance suite | `npm run test:compliance` | PASS (6) |
| Accessibility (axe) | inside e2e — landing, /crear, /registro, /panel, /panel/historico, /panel/datos, a SEO page | PASS (0 serious/critical) |
| Responsive | e2e at 360 / 768 / 1280 | PASS |
| Cross-tenant authz | `tests/e2e/launch-gate.spec.ts` — company B cannot read company A's DeCA / history / correct it | PASS |
| Security headers | `tests/e2e/launch-gate.spec.ts` — CSP, HSTS (prod), nosniff, DENY, Referrer-Policy, Permissions-Policy | PASS |
| Public token entropy | `tests/e2e/launch-gate.spec.ts` — ≥ 240-bit base64url, unique, non-enumerable | PASS |
| Failure paths | malformed input → 422; bad beacon → 204 (never 5xx); unknown token → 404 | PASS |
| Standalone build | `NEXT_STANDALONE=1 npm run build` (fonts traced) | PASS |
| Standalone server is CommonJS | CI step — `node --check .next/standalone/server.js`, no `"type":"module"`, boots via `require('./server.cjs')` (Hostinger `lsnode.js` compat) | PASS |
| `keel-verify` | `node scripts/keel-verify.mjs` | PASS |
| Secret scan | pre-commit hook + CI `git grep` | PASS |
| Debug logging off | `FVD_DEBUG` unset in the production image | VERIFY at deploy |

**Security posture vs `docs/threat-model.md`:** T-1…T-15 reviewed. CSP ships as `script-src 'self'
'unsafe-inline'` (no external scripts, no `unsafe-eval` in prod, no user-supplied HTML rendered) —
tightening to a nonce-based CSP is a tracked post-launch item.

## Sample DeCA for legal review

Generate one from the running app and hand it to whoever confirms inspection validity:

```
npm run dev
# open http://localhost:3000/crear, fill real-shaped (synthetic) data, generate,
# then open the /d/<token> URL and save the PDF.
```

Or headless:

```
npm run seed
node -e "fetch('http://localhost:3000/api/deca',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({shipper:{name:'Cargas del Turia SL',nif:'B96789011',address:'Av. del Puerto 120, Valencia'},carrier:{name:'Transportes Pérez SL',nif:'B12345674'},origin:'Valencia',destination:'Madrid',transportDate:'2026-10-06',goods:'Palés de cerámica',weight:'12000 kg',tractorPlate:'1234 BCD'})}).then(r=>r.json()).then(d=>console.log('http://localhost:3000/d/'+d.token))"
```

## Hosting choice — read this first

This is a Next.js **SSR** app with a **PostgreSQL** database and a server-side PDF pipeline. It needs a
**long-running Node process** and a **real Postgres**. It will 503 without both.

| Host | Works? | Notes |
|---|---|---|
| Hostinger **VPS** (KVM) | ✅ recommended | Full control, Docker — the runbook below. |
| Hostinger **Cloud Startup / Web hosting** | ✅ via the hPanel **Node.js** tool (LiteSpeed `lsnode.js`), no Docker | Startup file **`server.cjs`** (see §"Hostinger Cloud Startup" below). Shared resources — the build is heavy; build elsewhere and upload if the app root is small. |
| Vercel / Netlify / Railway / Render / Fly.io | ✅ | Next-native; pair with Supabase/Neon Postgres. |
| Static / PHP shared hosting | ❌ | No Node process → whole-site 503. |

**The database is not optional.** With only the `.env.example` placeholders there is no Postgres to
connect to, so `/health` and every DB-backed route return 503. Two ways to get one:
- **Bundled (recommended for a VPS with Docker):** `docker-compose.prod.yml` runs Postgres + the app +
  a persistent PDF volume together — no Supabase, no external account. See §4 below.
- **Managed:** a **Supabase** or **Neon** project → real `DATABASE_URL`; run `prisma migrate deploy`
  against it. Supabase also gives the private Storage bucket if you want `FVD_STORAGE=supabase`.

### Hostinger Cloud Startup (hPanel → Node.js, LiteSpeed `lsnode.js`)

Hostinger's LiteSpeed Node launcher starts the app with CommonJS **`require(startupFile)`**. A raw
Next.js standalone `server.js` is ESM when the project's `package.json` has `"type": "module"`, and
`require()` of an ES module throws `ERR_REQUIRE_ESM` — the site then 503s before the app starts. This
repo is built to avoid that:

- `package.json` has **no `"type": "module"`** → Next emits `.next/standalone/server.js` and
  `.next/standalone/package.json` as **CommonJS** (verified in CI — see the
  "Standalone server is CommonJS" step).
- **`server.cjs`** (repo root) is the startup file. `.cjs` is *always* CommonJS regardless of any
  `"type"` field, so `lsnode.js` can `require()` it. It copies `.next/static` + `public/` into
  `.next/standalone/` if missing, sets `PORT`/`HOSTNAME`, and `require()`s the standalone server.
- `npm run build` runs `scripts/standalone-postbuild.mjs`, which copies `.next/static`, `public/` and
  `prisma/migrations/` into `.next/standalone/` (Next does not). It no-ops for a non-standalone build.

**Steps:**
1. **Database:** Supabase / Neon → real `DATABASE_URL` (Cloud Startup has no bundled Postgres). For
   PDFs, either a Supabase private bucket `deca-pdfs` + `FVD_STORAGE=supabase`, or `FVD_STORAGE=local`
   with a writable `.next/standalone/.storage` (persisted between deploys — confirm with Hostinger).
2. hPanel → **Advanced → Node.js**:
   - Node version **20+**
   - Application root = the repository root
   - **Application startup file = `server.cjs`**
3. hPanel → **environment variables** (from `.env.example`): `NEXT_PUBLIC_FVD_BASE_URL=https://<domain>`
   (must match — it drives every DeCA public URL, R-5/R-6), `DATABASE_URL`, `FVD_HASH_SECRET` (≥ 16
   chars), `FVD_STORAGE`, Supabase keys if used, `FVD_DEBUG=0`.
4. Build (SSH or deploy hook, in the app root):
   ```
   npm ci
   npx prisma generate
   npx prisma migrate deploy
   NEXT_STANDALONE=1 npm run build
   ```
5. Restart the Node app in hPanel. `https://<domain>/health` must return `{"status":"ok","db":"up"}`.

**`hbuilds/` note:** Hostinger regenerates its own build/cache directory on every deploy — never hand-edit
files there. All the compatibility handling lives in the repo (`package.json`, `server.cjs`,
`scripts/standalone-postbuild.mjs`), so a redeploy keeps working.

**If it still 503s:**
- `ERR_REQUIRE_ESM` again → the startup file is not `server.cjs`, or someone re-added `"type": "module"`
  to `package.json` (CI's "Standalone server is CommonJS" step guards this).
- `/health` says `db: "down"` → bad `DATABASE_URL` or migrations not run.
- `PrismaClientInitializationError` → `npx prisma generate` must run **on the server**; the schema
  targets `debian-openssl-3.0.x` + `linux-musl-openssl-3.0.x` as well as native.
- 404s for CSS/JS → `.next/static` did not reach `.next/standalone/.next/static`; re-run
  `npm run build` (or let `server.cjs` copy it on next start).

## Deployment runbook — Hostinger VPS + Supabase

### 1. Supabase (one-time)
1. Create a project. Note the project URL, the `anon` key and the `service_role` key.
2. **Storage:** create a **private** bucket named `deca-pdfs` (no public access). Set
   `FVD_STORAGE=supabase` in `.env` (dev/CI leave it `local`).
3. **Database:** get the connection string (session pooler) → `DATABASE_URL`.
4. RLS: the app talks to the DB only through the server with the service role; the `anon` key has no
   table grants. Leave RLS deny-by-default on any table the client could reach (none in v1).

### 2. Transactional email (Resend) + hCaptcha (optional)
- Resend: create an API key, verify the sending domain → `RESEND_API_KEY`, `FVD_MAIL_FROM`.
- hCaptcha: create a site → `NEXT_PUBLIC_HCAPTCHA_SITE_KEY`, `HCAPTCHA_SECRET_KEY`. Optional — without
  it the proof-of-work challenge is used.

### 3. Domain & DNS
- Point the real domain (or `deca.farvertrans.es`) at the VPS. Set `NEXT_PUBLIC_FVD_BASE_URL` to
  `https://<domain>` — this is the single configurable public base URL used for canonicals, the
  sitemap, OG tags and every DeCA public URL.

### 4. VPS (Hostinger, Ubuntu LTS, ≥ 2 GB RAM) — bundled stack, one command

```bash
# Docker Engine
curl -fsSL https://get.docker.com | sh

git clone https://github.com/FarinosV44/Farvertrans-Deca.git && cd Farvertrans-Deca
git checkout main
cp .env.prod.example .env.prod
#   edit .env.prod:
#   - POSTGRES_PASSWORD           → a long random string
#   - DATABASE_URL                → same password, host stays `db` (the compose service)
#   - NEXT_PUBLIC_FVD_BASE_URL    → https://<your real domain>
#   - FVD_HASH_SECRET             → a long random string
docker compose -f docker-compose.prod.yml up -d --build
```

This starts three containers: `fvd-prod-db` (Postgres, private, on a named volume),
a one-shot `migrate` (`prisma migrate deploy`), then `fvd-prod-app` on `:3000` with a named volume
at `/app/.storage` holding the generated PDFs (`FVD_STORAGE=local`). `docker compose ... logs -f app`
to follow it; `docker compose -f docker-compose.prod.yml up -d --build` again to redeploy after a
`git pull` (migrations re-run automatically, data volumes persist).

- Put Caddy or nginx in front for TLS (Let's Encrypt), proxying to `127.0.0.1:3000`, and set
  `Strict-Transport-Security` at the proxy too. TLS 1.2 minimum (R-6).
- `FVD_DEBUG` must be `0` in `.env.prod`.
- Back up both volumes (`fvd-prod-db`, `fvd-prod-storage`) — see §6.

**Alternative — managed Postgres instead of the bundled `db`:** delete the `db` and `migrate` service
deps you don't want, point `DATABASE_URL` at Supabase/Neon, run `prisma migrate deploy` against it
once, and `docker run -d --name fvd --env-file .env.prod -p 3000:3000 --restart unless-stopped -v fvd-storage:/app/.storage fvd-app`.

### 5. Health & logs
- `GET /health` → `{ "status": "ok", "version": "...", "db": "up" }`. Wire it to Hostinger/uptime monitoring.
- App logs go to stdout (`docker logs fvd`). No personal data or tokens are logged.

### 6. Backups
- **Bundled stack:** `docker exec fvd-prod-db pg_dump -U <user> <db> | gzip > deca-$(date +%F).sql.gz`
  on a cron, off the box; and archive the `fvd-prod-storage` volume
  (`docker run --rm -v fvd-prod-storage:/s -v $PWD:/out alpine tar czf /out/storage-$(date +%F).tgz -C /s .`).
- **Managed Postgres:** Supabase/Neon provide automated backups; enable point-in-time recovery.
- Test a restore before relying on it.

## Merge to `main`

The user authorised the merge in the current conversation. After the full gate passes on `develop`:

```bash
git checkout develop && git pull
git checkout -b main 2>/dev/null || git checkout main
git merge --ff-only develop || git merge --no-ff develop -m "Release v1 (BUILD 05-15)"
git push -u origin main
```

No version tag is created unless separately requested.

## Post-launch tracked items
- Nonce-based CSP (drop `'unsafe-inline'` for scripts).
- Password reset (email) flow.
- `.keel` plan.json + `scripts/keel-close` / `keel-handoff-verify` (skipped under execution mode D-019).
- Local + long-tail SEO pages (deferred — `docs/sprints/deferred.md`).
- The RGPD and legal-inspection reviews above must close before advertising the product as a compliant
  DeCA solution.
