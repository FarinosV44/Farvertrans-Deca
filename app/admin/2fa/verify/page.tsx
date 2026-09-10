import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { TotpVerifyForm } from "@/components/admin/totp-verify-form";
import {
  getInternalUser,
  hasEnrolledStrongAuth,
  isAdmin2faFresh,
  isAdminStepUpFresh,
} from "@/lib/admin/guard";
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
  searchParams: Promise<{ next?: string; stepup?: string }>;
}) {
  const user = await getInternalUser();
  if (!user) notFound();
  if (!(await hasEnrolledStrongAuth(user.id, user.totpEnabledAt))) redirect("/admin/2fa/setup");

  const { next, stepup } = await searchParams;
  const dest = safeInternalPath(next, "/admin");
  // Already verified on this session? Don't render the challenge again — that
  // stale re-render is what users reported as "it keeps asking for the code"
  // (#86 part 7). For a step-up re-verification (`stepup=1`, from a
  // `step_up_required` action) "already verified" means the 10-minute step-up
  // window, NOT the 12h admin window: skipping on the 12h window sends the
  // admin back to an action that still answers `step_up_required` — an
  // unbreakable loop (D-194).
  const alreadyFresh = stepup === "1" ? await isAdminStepUpFresh() : await isAdmin2faFresh();
  if (alreadyFresh) redirect(dest);

  const hasPasskey = (await prisma.webAuthnCredential.count({ where: { userId: user.id } })) > 0;
  return (
    <AuthShell>
      <TotpVerifyForm next={dest} hasPasskey={hasPasskey} hasTotp={!!user.totpEnabledAt} />
    </AuthShell>
  );
}
