import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { TotpVerifyForm } from "@/components/admin/totp-verify-form";
import { getInternalUser } from "@/lib/admin/guard";
import { safeInternalPath } from "@/lib/auth/safe-redirect";

export const metadata: Metadata = {
  title: "Verificación en dos pasos",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/** Post-login admin TOTP challenge (SECURITY #53) — `requireInternal()` sends here when stale/absent. */
export default async function AdminTotpVerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await getInternalUser();
  if (!user) notFound();
  if (!user.totpEnabledAt) redirect("/admin/2fa/setup");

  const { next } = await searchParams;
  return (
    <AuthShell>
      <TotpVerifyForm next={safeInternalPath(next, "/admin")} />
    </AuthShell>
  );
}
