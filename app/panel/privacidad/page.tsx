import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { AppNav } from "@/components/app/app-nav";
import { CommercialTreatmentSettings } from "@/components/app/commercial-treatment-settings";
import { getCurrentUser } from "@/lib/auth";
import { getCommercialTreatment } from "@/lib/consent";
import { getDictionary } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Privacidad y comunicaciones", robots: { index: false } };

export default async function PrivacidadPage() {
  const user = await getCurrentUser();
  if (!user?.companyId) redirect("/registro/completar-empresa");

  const [treatment, t] = await Promise.all([
    getCommercialTreatment(user.companyId),
    getDictionary(),
  ]);

  return (
    <>
      <SiteHeader authed companyName={user.company?.name} />
      <main id="contenido" className="mx-auto max-w-[720px] px-4 py-8 md:px-6">
        <h1 className="text-2xl font-bold">{t.panel.privacy.title}</h1>
        <AppNav current="privacidad" />
        <p className="mt-4 text-sm text-[var(--color-text-muted)]">{t.panel.privacy.intro}</p>
        <CommercialTreatmentSettings
          treatment={treatment}
          companyEmail={user.company?.email ?? null}
          companyPhone={user.company?.phone ?? null}
          canChange={user.companyRole === "owner"}
        />
      </main>
      <SiteFooter />
    </>
  );
}
