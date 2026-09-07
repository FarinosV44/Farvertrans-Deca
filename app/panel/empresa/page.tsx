import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { AppNav } from "@/components/app/app-nav";
import { CompanyLogoManager } from "@/components/app/company-logo-manager";
import { CompanyProfileForm } from "@/components/app/company-profile-form";
import { getCurrentUser } from "@/lib/auth";
import { companyDataComplete } from "@/lib/company/completeness";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mi empresa", robots: { index: false } };

export default async function EmpresaPage() {
  const user = await getCurrentUser();
  if (!user?.companyId || !user.company) redirect("/registro");

  const dataComplete = companyDataComplete(user.company);
  const canEdit = user.companyRole === "owner";

  return (
    <>
      <SiteHeader authed companyName={user.company.name} />
      <main id="contenido" className="mx-auto max-w-[720px] px-4 py-8 md:px-6">
        <h1 className="text-2xl font-bold">Mi empresa</h1>
        <AppNav current="empresa" />

        {!dataComplete && (
          <div
            role="status"
            data-testid="company-data-incomplete"
            className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-warning,#b45309)] bg-[color-mix(in_srgb,var(--color-warning,#b45309)_8%,transparent)] p-4 text-sm"
          >
            <strong>Completa los datos de tu empresa.</strong>{" "}
            {canEdit
              ? "Faltan datos obligatorios (dirección, código postal, población, contacto). Rellénalos abajo para poder generar nuevos DeCA."
              : "Faltan datos obligatorios. Pídele al responsable de la cuenta que los complete para poder generar nuevos DeCA."}
          </div>
        )}

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
          <h2 className="text-lg font-bold">Datos de contacto</h2>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Email, teléfono, dirección y persona de contacto de la empresa — visible solo dentro de
            tu espacio de trabajo.
          </p>
          <CompanyProfileForm
            initial={{
              email: user.company.email,
              phone: user.company.phone,
              address: user.company.address,
              postalCode: user.company.postalCode,
              city: user.company.city,
              contactName: user.company.contactName,
            }}
            canChange={canEdit}
          />
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
