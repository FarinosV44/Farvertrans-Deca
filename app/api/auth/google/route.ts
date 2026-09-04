import { NextResponse } from "next/server";
import { buildGoogleAuthUrl, googleOAuthConfigured, googleRedirectUri } from "@/lib/auth/google";
import {
  createOAuthState,
  OAUTH_STATE_COOKIE,
  OAUTH_STATE_COOKIE_OPTIONS,
} from "@/lib/auth/oauth-state";
import { publicEnv } from "@/lib/env";

export const runtime = "nodejs";

/** Start the "Continuar con Google" redirect (AUTH #30). */
export async function GET(req: Request) {
  const base = publicEnv.baseUrl;
  if (!googleOAuthConfigured()) {
    return NextResponse.redirect(`${base}/entrar`);
  }

  const invite = new URL(req.url).searchParams.get("invite") ?? undefined;
  const { cookieValue, nonce } = createOAuthState(invite);
  const authUrl = buildGoogleAuthUrl({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    redirectUri: googleRedirectUri(base),
    state: nonce,
  });

  const res = NextResponse.redirect(authUrl);
  res.cookies.set(OAUTH_STATE_COOKIE, cookieValue, OAUTH_STATE_COOKIE_OPTIONS);
  return res;
}
