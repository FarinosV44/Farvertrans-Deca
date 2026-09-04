import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";
import { getCurrentUser } from "@/lib/auth";
import { getInvitePreview } from "@/lib/team";
import { resolveProspectInvite } from "@/lib/growth";

export const metadata: Metadata = {
  title: "Crear cuenta",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function RegistroPage({
  searchParams,
}: {
  searchParams: Promise<{ invite?: string; claim?: string }>;
}) {
  const sp = await searchParams;
  const user = await getCurrentUser();

  // An invite for an already-logged-in user: accept it and go straight to the panel.
  if (user?.companyId && sp.invite) {
    try {
      const { acceptInvite } = await import("@/lib/team");
      await acceptInvite(sp.invite, user.id);
    } catch {
      /* fall through */
    }
    redirect("/panel");
  }
  if (user?.companyId && !sp.claim) redirect("/panel");

  const teamInvite = sp.invite ? await getInvitePreview(sp.invite) : null;
  const prospectInvite = sp.invite && !teamInvite ? await resolveProspectInvite(sp.invite) : null;
  const googleEnabled = !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;

  return (
    <AuthShell>
      <Suspense fallback={null}>
        <RegisterForm
          inviteCompany={teamInvite?.companyName ?? null}
          inviteEmail={teamInvite?.email ?? null}
          prospectCompany={
            prospectInvite ? { name: prospectInvite.name, nif: prospectInvite.nif ?? "" } : null
          }
          googleEnabled={googleEnabled}
        />
      </Suspense>
    </AuthShell>
  );
}
