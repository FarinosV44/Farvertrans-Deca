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
        <em>Versión {LEGAL_ENTITY.termsVersion}.</em>
      </p>
      <p>
        Esta política explica qué datos trata {BRAND.name} y con qué finalidad, conforme al
        Reglamento (UE) 2016/679 (RGPD) y la LOPDGDD.
      </p>
      <h2>Responsable del tratamiento</h2>
      <p>
        <strong>{LEGAL_ENTITY.name}</strong>, CIF {LEGAL_ENTITY.cif}. Domicilio social:{" "}
        {LEGAL_ENTITY.address}. Contacto:{" "}
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
          <strong>Cuenta</strong>: email y contraseña (cifrada). Tu primer DeCA puede generarse solo
          con tu nombre y email, sin crear cuenta; a partir del segundo documento sí es necesario
          registrarte o iniciar sesión.
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

      {/* LEGAL REVIEW PENDING — issue #84 — do not merge to main before sign-off */}
      <h2>
        DECA Conecta: tratamiento comercial para propuestas personalizadas de carga (opcional)
      </h2>
      <p>
        Si lo autorizas expresamente, {BRAND.name} podrá comunicar unos pocos datos de
        disponibilidad de tus portes a{" "}
        <strong>
          cargadores interesados en ofrecerte una propuesta comercial personalizada y preferente de
          carga
        </strong>
        , próxima al destino de tu vehículo y compatible con tus intereses. Esta autorización es{" "}
        <strong>voluntaria e independiente</strong> del resto de la relación: no se te pide en el
        alta como paso obligatorio y{" "}
        <strong>
          el uso gratuito de {BRAND.name}, así como la creación, conservación y consulta de tus
          DeCA, no queda condicionado
        </strong>{" "}
        a que la concedas.
      </p>
      <p>
        <strong>Finalidad.</strong> Poner en contacto a transportistas con disponibilidad y a
        cargadores que buscan contratar transporte, para que estos puedan dirigirte propuestas sin
        compromiso. Aceptar o rechazar cualquier propuesta es siempre decisión tuya.
      </p>
      <p>
        <strong>Base jurídica.</strong> Tu consentimiento (art. 6.1.a RGPD), que puedes retirar en
        cualquier momento sin que ello afecte a la licitud del tratamiento previo ni al uso del
        Servicio.
      </p>
      <p>
        <strong>Categorías de destinatarios.</strong> Cargadores interesados en ofrecer una
        propuesta comercial personalizada y preferente de carga. El destinatario recibe únicamente
        una <em>ficha de disponibilidad comercial</em> con los campos autorizados; no accede a tu
        cuenta, ni al DeCA, ni a la URL pública, ni al QR, ni a tu historial de portes.
      </p>
      <p>
        <strong>Datos que se comunican.</strong> Solo estos: (i) empresa o nombre del transportista
        autorizado; (ii) destino o zona de destino/disponibilidad del vehículo; (iii) fecha estimada
        de llegada o disponibilidad; (iv) el canal de contacto que hayas autorizado expresamente
        —correo electrónico, teléfono o ambos— y el dato correspondiente a ese canal.
      </p>
      <p>
        <strong>Datos que NO se comunican por esta vía.</strong> El origen del transporte; la
        identidad o los datos de contacto del cargador contractual del DeCA; la dirección de carga;
        la mercancía, su cantidad, peso o naturaleza; el precio, la tarifa o las condiciones
        económicas; las matrículas, los datos del conductor u otros datos personales no autorizados;
        y la copia, la URL pública, el QR o el contenido completo del DeCA.
      </p>
      <p>
        <strong>Modalidades y revocación.</strong> Puedes elegir entre no compartir en ningún porte
        (opción inicial por defecto), decidirlo individualmente en cada DeCA, o autorizarlo con
        carácter general pudiendo desactivarlo en un porte concreto antes de emitirlo. La
        configuración y la retirada están disponibles en cualquier momento en el panel, en{" "}
        <em>Privacidad y comunicaciones</em>. La retirada es inmediata para las comunicaciones
        futuras; no afecta a las comunicaciones ya realizadas lícitamente antes de la revocación ni
        a ningún DeCA ya generado. Antes de comunicar una ficha aún pendiente se verifica que la
        autorización sigue activa.
      </p>
      <p>
        <strong>Registro.</strong> Se conserva de forma estructurada un registro de tu modalidad
        elegida, el canal y los datos autorizados, la versión de este texto aceptada, y la fecha de
        cada activación, modificación, revocación o comunicación, con la única finalidad de
        acreditar la autorización.
      </p>

      <h2>Encargados y terceros</h2>
      <p>
        Usamos proveedores de infraestructura (hosting, base de datos y almacenamiento) que actúan
        como encargados del tratamiento bajo contrato, únicamente para prestar el Servicio.
      </p>

      <h2>Responsable frente a encargado: el contenido de tu DeCA</h2>
      <p>
        {LEGAL_ENTITY.name} actúa como <strong>responsable del tratamiento</strong> respecto de los
        datos de cuenta, autenticación, seguridad, administración y facturación (los datos que
        gestionamos para prestarte el Servicio en sí).
      </p>
      <p>
        Respecto de los datos personales que tú introduces DENTRO de un DeCA (por ejemplo, datos de
        conductores, empleados o terceros que aparecen en el documento), {LEGAL_ENTITY.name} actúa
        como <strong>encargado del tratamiento</strong> por cuenta del usuario o empresa que genera
        el documento, conforme al artículo 28 RGPD. En ese papel, {LEGAL_ENTITY.name}: (a) trata
        esos datos únicamente siguiendo tus instrucciones documentadas (generar, custodiar y poner a
        disposición el documento); (b) garantiza confidencialidad del personal con acceso; (c)
        aplica medidas de seguridad técnicas y organizativas razonables; (d) no subcontrata el
        tratamiento a otros encargados sin informarte; (e) te asiste, dentro de lo razonable, para
        responder a solicitudes de derechos de los interesados y a tus obligaciones de seguridad y
        notificación de incidentes; (f) elimina o devuelve esos datos al finalizar la prestación del
        Servicio, salvo obligación legal de conservación; y (g) pone a tu disposición la información
        necesaria para acreditar el cumplimiento de estas obligaciones. Como usuario que introduce
        datos de terceros en un DeCA, eres responsable de contar con base legal para tratarlos e
        incluirlos en el documento.
      </p>
    </LegalPage>
  );
}
