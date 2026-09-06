import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { TotpSetupForm } from "@/components/admin/totp-setup-form";
import { getInternalUser } from "@/lib/admin/guard";

export const metadata: Metadata = {
  title: "Configurar 2FA",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/** Mandatory admin TOTP enrollment (SECURITY #53) — `requireInternal()` sends here when unset. */
export default async function AdminTotpSetupPage() {
  const user = await getInternalUser();
  if (!user) notFound();
  if (user.totpEnabledAt) redirect("/admin");

  return (
    <AuthShell>
      <TotpSetupForm />
    </AuthShell>
  );
}
