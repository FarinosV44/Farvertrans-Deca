import "server-only";
import { createHmac } from "node:crypto";

/** One-way hash of an IP (or fingerprint) for minimal audit logs / abuse counters. */
export function hashIdentifier(value: string): string {
  const secret = process.env.FVD_HASH_SECRET ?? "insecure-dev-secret";
  return createHmac("sha256", secret).update(value).digest("hex").slice(0, 32);
}

/** Best-effort client IP from proxy headers (Hostinger reverse proxy sets X-Forwarded-For). */
export function clientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip") || "unknown"
  );
}
