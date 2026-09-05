import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { AppNav } from "@/components/app/app-nav";
import { CompanyLogoManager } from "@/components/app/company-logo-manager";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mi empresa", robots: { index: false } };

export default async function EmpresaPage() {
  const user = await getCurrentUser();
  if (!user?.companyId || !user.company) redirect("/registro");

  return (
    <>
      <SiteHeader authed companyName={user.company.name} />
      <main id="contenido" className="mx-auto max-w-[720px] px-4 py-8 md:px-6">
        <h1 className="text-2xl font-bold">Mi empresa</h1>
        <AppNav current="empresa" />

        <section className="mt-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] p-5">
          <h2 className="text-lg font-bold">Datos de la empresa</h2>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium text-[var(--color-text-muted)]">
                Nombre o razón social
              </dt>
              <dd className="text-sm">{user.company.name}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-[var(--color-text-muted)]">NIF</dt>
              <dd className="text-sm">{user.company.nif ?? "—"}</dd>
            </div>
          </dl>
        </section>

        <section className="mt-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] p-5">
          <h2 className="text-lg font-bold">Logo en el PDF</h2>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Aparecerá en la cabecera de los DeCA que generes a partir de ahora. Los documentos ya
            generados no cambian.
          </p>
          <CompanyLogoManager
            initialLogoDataUri={user.company.logoDataUri}
            canChange={user.companyRole === "owner"}
          />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
