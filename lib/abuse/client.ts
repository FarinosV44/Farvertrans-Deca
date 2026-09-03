"use client";

/** A cheap, non-invasive browser signal for abuse bucketing (never for tracking). */
export function clientFingerprint(): string {
  if (typeof window === "undefined") return "";
  try {
    const parts = [
      navigator.userAgent,
      navigator.language,
      String(screen.width) + "x" + String(screen.height),
      String(new Date().getTimezoneOffset()),
      String(navigator.hardwareConcurrency ?? ""),
    ];
    return parts.join("|").slice(0, 300);
  } catch {
    return "";
  }
}

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Solve the proof-of-work: find a nonce so sha256(`${prefix}:${nonce}`) starts
 * with `difficulty` zero hex chars. Returns the answer string for the
 * `x-fvd-challenge` header, or null if hCaptcha should be used instead.
 */
export async function solveChallenge(challenge: {
  type: "pow" | "hcaptcha";
  prefix?: string;
  difficulty?: number;
  hcaptchaToken?: string;
}): Promise<string | null> {
  if (challenge.type === "hcaptcha") {
    return challenge.hcaptchaToken ? `hcaptcha:${challenge.hcaptchaToken}` : null;
  }
  const prefix = challenge.prefix ?? "";
  const target = "0".repeat(challenge.difficulty ?? 4);
  for (let i = 0; i < 8_000_000; i++) {
    const nonce = i.toString(36);
    if ((await sha256Hex(`${prefix}:${nonce}`)).startsWith(target)) {
      return `pow:${prefix}:${nonce}`;
    }
  }
  return null;
}
