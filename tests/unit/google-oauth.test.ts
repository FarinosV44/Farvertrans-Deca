import { describe, expect, it } from "vitest";
import { createOAuthState, verifyOAuthState } from "@/lib/auth/oauth-state";
import { buildGoogleAuthUrl } from "@/lib/auth/google";

describe("OAuth state (Google sign-in CSRF, AUTH #30)", () => {
  it("round-trips: a state created by the start route verifies on the callback", () => {
    const { cookieValue, nonce } = createOAuthState();
    const result = verifyOAuthState(cookieValue, nonce);
    expect(result.ok).toBe(true);
    expect(result.invite).toBeUndefined();
  });

  it("carries a pending invite token through the round trip", () => {
    const { cookieValue, nonce } = createOAuthState("inv_abc123");
    const result = verifyOAuthState(cookieValue, nonce);
    expect(result.ok).toBe(true);
    expect(result.invite).toBe("inv_abc123");
  });

  it("rejects a state param that doesn't match the signed cookie's nonce", () => {
    const { cookieValue } = createOAuthState();
    expect(verifyOAuthState(cookieValue, "not-the-real-nonce").ok).toBe(false);
  });

  it("rejects a tampered cookie (bad signature)", () => {
    const { cookieValue, nonce } = createOAuthState();
    const [body] = cookieValue.split(".");
    const tampered = `${body}.tampered-signature`;
    expect(verifyOAuthState(tampered, nonce).ok).toBe(false);
  });

  it("rejects a missing cookie or missing query state", () => {
    const { nonce } = createOAuthState();
    expect(verifyOAuthState(undefined, nonce).ok).toBe(false);
    const { cookieValue } = createOAuthState();
    expect(verifyOAuthState(cookieValue, null).ok).toBe(false);
  });
});

describe("buildGoogleAuthUrl", () => {
  it("is a pure function that builds the exact consent-screen URL", () => {
    const url = buildGoogleAuthUrl({
      clientId: "client-123",
      redirectUri: "https://decaprofesional.es/api/auth/google/callback",
      state: "nonce-abc",
    });
    const parsed = new URL(url);
    expect(parsed.origin + parsed.pathname).toBe("https://accounts.google.com/o/oauth2/v2/auth");
    expect(parsed.searchParams.get("client_id")).toBe("client-123");
    expect(parsed.searchParams.get("redirect_uri")).toBe(
      "https://decaprofesional.es/api/auth/google/callback",
    );
    expect(parsed.searchParams.get("state")).toBe("nonce-abc");
    expect(parsed.searchParams.get("response_type")).toBe("code");
    expect(parsed.searchParams.get("scope")).toBe("openid email profile");
  });
});
