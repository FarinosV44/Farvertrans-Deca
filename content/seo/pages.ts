import { LEGAL_SOURCE } from "@/lib/content/landing";

export type SeoSection = { h2: string; body: string[] };
export type SeoPage = {
  slug: string;
  title: string; // <title>
  h1: string;
  description: string; // meta description
  intent: string; // the single search intent this page answers
  lastReviewed: string; // ISO date of the last normative review
  intro: string[];
  sections: SeoSection[];
  faq: { q: string; a: string }[];
  sources: { label: string; url: string }[];
  related: string[]; // slugs
};

const BOE = LEGAL_SOURCE;
const MIN = {
  label: "Ministerio de Transportes — Documento electrónico de Control Administrativo (DeCA)",
  url: "https://www.transportes.gob.es/transporte-terrestre/profesionales-transporte/servicios-transportista/documento-electronico-control-administrativo-deca",
};
const CETM = {
  label: "CETM — Requisitos del DeCA",
  url: "https://www.cetm.es/asi-son-los-requisitos-que-debe-cumplir-el-documento-electronico-de-control-administrativo-deca/",
};
const ART6 = {
  label: "Orden FOM/2861/2012, artículo 6 (BOE)",
  url: "https://www.boe.es/buscar/act.php?id=BOE-A-2013-154",
};
const REVIEWED = "2026-09-03";

