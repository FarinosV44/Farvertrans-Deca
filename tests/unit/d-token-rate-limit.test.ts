import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    decaVersion: { findUnique: vi.fn() },
    decaAccessLog: { create: vi.fn() },
  },
}));
vi.mock("@/lib/abuse", () => ({ checkAbuse: vi.fn() }));
vi.mock("@/lib/hash", () => ({
  hashIdentifier: (v: string) => `hashed:${v}`,
  clientIp: () => "203.0.113.1",
}));

import { GET } from "@/app/d/[token]/route";
import { checkAbuse } from "@/lib/abuse";
import { prisma } from "@/lib/prisma";

/**
 * #125 — `lib/abuse/index.ts` declares a `d_404` policy specifically for this
 * route, but nothing ever called it: an unauthenticated caller could probe
 * `/d/<random>` without limit. These tests import the real route handler
 * (mocking only its DB/hash dependencies) rather than firing hundreds of real
 * HTTP requests, because the e2e suite runs with
 * `FVD_DISABLE_ABUSE_CHECKS=1` and structurally cannot exercise rate-limiting
 * at all.
 */
describe("#125 — /d/[token] 404 path calls checkAbuse('d_404', ...)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (prisma.decaVersion.findUnique as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);
  });

  function callGet(token = "a".repeat(24)) {
    const req = new Request(`http://localhost/d/${token}`);
    return GET(req, { params: Promise.resolve({ token }) });
  }

  it("checks abuse on an unknown token and returns the normal 404 when allowed", async () => {
    (checkAbuse as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ verdict: "allow" });
    const res = await callGet();
    expect(checkAbuse).toHaveBeenCalledTimes(1);
    expect(checkAbuse).toHaveBeenCalledWith("d_404", expect.any(Headers));
    expect(res.status).toBe(404);
  });

  it("returns 429 (never the document) once the hard threshold is reached", async () => {
    (checkAbuse as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      verdict: "block",
      retryAfterMs: 60_000,
    });
    const res = await callGet();
    expect(res.status).toBe(429);
  });

  it("never shows a CAPTCHA/PoW challenge on this route — a real inspector must always get through", async () => {
    // T-3 / security.md: "never [challenge] on /d/ fetches". A "challenge"
    // verdict has no UI to answer it on this raw document endpoint, so it
    // must fall back to the ordinary 404, never a 429-with-challenge-payload.
    (checkAbuse as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ verdict: "challenge" });
    const res = await callGet();
    expect(res.status).toBe(404);
  });

  it("rejects a malformed token before ever touching the database", async () => {
    (checkAbuse as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ verdict: "allow" });
    const res = await callGet("short");
    expect(res.status).toBe(404);
    expect(prisma.decaVersion.findUnique).not.toHaveBeenCalled();
  });
});
