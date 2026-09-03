import { NextResponse } from "next/server";
import { POW_DIFFICULTY } from "./challenge";
import type { RateDecision } from "./limiter";

/**
 * Turn a non-allow rate decision into an HTTP response. `challenge` → 429 with a
 * PoW spec the client solves and retries; `block` → 429 with Retry-After.
 */
export function abuseResponse(
  d: RateDecision & { challengePrefix?: string },
): NextResponse | null {
  if (d.verdict === "allow") return null;
  if (d.verdict === "block") {
    return NextResponse.json(
      { error: { code: "rate_limited", message: "Demasiadas solicitudes. Espera unos minutos e inténtalo de nuevo." } },
      { status: 429, headers: { "retry-after": String(Math.ceil(d.retryAfterMs / 1000)) } },
    );
  }
  return NextResponse.json(
    {
      error: {
        code: "challenge",
        message: "Confirma que no eres un robot para continuar.",
        challenge: {
          type: process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY ? "hcaptcha" : "pow",
          prefix: d.challengePrefix,
          difficulty: POW_DIFFICULTY,
          siteKey: process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || undefined,
        },
      },
    },
    { status: 429 },
  );
}
