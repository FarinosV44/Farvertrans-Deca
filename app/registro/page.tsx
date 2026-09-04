import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
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

  // An invite link that no longer resolves — expired, already used, or unknown.
  // Never silently fall through to creating a brand-new company (#38).
  if (sp.invite && !teamInvite && !prospectInvite) {
    return (
      <AuthShell>
        <h1 className="text-2xl font-bold tracking-tight">Invitación no válida</h1>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          Este enlace de invitación ha caducado, ya se ha utilizado o no es correcto. Pide a quien
          te invitó que te envíe uno nuevo.
        </p>
        <div className="mt-6 space-y-2 text-sm">
          <Link
            href="/entrar"
            className="block font-medium text-[var(--color-primary)] underline"
            data-testid="invalid-invite-login"
          >
            Ya tengo cuenta · Entrar
          </Link>
          <Link href="/crear" className="block font-medium text-[var(--color-primary)] underline">
            Crear un DeCA gratis sin cuenta
          </Link>
        </div>
      </AuthShell>
    );
  }

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
