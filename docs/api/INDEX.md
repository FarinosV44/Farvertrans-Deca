# API Index — Farvertrans DeCA
> One line per public surface. Grep here FIRST; open the full doc only on a hit.

| Surface | Kind | Code file | Doc | Purpose (one line) |
|---------|------|-----------|-----|--------------------|
| GET /health | route | app/health/route.ts | docs/reference/endpoints.md | Liveness + DB reachability + app version |
| getEnv() | function | lib/env.ts | docs/reference/lib.md | Parse & cache the validated server environment (fail-closed) |
| publicEnv | const | lib/env.ts | docs/reference/lib.md | Client-safe env values |
| getSupabaseServerClient() | function | lib/supabase/server.ts | docs/reference/lib.md | Request-scoped Supabase client bound to auth cookies |
| getSupabaseServiceClient() | function | lib/supabase/server.ts | docs/reference/lib.md | Service-role Supabase client (server only, never user-authz) |
| getSupabaseBrowserClient() | function | lib/supabase/client.ts | docs/reference/lib.md | Browser Supabase client (anon key) |
| prisma | const | lib/prisma.ts | docs/reference/lib.md | Shared PrismaClient singleton |
| APP_VERSION | const | lib/version.ts | docs/reference/lib.md | Single source of the app version |
| es | const | lib/i18n/es.ts | docs/reference/lib.md | es-ES string catalog |