export const SEO_PAGES: SeoPage[] = [
  {
    slug: "deca-gratis",
    title: "DeCA gratis | Genera el Documento de Control sin coste",
    h1: "DeCA gratis",
    description:
      "Crea gratis el Documento Electrónico de Control Administrativo (DeCA): PDF nativo, QR y URL de descarga directa. Sin tarjeta y sin límite.",
    intent: "Quiero generar un DeCA sin pagar.",
    lastReviewed: REVIEWED,
    intro: [
      "Con DeCA Fácil puedes crear y descargar el Documento Electrónico de Control Administrativo sin coste, sin tarjeta y sin límite de documentos, al menos hasta el 31 de diciembre de 2026.",
      "El documento que se genera cumple los requisitos técnicos de la resolución vigente: PDF nativo digital, código QR y una URL única HTTPS que permite la descarga directa del fichero sin registro ni contraseña.",
    ],
    sections: [
      {
        h2: "¿Qué incluye la versión gratuita?",
        body: [
          "Creación ilimitada de DeCA para el transporte interior de mercancías por carretera.",
          "PDF nativo con todos los datos obligatorios, QR y URL de verificación.",
          "Compartir el documento con el conductor por enlace, WhatsApp o email, y copia imprimible.",
          "Con una cuenta gratuita: historial, reutilización de datos habituales y duplicado de documentos.",
        ],
      },
      {
        h2: "¿Por qué es gratis?",
        body: [
          "El objetivo hasta el 31/12/2026 es que el máximo número de empresas y autónomos llegue preparado a la obligatoriedad del 5 de octubre de 2026, no cobrar por cada documento.",
        ],
      },
    ],
    faq: [
      {
        q: "¿Hay un límite mensual de DeCA?",
        a: "No. Solo se aplican comprobaciones automáticas frente a usos abusivos que no afectan al uso normal ni a la inspección.",
      },
      {
        q: "¿El DeCA gratuito es válido para inspección?",
        a: "Sí. Se genera como PDF nativo con QR y URL de descarga directa conforme a la resolución de 5 de junio de 2026.",
      },
    ],
    sources: [BOE, MIN],
    related: ["que-es-el-deca", "generador-deca", "requisitos-deca"],
  },
  {
    slug: "que-es-el-deca",
    title: "Qué es el DeCA: Documento Electrónico de Control Administrativo",
    h1: "¿Qué es el DeCA?",
    description:
      "El DeCA es la versión digital obligatoria del documento de control del transporte de mercancías por carretera. Qué es, para qué sirve y desde cuándo es obligatorio.",
    intent: "Qué es exactamente el DeCA.",
    lastReviewed: REVIEWED,
    intro: [
      "El DeCA (Documento Electrónico de Control Administrativo) es la versión digital del documento de control que ampara el transporte público de mercancías por carretera. Sustituye al documento en papel.",
      "Se genera a partir de datos estructurados, incorpora un código QR y una URL única, y debe conservarse al menos un año.",
    ],
    sections: [
      {
        h2: "Para qué sirve",
        body: [
          "Acredita ante la inspección los datos esenciales del servicio: quién contrata, quién transporta, origen y destino, mercancía y vehículo.",
          "El conductor lo lleva a bordo en el móvil o impreso, siempre con el QR disponible.",
        ],
      },
      {
        h2: "Qué cambia respecto al papel",
        body: [
          "Desde el 5 de octubre de 2026 el documento de control del transporte interior deja de admitirse en papel: debe ser electrónico.",
          "No vale un PDF escaneado ni una imagen digitalizada: el fichero tiene que ser nativo digital.",
        ],
      },
    ],
    faq: [
      {
        q: "¿DeCA y documento de control son lo mismo?",
        a: "El DeCA es el documento de control en formato electrónico, con los requisitos técnicos añadidos por la resolución de 5 de junio de 2026.",
      },
      {
        q: "¿Necesito firma electrónica?",
        a: "La resolución no exige firma electrónica; sí exige PDF nativo, QR, URL HTTPS de descarga directa y registro de creación y modificaciones.",
      },
    ],
    sources: [BOE, MIN, CETM],
    related: ["deca-obligatorio-2026", "requisitos-deca", "como-hacer-un-deca"],
  },
  {
    slug: "deca-obligatorio-2026",
    title: "DeCA obligatorio desde el 5 de octubre de 2026",
    h1: "El DeCA es obligatorio desde el 5 de octubre de 2026",
    description:
      "Desde el 5 de octubre de 2026 el documento de control del transporte interior de mercancías por carretera debe ser electrónico (DeCA). Sin prórroga ni periodo transitorio.",
    intent: "Desde cuándo es obligatorio el DeCA.",
    lastReviewed: REVIEWED,
    intro: [
      "El 5 de octubre de 2026 entra en vigor la obligación de que el documento de control administrativo del transporte interior de mercancías por carretera sea electrónico.",
      "No hay prórroga ni periodo transitorio: a partir de esa fecha el papel deja de admitirse.",
    ],
    sections: [
      {
        h2: "Qué debes tener listo",
        body: [
          "Un modo de generar el DeCA antes del inicio efectivo de cada servicio.",
          "La entrega de una copia al conductor (electrónica o impresa) con el QR.",
          "La conservación de los ficheros durante al menos un año.",
        ],
      },
      {
        h2: "Ámbito",
        body: [
          "La obligación afecta al transporte interior. El documento debe generarse antes del inicio del servicio y registrar fecha y hora de creación y de cualquier modificación.",
        ],
      },
    ],
    faq: [
      {
        q: "¿Hay multa por no llevar el DeCA?",
        a: "El documento de control es exigible en carretera; su ausencia o incorrección es sancionable conforme a la normativa de transporte.",
      },
      {
        q: "¿Puedo empezar a usarlo antes del 5 de octubre?",
        a: "Sí. Puedes generar DeCA válidos desde ya y llegar preparado a la fecha de obligatoriedad.",
      },
    ],
    sources: [BOE, MIN],
    related: ["que-es-el-deca", "quien-esta-obligado-deca", "generador-deca"],
  },
  {
    slug: "como-hacer-un-deca",
    title: "Cómo hacer un DeCA paso a paso",
    h1: "¿Cómo hacer el DeCA?",
    description:
      "Guía paso a paso para generar el Documento Electrónico de Control Administrativo: datos a introducir, generación del PDF con QR y entrega al conductor.",
    intent: "Cómo se hace un DeCA.",
    lastReviewed: REVIEWED,
    intro: [
      "Hacer un DeCA correcto son tres pasos: introducir los datos, generar el fichero y entregárselo al conductor antes de que empiece el servicio.",
    ],
    sections: [
      {
        h2: "1. Introduce los datos",
        body: [
          "Cargador contractual (nombre o razón social, NIF y domicilio) y transportista efectivo (nombre o razón social y NIF).",
          "Origen y destino, fecha del transporte.",
          "Naturaleza y peso de la mercancía (o una medida alternativa si el peso exacto no es determinable) y matrícula del vehículo (tractora y remolque si es un conjunto articulado).",
        ],
      },
      {
        h2: "2. Genera el DeCA",
        body: [
          "La aplicación crea un PDF nativo con el QR y una URL única HTTPS que descarga el fichero directamente, sin registro.",
          "Se registra la fecha y hora de creación.",
        ],
      },
      {
        h2: "3. Entrégaselo al conductor",
        body: [
          "Antes del inicio efectivo del servicio: copia electrónica visible en el móvil o copia impresa, siempre con el QR.",
          "Puedes compartirlo por enlace, WhatsApp o email.",
        ],
      },
    ],
    faq: [
      {
        q: "¿Y si tengo que corregir un dato después?",
        a: "Se genera una nueva versión con un QR y una URL nuevos; la versión anterior se conserva. Entrega al conductor la versión vigente.",
      },
      {
        q: "¿Puedo reutilizar datos de un DeCA anterior?",
        a: "Sí, con una cuenta gratuita puedes duplicar un DeCA y guardar empresas, vehículos y direcciones habituales.",
      },
    ],
    sources: [ART6, BOE, CETM],
    related: ["datos-obligatorios-deca", "requisitos-deca", "generador-deca"],
  },
  {
    slug: "requisitos-deca",
    title: "Requisitos del DeCA: PDF, QR, URL y conservación",
    h1: "Requisitos técnicos del DeCA",
    description:
      "Requisitos que debe cumplir el DeCA según la resolución vigente: PDF nativo, tamaño máximo 5 MB, QR, URL HTTPS de descarga directa, registro de cambios y conservación mínima de 1 año.",
    intent: "Qué requisitos debe cumplir el DeCA.",
    lastReviewed: REVIEWED,
    intro: [
      "Estos son los requisitos técnicos exigibles al DeCA para el transporte interior de mercancías.",
    ],
    sections: [
      {
        h2: "Formato del fichero",
        body: [
          "PDF nativo digital, generado a partir de datos estructurados. No es válido un escaneo ni una imagen digitalizada.",
          "Tamaño máximo 5 MB. Texto legible.",
          "Metadatos con la fecha de creación y de modificación.",
        ],
      },
      {
        h2: "Código QR y URL",
        body: [
          "El PDF incorpora un código QR que apunta a la URL única y específica del documento.",
          "La URL empieza por https:// (TLS 1.2 o superior) y permite la descarga directa del PDF, sin credenciales, sin contraseña y sin pantalla intermedia con un botón.",
          "El acceso debe estar disponible durante todo el servicio; se puede desactivar siete días naturales después de finalizarlo.",
        ],
      },
      {
        h2: "Trazabilidad y conservación",
        body: [
          "Se registra la fecha y hora de creación y de cualquier modificación.",
          "Los ficheros se conservan al menos un año, tanto por el cargador como por el transportista.",
        ],
      },
    ],
    faq: [
      {
        q: "¿La URL puede pedir login?",
        a: "No. No es válida ninguna URL que dirija a una página que requiera credenciales o autenticación.",
      },
      {
        q: "¿Puede tener un botón de descarga?",
        a: "No. La URL debe descargar el PDF directamente, sin elementos que impliquen una interacción manual.",
      },
    ],
    sources: [BOE, CETM, MIN],
    related: ["deca-pdf-qr", "datos-obligatorios-deca", "que-es-el-deca"],
  },
  {
    slug: "datos-obligatorios-deca",
    title: "Datos obligatorios del DeCA (artículo 6 FOM/2861/2012)",
    h1: "¿Qué datos debe contener el DeCA?",
    description:
      "Datos mínimos que debe contener el DeCA según el artículo 6 de la Orden FOM/2861/2012: cargador, transportista, origen y destino, mercancía y peso, fecha y matrículas.",
    intent: "Qué datos lleva un DeCA.",
    lastReviewed: REVIEWED,
    intro: [
      "El DeCA debe contener, como mínimo, los datos del artículo 6 de la Orden FOM/2861/2012.",
    ],
    sections: [
      {
        h2: "Datos mínimos",
        body: [
          "Cargador contractual: nombre o razón social, NIF y domicilio.",
          "Transportista efectivo: nombre o razón social y NIF.",
          "Lugar de origen y de destino del envío.",
          "Naturaleza y peso de la mercancía. Si determinar el peso exacto es difícil por las circunstancias de la carga, se usa otro tipo de medición.",
          "Fecha de realización del transporte.",
          "Matrícula del vehículo. En un conjunto articulado, la de la tractora y la del remolque o semirremolque.",
        ],
      },
      {
        h2: "Documentos que ya cumplen",
        body: [
          "Si el transporte se documenta en una carta de porte u otra documentación conforme a la legislación aplicable que contenga todos estos datos, puede servir como documento de control.",
        ],
      },
    ],
    faq: [
      {
        q: "¿El NIF del transportista extranjero vale?",
        a: "Sí. El identificador fiscal extranjero es válido aunque no tenga el formato español.",
      },
      {
        q: "¿Y si no sé el peso exacto?",
        a: "Se admite una medida alternativa (por ejemplo, una plataforma completa) cuando el peso exacto no es determinable.",
      },
    ],
    sources: [ART6, BOE],
    related: ["requisitos-deca", "como-hacer-un-deca", "generador-deca"],
  },
  {
    slug: "deca-pdf-qr",
    title: "DeCA en PDF con QR: cómo debe ser y cómo se verifica",
    h1: "El PDF del DeCA y su código QR",
    description:
      "Cómo debe ser el PDF del DeCA y cómo funciona su QR: fichero nativo digital, QR con la URL única HTTPS y descarga directa del documento sin registro.",
    intent: "Cómo es el PDF y el QR del DeCA.",
    lastReviewed: REVIEWED,
    intro: ["El DeCA es un PDF nativo con un código QR que enlaza a la URL única del documento."],
    sections: [
      {
        h2: "El PDF",
        body: [
          "Se genera a partir de los datos estructurados, no del escaneo de un papel.",
          "Ocupa menos de 5 MB y su texto es legible y seleccionable.",
          "Incluye metadatos con la fecha de creación y, si se corrige, de modificación.",
        ],
      },
      {
        h2: "El QR",
        body: [
          "Contiene la URL única y específica del documento.",
          "Al escanearlo, se descarga directamente el PDF: sin login, sin contraseña, sin pantalla intermedia.",
          "El inspector puede presentar el PDF o el propio QR.",
        ],
      },
    ],
    faq: [
      {
        q: "¿El QR caduca?",
        a: "El acceso está disponible durante el servicio y puede desactivarse siete días naturales después de finalizarlo. El documento se conserva un año.",
      },
      {
        q: "¿Puedo imprimir el DeCA?",
        a: "Sí. La copia impresa es válida siempre que muestre el QR.",
      },
    ],
    sources: [BOE, CETM],
    related: ["requisitos-deca", "que-es-el-deca", "generador-deca"],
  },
  {
    slug: "quien-esta-obligado-deca",
    title: "Quién está obligado a hacer el DeCA",
    h1: "¿Quién está obligado a hacer el DeCA?",
    description:
      "Quién debe generar y conservar el DeCA en el transporte público de mercancías por carretera: cargador contractual y transportista efectivo, con excepciones.",
    intent: "Si estoy obligado a hacer el DeCA.",
    lastReviewed: REVIEWED,
    intro: [
      "La obligación recae sobre el cargador contractual y el transportista efectivo del transporte público de mercancías por carretera, en los términos de la normativa aplicable.",
      "Ambos deben conservar el fichero al menos un año.",
    ],
    sections: [
      {
        h2: "Casos habituales",
        body: [
          "Empresa de transporte que realiza el porte: transportista efectivo.",
          "Cargador, industria o comercio que contrata el transporte: cargador contractual.",
          "Agencia de transporte u operador logístico que contrata en nombre propio: asume las obligaciones del cargador contractual.",
          "Autónomo transportista: transportista efectivo.",
        ],
      },
      {
        h2: "Excepciones",
        body: [
          "Determinados transportes están exentos del documento de control conforme a la normativa (por ejemplo, ciertos transportes privados complementarios o supuestos específicos). Comprueba tu caso concreto.",
        ],
      },
    ],
    faq: [
      {
        q: "¿Tengo que hacerlo yo o el cliente?",
        a: "La normativa obliga tanto al cargador contractual como al transportista efectivo. En la práctica lo genera quien organiza el servicio y ambos lo conservan.",
      },
      {
        q: "¿Y el transporte internacional?",
        a: "La obligación del DeCA se refiere al transporte interior. En internacional se usa la documentación propia de ese ámbito (por ejemplo, la carta de porte CMR).",
      },
    ],
    sources: [MIN, BOE, ART6],
    related: ["deca-obligatorio-2026", "deca-vs-cmr", "soy-obligado"],
  },
  {
    slug: "deca-vs-cmr",
    title: "DeCA y CMR: en qué se diferencian",
    h1: "DeCA vs CMR",
    description:
      "Diferencias entre el DeCA (documento de control del transporte interior) y la carta de porte CMR (transporte internacional): ámbito, función y cuándo usar cada uno.",
    intent: "Diferencia entre DeCA y CMR.",
    lastReviewed: REVIEWED,
    intro: [
      "El DeCA y la carta de porte CMR son documentos distintos con ámbitos distintos.",
      "El DeCA es el documento de control administrativo del transporte interior; el CMR es la carta de porte del transporte internacional de mercancías por carretera.",
    ],
    sections: [
      {
        h2: "Ámbito",
        body: [
          "DeCA: transporte interior (nacional). Obligatorio en formato electrónico desde el 5 de octubre de 2026.",
          "CMR / eCMR: transporte internacional al amparo del Convenio CMR.",
        ],
      },
      {
        h2: "Función",
        body: [
          "DeCA: acredita ante la inspección los datos administrativos del servicio.",
          "CMR: es el contrato de transporte y el recibo de la mercancía entre las partes.",
        ],
      },
      {
        h2: "¿Puede una carta de porte servir de DeCA?",
        body: [
          "Sí, si contiene todos los datos del artículo 6 de la Orden FOM/2861/2012 y cumple los requisitos técnicos aplicables.",
        ],
      },
    ],
    faq: [
      {
        q: "¿Necesito los dos en un porte nacional?",
        a: "En transporte interior necesitas el documento de control (DeCA). El CMR es propio del transporte internacional.",
      },
      {
        q: "¿El eCMR cumple como DeCA?",
        a: "Solo si incluye todos los datos exigidos y cumple los requisitos técnicos del DeCA para el tramo interior.",
      },
    ],
    sources: [ART6, BOE],
    related: ["quien-esta-obligado-deca", "datos-obligatorios-deca", "que-es-el-deca"],
  },
  {
    slug: "generador-deca",
    title: "Generador de DeCA online y gratuito",
    h1: "Generador de DeCA",
    description:
      "Generador online del Documento Electrónico de Control Administrativo. Crea el DeCA en 3 pasos: PDF nativo, QR y URL de descarga directa. Gratis y sin registro para empezar.",
    intent: "Necesito un generador de DeCA.",
    lastReviewed: REVIEWED,
    intro: [
      "DeCA Fácil es un generador online del Documento Electrónico de Control Administrativo. No necesitas instalar nada ni pasar por un comercial.",
      "Introduces los datos del servicio, generas el DeCA y lo compartes con el conductor. El documento cumple los requisitos técnicos de la resolución vigente.",
    ],
    sections: [
      {
        h2: "Qué hace el generador",
        body: [
          "Valida que están todos los datos obligatorios antes de generar.",
          "Crea un PDF nativo con QR y una URL única HTTPS de descarga directa.",
          "Registra la fecha y hora de creación y, si corriges, de modificación.",
          "Conserva cada documento y su historial de versiones.",
        ],
      },
      {
        h2: "Empezar",
        body: [
          "Puedes crear tu primer DeCA sin registrarte. Con una cuenta gratuita guardas el historial y reutilizas tus datos habituales.",
        ],
      },
    ],
    faq: [
      {
        q: "¿Tengo que registrarme?",
        a: "No para el primer DeCA. Registrarte es gratis y sirve para guardar y reutilizar.",
      },
      {
        q: "¿El documento generado es válido para inspección?",
        a: "Sí: PDF nativo, QR y URL de descarga directa conforme a la resolución de 5 de junio de 2026.",
      },
    ],
    sources: [BOE, MIN],
    related: ["deca-gratis", "como-hacer-un-deca", "requisitos-deca"],
  },

  // --- Persona pages (GROWTH #35) ---
  {
    slug: "deca-autonomos",
    title: "DeCA para transportistas autónomos | Gratis, en el móvil",
    h1: "DeCA para transportistas autónomos",
    description:
      "Genera el DeCA de cada servicio en minutos desde el móvil, sin cuota ni software. Guarda tu empresa y tu vehículo para el siguiente. Gratis durante la fase de lanzamiento.",
    intent: "Soy transportista autónomo y necesito hacer el DeCA de mis portes.",
    lastReviewed: REVIEWED,
    intro: [
      "Si trabajas por tu cuenta con una o dos cabezas tractoras, el DeCA es una obligación más que resolver antes de salir. Con DeCA Fácil lo generas en el móvil en un par de minutos, sin instalar nada y sin cuota mensual.",
      "El primer documento no requiere registro. Si te creas una cuenta gratuita, tus datos de empresa y tu vehículo quedan guardados y se autocompletan en el siguiente DeCA.",
    ],
    sections: [
      {
        h2: "Tu caso: pocos vehículos, muchos servicios distintos",
        body: [
          "Cambias de cargador y de ruta a menudo, pero tu empresa y tu vehículo son casi siempre los mismos. La cuenta gratuita guarda esos datos fijos y te deja rellenar solo lo que cambia: cargador, origen, destino, mercancía y fecha.",
          "Cuando repites un porte parecido, duplicas el DeCA anterior y ajustas lo justo.",
        ],
      },
      {
        h2: "Del móvil al conductor (o a ti mismo)",
        body: [
          "Al generar el DeCA obtienes el PDF nativo, el QR y una URL HTTPS de descarga directa. Lo compartes por WhatsApp, enlace o correo, o lo llevas tú mismo en el teléfono. La URL abre el PDF sin registro ni contraseña para la inspección.",
        ],
      },
      {
        h2: "¿Estás obligado?",
        body: [
          "El transporte público de mercancías por carretera exige DeCA desde el 5 de octubre de 2026, tanto al transportista efectivo como al cargador contractual. Si tienes dudas sobre tu caso concreto, revisa quién está obligado.",
        ],
      },
    ],
    faq: [
      {
        q: "¿Necesito registrarme para el primer DeCA?",
        a: "No. El primer documento se genera sin cuenta. Registrarte es gratis y solo sirve para guardar y reutilizar tus datos.",
      },
      {
        q: "¿Tiene coste para autónomos?",
        a: "No. Sin tarjeta y sin límite de documentos durante la fase de lanzamiento, al menos hasta el 31 de diciembre de 2026.",
      },
      {
        q: "¿Vale un NIF/VAT extranjero?",
        a: "Sí. El formulario acepta identificadores extranjeros para el cargador o el transportista.",
      },
    ],
    sources: [BOE, MIN, CETM],
    related: ["como-hacer-un-deca", "quien-esta-obligado-deca", "deca-gratis"],
  },
  {
    slug: "deca-empresas-transporte",
    title: "DeCA para empresas de transporte | Espacio compartido para el equipo",
    h1: "DeCA para empresas de transporte",
    description:
      "Un mismo espacio para todos tus operadores: historial compartido, cargadores, vehículos y direcciones guardados, y auditoría de quién creó o corrigió cada DeCA.",
    intent:
      "Somos una empresa de transporte con varios operadores de tráfico y queremos gestionar los DeCA en común.",
    lastReviewed: REVIEWED,
    intro: [
      "En una empresa de transporte, varias personas emiten documentos a lo largo del día. DeCA Fácil da a tu empresa un espacio de trabajo único: todos los operadores comparten el historial, los datos maestros y las plantillas.",
      "Cada DeCA guarda quién lo generó y quién lo corrigió, con fecha y hora, para que la trazabilidad interna sea clara.",
    ],
    sections: [
      {
        h2: "Varios usuarios, una sola empresa",
        body: [
          "El administrador invita a los operadores por email con un enlace de un solo uso. Al aceptar, se unen a la empresa existente — nunca se crea una empresa duplicada porque otro empleado se registre.",
          "Los roles son sencillos: administrador (gestiona el equipo y los datos de empresa) y operador (crea, comparte, duplica y corrige documentos).",
        ],
      },
      {
        h2: "Datos maestros compartidos",
        body: [
          "Cargadores habituales, vehículos (tractora y remolque) y direcciones de carga y descarga se guardan a nivel de empresa y se autocompletan para cualquier operador. Editar un dato maestro no altera ningún documento ya generado: los PDF históricos son inmutables.",
        ],
      },
      {
        h2: "Historial y correcciones",
        body: [
          "El historial es común y se filtra por fecha, ruta, matrícula, cargador o referencia. Una corrección genera siempre una versión nueva con su propio QR y URL; la versión anterior se conserva y sigue siendo consultable.",
        ],
      },
    ],
    faq: [
      {
        q: "¿Hay límite de usuarios?",
        a: "No durante la fase de lanzamiento. Usuarios ilimitados para tu empresa.",
      },
      {
        q: "¿Qué pasa si quito a un empleado?",
        a: "Pierde el acceso al espacio de trabajo de inmediato. Su cuenta personal se mantiene, sin empresa.",
      },
      {
        q: "¿Se puede ver quién hizo cada documento?",
        a: "Sí. Cada versión del DeCA registra el usuario que la creó o corrigió, con fecha y hora.",
      },
    ],
    sources: [BOE, MIN, CETM],
    related: ["deca-agencias-transporte", "requisitos-deca", "como-hacer-un-deca"],
  },
  {
    slug: "deca-agencias-transporte",
    title: "DeCA para agencias y operadores de transporte | Como cargador contractual",
    h1: "DeCA para agencias y operadores de transporte",
    description:
      "Emite el DeCA como cargador contractual en cada contratación, con varias empresas y transportistas reutilizables y un espacio de trabajo para tu equipo. Sin depender de terceros.",
    intent:
      "Soy una agencia de transporte / operador que contrata transporte y tengo que emitir el DeCA como cargador contractual.",
    lastReviewed: REVIEWED,
    intro: [
      "Cuando una agencia u operador de transporte contrata el porte, actúa como cargador contractual y tiene las mismas obligaciones de generación y conservación del DeCA que cualquier otro cargador.",
      "DeCA Fácil te deja emitir el documento en cada contratación sin montar un proceso nuevo y sin depender de que lo haga el transportista: tú controlas el documento, su conservación y su URL de inspección.",
    ],
    sections: [
      {
        h2: "Muchas contrapartes, contratación rápida",
        body: [
          "Trabajas con carteras amplias de clientes y de transportistas. Guarda unos y otros como datos reutilizables y selecciónalos al crear cada DeCA; duplica un documento anterior cuando la contratación se repite.",
        ],
      },
      {
        h2: "Tu equipo, un espacio común",
        body: [
          "Invita a los operadores de tu agencia al mismo espacio de trabajo. Comparten historial, contrapartes y plantillas, y cada documento queda atribuido a quien lo emitió.",
        ],
      },
      {
        h2: "Conservación y trazabilidad",
        body: [
          "El cargador contractual debe conservar el DeCA al menos un año. El historial mantiene todos tus documentos y versiones, con la fecha de creación y de cada modificación, y la URL pública de cada versión.",
        ],
      },
    ],
    faq: [
      {
        q: "¿Una agencia está obligada a emitir el DeCA?",
        a: "Sí, cuando actúa como cargador contractual u operador que contrata el transporte, con las mismas obligaciones de generación y conservación.",
      },
      {
        q: "¿Puedo gestionar varias empresas cargadoras?",
        a: "Sí. Guardas tantas empresas y transportistas como necesites y eliges los que corresponden en cada documento.",
      },
    ],
    sources: [BOE, MIN, ART6],
    related: ["deca-empresas-transporte", "quien-esta-obligado-deca", "datos-obligatorios-deca"],
  },
  {
    slug: "deca-cargadores",
    title: "DeCA para cargadores y expedidores | Genera, conserva y comparte",
    h1: "DeCA para cargadores y expedidores",
    description:
      "Cumple la obligación de generación y conservación del DeCA sin montar un proceso nuevo en tu ERP: transportistas habituales guardados, historial y ruta de inspección directa por QR.",
    intent: "Soy el cargador / expedidor de la mercancía y tengo que cumplir con el DeCA.",
    lastReviewed: REVIEWED,
    intro: [
      "El cargador contractual es uno de los dos obligados a generar y conservar el DeCA. Si eres una empresa industrial o comercial que expide mercancía, necesitas una forma sencilla de cumplir sin cambiar tus sistemas.",
      "Con DeCA Fácil generas el documento por servicio, lo conservas en el historial durante el plazo legal y lo compartes con el transportista y con el conductor.",
    ],
    sections: [
      {
        h2: "Sin tocar tu ERP",
        body: [
          "No hace falta integrar nada. Entras, rellenas los datos del servicio — con tus transportistas habituales guardados — y descargas el PDF nativo con QR y URL. La conservación de al menos un año la cubre el historial.",
        ],
      },
      {
        h2: "El transportista lo recibe listo",
        body: [
          "Compartes el DeCA por enlace, WhatsApp o email. El conductor lo lleva en el móvil o impreso, y la URL del QR abre el PDF vigente directamente para la inspección, sin registro.",
        ],
      },
      {
        h2: "Qué datos tienes que aportar",
        body: [
          "Como cargador aportas tu razón social, NIF y domicilio, los del transportista efectivo, el origen y destino, la naturaleza y el peso de la mercancía, la fecha y la matrícula. Revisa la lista completa de datos obligatorios.",
        ],
      },
    ],
    faq: [
      {
        q: "¿El cargador también conserva el DeCA?",
        a: "Sí. La conservación mínima de un año recae tanto sobre el cargador contractual como sobre el transportista.",
      },
      {
        q: "¿Puedo delegar la generación en el transportista?",
        a: "El transportista efectivo tiene su propia obligación, pero la del cargador contractual no desaparece por ello. Generarlo tú te da el control del documento y de su conservación.",
      },
    ],
    sources: [BOE, MIN, ART6],
    related: ["datos-obligatorios-deca", "quien-esta-obligado-deca", "deca-agencias-transporte"],
  },
];

export function getSeoPage(slug: string): SeoPage | undefined {
  return SEO_PAGES.find((p) => p.slug === slug);
}
