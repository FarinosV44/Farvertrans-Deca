import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";
import { BRAND } from "@/lib/brand";
import { publicEnv } from "@/lib/env";

export const metadata: Metadata = {
  title: "Contacto",
  robots: { index: false, follow: true },
  alternates: { canonical: `${publicEnv.baseUrl}/contacto` },
};

export default function ContactoPage() {
  return (
    <LegalPage title="Contacto">
      <p>
        ¿Dudas sobre el DeCA, un error al generar tu documento o cualquier otra cuestión? Escríbenos
        directamente:
      </p>
      <p>
        <a
          href={`mailto:${BRAND.supportEmail}`}
          className="text-lg font-medium text-[var(--color-primary)] no-underline hover:underline"
        >
          {BRAND.supportEmail}
        </a>
      </p>
      <p>
        Si el problema es con un documento ya generado, indícanos la referencia (por ejemplo
        <code className="mx-1 rounded bg-[var(--color-surface)] px-1">DECA-A1B2C3D4</code>) o el
        código de incidencia si lo tienes — lo localizamos al instante.
      </p>
    </LegalPage>
  );
}
