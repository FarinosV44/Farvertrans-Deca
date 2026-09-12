import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { AppNav } from "@/components/app/app-nav";
import { DatosHabitualesManager } from "@/components/app/saved-data-manager";
import { getCurrentUser } from "@/lib/auth";
import { listSaved } from "@/lib/data/saved";
import { listSavedShipments } from "@/lib/data/saved-shipments";
import { getDictionary } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Datos habituales", robots: { index: false } };

export default async function DatosPage() {
  const user = await getCurrentUser();
  if (!user?.companyId) redirect("/registro/completar-empresa");

  const [saved, shipments, t] = await Promise.all([
    listSaved(user.companyId),
    listSavedShipments(user.companyId),
    getDictionary(),
  ]);

  return (
    <>
      <SiteHeader authed companyName={user.company?.name} />
      <main id="contenido" className="mx-auto max-w-[900px] px-4 py-8 md:px-6">
        <h1 className="text-2xl font-bold">{t.panel.nav.datos}</h1>
        <AppNav current="datos" />
        <DatosHabitualesManager
          companies={saved.companies}
          vehicles={saved.vehicles}
          locations={saved.locations}
          shipments={shipments}
        />
      </main>
      <SiteFooter />
    </>
  );
}
