import "server-only";
import { prisma } from "@/lib/prisma";
import { clientIp, hashIdentifier } from "@/lib/hash";
import { POLICIES, decide, windowStart, type ActionKey, type RateDecision } from "./limiter";
import { challengePrefix, verifyHcaptcha, verifyPow } from "./challenge";

/** Challenge answer sent by the client: `hcaptcha:<token>` or `pow:<prefix>:<nonce>`. */
function parseAnswer(raw: string | null | undefined) {
  if (!raw) return null;
  if (raw.startsWith("hcaptcha:")) return { kind: "hcaptcha" as const, token: raw.slice(9) };
  if (raw.startsWith("pow:")) {
    const rest = raw.slice(4);
    const i = rest.indexOf(":");
    if (i < 0) return null;
    return { kind: "pow" as const, prefix: rest.slice(0, i), nonce: rest.slice(i + 1) };
  }
  return null;
}

/** A privacy-preserving key for an action: hashed IP (+ fingerprint when present). */
export function abuseKey(action: ActionKey, headers: Headers, fingerprint?: string | null): string {
  const ip = hashIdentifier(clientIp(headers));
  const fp = fingerprint ? hashIdentifier(fingerprint).slice(0, 12) : "-";
  return `${action}:${ip}:${fp}`;
}

/**
 * Decide whether an action may proceed. Records the attempt when allowed/challenged
 * so the window advances. `GET /d/[token]` NEVER calls this.
 */
/** A looser IP-only policy for requests that carry no client fingerprint. */
function loosePolicy(action: ActionKey) {
  const p = POLICIES[action];
  return { windowMs: p.windowMs, soft: p.soft * 6, hard: p.hard * 6 };
}

export async function checkAbuse(
  action: ActionKey,
  headers: Headers,
  opts: { fingerprint?: string | null; challengeToken?: string | null; record?: boolean } = {},
): Promise<RateDecision & { challengePrefix?: string }> {
  const hasFp = !!opts.fingerprint && opts.fingerprint.length > 4;
  const policy = hasFp ? POLICIES[action] : loosePolicy(action);
  const key = abuseKey(action, headers, opts.fingerprint);
  const now = new Date();

  const agg = await prisma.abuseCounter.aggregate({
    _sum: { count: true },
    where: { keyHash: key, windowStart: { gte: windowStart(policy, now) } },
  });
  const count = agg._sum.count ?? 0;

  const base = decide(policy, count);

  // A solved challenge downgrades "challenge" to "allow" for this request.
  if (base.verdict === "challenge") {
    const answer = parseAnswer(opts.challengeToken);
    let solved = false;
    if (answer?.kind === "hcaptcha") {
      const h = await verifyHcaptcha(answer.token);
      solved = h === true;
    } else if (answer?.kind === "pow") {
      solved = verifyPow(key, answer.prefix, answer.nonce);
    }
    if (solved) {
      if (opts.record !== false) await record(key, now);
      return { verdict: "allow" };
    }
    return { verdict: "challenge", challengePrefix: challengePrefix(key) };
  }

  if (base.verdict === "allow" && opts.record !== false) await record(key, now);
  return base;
}

async function record(keyHash: string, now: Date) {
  // one row per (key, minute) bucket — cheap and self-expiring by the window query
  const bucket = new Date(Math.floor(now.getTime() / 60000) * 60000);
  await prisma.abuseCounter.upsert({
    where: { keyHash_windowStart: { keyHash, windowStart: bucket } },
    create: { keyHash, windowStart: bucket, count: 1 },
    update: { count: { increment: 1 } },
  });
}
