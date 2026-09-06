import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { TotpVerifyForm } from "@/components/admin/totp-verify-form";
import { getInternalUser, hasEnrolledStrongAuth } from "@/lib/admin/guard";
import { safeInternalPath } from "@/lib/auth/safe-redirect";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Verificación en dos pasos",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Post-login admin strong-auth challenge (SECURITY #53 passkey follow-up) —
 * `requireInternal()` sends here when stale/absent.
 */
export default async function AdminTotpVerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await getInternalUser();
  if (!user) notFound();
  if (!(await hasEnrolledStrongAuth(user.id, user.totpEnabledAt))) redirect("/admin/2fa/setup");

  const { next } = await searchParams;
  const hasPasskey = (await prisma.webAuthnCredential.count({ where: { userId: user.id } })) > 0;
  return (
    <AuthShell>
      <TotpVerifyForm next={safeInternalPath(next, "/admin")} hasPasskey={hasPasskey} />
    </AuthShell>
  );
}
