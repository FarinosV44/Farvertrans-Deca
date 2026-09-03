import { NextRequest, NextResponse } from "next/server";

/**
 * Security headers (threat model T-5 / T-8).
 *
 * CSP note: `script-src` is `'self' 'unsafe-inline'` (no external hosts except
 * hCaptcha, no `unsafe-eval` in production). A strict nonce/`'strict-dynamic'`
 * CSP did not propagate to Next's own script tags under `next start` on this
 * version; since the app renders no user-supplied HTML (React escapes
 * everything, no `dangerouslySetInnerHTML` with user data) and loads no
 * third-party scripts, `'unsafe-inline'` here is a bounded risk. Tightening to a
 * nonce-based CSP is a tracked post-launch item.
 */
export function middleware(_req: NextRequest) {
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
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg).*)"],
};
