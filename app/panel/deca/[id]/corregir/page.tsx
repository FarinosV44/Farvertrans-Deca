import { notFound, redirect } from "next/navigation";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { CrearWizard, type WizardInitial } from "@/components/deca/wizard";
import { getCurrentUser } from "@/lib/auth";
import { getDecaDetail } from "@/lib/data/history";
import { listSaved } from "@/lib/data/saved";
import { listSavedShipments } from "@/lib/data/saved-shipments";

export const dynamic = "force-dynamic";
export const metadata = { title: "Corregir DeCA", robots: { index: false } };

export default async function CorregirPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user?.companyId) redirect("/registro/completar-empresa");

  const { id } = await params;
  const [deca, saved, shipments] = await Promise.all([
    getDecaDetail(user.companyId, id),
    listSaved(user.companyId),
    listSavedShipments(user.companyId),
  ]);
  if (!deca) notFound();

  const d = deca.current.data;
  const initial: WizardInitial = {
    shipperName: d.shipper?.name ?? "",
    shipperNif: d.shipper?.nif ?? "",
    shipperAddress: d.shipper?.address ?? "",
    shipperPostalCode: d.shipper?.postalCode ?? "",
    shipperCity: d.shipper?.city ?? "",
    carrierName: d.carrier?.name ?? "",
    carrierNif: d.carrier?.nif ?? "",
    carrierAddress: d.carrier?.address ?? "",
    carrierPostalCode: d.carrier?.postalCode ?? "",
    carrierCity: d.carrier?.city ?? "",
    loadLocationName: d.loadLocation?.name ?? "",
    loadLocationAddress: d.loadLocation?.address ?? "",
    loadLocationPostalCode: d.loadLocation?.postalCode ?? "",
    loadLocationCity: d.loadLocation?.city ?? "",
    loadLocationProvince: d.loadLocation?.province ?? "",
    loadLocationCountry: d.loadLocation?.country ?? "España",
    loadDate: d.loadDate ?? "",
    unloadLocationName: d.unloadLocation?.name ?? "",
    unloadLocationAddress: d.unloadLocation?.address ?? "",
    unloadLocationPostalCode: d.unloadLocation?.postalCode ?? "",
    unloadLocationCity: d.unloadLocation?.city ?? "",
    unloadLocationProvince: d.unloadLocation?.province ?? "",
    unloadLocationCountry: d.unloadLocation?.country ?? "España",
    unloadDate: d.unloadDate ?? "",
    goods: d.goods ?? "",
    weight: d.weight ?? "",
    tractorPlate: d.tractorPlate ?? "",
    trailerPlate: d.trailerPlate ?? "",
    reference: "",
    // #112: shipments beyond the first must be pre-loaded — never silently
    // dropped just because the correction form was opened. Vehicle is never
    // per-shipment (single DeCA-level tractor/trailer, set above) even if an
    // old dev-only record happens to carry a per-shipment override — that
    // override is simply not re-offered as editable; the document already
    // generated is untouched either way.
    extraShipments: (Array.isArray(d.shipments) ? d.shipments.slice(1) : []).map((raw) => {
      const s = raw as {
        loadLocation?: Record<string, string>;
        unloadLocation?: Record<string, string>;
        goods?: string;
        weight?: string;
        recipient?: string;
        loadDate?: string;
        unloadDate?: string;
        notes?: string;
      };
      return {
        loadLocationName: s.loadLocation?.name ?? "",
        loadLocationAddress: s.loadLocation?.address ?? "",
        loadLocationPostalCode: s.loadLocation?.postalCode ?? "",
        loadLocationCity: s.loadLocation?.city ?? "",
        loadLocationProvince: s.loadLocation?.province ?? "",
        loadLocationCountry: s.loadLocation?.country ?? "España",
        unloadLocationName: s.unloadLocation?.name ?? "",
        unloadLocationAddress: s.unloadLocation?.address ?? "",
        unloadLocationPostalCode: s.unloadLocation?.postalCode ?? "",
        unloadLocationCity: s.unloadLocation?.city ?? "",
        unloadLocationProvince: s.unloadLocation?.province ?? "",
        unloadLocationCountry: s.unloadLocation?.country ?? "España",
        goods: s.goods ?? "",
        weight: s.weight ?? "",
        recipient: s.recipient ?? "",
        loadDate: s.loadDate ?? d.loadDate ?? "",
        unloadDate: s.unloadDate ?? d.unloadDate ?? "",
        notes: s.notes ?? "",
      };
    }),
  };

  return (
    <>
      <SiteHeader authed companyName={user.company?.name} />
      <main id="contenido" className="mx-auto max-w-[720px] px-4 py-10 md:px-6">
        <CrearWizard initial={initial} saved={{ ...saved, shipments }} correctDecaId={deca.id} />
      </main>
      <SiteFooter />
    </>
  );
}
