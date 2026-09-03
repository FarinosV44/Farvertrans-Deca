import { redirect } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { getCurrentUser } from "@/lib/auth";
import { publicEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

// Minimal registered workspace (BUILD 09). BUILD 10 adds history/search, saved
// entities and duplicate.
export default async function AppHome() {
  const user = await getCurrentUser();
  if (!user) redirect("/registro");

  const { prisma } = await import("@/lib/prisma");
  const decas = user.companyId
    ? await prisma.deca.findMany({
        where: { companyId: user.companyId },
        include: { currentVersion: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      })
    : [];

  return (
    <>
      <SiteHeader />
      <main id="contenido" className="mx-auto max-w-[900px] px-4 py-10 md:px-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Mis DeCA</h1>
          <Link
            href="/crear"
            className="min-h-10 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-2 font-medium text-[var(--color-primary-contrast)] no-underline"
          >
            + Crear DeCA
          </Link>
        </div>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          {user.company?.name ?? "Tu empresa"}
        </p>

        {decas.length === 0 ? (
          <p className="mt-8 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-sm text-[var(--color-text-muted)]">
            Aún no tienes documentos guardados. <Link href="/crear">Crea tu primer DeCA</Link>.
          </p>
        ) : (
          <ul className="mt-6 divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
            {decas.map((d) => {
              const data = (d.currentVersion?.dataJson ?? {}) as {
                origin?: string;
                destination?: string;
                carrier?: { name?: string };
              };
              return (
                <li key={d.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">
                      {String(data.origin ?? "")} → {String(data.destination ?? "")}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {d.createdAt.toISOString().slice(0, 10)} ·{" "}
                      {String(data.carrier?.name ?? "")}
                    </p>
                  </div>
                  {d.currentVersion && (
                    <a
                      className="text-sm"
                      href={`${publicEnv.baseUrl}/d/${d.currentVersion.token}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ver PDF
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
