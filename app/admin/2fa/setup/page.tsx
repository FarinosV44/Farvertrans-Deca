import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { TotpSetupForm } from "@/components/admin/totp-setup-form";
import { getInternalUser, hasEnrolledStrongAuth } from "@/lib/admin/guard";

export const metadata: Metadata = {
  title: "Configurar 2FA",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Mandatory admin strong-auth enrollment (SECURITY #53 passkey follow-up) —
 * `requireInternal()` sends here when neither a passkey nor TOTP is set up.
 */
export default async function AdminTotpSetupPage() {
  const user = await getInternalUser();
  if (!user) notFound();
  if (await hasEnrolledStrongAuth(user.id, user.totpEnabledAt)) redirect("/admin");

  return (
    <AuthShell>
      <TotpSetupForm />
    </AuthShell>
  );
}
