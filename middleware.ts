import { NextRequest, NextResponse } from "next/server";
import { ATTR_COOKIE } from "@/lib/attribution/parse";
import { EMPTY_ATTRIBUTION, mergeFromUrl, type Attribution } from "@/lib/attribution/merge";

/**
 * Security headers (threat model T-5 / T-8) + server-side acquisition capture.
 *
 * Attribution is recorded here, synchronously with the request, so `?ref=` and
 * the UTMs survive even before client hydration (and with JS disabled). The
 * client `<AttributionCapture>` still covers SPA navigations.
 *
 * CSP note: `script-src` is `'self' 'unsafe-inline'` (no external hosts except
 * hCaptcha, no `unsafe-eval` in production). A nonce/`'strict-dynamic'` CSP did
 * not propagate to Next's own script tags under `next start` on this version;
 * since the app renders no user-supplied HTML and loads no third-party scripts,
 * `'unsafe-inline'` here is a bounded risk. Nonce CSP is a tracked post-launch item.
 */
const ATTR_MAX_AGE_S = 60 * 60 * 24 * 365; // 1 year

export function middleware(req: NextRequest) {
  const isDev = process.env.NODE_ENV !== "production";

  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://hcaptcha.com https://*.hcaptcha.com`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob:`,
    `font-src 'self' data:`,
    `connect-src 'self' https://hcaptcha.com https://*.hcaptcha.com`,
    `frame-src 'self' https://hcaptcha.com https://*.hcaptcha.com`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    isDev ? "" : "upgrade-insecure-requests",
  ]
    .filter(Boolean)
    .join("; ");

  const res = NextResponse.next();
  res.headers.set("Content-Security-Policy", csp);
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (!isDev) {
    res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  }

  // Server-side acquisition capture (F12 / EPIC 02).
  try {
    let current: Attribution = EMPTY_ATTRIBUTION;
    const raw = req.cookies.get(ATTR_COOKIE)?.value;
    if (raw) {
      try {
        current = JSON.parse(decodeURIComponent(raw)) as Attribution;
      } catch {
        current = EMPTY_ATTRIBUTION;
      }
    }
    if (!current.lockedAt) {
      const merged = mergeFromUrl(current, new URL(req.url), req.headers.get("referer"));
      if (JSON.stringify(merged) !== JSON.stringify(current)) {
        res.cookies.set(ATTR_COOKIE, encodeURIComponent(JSON.stringify(merged)), {
          maxAge: ATTR_MAX_AGE_S,
          path: "/",
          sameSite: "lax",
          httpOnly: false, // the client capture + lock read it too
        });
      }
    }
  } catch {
    // attribution is best-effort — never break a request
  }

  return res;
}

export const config = {
  matcher: [
    // HTML pages only — skip API, the public PDF route, and static assets
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|api/|d/).*)",
  ],
};
