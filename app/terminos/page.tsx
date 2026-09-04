import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";
import { BRAND } from "@/lib/brand";
import { LEGAL_ENTITY } from "@/lib/legal-entity";
import { publicEnv } from "@/lib/env";

export const metadata: Metadata = {
  title: "Términos y condiciones",
  robots: { index: false, follow: true },
  alternates: { canonical: `${publicEnv.baseUrl}/terminos` },
};

export default function TerminosPage() {
  return (
    <LegalPage title="Términos y condiciones">
      <p>
        Estos términos regulan el uso de {BRAND.name}, un servicio operado por{" "}
        <strong>{LEGAL_ENTITY.name}</strong> (CIF {LEGAL_ENTITY.cif}). Al crear una cuenta aceptas
        estos términos y la{" "}
        <a href={LEGAL_ENTITY.privacyUrl}>política de privacidad</a>.
      </p>
      <p className="text-xs text-[var(--color-text-muted)]">
        Versión {LEGAL_ENTITY.termsVersion}. El contenido detallado se completará con la revisión
        legal final antes del lanzamiento comercial; los puntos siguientes reflejan el
        funcionamiento real del servicio hoy.
      </p>
      <h2>Objeto del servicio</h2>
      <p>
        {BRAND.name} permite generar, corregir, conservar y compartir el Documento Electrónico de
        Control (DeCA) del transporte de mercancías por carretera, conforme a la Resolución de 5 de
        junio de 2026. El uso es gratuito durante la fase de lanzamiento indicada en el sitio.
      </p>
      <h2>Cuenta y responsabilidad de los datos</h2>
      <ul>
        <li>
          Eres responsable de la veracidad de los datos que introduces en cada DeCA y de mantener
          segura tu contraseña.
        </li>
        <li>
          El Servicio genera el documento a partir de los datos que aportas; no valida su exactitud
          legal ni sustituye el asesoramiento profesional.
        </li>
        <li>
          Una corrección crea una nueva versión del documento; las versiones anteriores se conservan
          y siguen siendo consultables.
        </li>
      </ul>
      <h2>Uso aceptable</h2>
      <p>
        Queda prohibido un uso del Servicio contrario a la ley, que perjudique a terceros, o que
        intente eludir los controles anti-abuso (creación masiva automatizada, suplantación de
        identidad de otra empresa, etc.).
      </p>
      <h2>Disponibilidad del documento público</h2>
      <p>
        La URL pública de cada DeCA permanece accesible durante el servicio y, como mínimo, 7 días
        naturales después de la fecha de descarga. El documento y su histórico de versiones se
        conservan como exige la normativa del transporte, con independencia de esa disponibilidad
        pública.
      </p>
      <h2>Cambios en el servicio</h2>
      <p>
        {LEGAL_ENTITY.name} puede actualizar estos términos; los cambios relevantes se anunciarán en
        el sitio y una nueva versión requerirá tu aceptación en el siguiente inicio de sesión cuando
        sea necesario.
      </p>
      <h2>Contacto</h2>
      <p>
        Para cualquier cuestión relativa a estos términos, escribe a{" "}
        <a href={`mailto:${LEGAL_ENTITY.supportEmail}`}>{LEGAL_ENTITY.supportEmail}</a>.
      </p>
    </LegalPage>
  );
}
