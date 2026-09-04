import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import {
  CrearWizard,
  type SavedData,
  type WizardInitial,
  type WizardTemplate,
} from "@/components/deca/wizard";
import { getCurrentUser } from "@/lib/auth";
import { getDecaForDuplicate } from "@/lib/data/history";
import { listSaved } from "@/lib/data/saved";
import { listTemplates } from "@/lib/data/templates";

export const metadata: Metadata = {
  title: "Crear DeCA gratis",
  description:
    "Crea tu Documento Electrónico de Control sin registrarte. 3 pasos, PDF nativo con QR y URL de descarga directa.",
  robots: { index: true, follow: true },
};

export const dynamic = "force-dynamic";

export default async function CrearPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;
  const user = await getCurrentUser();

  let initial: WizardInitial | undefined;
  let saved: SavedData | undefined;
  let templates: WizardTemplate[] | undefined;

  if (user?.companyId) {
    const [s, t, source] = await Promise.all([
      listSaved(user.id),
      listTemplates(user.companyId),
      from ? getDecaForDuplicate(user.companyId, from) : Promise.resolve(null),
    ]);
    saved = s;
    templates = t;
    if (source) {
      initial = {
        shipperName: source.shipper?.name ?? "",
        shipperNif: source.shipper?.nif ?? "",
        shipperAddress: source.shipper?.address ?? "",
        carrierName: source.carrier?.name ?? "",
        carrierNif: source.carrier?.nif ?? "",
        carrierAddress: source.carrier?.address ?? "",
        loadLocationName: source.loadLocation?.name ?? "",
        loadLocationAddress: source.loadLocation?.address ?? "",
        loadLocationPostalCode: source.loadLocation?.postalCode ?? "",
        loadLocationCity: source.loadLocation?.city ?? "",
        loadLocationProvince: source.loadLocation?.province ?? "",
        loadLocationCountry: source.loadLocation?.country ?? "España",
        loadDate: "", // reset — the operator sets the new dates
        unloadLocationName: source.unloadLocation?.name ?? "",
        unloadLocationAddress: source.unloadLocation?.address ?? "",
        unloadLocationPostalCode: source.unloadLocation?.postalCode ?? "",
        unloadLocationCity: source.unloadLocation?.city ?? "",
        unloadLocationProvince: source.unloadLocation?.province ?? "",
        unloadLocationCountry: source.unloadLocation?.country ?? "España",
        unloadDate: "",
        goods: source.goods ?? "",
        weight: source.weight ?? "",
        tractorPlate: source.tractorPlate ?? "",
        trailerPlate: source.trailerPlate ?? "",
        reference: "",
      };
    }
  }

  return (
    <>
      <SiteHeader authed={!!user?.companyId} companyName={user?.company?.name} />
      <main id="contenido" className="mx-auto max-w-[720px] px-4 py-10 md:px-6">
        <CrearWizard
          initial={initial}
          saved={saved}
          templates={templates}
          company={
            user?.company
              ? { name: user.company.name, nif: user.company.nif, address: user.company.address }
              : undefined
          }
        />
      </main>
      <SiteFooter />
    </>
  );
}
