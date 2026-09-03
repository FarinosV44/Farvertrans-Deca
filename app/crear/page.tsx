import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { CrearWizard } from "@/components/deca/wizard";

export const metadata: Metadata = {
  title: "Crear DeCA gratis",
  description:
    "Crea tu Documento Electrónico de Control sin registrarte. 3 pasos, PDF nativo con QR y URL de descarga directa.",
  robots: { index: true, follow: true },
};

export default function CrearPage() {
  return (
    <>
      <SiteHeader />
      <main id="contenido" className="mx-auto max-w-[720px] px-4 py-10 md:px-6">
        <CrearWizard />
      </main>
      <SiteFooter />
    </>
  );
}
