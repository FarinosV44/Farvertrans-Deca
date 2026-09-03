import { notFound, redirect } from "next/navigation";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { CrearWizard, type WizardInitial } from "@/components/deca/wizard";
import { getCurrentUser } from "@/lib/auth";
import { getDecaDetail } from "@/lib/data/history";

export const dynamic = "force-dynamic";
export const metadata = { title: "Corregir DeCA", robots: { index: false } };

export default async function CorregirPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user?.companyId) redirect("/registro");

  const { id } = await params;
  const deca = await getDecaDetail(user.companyId, id);
  if (!deca) notFound();

  const d = deca.current.data;
  const initial: WizardInitial = {
    shipperName: d.shipper?.name ?? "",
    shipperNif: d.shipper?.nif ?? "",
    shipperAddress: d.shipper?.address ?? "",
    carrierName: d.carrier?.name ?? "",
    carrierNif: d.carrier?.nif ?? "",
    carrierAddress: d.carrier?.address ?? "",
    origin: d.origin ?? "",
    destination: d.destination ?? "",
    transportDate: d.transportDate ?? "",
    goods: d.goods ?? "",
    weight: d.weight ?? "",
    tractorPlate: d.tractorPlate ?? "",
    trailerPlate: d.trailerPlate ?? "",
    reference: "",
  };

  return (
    <>
      <SiteHeader authed />
      <main id="contenido" className="mx-auto max-w-[720px] px-4 py-10 md:px-6">
        <CrearWizard
          initial={initial}
          saved={{ companies: [], vehicles: [], addresses: [] }}
          correctDecaId={deca.id}
        />
      </main>
      <SiteFooter />
    </>
  );
}
