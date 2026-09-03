import { publicEnv } from "@/lib/env";
import { BRAND } from "@/lib/brand";

export const HERO = {
  eyebrow: "Documento Electrónico de Control",
  h1: "DeCA GRATIS",
  subhead: `${BRAND.tagline}`,
  proof:
    "PDF nativo · QR válido para inspección · URL directa · Sin tarjeta · Sin límite hasta el 31/12/2026",
  cta: "CREAR DECA GRATIS",
  ctaSecondary: "ENTRAR",
  trust: "Sin tarjeta · Sin límite · Gratis hasta el 31/12/2026",
};

/** Compact trust row under the hero. */
export const TRUST_ROW = [
  "Sin registro para el primero",
  "PDF + QR",
  "Listo para inspección",
  "Conservación online",
];

/** Who it's for (persona section — #22). */
export const PERSONAS = [
  {
    title: "Agencias de transporte",
    body: "Emite el DeCA como cargador contractual en cada contratación y consérvalo con toda tu operativa en un mismo sitio.",
  },
  {
    title: "Transportistas",
    body: "Genera el documento del servicio en el móvil antes de salir y compártelo con el conductor en un toque.",
  },
  {
    title: "Autónomos",
    body: "Sin software que instalar ni cuota mensual. Entras, rellenas y descargas. Guarda tus datos para la próxima.",
  },
  {
    title: "Cargadores",
    body: "Cumple la obligación de generación y conservación sin montar un proceso nuevo en tu ERP.",
  },
];

/** Why companies come back every day (#22 section 5). */
export const DAILY_USE = [
  "Empresas y transportistas guardados: se autocompletan en el siguiente DeCA.",
  "Direcciones habituales de carga y descarga listas para elegir.",
  "Vehículos guardados: tractora y remolque en un clic.",
  "Duplicar un DeCA anterior y cambiar solo lo que toca.",
  "Historial completo con búsqueda por fecha, ruta, matrícula o referencia.",
];

export const STEPS = [
  {
    n: 1,
    title: "Introduce los datos",
    body: "Cargador, transportista, origen, destino, mercancía y matrícula. Sin registro.",
  },
  {
    n: 2,
    title: "Genera el DeCA",
    body: "Creamos el PDF nativo con QR y una URL única de descarga directa.",
  },
  {
    n: 3,
    title: "Compártelo con el conductor",
    body: "Enlace, WhatsApp, email o copia impresa. Listo para inspección.",
  },
];

export const BENEFITS = [
  {
    title: "Gratis",
    body: "Sin límite de DeCA durante la fase de captación. Sin tarjeta, sin plan de pago.",
  },
  {
    title: "Rápido",
    body: "Reutiliza tus datos habituales y duplica documentos anteriores en un toque.",
  },
  {
    title: "Preparado para inspección",
    body: "PDF nativo, QR y URL HTTPS directa conforme a la resolución vigente.",
  },
];

export const LEGAL_POINTS = [
  "Obligatorio desde el 5 de octubre de 2026 para el transporte interior de mercancías por carretera.",
  "El fichero es un PDF nativo digital, generado a partir de datos estructurados — no vale un escaneo.",
  "Tamaño máximo 5 MB.",
  "Incluye un código QR con una URL única que empieza por https://",
  "La URL permite la descarga directa del PDF, sin registro y sin contraseña.",
  "Se registra la fecha y hora de creación y de cualquier modificación.",
  "Conservación mínima de 1 año por el cargador y por el transportista.",
];

export const LEGAL_SOURCE = {
  label: "Resolución de 5 de junio de 2026 (BOE de 12 de junio de 2026)",
  url: "https://www.boe.es/buscar/act.php?id=BOE-A-2026-12784",
};

export const FAQ: { q: string; a: string }[] = [
  {
    q: "¿Qué es el DeCA?",
    a: "El Documento Electrónico de Control Administrativo es la versión digital obligatoria del documento de control del transporte de mercancías por carretera. Sustituye al documento en papel.",
  },
  {
    q: "¿Cuándo es obligatorio?",
    a: "Desde el 5 de octubre de 2026 para el transporte interior. No hay prórroga ni periodo transitorio: el papel deja de admitirse.",
  },
  {
    q: "¿Quién tiene que hacerlo?",
    a: "El cargador contractual y el transportista efectivo del transporte público de mercancías por carretera, en los términos de la normativa aplicable.",
  },
  {
    q: "¿Es obligatorio para agencias de transporte?",
    a: "Sí, cuando actúan como cargador contractual u operador que contrata el transporte, con las mismas obligaciones de generación y conservación.",
  },
  {
    q: "¿Sirve un PDF escaneado?",
    a: "No. El fichero debe ser un PDF nativo digital generado a partir de datos estructurados. Un escaneo o una imagen digitalizada no es válido.",
  },
  {
    q: "¿Tiene que firmarse?",
    a: "La resolución no exige firma electrónica. Sí exige PDF nativo, QR, URL HTTPS de descarga directa y registro de creación y modificaciones.",
  },
  {
    q: "¿Qué datos debe contener?",
    a: "Como mínimo: cargador contractual (nombre o razón social, NIF y domicilio), transportista efectivo (nombre o razón social y NIF), origen y destino, naturaleza y peso de la mercancía, fecha del transporte y matrícula del vehículo (tractora y remolque si es un conjunto articulado).",
  },
  {
    q: "¿Cómo lo lleva el conductor?",
    a: "Antes del inicio del servicio, en copia electrónica visible en el móvil o en copia impresa, siempre con el QR disponible.",
  },
  {
    q: `¿Es gratis ${BRAND.name}?`,
    a: "Sí. Puedes crear y descargar documentos sin tarjeta y sin límite hasta el 31 de diciembre de 2026.",
  },
  {
    q: "¿Puedo generar todos los documentos que quiera?",
    a: "Sí. No hay límite mensual. Solo aplicamos controles automáticos frente a usos abusivos que no afectan al uso normal ni a la inspección.",
  },
];

/** JSON-LD for the landing (schema.org). Only emitted where the content is genuinely present. */
export function landingJsonLd() {
  const base = publicEnv.baseUrl;
  return [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: BRAND.name,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: base,
      offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
      description: HERO.subhead,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];
}
