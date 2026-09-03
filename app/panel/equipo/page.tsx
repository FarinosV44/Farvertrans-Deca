import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { AppNav } from "@/components/app/app-nav";
import { TeamManager } from "@/components/app/team-manager";
import { getCurrentUser } from "@/lib/auth";
import { listMembers, listPendingInvites } from "@/lib/team";

export const dynamic = "force-dynamic";
export const metadata = { title: "Equipo", robots: { index: false } };

export default async function EquipoPage() {
  const user = await getCurrentUser();
  if (!user?.companyId) redirect("/registro");

  const [members, invites] = await Promise.all([
    listMembers(user.companyId),
    user.companyRole === "owner" ? listPendingInvites(user.companyId) : Promise.resolve([]),
  ]);

  return (
    <>
      <SiteHeader authed companyName={user.company?.name} />
      <main id="contenido" className="mx-auto max-w-[720px] px-4 py-8 md:px-6">
        <h1 className="text-2xl font-bold">Equipo · {user.company?.name}</h1>
        <AppNav current="equipo" />
        <TeamManager
          members={members}
          invites={invites.map((i) => ({ ...i, expiresAt: i.expiresAt.toISOString() }))}
          isAdmin={user.companyRole === "owner"}
          meId={user.id}
        />
      </main>
      <SiteFooter />
    </>
  );
}
