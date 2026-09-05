import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { TrackView } from "@/components/analytics/track-view";
import { EmailVerificationError, getCurrentUser, verifyEmailToken } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Confirma tu correo",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function VerifyEmailTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const t = await getDictionary();

  let ok = false;
  let errorCode: string | null = null;
  try {
    await verifyEmailToken(token);
    ok = true;
  } catch (e) {
    errorCode = e instanceof EmailVerificationError ? e.code : "invalid";
  }

  const errorCopy: Record<string, string> = {
    invalid: t.auth.verifyToken.errorInvalid,
    used: t.auth.verifyToken.errorUsed,
    expired: t.auth.verifyToken.errorExpired,
  };

  // The click may land in a different session than the one that registered.
  const user = await getCurrentUser().catch(() => null);

  return (
    <>
      <SiteHeader authed={!!user?.companyId} companyName={user?.company?.name} />
      <main id="contenido" className="mx-auto max-w-[480px] px-4 py-12 text-center md:px-6">
        {ok ? (
          <>
            <TrackView event="email_verified" />
            <div
              aria-hidden
              className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[color-mix(in_srgb,var(--color-success)_15%,transparent)] text-3xl"
            >
              ✓
            </div>
            <h1 className="mt-5 text-2xl font-bold" data-testid="verify-email-success">
              {t.auth.verifyToken.successHeading}
            </h1>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              {t.auth.verifyToken.successBody}
            </p>
            <Link
              href={user ? "/panel" : "/entrar"}
              className="mt-6 inline-flex min-h-12 items-center rounded-[var(--radius-md)] bg-[var(--color-primary)] px-6 font-medium text-[var(--color-primary-contrast)] no-underline"
            >
              {user ? t.auth.verifyToken.successCtaAuthed : t.auth.verifyToken.successCtaAnon}
            </Link>
          </>
        ) : (
          <>
            <div
              aria-hidden
              className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[var(--color-danger)]/10 text-3xl"
            >
              ⚠️
            </div>
            <h1 className="mt-5 text-2xl font-bold" data-testid="verify-email-error">
              {t.auth.verifyToken.errorHeading}
            </h1>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              {(errorCode && errorCopy[errorCode]) ?? errorCopy.invalid}
            </p>
            <Link
              href={user ? "/verificar-email" : "/entrar"}
              className="mt-6 inline-flex min-h-12 items-center rounded-[var(--radius-md)] border border-[var(--color-primary)] px-6 font-medium text-[var(--color-primary)] no-underline"
            >
              {user ? t.auth.verifyToken.errorCtaAuthed : t.auth.verifyToken.errorCtaAnon}
            </Link>
          </>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
