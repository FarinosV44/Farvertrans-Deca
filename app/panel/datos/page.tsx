import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { AppNav } from "@/components/app/app-nav";
import { SavedDataManager } from "@/components/app/saved-data-manager";
import { CommercialConsentToggle } from "@/components/app/commercial-consent-toggle";
import { getCurrentUser } from "@/lib/auth";
import { listSaved } from "@/lib/data/saved";
import { getCommercialConsent } from "@/lib/consent";

export const dynamic = "force-dynamic";
export const metadata = { title: "Datos habituales", robots: { index: false } };

export default async function DatosPage() {
  const user = await getCurrentUser();
  if (!user?.companyId) redirect("/registro");

  const [saved, consent] = await Promise.all([
    listSaved(user.companyId),
    getCommercialConsent(user.companyId),
  ]);

  return (
    <>
      <SiteHeader authed companyName={user.company?.name} />
      <main id="contenido" className="mx-auto max-w-[720px] px-4 py-8 md:px-6">
        <h1 className="text-2xl font-bold">Datos habituales</h1>
        <AppNav current="datos" />
        <p className="mt-4 text-sm text-[var(--color-text-muted)]">
          Guarda las empresas, vehículos y direcciones que usas a menudo para rellenar tus DeCA en
          segundos.
        </p>
        <SavedDataManager
          companies={saved.companies}
          vehicles={saved.vehicles}
          locations={saved.locations}
        />
        <CommercialConsentToggle
          granted={consent.granted}
          canChange={user.companyRole === "owner"}
        />
      </main>
      <SiteFooter />
    </>
  );
}
