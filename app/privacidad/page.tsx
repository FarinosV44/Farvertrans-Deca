import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";
import { BRAND } from "@/lib/brand";
import { LEGAL_ENTITY } from "@/lib/legal-entity";
import { publicEnv } from "@/lib/env";

export const metadata: Metadata = {
  title: "Privacidad",
  robots: { index: false, follow: true },
  alternates: { canonical: `${publicEnv.baseUrl}/privacidad` },
};

export default function PrivacidadPage() {
  return (
    <LegalPage title="Política de privacidad">
      <p>
        Esta política explica qué datos trata {BRAND.name} y con qué finalidad, conforme al
        Reglamento (UE) 2016/679 (RGPD) y la LOPDGDD.
      </p>
      <h2>Responsable del tratamiento</h2>
      <p>
        <strong>{LEGAL_ENTITY.name}</strong>, CIF {LEGAL_ENTITY.cif}. {LEGAL_ENTITY.address} — se
        publicará en cuanto esté disponible. Contacto:{" "}
        <a href={`mailto:${LEGAL_ENTITY.privacyEmail}`}>{LEGAL_ENTITY.privacyEmail}</a>.
      </p>
      <h2>Qué datos tratamos</h2>
      <ul>
        <li>
          <strong>Datos del DeCA</strong>: los que introduces en el formulario (cargador,
          transportista, ruta, mercancía, matrícula). Se usan únicamente para generar tu documento y
          se conservan el tiempo exigido por la normativa del transporte.
        </li>
        <li>
          <strong>Cuenta</strong>: email y contraseña (cifrada). Crear una cuenta gratuita es
          necesario para generar tu DeCA — puedes rellenar el formulario sin cuenta, pero el
          documento final requiere registrarte o iniciar sesión.
        </li>
        <li>
          <strong>Uso del sitio</strong>: eventos anónimos de analítica propia (sin cookies de
          terceros) para entender qué funciona y qué no. No incluyen tu nombre, NIF ni el contenido
          de tus documentos.
        </li>
      </ul>
      <h2>Base legal</h2>
      <p>
        La ejecución del servicio que solicitas (generar y conservar tu DeCA) y, en su caso, tu
        consentimiento al crear una cuenta.
      </p>
      <h2>Conservación</h2>
      <p>
        Los documentos generados se conservan al menos un año, conforme a la obligación legal del
        transporte de mercancías. Puedes solicitar la supresión de tu cuenta y tus datos habituales
        en cualquier momento; la conservación del propio DeCA generado sigue el plazo legal
        aplicable con independencia de la baja de la cuenta.
      </p>
      <h2>Tus derechos</h2>
      <p>
        Puedes ejercer tus derechos de acceso, rectificación, supresión, portabilidad, limitación y
        oposición escribiendo a <a href={`mailto:${BRAND.supportEmail}`}>{BRAND.supportEmail}</a>.
      </p>
      <h2>Encargados y terceros</h2>
      <p>
        Usamos proveedores de infraestructura (hosting, base de datos y almacenamiento) que actúan
        como encargados del tratamiento bajo contrato, únicamente para prestar el Servicio.
      </p>
    </LegalPage>
  );
}
