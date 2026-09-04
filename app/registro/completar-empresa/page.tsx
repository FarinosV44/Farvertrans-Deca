import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { CompleteCompanyForm } from "@/components/auth/complete-company-form";
import { getCurrentUser } from "@/lib/auth";
import { getInvitePreview } from "@/lib/team";

export const metadata: Metadata = {
  title: "Completa tu empresa",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Second step of Google sign-up (AUTH #30): the account exists but has no
 * company yet. Never reachable with a company already set, and never
 * reachable without a session — both just redirect, no error screen needed.
 */
export default async function CompletarEmpresaPage({
  searchParams,
}: {
  searchParams: Promise<{ invite?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/entrar");
  if (user.companyId) redirect("/panel");

  const { invite } = await searchParams;
  const teamInvite = invite ? await getInvitePreview(invite) : null;

  return (
    <AuthShell>
      <CompleteCompanyForm inviteCompany={teamInvite?.companyName ?? null} invite={invite} />
    </AuthShell>
  );
}
