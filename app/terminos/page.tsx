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
        <strong>{LEGAL_ENTITY.name}</strong> (CIF {LEGAL_ENTITY.cif}). Al crear una cuenta, o al
        generar un DeCA sin cuenta, aceptas estos términos y la{" "}
        <a href={LEGAL_ENTITY.privacyUrl}>política de privacidad</a>.
      </p>
      <p className="text-xs text-[var(--color-text-muted)]">
        Versión {LEGAL_ENTITY.termsVersion}. Estos términos reflejan el funcionamiento real del
        servicio; se recomienda una revisión por asesoría legal externa antes de cualquier cambio
        material en el modelo de negocio (por ejemplo, el paso a un servicio de pago).
      </p>

      <h2>Objeto del servicio</h2>
      <p>
        {BRAND.name} es una plataforma tecnológica que permite generar, corregir, conservar y
        compartir el Documento Electrónico de Control (DeCA) del transporte de mercancías por
        carretera, conforme a la Resolución de 5 de junio de 2026. El uso es gratuito durante la
        fase de lanzamiento indicada en el sitio (ver «Fase de lanzamiento gratuita» más abajo).
      </p>

      <h2>El papel de {LEGAL_ENTITY.name}: plataforma y custodio técnico</h2>
      <p>
        {LEGAL_ENTITY.name} presta un servicio de tecnología, gestión documental y custodia digital
        de los DeCA generados a través de la plataforma. Este servicio consiste en:
      </p>
      <ul>
        <li>poner a disposición el generador y el histórico de documentos;</li>
        <li>almacenar de forma segura los documentos generados y sus versiones;</li>
        <li>
          conservarlos durante el plazo legalmente exigible a la normativa de transporte aplicable.
        </li>
      </ul>
      <p>
        La custodia que presta {LEGAL_ENTITY.name} <strong>no equivale a</strong> certificar el
        contenido del documento, validar la veracidad de los datos introducidos, ni garantizar que
        la operación de transporte descrita sea correcta, lícita o se haya ejecutado conforme a lo
        indicado. {LEGAL_ENTITY.name} custodia el documento tal y como el usuario lo generó.
      </p>

      <h2>Responsabilidad sobre los datos y la operación de transporte</h2>
      <ul>
        <li>
          Eres responsable de la veracidad, exactitud, legalidad y completitud de todos los datos
          que introduces en cada DeCA, y de revisar el documento antes de emitirlo o utilizarlo.
        </li>
        <li>
          {LEGAL_ENTITY.name} no verifica ni asume responsabilidad sobre: la veracidad de los datos
          introducidos por el usuario; la naturaleza, tipo, peso o cantidad de la mercancía
          transportada; el cumplimiento de normativa sobre mercancías peligrosas; las operaciones de
          carga y descarga; la ruta; los vehículos, conductores, licencias, permisos, autorizaciones
          o seguros implicados; los contratos de transporte entre las partes; la legalidad de la
          operación de transporte; ni las acciones u omisiones del cargador, el transportista, el
          conductor o cualquier tercero.
        </li>
        <li>
          La ejecución real del transporte es responsabilidad exclusiva de las partes que
          efectivamente lo realizan (cargador, transportista, conductor) — {LEGAL_ENTITY.name} no
          interviene en dicha ejecución.
        </li>
        <li>
          El Servicio genera el documento a partir de los datos que aportas; no sustituye el
          asesoramiento profesional ni el cumplimiento normativo que corresponde a las partes del
          transporte.
        </li>
      </ul>

      <h2>Limitación de responsabilidad</h2>
      <p>
        En la medida máxima permitida por la ley, {LEGAL_ENTITY.name} no será responsable de daños
        derivados de: datos incorrectos introducidos por el usuario; la operación de transporte en
        sí misma; fallos de terceros, de infraestructuras en la nube o de redes de
        telecomunicaciones que estén fuera de su control razonable; interrupciones por mantenimiento
        programado o incidencias técnicas; ni de daños indirectos, lucro cesante o pérdida de
        negocio, cuando la exclusión sea lícita. Cuando el Servicio pase a ser de pago, cualquier
        límite cuantitativo de responsabilidad se fijará en las condiciones del plan contratado, en
        la medida legalmente admisible.
      </p>
      <p>
        Nada en estos términos excluye o limita la responsabilidad de {LEGAL_ENTITY.name} en los
        casos en que la ley no permite su exclusión o limitación — incluyendo dolo, negligencia
        grave, o el incumplimiento de obligaciones legales de carácter imperativo.
      </p>

      <h2>Fase de lanzamiento gratuita</h2>
      <p>
        El acceso gratuito actual es promocional y temporal, propio de la fase de lanzamiento.{" "}
        {LEGAL_ENTITY.name} podrá introducir en el futuro planes de suscripción mensual u otras
        modalidades de pago; cualquier cambio se comunicará con la antelación que exija la normativa
        aplicable. El hecho de que el acceso sea gratuito hoy no elimina las obligaciones de
        custodia y conservación aplicables a los documentos ya generados.
      </p>

      <h2>Custodia y conservación</h2>
      <p>
        {LEGAL_ENTITY.name} almacena y custodia los documentos generados a través de la plataforma y
        respeta los plazos de conservación aplicables; las versiones históricas de un DeCA corregido
        se conservan y siguen siendo consultables. La URL pública de cada DeCA permanece accesible
        durante el servicio y, como mínimo, 7 días naturales tras la fecha de descarga.
      </p>
      <p>
        La custodia no equivale a una certificación del contenido. {LEGAL_ENTITY.name} aplica
        medidas de seguridad razonables, pero no afirma que el servicio sea «100% seguro» ni que la
        pérdida de un documento sea «imposible» — ninguna infraestructura puede garantizarlo, y
        cualquier mención de integridad, acceso o seguridad en este sitio se limita a lo realmente
        implementado.
      </p>

      <h2>Uso aceptable</h2>
      <p>
        Queda prohibido un uso del Servicio contrario a la ley, que perjudique a terceros, o que
        intente eludir los controles anti-abuso (creación masiva automatizada, suplantación de
        identidad de otra empresa, etc.).
      </p>

      <h2>Ley aplicable y jurisdicción</h2>
      <p>
        Para usuarios que actúen como empresa o profesional (uso B2B), las partes se someten, con
        renuncia expresa a cualquier otro fuero, a los Juzgados y Tribunales de Valencia (España),
        sin perjuicio de las normas de jurisdicción y competencia de carácter imperativo que
        resulten de aplicación. Esta cláusula no se aplicará en la medida en que resulte contraria a
        las normas de protección de fuero de los consumidores, si en algún momento el Servicio se
        ofreciera también a consumidores.
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
