import { NextResponse } from "next/server";
import { setSessionCookie, findOrCreateGoogleUser } from "@/lib/auth";
import {
  exchangeGoogleCode,
  fetchGoogleUserinfo,
  googleOAuthConfigured,
  googleRedirectUri,
} from "@/lib/auth/google";
import { OAUTH_STATE_COOKIE, verifyOAuthState } from "@/lib/auth/oauth-state";
import { publicEnv } from "@/lib/env";

export const runtime = "nodejs";

/**
 * Google OAuth callback (AUTH #30). Fails closed on every error path — a
 * broken/expired/tampered exchange always lands back on `/entrar` with a
 * generic error, never a crash and never a half-open session.
 */
export async function GET(req: Request) {
  const base = publicEnv.baseUrl;
  const fail = (reason: string) => NextResponse.redirect(`${base}/entrar?error=${reason}`);

  if (!googleOAuthConfigured()) return fail("oauth_unavailable");

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state) return fail("oauth_invalid");

  const cookieStore = req.headers.get("cookie") ?? "";
  const stateCookie = cookieStore
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${OAUTH_STATE_COOKIE}=`))
    ?.slice(OAUTH_STATE_COOKIE.length + 1);
  const verified = verifyOAuthState(stateCookie, state);
  if (!verified.ok) return fail("oauth_state");

  try {
    const { access_token } = await exchangeGoogleCode({
      code,
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      redirectUri: googleRedirectUri(base),
    });
    const profile = await fetchGoogleUserinfo(access_token);
    if (!profile.email_verified) return fail("oauth_email");

    const { userId, companyId } = await findOrCreateGoogleUser(profile);
    await setSessionCookie(userId);

    if (companyId) return NextResponse.redirect(`${base}/panel`);
    const inviteQs = verified.invite ? `?invite=${encodeURIComponent(verified.invite)}` : "";
    return NextResponse.redirect(`${base}/registro/completar-empresa${inviteQs}`);
  } catch {
    return fail("oauth_failed");
  }
}
