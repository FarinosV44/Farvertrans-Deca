import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));

/**
 * `sendMail` runs inside the request path (registration, password reset, team
 * invites). Node's `fetch` has no default timeout, so a slow/unreachable Resend
 * would hang the whole request. These tests pin: (1) an aborted/slow send fails
 * fast as `{ sent: false, reason: "error" }` rather than hanging, (2) a normal
 * success/error still behaves, (3) the abort signal is actually attached.
 */
describe("sendMail — resilient to a slow/unreachable provider", () => {
  const OLD = { key: process.env.RESEND_API_KEY, from: process.env.FVD_MAIL_FROM };
  beforeEach(() => {
    process.env.RESEND_API_KEY = "re_test_key";
    process.env.FVD_MAIL_FROM = "deca@example.com";
    vi.resetModules();
  });
  afterEach(() => {
    process.env.RESEND_API_KEY = OLD.key;
    process.env.FVD_MAIL_FROM = OLD.from;
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("passes an AbortSignal to fetch and returns error (not a hang) when the request is aborted", async () => {
    let seenSignal: AbortSignal | undefined;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: string, init: RequestInit) => {
        seenSignal = init.signal ?? undefined;
        const err = new Error("The operation was aborted due to timeout");
        err.name = "TimeoutError";
        throw err;
      }),
    );
    const { sendMail } = await import("@/lib/mailer");
    const r = await sendMail({ to: "u@example.com", subject: "s", text: "t" });
    expect(seenSignal).toBeInstanceOf(AbortSignal);
    expect(r).toEqual({ sent: false, reason: "error" });
  });

  it("still reports a provider error verbatim", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response('{"message":"nope"}', { status: 422 })),
    );
    const { sendMail } = await import("@/lib/mailer");
    expect(await sendMail({ to: "u@example.com", subject: "s", text: "t" })).toEqual({
      sent: false,
      reason: "error",
    });
  });

  it("#127 redacts a recipient email the provider echoes back in its error body before logging", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            '{"statusCode":422,"message":"Invalid `to` field: chofer@empresa.es is not a verified address"}',
            { status: 422 },
          ),
      ),
    );
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { sendMail } = await import("@/lib/mailer");
    await sendMail({ to: "chofer@empresa.es", subject: "s", text: "t" });
    const logged = errorSpy.mock.calls.map((c) => String(c[0])).join("\n");
    expect(logged).not.toContain("chofer@empresa.es");
    expect(logged).toContain("[redacted]");
    errorSpy.mockRestore();
  });

  it("still reports success with the provider id", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response('{"id":"abc-123"}', { status: 200 })),
    );
    const { sendMail } = await import("@/lib/mailer");
    expect(await sendMail({ to: "u@example.com", subject: "s", text: "t" })).toEqual({
      sent: true,
      providerId: "abc-123",
    });
  });

  it("returns unconfigured (no throw) when the key is missing", async () => {
    delete process.env.RESEND_API_KEY;
    vi.resetModules();
    const { sendMail } = await import("@/lib/mailer");
    expect(await sendMail({ to: "u@example.com", subject: "s", text: "t" })).toEqual({
      sent: false,
      reason: "unconfigured",
    });
  });
});
