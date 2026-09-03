# API Index — Farvertrans DeCA
> One line per public surface. Grep here FIRST; open the full doc only on a hit.

| Surface | Kind | Code file | Doc | Purpose (one line) |
|---------|------|-----------|-----|--------------------|
| GET /health | route | app/health/route.ts | docs/reference/endpoints.md | Liveness + DB reachability + app version |
| POST /api/events | route | app/api/events/route.ts | docs/reference/endpoints.md | First-party analytics ingest; schema-validated, always 204, never 5xx |
| POST /api/deca | route | app/api/deca/route.ts | docs/reference/endpoints.md | Create a DeCA (F1): validate R-2, render compliant PDF, store it, persist deca+version, return token + claim token; 422 on invalid, fails closed |
| GET /d/[token] | route | app/d/[token]/route.ts | docs/reference/endpoints.md | Public inspection (F4/R-6..R-9): streams the exact PDF, no auth/cookie/interstitial, noindex; 404 unknown, 410 outside the 7-day window |
| renderDecaPdf() / PdfRenderError | fn/class | lib/pdf/render.ts | docs/reference/lib.md | Render the compliant text PDF (R-3), embed QR (R-5) + metadata timestamps (R-11), enforce ≤5 MB (R-4) |
| DecaDocument | component | lib/pdf/deca-document.tsx | docs/reference/lib.md | The @react-pdf document — every field as selectable text, A4, QR + URL footer |
| qrPngDataUri() / qrPngBuffer() | function | lib/pdf/qr.ts | docs/reference/lib.md | QR PNG for a URL (error correction H) |
| ensureFonts() | function | lib/pdf/fonts.ts | docs/reference/lib.md | Register bundled Inter (OFL) as data URIs for @react-pdf |
| getPdfStore() / pdfKey() / PdfStore / StorageError | fn/type | lib/storage/index.ts | docs/reference/lib.md | Pluggable PDF store: Supabase Storage (prod) or local FS (dev/tests) |
| isPubliclyAvailable() | function | lib/deca/deactivation.ts | docs/reference/lib.md | R-9 7-day post-service availability window |
| hashIdentifier() / clientIp() | function | lib/hash.ts | docs/reference/lib.md | One-way IP hash + proxy IP extraction for the access log |
| validateDeca() / DecaValidationError | fn/class | lib/deca/validate.ts | docs/reference/lib.md | Full R-2 compliance validation; throws on missing mandatory field, warns (never blocks) on foreign NIF |
| decaPayloadSchema / step1..3Schema | const | lib/deca/schema.ts | docs/reference/lib.md | zod schemas for the wizard steps + the full DeCA payload |
| normalizePlate() / looksLikeSpanishPlate() | function | lib/deca/plate.ts | docs/reference/lib.md | Plate normalisation + soft Spanish-format hint |
| checkNif() | function | lib/deca/nif.ts | docs/reference/lib.md | DNI/NIE/CIF control validation (advisory) |
| newPublicToken() / newClaimToken() | function | lib/deca/token.ts | docs/reference/lib.md | 256-bit base64url tokens for the public URL and the claim link |
| createDeca() | function | lib/deca/persist.ts | docs/reference/lib.md | Atomic persist of deca + version 1 (+ claim token for anonymous); idempotency-key aware |
| CrearWizard / Field / ResultActions | component | components/deca/* | docs/reference/lib.md | 3-step creator UI + result-screen actions |
| GET /robots.txt | route | app/robots.ts | docs/reference/endpoints.md | Allow site; disallow /app /api /d/ /operadores /claim |
| GET /sitemap.xml | route | app/sitemap.ts | docs/reference/endpoints.md | Public indexable pages only |
| EVENT_NAMES / eventInputSchema / pickRefSnapshot() | const/fn | lib/analytics/events.ts | docs/reference/lib.md | Closed event set + ingest schema + ref/UTM extraction |
| track() / getSessionId() | function | lib/analytics/client.ts | docs/reference/lib.md | Client-side fire-and-forget analytics + opaque session id |
| landingJsonLd() + FAQ/HERO/STEPS/BENEFITS/LEGAL_* | fn/const | lib/content/landing.ts | docs/reference/lib.md | Landing copy + schema.org JSON-LD builder |
| CtaButton / SiteHeader / SiteFooter / MobileCta / DecaPreview / TrackView | component | components/site/*, components/analytics/* | docs/reference/lib.md | Landing UI building blocks |
| getEnv() | function | lib/env.ts | docs/reference/lib.md | Parse & cache the validated server environment (fail-closed) |
| publicEnv | const | lib/env.ts | docs/reference/lib.md | Client-safe env values |
| getSupabaseServerClient() | function | lib/supabase/server.ts | docs/reference/lib.md | Request-scoped Supabase client bound to auth cookies |
| getSupabaseServiceClient() | function | lib/supabase/server.ts | docs/reference/lib.md | Service-role Supabase client (server only, never user-authz) |
| getSupabaseBrowserClient() | function | lib/supabase/client.ts | docs/reference/lib.md | Browser Supabase client (anon key) |
| prisma | const | lib/prisma.ts | docs/reference/lib.md | Shared PrismaClient singleton |
| APP_VERSION | const | lib/version.ts | docs/reference/lib.md | Single source of the app version |
| es | const | lib/i18n/es.ts | docs/reference/lib.md | es-ES string catalog |
