/**
 * #111 — Body of the "Guía de uso de DeCA Profesional" content item. Kept in its
 * own module because it is long; imported by `prisma/content-seed.ts`.
 *
 * Written against the real application (routes under `app/panel/**`, `app/crear`,
 * `app/registro/**`, the wizard in `components/deca/wizard.tsx`, the support and
 * integrations subsystems). Only documents functionality that exists today.
 *
 * Markdown subset: `##`/`###` headings (feed the auto table of contents),
 * numbered/bulleted lists, `::: tip|important|example` callouts, `::: faq`,
 * `![alt](/guia/x.png "pie")` screenshots, `[[cta]]`. See `lib/content/markdown.tsx`.
 *
 * Screenshots live in `public/guia/` and are produced by
 * `scripts/guide-screenshots.mjs` with synthetic demo data — replace the files
 * in place to refresh them, the guide text does not change.
 */
export const GUIA_DE_USO_SLUG = "guia-de-uso-deca-profesional";

export const GUIA_DE_USO_BODY = `DeCA Profesional es una herramienta web para generar el **Documento Electrónico de Control Administrativo (DeCA)** del transporte de mercancías por carretera, conservarlo y tenerlo listo para una inspección. Esta guía recorre, paso a paso, todo lo que puedes hacer desde la plataforma.

## Primeros pasos

Con DeCA Profesional puedes:

- Crear un DeCA en tres pasos y descargar el **PDF con su código QR** y su **URL de verificación**.
- Guardar tus documentos y consultarlos cuando quieras desde **Mis DeCA** y el **Historial**.
- Reutilizar datos que se repiten (empresas, vehículos, lugares) y **plantillas** de portes habituales.
- Trabajar en equipo con varias personas dentro de la misma empresa.
- Corregir un DeCA generando una versión nueva, conservando la anterior.

Funciona en el navegador, sin instalar nada. En **ordenador** verás el asistente de creación con una vista previa del documento al lado; en **móvil** el mismo asistente se adapta a la pantalla y la barra de acciones queda fija abajo. La sesión se mantiene abierta, así que puedes empezar en un dispositivo y seguir en otro.

La navegación principal, una vez dentro, está en la barra de secciones de tu cuenta: **Inicio**, **Histórico**, **Plantillas**, **Datos habituales**, **Equipo**, **Mi empresa**, **Privacidad** y **Ayuda**. El botón **Crear DeCA** está siempre visible en la cabecera.

![Pantalla de Inicio del panel con las acciones principales](/guia/panel-inicio.png "Inicio: crear un DeCA, duplicar el último y ver los documentos recientes")

## Crear una cuenta

Puedes generar tu **primer** DeCA sin cuenta: se te pedirá solo el nombre y el correo al final. Para conservar los documentos, reutilizar datos y trabajar en equipo necesitas una cuenta.

### Con correo y contraseña

1. Entra en **Crear cuenta**.
2. Indica tu **correo** y una **contraseña**.
3. Completa la **ficha de empresa**: razón social, **NIF/CIF**, dirección, código postal, localidad y una persona de contacto con teléfono y correo.
4. Marca la aceptación de la **Política de Privacidad** y las **Condiciones**. Es obligatorio.
5. De forma **opcional**, puedes activar **DECA Conecta** marcando «Avísame si aparece una oportunidad de carga compatible con mis rutas» (ver la sección **DECA Conecta**).
6. Crea la cuenta. Te enviamos un correo para **verificar tu dirección**; hasta que lo hagas verás un aviso en el panel, pero ya puedes trabajar.

### Con Google

1. Pulsa **Continuar con Google** y elige tu cuenta.
2. Como Google ya confirma tu correo, no hay que verificarlo aparte.
3. A continuación aparece **«Ya casi está»**: completa la **ficha de empresa** (los mismos datos que arriba), acepta la Política de Privacidad y las Condiciones y, si quieres, activa **DECA Conecta**.
4. Pulsa continuar y entras directamente en tu panel.

### Verificación de empresa

No existe un paso manual de «verificar la empresa». La razón social y el NIF/CIF quedan **bloqueados** tras el alta: si alguno es incorrecto, escríbenos a soporte y lo corregimos nosotros (ver **Mi empresa**).

::: important
La razón social y el NIF/CIF **no se pueden editar** desde la cuenta una vez creada. Revísalos con calma al registrarte.
:::

## Tipos de uso

Al crear la cuenta se pregunta **«¿Cómo utilizarás principalmente la plataforma?»**. Sirve para orientar la ayuda y los ejemplos; **no limita** ninguna función: cualquier cuenta puede crear cualquier DeCA.

- **Transportista de mercancías** — realizas el transporte de mercancías por cuenta ajena.
- **Empresa cargadora** — contratas transporte para tus propios envíos de mercancías.
- **Operador de transporte** — organizas transportes de mercancías (operador logístico o agencia).
- **Transportista de viajeros** — realizas transporte de viajeros por carretera.

## Cómo crear un DeCA

Pulsa **Crear DeCA**. El asistente tiene **tres pasos** y una **revisión** final antes de generar. Arriba se ve siempre en qué paso estás (**«Paso 1 de 3»**) y una barra de progreso.

![Paso 1 del asistente de creación](/guia/crear-paso-1.png "Paso 1 · Quién contrata y quién transporta")

### Paso 1 · Quién contrata y quién transporta

- **Cargador contractual**: la empresa que **contrata** el transporte.
- **Transportista efectivo**: la empresa que lo **realiza** físicamente.

De cada uno se indica nombre o razón social, **NIF/VAT**, domicilio, código postal y localidad. Si has guardado empresas en **Datos habituales**, puedes elegirlas de la lista y se rellenan solas. Si tu cuenta tiene ficha de empresa, el botón **«Usar mi empresa»** completa tus datos en el papel que corresponda.

::: example
Eres autónomo y transportas para un cliente: tú eres el **transportista efectivo** y el cliente, el **cargador contractual**. Si eres una agencia que subcontrata, tú eres el **cargador contractual**.
:::

### Paso 2 · Carga y descarga

- **Lugar de carga** y **lugar de descarga**: nombre del sitio, dirección, código postal, localidad, provincia y país.
- **Fecha de carga** y **fecha de descarga**.

También puedes elegir lugares guardados en **Datos habituales**.

### Paso 3 · Vehículo, mercancía y revisión

- **Mercancía**: descripción de lo que se transporta.
- **Peso**: indica siempre la unidad (\`12.000 kg\`). Si el peso exacto no es determinable, describe la medida («una plataforma completa»).
- **Matrícula del tractor** y, solo si es un conjunto articulado, **matrícula del remolque**.
- **Referencia** interna (opcional).

### Revisión y generación

Antes de generar verás un **resumen agrupado por secciones del PDF**, cada una con un botón **Editar** que te devuelve al paso correspondiente. Justo encima, una **comprobación rápida** marca lo que falta o está mal escrito, con un enlace **Arreglar** a ese campo concreto. Cuando todo esté correcto, pulsa **GENERAR DECA**.

::: tip
La pantalla de revisión muestra **exactamente** lo que irá en el PDF. Es el mejor momento para detectar un NIF mal escrito o el cargador y el transportista intercambiados.
:::

### Errores frecuentes y cómo evitarlos

- **Confundir cargador y transportista.** Cargador = quien contrata; transportista = quien conduce.
- **Peso sin unidad.** Pon siempre \`kg\`, \`t\`… o describe la medida.
- **Remolque cuando no hay.** La matrícula del remolque solo se rellena en conjuntos articulados.
- **NIF/VAT mal escrito.** Revisa la letra inicial y el dígito de control; se aceptan identificadores extranjeros.

## Varios envíos en un mismo DeCA

Un mismo transporte puede tener **más de un lugar de carga o descarga** — por ejemplo, recoger mercancía en dos almacenes distintos antes de entregarla, o repartirla en dos puntos diferentes. DeCA Profesional permite documentar todos esos **envíos** dentro de un único DeCA, siempre que compartan el mismo **cargador contractual** y el mismo **transportista efectivo**.

::: important
Los distintos envíos de un mismo DeCA deben tener idéntico **cargador contractual** y **transportista efectivo**. Si cambia cualquiera de los dos, se trata de un transporte distinto y necesita su propio DeCA.
:::

### Cómo añadir varios envíos

En el **paso 2** del asistente (Carga y descarga) verás la pregunta **«¿Este transporte tiene varios lugares de carga o descarga?»**. Actívala para desplegar el flujo de varios envíos:

1. El **primer envío** usa los campos que ya conoces: lugar de carga, lugar de descarga, mercancía y peso.
2. Pulsa **«+ Añadir otro envío»** para abrir un bloque **ENVÍO 2** (y así sucesivamente).
3. Cada envío tiene **su propio** origen, destino, mercancía y peso — nunca se comparten entre envíos.
4. La fecha, la matrícula y las notas son, por defecto, las mismas del transporte, pero puedes **cambiarlas envío a envío** si ese tramo concreto usa un vehículo o una fecha distinta.

![Añadir un segundo envío en el asistente de creación](/guia/crear-multi-envio.png "Envío 2: origen, destino, mercancía y peso propios")

::: example
**Valencia → Madrid + Castellón → Madrid**: recoges palés de cerámica en Valencia y azulejos en Castellón, y entregas ambos en el mismo almacén de Madrid. Es un único DeCA con dos envíos, mismo cargador y transportista.

Otro caso frecuente: **Valencia → Madrid + Valencia → Toledo** — cargas en un único punto y repartes en dos destinos distintos.
:::

### Cómo se ve en el PDF

El PDF muestra un bloque **«ENVÍO 1»**, **«ENVÍO 2»**… con los datos propios de cada uno, y un **PESO TOTAL** que suma los pesos de todos los envíos (cuando todos son valores numéricos comparables). El documento incluye un aviso de que **la numeración de los envíos es solo identificativa y no indica el orden en que se realizan**.

### Si un dato cambia durante el transporte

Si necesitas corregir cualquier dato de un DeCA con varios envíos — una dirección, un peso, una fecha — se aplica la misma corrección con versionado que en un DeCA normal: se genera una **versión nueva** conservando la anterior, y puedes editar cualquier envío individualmente sin perder los demás (ver **Histórico**, más adelante).

## PDF del DeCA

El **PDF se genera al pulsar GENERAR DECA**, al terminar los tres pasos. Es un PDF nativo, no una foto del formulario.

- **Dónde se guarda:** queda asociado a tu cuenta (si la tienes) y accesible desde **Mis DeCA** y el **Historial**. También se conserva en la custodia del servicio.
- **Cómo abrirlo o descargarlo:** desde la pantalla de resultado, o más tarde con el enlace **PDF** de cada fila en el panel. La **URL pública de verificación** (\`/d/…\`) abre el PDF **directamente**, sin registro ni contraseña.
- **Código QR:** cada DeCA lleva su QR impreso en el PDF; apunta a esa URL de verificación.
- **Logo de empresa:** si tu empresa tiene logo configurado, aparece en el PDF (ver **Logo en el PDF**).

::: important
Si más adelante cambias el logo o algún dato de la empresa, **los DeCA ya generados no cambian**: reflejan la información que había en el momento de generarlos. Para actualizar un documento concreto hay que **corregirlo** (se crea una versión nueva).
:::

## Mis DeCA

La lista de documentos generados está en el **Histórico** y, en versión corta, en **Inicio** («Últimos documentos»). De cada DeCA puedes:

- **Ver el detalle** (datos, versiones, QR).
- **Abrir o descargar el PDF**.
- **Compartir** el enlace (WhatsApp, copiar, correo).
- **Duplicar** para crear otro parecido (\`Crear DeCA\` partiendo de ese).
- **Corregir**, lo que genera una **versión nueva**.

![Listado de documentos en el Histórico](/guia/mis-deca.png "Mis DeCA: buscar, filtrar por fechas y abrir cada documento")

## Historial

El **Historial** reúne todos los DeCA de tu empresa, ordenados por fecha, en un listado pensado para identificar cada documento de un vistazo: la ruta es el dato principal, seguida de la fecha y la referencia; debajo, quién carga y quién transporta; y a la derecha, el estado del documento.

- **Buscar** por texto (localidad, transportista, referencia…).
- **Filtrar por rango de fechas y por transportista o matrícula**.
- **Guardar vistas** de búsqueda que uses a menudo.
- **Exportar el histórico a CSV** para tu control interno.

![Listado del Histórico](/guia/mis-deca.png "Cada DeCA se identifica por su ruta, fecha y estado")

Cada fila muestra la acción principal, **«Ver detalle»**, siempre visible; **Inspección** y **Compartir** como acciones frecuentes; y el resto — **Corregir**, **Duplicar**, **PDF** — agrupadas bajo el menú **«···»**.

Si un DeCA tiene **varios envíos** (ver la sección anterior), la fila muestra una insignia **«+N envíos»** junto a la ruta principal y un resumen de los trayectos adicionales, sin necesidad de abrir el detalle para saber que hay más de un envío.

El **estado** de cada documento distingue entre **Vigente** (la versión actual), **Corregida** (tiene una versión posterior a la mostrada) y **No disponible**. Si buscas o filtras y no aparece ningún resultado, el Historial te lo indica claramente y te ofrece **«Limpiar filtros»** para volver a empezar.

Es útil para llevar el control de la actividad y para localizar rápidamente un documento si te lo piden en una inspección o una revisión interna.

## Plantillas

Una **plantilla** guarda los datos de un porte habitual para no volver a teclearlos.

1. Ve a **Plantillas** y pulsa **Nueva plantilla** (o guarda como plantilla desde un DeCA).
2. Ponle un **nombre** reconocible y rellena los datos que se repiten.
3. Para usarla, al **Crear DeCA** elige **«Empezar desde una plantilla»** y selecciónala; se rellenan los pasos y solo ajustas lo que cambia (normalmente las fechas).

Puedes **editar** o **eliminar** una plantilla cuando quieras.

![Sección de plantillas](/guia/plantillas.png "Plantillas de portes habituales")

::: example
Ejemplos típicos de plantilla: **cliente frecuente**, **ruta habitual** (Valencia → Madrid) o **punto de carga fijo**.
:::

## Datos habituales

Los **datos habituales** son piezas sueltas que se reutilizan al rellenar cualquier DeCA, organizadas en pestañas:

- **Empresas y contactos** — cargadores y transportistas habituales, con su NIF y dirección.
- **Vehículos** — matrículas guardadas.
- **Lugares** — direcciones habituales de carga y descarga (un mismo lugar sirve para ambos usos, no hace falta guardarlo dos veces).
- **Rutas / envíos habituales** — un trayecto completo (lugar de carga + lugar de descarga + mercancía y peso habituales) que se usa para rellenar de un solo golpe un **envío** dentro de un DeCA, incluido un ENVÍO N adicional en un DeCA de varios envíos (ver **Varios envíos en un mismo DeCA**).

![Datos habituales, organizados en pestañas](/guia/datos-habituales.png "Empresas, vehículos, lugares y rutas habituales")

Un **buscador** en la parte superior filtra por cualquier campo dentro de la pestaña activa. El botón **«+ Añadir dato habitual»** abre un formulario compacto para crear una empresa, un vehículo, un lugar o una ruta; si al guardar detecta un dato muy parecido a uno ya existente, te avisa antes de crear un duplicado, pero nunca te lo impide.

Se guardan desde esta sección y también **sobre la marcha** al crear un DeCA — cada campo del asistente que tiene un equivalente habitual ofrece elegirlo de una lista, y puedes marcar «guardar como habitual» un dato que acabas de escribir para no volver a teclearlo. Puedes **editarlos** o **eliminarlos** cuando quieras.

**Diferencia con las plantillas:** una plantilla es un **porte completo** (cargador + transportista + ruta + vehículo). Un dato habitual es **un solo elemento** (una empresa, un vehículo, un lugar o una ruta) que combinas libremente en cada documento.

## Equipo

Varias personas pueden trabajar en la misma empresa. Desde **Equipo** (visible para el administrador):

1. **Invita** a una persona por correo. Recibe un enlace para unirse.
2. Al unirse comparte los DeCA y los datos habituales de la empresa; **no** tiene que dar de alta otra empresa.
3. Puedes **cambiar su rol** o **eliminar su acceso** («Eliminar acceso»).

**Roles:**

| Rol | Puede |
| --- | --- |
| **Administrador** | Todo: crear y corregir DeCA, gestionar datos, invitar y gestionar el equipo, editar la empresa y el logo, cambiar Privacidad. |
| **Operador** | Crear y corregir DeCA, usar y guardar datos habituales y plantillas. No gestiona el equipo ni la empresa. |
| **Solo lectura** | Consultar el histórico y los documentos. No crea ni modifica nada. |

![Sección de equipo](/guia/equipo.png "Equipo: invitaciones y roles")

## Mi empresa

En **Mi empresa** se ven y se editan los datos de la empresa:

- **Razón social** y **NIF/CIF** — se muestran, pero **están bloqueados**. Si son incorrectos, escríbenos a soporte.
- **Datos de contacto** — persona de contacto, teléfono, correo.
- **Dirección**, **código postal** y **localidad** — editables.
- **Logo en el PDF** — ver la sección siguiente.

Solo el **administrador** de la empresa edita esta información.

![Mi empresa](/guia/mi-empresa.png "Datos de la empresa y logo")

## Logo en el PDF

- **Quién lo sube:** solo un **administrador** de la empresa.
- **Dónde aparece:** en el PDF de los DeCA.
- **A qué afecta:** a los documentos que generes **a partir de ese momento**. Los DeCA anteriores no se modifican.
- **Formato:** imagen **PNG o JPEG** (no se admite SVG). Hay un límite de tamaño de archivo que se indica en la propia pantalla. Usa un logo con fondo claro o transparente para que se vea bien impreso.

## Privacidad

En **Privacidad** decides una sola cosa: si activas **DECA Conecta**, es decir, si DeCA Profesional puede comunicar **unos pocos datos de disponibilidad de tus portes** a cargadores interesados en enviarte propuestas de carga.

- Es **voluntario** y se puede cambiar cuando quieras.
- No activarlo **no afecta en nada** a la creación, gestión o conservación de tus DeCA ni al uso gratuito de la plataforma.
- Opciones: **no compartir en ningún porte** (por defecto), **preguntarme en cada DeCA**, o **compartir en todos los portes salvo que lo desactive** en uno concreto.

La aceptación de la **Política de Privacidad** y de las **Condiciones** (obligatoria al registrarse) es distinta de DECA Conecta, que siempre es opcional y que aceptar la parte legal nunca activa.

![Opciones de privacidad de DECA Conecta](/guia/privacidad.png "Puedes decidir si no compartes, si eliges en cada DeCA o si lo activas habitualmente.")

## DECA Conecta: recibe oportunidades de carga compatibles con tus rutas

DECA Conecta es una función **opcional** de DeCA Profesional que utiliza, con tu autorización, el **destino y la fecha** de tus portes para que puedas recibir propuestas comerciales personalizadas de cargadores interesados. El objetivo es ayudarte a encontrar **cargas de retorno** y **reducir kilómetros en vacío** sin publicar tu DeCA ni compartir la ubicación GPS del vehículo.

### Activar DECA Conecta al crear la cuenta

![Activar DECA Conecta al crear una cuenta en DeCA Profesional](/guia/deca-conecta-registro.png "Activación voluntaria durante el registro.")

Al registrarte puedes marcar, de forma voluntaria, la casilla **«Avísame si aparece una oportunidad de carga compatible con mis rutas»**.

- La casilla está **desmarcada por defecto**.
- Aceptar la **Política de Privacidad** y las **Condiciones** **no activa** DECA Conecta.
- Puedes crear y gestionar tus DeCA con normalidad sin activarla.
- La preferencia se puede cambiar más tarde desde **Privacidad**.

### Configurar DECA Conecta desde Privacidad

En **Privacidad** eliges una de estas tres opciones, tal como aparecen en la interfaz:

1. **No compartir en ningún porte** — ningún dato comercial sale de tus DeCA. Es la opción predeterminada.
2. **Preguntarme en cada DeCA** — lo decides porte a porte al crear cada DeCA. El control aparece desactivado por defecto.
3. **Compartir en todos los portes, salvo que lo desactive** — se prepara la disponibilidad para cada nuevo DeCA, pero puede desactivarse en cualquier porte concreto antes de emitirlo.

![Activar oportunidades de carga para un DeCA concreto](/guia/deca-conecta-por-deca.png "La disponibilidad de cada porte puede permanecer desactivada.")

### Qué datos utiliza DECA Conecta

Para buscar oportunidades utiliza:

- El **lugar de destino** del camión.
- La **fecha** del transporte o de disponibilidad prevista.
- La **empresa o el nombre** y el **correo electrónico o el teléfono** que hayas autorizado para recibir la propuesta.

No comparte:

- El DeCA completo.
- El origen del porte actual.
- La mercancía ni su peso.
- La identidad del cliente del transporte.
- El precio ni las condiciones del servicio.
- Los documentos asociados.
- La ubicación GPS ni el seguimiento del vehículo en tiempo real.

### Qué ocurre cuando aparece una oportunidad

Puedes recibir una propuesta comercial personalizada de un cargador interesado. Recibirla **no te obliga a aceptarla**: eres libre de rechazarla o de negociar la ruta, el precio, los horarios, la mercancía, los requisitos del vehículo y el resto de condiciones contractuales.

::: important
DECA Conecta facilita el contacto, pero no garantiza que exista una carga compatible ni sustituye la contratación del nuevo transporte.
:::

Más detalle sobre el modelo de privacidad y el ahorro de kilómetros en vacío: [Cómo reducir kilómetros en vacío con DECA Conecta](/blog/deca-conecta-ofertas-carga).

## Ayuda y soporte

Desde **Ayuda** tienes:

- **Soporte técnico** por **WhatsApp** y por **correo** (\`deca@praetoriaabogados.es\`).
- **Abrir una incidencia técnica** (formulario, ver abajo).
- **Mis incidencias**: el estado y las respuestas de las que has abierto.
- **Asistencia jurídica en transporte y logística**, un canal aparte.

![Página de Ayuda](/guia/ayuda.png "Canales de soporte, formulario de incidencia y Mis incidencias")

## Abrir una incidencia

1. En **Ayuda**, ve a **«Abrir una incidencia técnica»**.
2. Elige la **categoría**: Generación de DeCA, Cuenta y acceso, Empresa y equipo, Un documento concreto, u Otro.
3. Escribe un **asunto** breve y una **descripción** con el detalle de lo que ocurre.
4. Pulsa **Enviar incidencia**.

La incidencia queda registrada con un **número** y aparece en **Mis incidencias**. Cuando el equipo de soporte responde, **recibes un correo** y la respuesta se ve también dentro de esa incidencia, donde puedes seguir contestando.

## Asistencia jurídica

La **asistencia jurídica en transporte y logística** es un servicio **independiente del soporte técnico**, prestado por **PRAETORIA, S.L.**, despacho con experiencia en el sector del transporte. Puede ser útil, por ejemplo, ante una **inspección**, una **sanción**, un **requerimiento** o un **conflicto** de transporte o logística. Tiene su propio canal de contacto en la página de **Ayuda**.

## Inspección de transporte

Qué hacer si un agente te pide el DeCA:

1. Abre DeCA Profesional (móvil o cualquier navegador) e inicia sesión, o abre directamente el **enlace de verificación** del documento si lo tienes a mano.
2. Localiza el DeCA en **Mis DeCA** / **Historial** (busca por ruta, fecha o referencia).
3. Abre el **PDF** o muestra el **código QR**: el agente puede escanearlo o teclear la URL, y el documento se abre sin registro.
4. Si hubo una **corrección**, enseña la **versión vigente** (la del QR que lleva el conductor).

::: tip
Antes de salir, comparte con el conductor el enlace del DeCA y ábrelo una vez con conexión para que quede en el historial del navegador. Vale la **copia electrónica** en el móvil o la **copia impresa con el QR**.
:::

## Preguntas frecuentes

::: faq
Q: ¿Tengo que instalar una aplicación?
A: No. DeCA Profesional funciona en el navegador, en móvil y en ordenador.
Q: ¿Puedo usar DeCA Profesional desde el móvil?
A: Sí. El asistente de creación y todo el panel se adaptan a la pantalla del móvil.
Q: ¿Dónde se guardan mis DeCA?
A: En tu cuenta —accesibles desde Mis DeCA y el Historial— y en la custodia del servicio.
Q: ¿Puedo descargar el PDF?
A: Sí, desde la pantalla de resultado o con el enlace PDF de cada fila del panel. La URL de verificación también abre el PDF directamente.
Q: ¿Puedo añadir mi logotipo?
A: Sí, un administrador lo sube en Mi empresa (PNG o JPEG). Aparece en los DeCA que generes a partir de entonces.
Q: ¿Puedo tener varios usuarios?
A: Sí. Desde Equipo se invita a más personas, con rol de Administrador, Operador o Solo lectura.
Q: ¿Qué ocurre si me equivoco al crear un DeCA?
A: Ábrelo y pulsa Corregir: se genera una versión nueva con QR y URL propios y la anterior se conserva.
Q: ¿Puedo utilizar plantillas?
A: Sí. En Plantillas guardas portes habituales y al Crear DeCA eliges «Empezar desde una plantilla».
Q: ¿Qué diferencia hay entre Plantillas y Datos habituales?
A: Una plantilla es un porte completo; un dato habitual es un solo elemento (una empresa, un vehículo, un lugar) que combinas en cada documento.
Q: ¿Cómo contacto con soporte?
A: Desde Ayuda: WhatsApp, correo (deca@praetoriaabogados.es) o el formulario de incidencia.
Q: ¿Cómo abro una incidencia?
A: En Ayuda, «Abrir una incidencia técnica»: categoría, asunto y descripción. La verás en Mis incidencias y recibirás la respuesta por correo y allí.
Q: ¿Qué datos se comparten en DECA Conecta?
A: Solo el destino y la fecha del porte, y la empresa o el nombre y el correo o teléfono que autorices; nunca el DeCA completo, el origen, la mercancía, el precio ni la ubicación GPS. Solo si activas la función.
Q: ¿Puedo desactivar DECA Conecta?
A: Sí, en cualquier momento desde Privacidad, y también en un porte concreto antes de emitirlo. Desactivarlo no afecta a tus DeCA ni al uso gratuito de la plataforma.
Q: ¿Qué hago durante una inspección?
A: Localiza el DeCA en Mis DeCA, abre el PDF o muestra el QR; se abre sin registro. Si hubo corrección, enseña la versión vigente.
:::

[[cta]]`;
