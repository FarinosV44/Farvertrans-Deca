import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { AppNav } from "@/components/app/app-nav";
import { CompanyLogoManager } from "@/components/app/company-logo-manager";
import { CompanyProfileForm } from "@/components/app/company-profile-form";
import { getCurrentUser } from "@/lib/auth";
import {
  companyDataComplete,
  missingCompanyFields,
  describeMissingFields,
} from "@/lib/company/completeness";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mi empresa", robots: { index: false } };

export default async function EmpresaPage() {
  const user = await getCurrentUser();
  if (!user?.companyId || !user.company) redirect("/registro");

  const dataComplete = companyDataComplete(user.company, false);
  const canEdit = user.companyRole === "owner";
  const missing = missingCompanyFields(user.company, false);
  // name/nif are locked for the user (#59) — only flag them as "ask support".
  const editableMissing = missing.filter((f) => f !== "name" && f !== "nif");
  const identifierMissing = missing.some((f) => f === "name" || f === "nif");

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
            className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-warn)] bg-[var(--color-warn-bg)] p-4 text-sm"
          >
            <strong>Completa los datos de tu empresa</strong> para poder generar nuevos DeCA.
            {editableMissing.length > 0 && (
              <>
                {" "}
                {canEdit
                  ? "Falta o no es válido, más abajo: "
                  : "Pídele al responsable que complete: "}
                {describeMissingFields(editableMissing)}.
              </>
            )}
            {identifierMissing && (
              <>
                {" "}
                La razón social o el CIF/NIF de la empresa no son correctos; escríbenos a soporte
                para corregirlos.
              </>
            )}
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
