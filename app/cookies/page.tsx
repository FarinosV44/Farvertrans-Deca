import type { Metadata } from "next";
import { LegalPage } from "@/components/site/legal-page";
import { BRAND } from "@/lib/brand";
import { publicEnv } from "@/lib/env";

export const metadata: Metadata = {
  title: "Política de cookies",
  robots: { index: false, follow: true },
  alternates: { canonical: `${publicEnv.baseUrl}/cookies` },
};

export default function CookiesPage() {
  return (
    <LegalPage title="Política de cookies">
      <p>
        {BRAND.name} usa el mínimo imprescindible para funcionar. No usamos cookies de publicidad ni
        de seguimiento de terceros.
      </p>
      <h2>Lo que usamos</h2>
      <ul>
        <li>
          <strong>Sesión</strong>: una cookie técnica para mantenerte identificado cuando inicias
          sesión. Imprescindible; no se puede desactivar sin perder el acceso a tu cuenta.
        </li>
        <li>
          <strong>Atribución</strong>: una cookie propia (no de terceros) que recuerda, si llegaste
          desde un enlace de referencia, qué operador o campaña te trajo. Solo se usa internamente;
          nunca se comparte con terceros ni se muestra en el documento generado.
        </li>
        <li>
          <strong>Primer DeCA</strong>: una cookie propia que marca, sin identificarte, que este
          navegador ya generó un DeCA sin cuenta — para pedirte que te registres antes del
          siguiente. No contiene tu nombre ni tu email.
        </li>
        <li>
          <strong>Almacenamiento local del navegador</strong>: para guardar un borrador del
          formulario si recargas la página por accidente. No sale de tu navegador.
        </li>
      </ul>
      <h2>Lo que no usamos</h2>
      <p>No hay cookies publicitarias, de redes sociales ni de rastreo entre webs.</p>
      <h2>Gestionarlas</h2>
      <p>
        Puedes borrar las cookies y el almacenamiento local desde los ajustes de tu navegador en
        cualquier momento. Al borrar la cookie de sesión, se cerrará tu sesión.
      </p>
      <p>
        Dudas: <a href={`mailto:${BRAND.supportEmail}`}>{BRAND.supportEmail}</a>.
      </p>
    </LegalPage>
  );
}
