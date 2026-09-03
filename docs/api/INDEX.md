# API Index — Farvertrans DeCA
> One line per public surface. Grep here FIRST; open the full doc only on a hit.

| Surface | Kind | Code file | Doc | Purpose (one line) |
|---------|------|-----------|-----|--------------------|
| GET /health | route | app/health/route.ts | docs/reference/endpoints.md | Liveness + DB reachability + app version |
| POST /api/events | route | app/api/events/route.ts | docs/reference/endpoints.md | First-party analytics ingest; schema-validated, always 204, never 5xx |
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
