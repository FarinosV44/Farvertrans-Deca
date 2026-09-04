import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";
import { BRAND } from "@/lib/brand";
import { publicEnv } from "@/lib/env";

export const metadata: Metadata = {
  title: "Aviso legal",
  robots: { index: false, follow: true },
  alternates: { canonical: `${publicEnv.baseUrl}/aviso-legal` },
};

export default function AvisoLegalPage() {
  return (
    <LegalPage title="Aviso legal">
      <p>
        Este aviso legal regula el acceso y el uso del sitio web y del servicio {BRAND.name} (en
        adelante, «el Servicio»).
      </p>
      <h2>Titularidad</h2>
      <p>
        Los datos identificativos del titular del Servicio (razón social, NIF y domicilio) se
        publicarán en esta página antes del lanzamiento público, conforme a la Ley 34/2002, de 11 de
        julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE).
      </p>
      <h2>Objeto</h2>
      <p>
        {BRAND.name} permite generar el Documento Electrónico de Control Administrativo (DeCA) del
        transporte de mercancías por carretera, conforme a la Resolución de 5 de junio de 2026. El
        uso del generador es gratuito durante la fase de lanzamiento indicada en el propio sitio.
      </p>
      <h2>Condiciones de uso</h2>
      <ul>
        <li>El usuario es responsable de la veracidad de los datos que introduce en el DeCA.</li>
        <li>
          El Servicio genera el documento a partir de esos datos; no valida su exactitud legal ni
          sustituye el asesoramiento profesional.
        </li>
        <li>Queda prohibido un uso del Servicio contrario a la ley o que perjudique a terceros.</li>
      </ul>
      <h2>Propiedad intelectual</h2>
      <p>
        El diseño, el código y los contenidos propios del sitio están protegidos por derechos de
        propiedad intelectual. No se autoriza su reproducción sin permiso, salvo el uso normal del
        Servicio para generar tus propios documentos.
      </p>
      <h2>Contacto</h2>
      <p>
        Para cualquier cuestión relativa a este aviso legal, escribe a{" "}
        <a href={`mailto:${BRAND.supportEmail}`}>{BRAND.supportEmail}</a>.
      </p>
    </LegalPage>
  );
}
