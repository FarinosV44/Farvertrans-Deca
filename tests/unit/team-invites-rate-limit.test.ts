import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/auth", () => ({
  getCurrentUser: vi.fn(),
}));
vi.mock("@/lib/team", () => ({
  createInvite: vi.fn(),
  TeamError: class TeamError extends Error {
    code: string;
    constructor(code: string, message: string) {
      super(message);
      this.code = code;
    }
  },
}));
vi.mock("@/lib/abuse", () => ({ checkAbuse: vi.fn() }));
vi.mock("@/lib/mailer", () => ({ sendMail: vi.fn() }));

import { POST } from "@/app/api/team/invites/route";
import { getCurrentUser } from "@/lib/auth";
import { createInvite } from "@/lib/team";
import { checkAbuse } from "@/lib/abuse";

/**
 * #129 — `POST /api/team/invites` let any authenticated member send an
 * unbounded number of invite emails to arbitrary addresses, with no abuse
 * check at all (unlike every sibling mail-sending route). These tests import
 * the real route handler directly (mocking its auth/team/mail dependencies)
 * rather than firing hundreds of real requests, for the same reason as #125:
 * the e2e suite runs with `FVD_DISABLE_ABUSE_CHECKS=1` and structurally
 * cannot exercise rate-limiting.
 */
describe("#129 — POST /api/team/invites is rate-limited", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getCurrentUser as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "u1",
      companyId: "c1",
      company: { name: "Acme SL" },
    });
    (createInvite as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      token: "tok",
      email: "new@example.com",
      inviteId: "i1",
    });
  });

  function callPost(body = { email: "new@example.com" }) {
    const req = new Request("http://localhost/api/team/invites", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return POST(req);
  }

  it("checks abuse before creating an invite, and returns 429 once blocked", async () => {
    (checkAbuse as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      verdict: "block",
      retryAfterMs: 60_000,
    });
    const res = await callPost();
    expect(checkAbuse).toHaveBeenCalledWith("share", expect.any(Headers), expect.any(Object));
    expect(res.status).toBe(429);
    expect(createInvite).not.toHaveBeenCalled();
  });

  it("still creates the invite normally when allowed", async () => {
    (checkAbuse as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ verdict: "allow" });
    const res = await callPost();
    expect(res.status).toBe(201);
    expect(createInvite).toHaveBeenCalledTimes(1);
  });
});
