# API Index — Farvertrans DeCA
> One line per public surface. Grep here FIRST; open the full doc only on a hit.

| Surface | Kind | Code file | Doc | Purpose (one line) |
|---------|------|-----------|-----|--------------------|
| GET /health | route | app/health/route.ts | docs/reference/endpoints.md | Liveness + DB reachability + app version |
| POST /api/events | route | app/api/events/route.ts | docs/reference/endpoints.md | First-party analytics ingest; schema-validated, always 204, never 5xx |
| POST /api/deca | route | app/api/deca/route.ts | docs/reference/endpoints.md | Create a DeCA (F1): requires an authenticated, email-verified session (401 `auth_required` / 403 `email_not_verified`, D-052/D-053); validate R-2, render compliant PDF, store it, persist deca+version, bump "last used" on any saved records referenced, return token + pdfSha256; 422 on invalid, fails closed |
| GET /d/[token] | route | app/d/[token]/route.ts | docs/reference/endpoints.md | Public inspection (F4/R-6..R-9): streams the exact PDF, no auth/cookie/interstitial, noindex; 404 unknown, 410 outside the 7-day window |
| renderDecaPdf() / PdfRenderError | fn/class | lib/pdf/render.ts | docs/reference/lib.md | Render the compliant text PDF (R-3), embed QR (R-5) + metadata timestamps (R-11), enforce ≤5 MB (R-4); accepts `customerLogoDataUri` (PRODUCT #39/#49), baked into that render only |
| DecaDocument | component | lib/pdf/deca-document.tsx | docs/reference/lib.md | The premium @react-pdf document (PRODUCT #49) — navy header with brand mark + optional customer logo + status pill, two-column party/route cards, labeled goods/vehicle grid, footer with QR + verification URL; every field stays real selectable text |
| detectLogoImage() / validateLogoUpload() / LogoValidationError | fn/class | lib/company/logo.ts | docs/reference/lib.md | Pure PNG/JPEG detection from real magic bytes + dimensions (never trusts a claimed MIME type), size + max-dimension validation (PRODUCT #39) |
| POST /api/company/logo | route | app/api/company/logo/route.ts | docs/reference/endpoints.md | Upload the company's optional PDF header logo (owner-only); validates the decoded bytes, stores a canonical data URI; only new documents are affected |
| DELETE /api/company/logo | route | app/api/company/logo/route.ts | docs/reference/endpoints.md | Remove the company logo (owner-only); historical PDFs are never touched |
| qrPngDataUri() / qrPngBuffer() | function | lib/pdf/qr.ts | docs/reference/lib.md | QR PNG for a URL (error correction H) |
| ensureFonts() | function | lib/pdf/fonts.ts | docs/reference/lib.md | Register bundled Inter (OFL) as data URIs for @react-pdf |
| getPdfStore() / pdfKey() / pdfSha256() / PdfStore / StorageError | fn/type | lib/storage/index.ts | docs/reference/lib.md | Pluggable PDF store: Supabase Storage (prod) or local FS (FVD_STORAGE_DIR persistent path); pdfSha256() is the per-version integrity anchor |
| isPubliclyAvailable() | function | lib/deca/deactivation.ts | docs/reference/lib.md | R-9 7-day post-service availability window |
| POST /api/auth/register | route | app/api/auth/register/route.ts | docs/reference/endpoints.md | Create company + user, set session, send the verification email (returns `emailSent: false` and logs a failure rather than claiming success when the provider call fails, D-053), claim a legacy anonymous DeCA link if present (never orphans it) |
| GET /api/auth/verify-email/status | route | app/api/auth/verify-email/status/route.ts | docs/reference/endpoints.md | Fresh, uncached read of `emailVerifiedAt` for the current session (D-053) — backs "Ya he confirmado mi cuenta", which never marks the account verified itself |
| POST /api/auth/verify-email/resend | route | app/api/auth/verify-email/resend/route.ts | docs/reference/endpoints.md | Rotates the verification token (invalidates the previous one) and resends; rate-limited via the "auth" abuse policy; `delivery` in the response is `sent`\|`unconfigured`\|`error`\|`already_verified` — the real outcome, never assumed success |
| POST /api/auth/verify-email/change-email | route | app/api/auth/verify-email/change-email/route.ts | docs/reference/endpoints.md | Changes the pending email + resends verification to the new address |
| POST /api/auth/login | route | app/api/auth/login/route.ts | docs/reference/endpoints.md | Email + password login; optional claim on the way in |
| signup() / login() / getCurrentUser() / AuthError | fn/class | lib/auth/index.ts | docs/reference/lib.md | v1 own auth (D-021); minimal signup, SSR session |
| hashPassword() / verifyPassword() / isStrongEnough() | function | lib/auth/password.ts | docs/reference/lib.md | scrypt password hashing (constant-time verify) |
| signSession() / verifySession() / SESSION_COOKIE | fn/const | lib/auth/session.ts | docs/reference/lib.md | HMAC-signed 30-day session token + cookie options |
| safeInternalPath() | function | lib/auth/safe-redirect.ts | docs/reference/lib.md | Post-auth `next` redirect safety (#38): only a same-origin path, never an absolute/protocol-relative URL or a bounce back into an auth screen |
| contentInputSchema / contentWarnings() / ContentInput | module | lib/content/schema.ts | docs/reference/lib.md | CMS content shape + client-safe editorial warnings (#32) — heuristics, not a score |
| createContent() / updateContent() / setStatus() / resolvePublic() / listPublished() / listPublishedFull() / SlugTakenError | module | lib/content/cms.ts | docs/reference/lib.md | CMS DB layer (#32): guides/blog, slug-change redirects via previousSlugs, soft archive |
| listPublishedFullSafe() / resolvePublicSafe() / resolveRelatedSafe() | function | lib/content/cms.ts | docs/reference/lib.md | Defensive wrappers (D-041) — a DB/config failure logs and degrades to an empty result, never an unhandled exception; used by /guias, /blog and their [slug] routes |
| estimateReadingMinutes() | function | lib/content/reading-time.ts | docs/reference/lib.md | Pure ~200 wpm estimate for the ArticleCard reading-time badge |
| Markdown / extractHeadings() / slugifyHeading() | module | lib/content/markdown.tsx (+ markdown-toc.ts) | docs/reference/lib.md | Safe in-house Markdown→React renderer for CMS bodies (#32) — no dangerouslySetInnerHTML; headings/lists/links/callouts/tables/FAQ/[[cta]] |
| GET/PATCH/DELETE /api/admin/contenido[/[id]] | route | app/api/admin/contenido/ | docs/reference/endpoints.md | CMS create / update+status / soft-archive (#32); internal session or x-fvd-admin-token, 404 otherwise |
| claimDeca() / ClaimError | fn/class | lib/deca/claim.ts | docs/reference/lib.md | Attach an anonymous DeCA to a company via its one-time claim token (D-016) |
| GET /api/saved | route | app/api/saved/route.ts | docs/reference/endpoints.md | The COMPANY's (WORKSPACE #24, D-052 scope change from per-user) saved companies/vehicles/locations, sorted by last used (wizard autofill dropdowns) |
| POST /api/saved/[kind] | route | app/api/saved/[kind]/route.ts | docs/reference/endpoints.md | Create a saved company (with role)/vehicle (with alias)/location (structured, load/unload/both), scoped to the company; 422 on invalid |
| DELETE /api/saved/[kind]/[id] | route | app/api/saved/[kind]/[id]/route.ts | docs/reference/endpoints.md | Delete a saved entity (company-scoped); never touches generated DeCA |
| listSaved() / createSaved() / deleteSaved() | function | lib/data/saved.ts | docs/reference/lib.md | Saved-entity CRUD, always user-scoped |
| savedCompany/Vehicle/AddressSchema / savedKinds | const | lib/data/saved-schema.ts | docs/reference/lib.md | zod schemas for saved entities (plate normalisation) |
| listHistory() / listHistoryCarriers() / getDecaForDuplicate() | function | lib/data/history.ts | docs/reference/lib.md | Company-scoped DeCA history (rows carry shipper/carrier/plates/versionNo) + distinct carriers for the filter + the duplicate-flow source payload |
| listTemplates() / createTemplate() / deleteTemplate() / templatePayloadSchema | fn/schema | lib/data/templates.ts | docs/reference/lib.md | Reusable DeCA templates — recurring non-date data per lane (UX #25); never carries a token or a transport date |
| GET/POST /api/templates, DELETE /api/templates/[id] | route | app/api/templates/ | docs/reference/endpoints.md | Company-scoped template CRUD; authed owner only (401 otherwise) |
| lib/team.ts (createInvite / acceptInvite / consumeInviteToken / listMembers / removeMember / changeRole / getInvitePreview / TeamError) | module | lib/team.ts | docs/reference/lib.md | Company workspaces + invitations (TEAM #27/#37); owner=admin / member=operator; invite tokens stored hashed, 14-day TTL, one-time; changeRole() promotes/demotes and never drops the last admin |
| PATCH /api/team/members/[id] | route | app/api/team/members/[id]/route.ts | docs/reference/endpoints.md | Admin changes a member's workspace role (TEAM #37); 403 non-admin, 422 last-admin / self |
| POST /api/team/invites, DELETE /api/team/invites/[id], DELETE /api/team/members/[id] | route | app/api/team/ | docs/reference/endpoints.md | Admin-only workspace management; 403 for non-admins |
| lib/growth.ts (createProspect / issueProspectInvite / resolveProspectInvite / attachCompanyToProspect / touchProspectActivity / acquisitionFunnel / importProspects) | module | lib/growth.ts | docs/reference/lib.md | Company acquisition funnel (GROWTH #28) — prospects, operator-attributed onboarding links, activation = first DeCA |
| POST /api/operadores/prospects (create/invite/import) | route | app/api/operadores/prospects/ | docs/reference/endpoints.md | Internal-only (404 for others); seed prospects, issue onboarding links, bulk import |
| POST /api/auth/password/request, POST /api/auth/password/reset, POST /api/auth/logout | route | app/api/auth/ | docs/reference/endpoints.md | Password recovery (no enumeration; test-seam FVD_EXPOSE_RESET_TOKEN) + logout (ACCOUNT #23) |
| rowMatches() | function | lib/data/history-filter.ts | docs/reference/lib.md | Pure history filter predicate: free text + date range + exact carrier + plate contains (WORKSPACE #24) |
| SavedDataManager / AppNav | component | components/app/* | docs/reference/lib.md | Workspace nav + saved-data CRUD UI |
| GET /api/operadores/stats | route | app/api/operadores/stats/route.ts | docs/reference/endpoints.md | Per-operator acquisition stats; internal role only (404 otherwise) |
| parseTouch() / touchIsQualifying() / UTM_KEYS | fn/const | lib/attribution/parse.ts | docs/reference/lib.md | Pure: extract an acquisition touch (ref + 5 UTMs) + classify channel |
| mergeTouch() / mergeFromUrl() / lock() / toAcquisitionRow() | function | lib/attribution/merge.ts | docs/reference/lib.md | Pure: first-touch-never-overwritten + last-touch merge rules (F12) |
| captureAttribution() / lockAttribution() | function | lib/attribution/client.ts | docs/reference/lib.md | Client cookie+localStorage capture; lock at signup |
| writeAcquisitionAtSignup() / markFirstDeca() / operatorStats() | function | lib/attribution/persist.ts | docs/reference/lib.md | Server: write the acquisition row at signup, first_deca_at, per-operator report |
| AttributionCapture | component | components/analytics/attribution-capture.tsx | docs/reference/lib.md | Root-layout invisible touch recorder |
| POST /api/deca/[id]/version | route | app/api/deca/[id]/version/route.ts | docs/reference/endpoints.md | Correct a DeCA → new version (R-13); authed owner only; 404/403/422 |
| POST /api/share | route | app/api/share/route.ts | docs/reference/endpoints.md | Email the DeCA link to the driver (rate-limited, templated); mailto fallback when Resend unconfigured |
| correctDeca() / DecaCorrectionError | fn/class | lib/deca/persist.ts | docs/reference/lib.md | Append a new DeCA version (new token/URL/QR/PDF), keep priors, record reason + timestamp + author (userId) + pdfSha256 |
| getDecaDetail() | function | lib/data/history.ts | docs/reference/lib.md | Company-scoped DeCA detail + version history (per-version reason, UTC timestamp, correcting-user email) |
| decide() / POLICIES / windowStart() | fn/const | lib/abuse/limiter.ts | docs/reference/lib.md | Pure sliding-window rate decision (allow/challenge/block) |
| checkAbuse() / abuseKey() | function | lib/abuse/index.ts | docs/reference/lib.md | Server rate check; records the attempt; never called by /d/ |
| challengePrefix() / verifyPow() / verifyHcaptcha() | function | lib/abuse/challenge.ts | docs/reference/lib.md | Signed PoW challenge (plain SHA-256, client needs no secret) + hCaptcha verify |
| abuseResponse() | function | lib/abuse/response.ts | docs/reference/lib.md | 429 challenge / block HTTP response builder |
| clientFingerprint() / solveChallenge() | function | lib/abuse/client.ts | docs/reference/lib.md | Client: cheap abuse signal + PoW solver (Web Crypto) |
| sendMail() | function | lib/mailer.ts | docs/reference/lib.md | Resend transactional email; `{sent:false, reason:"unconfigured"}` fallback |
| /[slug] (SEO cluster) | route | app/(seo)/[slug]/page.tsx | docs/reference/endpoints.md | 10 static SEO pages (dynamicParams=false); FAQPage JSON-LD, canonical, CTA |
| /soy-obligado | route | app/(seo)/soy-obligado/page.tsx | docs/reference/endpoints.md | "¿Estoy obligado?" guided page — SSR query-param form, works without JS (F17) |
| SEO_PAGES / getSeoPage() | const/fn | content/seo/pages.ts | docs/reference/lib.md | The 10 SEO pages' content (intent, sections, faq, sources, related) |
| middleware() | function | middleware.ts | docs/reference/lib.md | CSP + HSTS + security headers on every HTML response (T-5/T-8) |
| .githooks/pre-commit | hook | .githooks/pre-commit | docs/07-release.md | Confidential-data gate (`core.hooksPath=.githooks`) |
| CI workflow | workflow | .github/workflows/ci.yml | docs/07-release.md | typecheck/lint/format/unit/e2e/compliance/keel-verify + secret scan on main, tags, PRs to main |
| Dockerfile | build | Dockerfile | docs/07-release.md | Production image — Next standalone, non-root, healthcheck |
| hashIdentifier() / clientIp() | function | lib/hash.ts | docs/reference/lib.md | One-way IP hash + proxy IP extraction for the access log |
| validateDeca() / DecaValidationError | fn/class | lib/deca/validate.ts | docs/reference/lib.md | Full R-2 compliance validation; throws on missing mandatory field, warns (never blocks) on foreign NIF |
| decaPayloadSchema / step1..3Schema | const | lib/deca/schema.ts | docs/reference/lib.md | zod schemas for the wizard steps + the full DeCA payload |
| normalizePlate() / looksLikeSpanishPlate() | function | lib/deca/plate.ts | docs/reference/lib.md | Plate normalisation + soft Spanish-format hint |
| checkNif() | function | lib/deca/nif.ts | docs/reference/lib.md | DNI/NIE/CIF control validation (advisory) |
| newPublicToken() / newClaimToken() | function | lib/deca/token.ts | docs/reference/lib.md | 256-bit base64url tokens for the public URL and the claim link |
| createDeca() | function | lib/deca/persist.ts | docs/reference/lib.md | Atomic persist of deca + version 1 (+ claim token for anonymous); returns pdfSha256; idempotency-key aware |
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
| GENERATION_STAGES / GenerationError / classifyError() / newCorrelationId() / safeErrorSummary() / stageMessage() | module | lib/deca/generation.ts | docs/reference/lib.md | Pure stage classification for DeCA generation failures (#29) + the short user-facing correlation code; redacts PII from every logged message |
| recordGenerationFailure() / markFailureRetried() / storageDriver() | function | lib/deca/failures.ts | docs/reference/lib.md | Log + persist a classified generation failure keyed by correlation code; never throws, never stores payload/PII |
| getDecaCockpit() / diffVersions() / CockpitData | module | lib/deca/detail.ts | docs/reference/lib.md | Shared data for the post-generation document cockpit (#36): sectioned summary, version history, field-level "what changed" diff; company-scoped when a companyId is passed, otherwise the anonymous result view |
| historyToCsv() / docWorkflowStatus() / WorkflowStatus | module | lib/deca/export.ts | docs/reference/lib.md | Company DeCA history CSV export (#34 §3, RFC 4180, BOM) + the product workflow status (Vigente / Corregida / No disponible — never a legal status) |
| GET /api/export/history | route | app/api/export/history/route.ts | docs/reference/endpoints.md | Streams the signed-in company's DeCA history as CSV (#34); company-scoped (T-1), honours the /panel/historico filter params; 401 for anonymous |
| runDiagnostics() / DiagnosticsReport | fn/type | lib/diagnostics.ts | docs/reference/lib.md | Production readiness probes: env, DB, schema, PDF render smoke, storage round-trip, base URL, providers, 24h generation health. Returns no secret |
| getInternalUser() / hasAdminToken() / isInternalRequest() / requireInternal() | function | lib/admin/guard.ts | docs/reference/lib.md | Internal-area authorization: internal-role session or FVD_ADMIN_TOKEN header; callers answer 404 (never 403). `requireInternal()` gates an `/admin` page (renders notFound for everyone else) |
| overviewMetrics() / operationalAlerts() / windowStart() | function | lib/admin/metrics.ts | docs/reference/lib.md | Admin overview KPIs (today/7d/30d) + operational alert rules, all from real rows (#33 §1) |
| listFailures() / getFailure() / failureStageCounts() / triageFailure() / failureTriageSchema | module | lib/admin/failures.ts | docs/reference/lib.md | Read + triage the #29 generation failures by correlation code; never returns payload/PII (#33 §7) |
| listDecaAdmin() / getDecaAdmin() / listCompaniesAdmin() / getCompanyAdmin() / listUsersAdmin() | function | lib/admin/records.ts | docs/reference/lib.md | Cross-tenant admin read models for DeCA / companies / users; only reached through requireInternal(); summarises document content, never returns it whole (#33 §2–§4) |
| adminSearch() / SearchHit | fn/type | lib/admin/search.ts | docs/reference/lib.md | Admin global search across company / user / DeCA reference / correlation code / prospect (#33 §9) |
| rangeFromParam() / RANGE_KEYS | fn/const | lib/admin/range.ts | docs/reference/lib.md | Pure windowed date ranges (24h/7d/30d/90d) for the admin filters |
| GET /api/admin/diagnostics | route | app/api/admin/diagnostics/route.ts | docs/reference/endpoints.md | Readiness report for deploy verification (`npm run diagnose -- <url>`); internal session or x-fvd-admin-token, 404 otherwise; 503 when a critical check fails |
| PATCH /api/admin/failures/[correlationId] | route | app/api/admin/failures/[correlationId]/route.ts | docs/reference/endpoints.md | Triage a #29 generation failure (toggle resolved, add internal note); internal session or x-fvd-admin-token, 404 otherwise; never edits the failure record itself |
| GET /api/admin/search | route | app/api/admin/search/route.ts | docs/reference/endpoints.md | Admin global search (`?q=`); internal session or x-fvd-admin-token, 404 otherwise; read-only |
