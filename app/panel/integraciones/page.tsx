import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { AppNav } from "@/components/app/app-nav";
import { IntegrationRequestForm } from "@/components/app/integration-request-form";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata = { title: "Integraciones", robots: { index: false } };

/** #74 — "API / Integraciones ERP": a demand-signal form, not a live API. */
export default async function IntegracionesPage() {
  const user = await getCurrentUser();
  if (!user?.companyId || !user.company) redirect("/registro/completar-empresa");

  const existing = await prisma.integrationRequest.findFirst({
    where: { companyId: user.companyId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <SiteHeader authed companyName={user.company.name} />
      <main id="contenido" className="mx-auto max-w-[720px] px-4 py-8 md:px-6">
        <h1 className="text-2xl font-bold">API / Integraciones ERP</h1>
        <AppNav current="empresa" />

        <p className="mt-4 max-w-prose text-sm text-[var(--color-text-muted)]">
          Conecta tu TMS o ERP con DeCA Profesional cuando lo necesites. Durante la fase de
          lanzamiento medimos la demanda para decidir qué integración construir primero.
        </p>

        <div className="mt-6 rounded-[var(--radius-md)] border border-[var(--color-border)] p-4">
          {existing ? (
            <p role="status" className="text-sm">
              Ya nos enviaste una solicitud el {existing.createdAt.toISOString().slice(0, 10)} para{" "}
              <strong>{existing.system}</strong>. La estamos revisando; te contactaremos.
            </p>
          ) : (
            <IntegrationRequestForm
              companyName={user.company.name}
              contactName={user.company.contactName ?? undefined}
              contactEmail={user.company.email ?? user.email}
            />
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
