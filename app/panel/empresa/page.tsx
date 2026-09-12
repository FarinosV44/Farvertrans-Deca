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
import { Alert } from "@/components/ui";
import { getDictionary } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mi empresa", robots: { index: false } };

export default async function EmpresaPage() {
  const user = await getCurrentUser();
  if (!user?.companyId || !user.company) redirect("/registro/completar-empresa");

  const dict = await getDictionary();
  const t = dict.panel.empresa;
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
        <h1 className="text-2xl font-bold">{dict.panel.myCompanyFallback}</h1>
        <AppNav current="empresa" />

        {!dataComplete && (
          <div className="mt-4">
            <Alert tone="warn" data-testid="company-data-incomplete">
              <strong>{t.incompleteTitle}</strong> {t.incompleteBody}
              {editableMissing.length > 0 && (
                <>
                  {" "}
                  {canEdit ? t.missingEditable : t.missingAskAdmin}
                  {describeMissingFields(editableMissing)}.
                </>
              )}
              {identifierMissing && <> {t.identifierIssue}</>}
            </Alert>
          </div>
        )}

        <section className="mt-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] p-5">
          <h2 className="text-lg font-bold">{t.companyDataHeading}</h2>
          {/* Two-up only from `md` (768px) — this theme's `sm` breakpoint is
              360px, so `sm:grid-cols-2` crowds these on every phone. */}
          <dl className="mt-3 grid gap-x-6 gap-y-4 md:grid-cols-2">
            <div className="min-w-0">
              <dt className="text-xs font-medium text-[var(--color-text-muted)]">{t.nameLabel}</dt>
              <dd className="mt-0.5 text-sm break-words [overflow-wrap:anywhere]">
                {user.company.name}
              </dd>
            </div>
            <div className="min-w-0">
              <dt className="text-xs font-medium text-[var(--color-text-muted)]">{t.nifLabel}</dt>
              <dd className="mt-0.5 text-sm break-words [overflow-wrap:anywhere]">
                {user.company.nif ?? "—"}
              </dd>
            </div>
          </dl>
        </section>

        <section className="mt-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] p-5">
          <h2 className="text-lg font-bold">{t.contactDataHeading}</h2>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">{t.contactDataIntro}</p>
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
          <h2 className="text-lg font-bold">{t.logoHeading}</h2>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">{t.logoIntro}</p>
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
