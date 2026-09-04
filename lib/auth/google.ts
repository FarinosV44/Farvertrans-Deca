/**
 * Google OAuth 2.0 (Authorization Code) — AUTH #30. Plain `fetch` calls
 * against Google's endpoints, no SDK: the app owns its own session system
 * (`lib/auth/session.ts`), so a full OAuth/Auth.js library would run a
 * second, parallel session mechanism for no benefit.
 */

const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

export function googleOAuthConfigured(): boolean {
  return !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;
}

/** Build the redirect_uri from the app's own base URL — never trusts a request header. */
export function googleRedirectUri(baseUrl: string): string {
  return `${baseUrl}/api/auth/google/callback`;
}

/** Pure — the consent-screen URL the browser is redirected to. */
export function buildGoogleAuthUrl(opts: {
  clientId: string;
  redirectUri: string;
  state: string;
}): string {
  const params = new URLSearchParams({
    client_id: opts.clientId,
    redirect_uri: opts.redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state: opts.state,
    prompt: "select_account",
  });
  return `${AUTH_URL}?${params.toString()}`;
}

export class GoogleAuthError extends Error {}

/** Exchange the authorization code for an access token. */
export async function exchangeGoogleCode(opts: {
  code: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}): Promise<{ access_token: string }> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code: opts.code,
      client_id: opts.clientId,
      client_secret: opts.clientSecret,
      redirect_uri: opts.redirectUri,
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) throw new GoogleAuthError(`token exchange failed (${res.status})`);
  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) throw new GoogleAuthError("token exchange returned no access_token");
  return { access_token: data.access_token };
}

export type GoogleUserinfo = {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
};

/** Fetch the authenticated user's profile from Google. */
export async function fetchGoogleUserinfo(accessToken: string): Promise<GoogleUserinfo> {
  const res = await fetch(USERINFO_URL, {
    headers: { authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new GoogleAuthError(`userinfo fetch failed (${res.status})`);
  const data = (await res.json()) as {
    sub?: string;
    email?: string;
    email_verified?: boolean;
    name?: string;
  };
  if (!data.sub || !data.email) throw new GoogleAuthError("userinfo missing sub/email");
  return {
    sub: data.sub,
    email: data.email,
    email_verified: !!data.email_verified,
    name: data.name,
  };
}
