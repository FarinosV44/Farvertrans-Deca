import { publicEnv } from "@/lib/env";
import { BRAND } from "@/lib/brand";
import { LEGAL_ENTITY } from "@/lib/legal-entity";

/** Trust-first positioning (TRUST #42, GROWTH #46) — professional first, free second. */
export const HERO = {
  eyebrow: "Documento Electrónico de Control",
  h1: "DeCA profesional, sencillo y listo para trabajar.",
  subhead:
    "Genera, gestiona, custodia y comparte tus Documentos Electrónicos de Control desde una plataforma especializada en transporte.",
  proof:
    "Mercancías · PDF + QR · Custodia digital · Histórico · Multiusuario · Gratis durante la fase de lanzamiento",
  cta: "CREAR DECA GRATIS",
  ctaSecondary: "ENTRAR",
  trust: "Gratis durante la fase de lanzamiento",
};

/**
 * Compact trust row under the hero. D-060 restored the lightweight lead gate
 * (name + email only) for the first DeCA, so "sin registro" is accurate again
 * for that first document — only a SECOND anonymous DeCA needs an account.
 */
export const TRUST_ROW = [
  "Sin registro para tu primer DeCA",
  "PDF + QR",
  "Custodia digital",
  "Histórico",
];

/** Discreet operator/legal-backing trust strip (TRUST #42 §2/§2A) — never the primary brand. */
export const OPERATOR_TRUST = {
  strip: `PDF + QR · Custodia digital · Histórico · ${LEGAL_ENTITY.operatorLine}`,
  heading: "Quién está detrás del servicio",
  body: `${LEGAL_ENTITY.operatorLine}. ${LEGAL_ENTITY.legalBackingLine}`,
};

/**
 * Who it's for (persona section — #22 / #35). Each card states the concrete
 * job-to-be-done and links to its own persona page; the CTA always leads to
 * product use, never a contact form.
 */
export const PERSONAS = [
  {
    title: "Transportista autónomo",
    jobToBeDone: "Genera el DeCA en minutos y llévalo en el móvil.",
    benefits: [
      "Registro gratuito en segundos",
      "Empresa y vehículo guardados tras registrarte",
      "Duplicado rápido del último documento",
      "Envío al conductor en un toque",
    ],
    slug: "deca-autonomos",
    event: "persona_autonomo_cta" as const,
  },
  {
    title: "Empresa de transporte",
    jobToBeDone: "Un mismo espacio para todos tus operadores y documentos.",
    benefits: [
      "Varios usuarios en la misma empresa",
      "Historial compartido",
      "Cargadores, vehículos y direcciones guardados",
      "Auditoría de quién creó o corrigió cada DeCA",
    ],
    slug: "deca-empresas-transporte",
    event: "persona_transport_company_cta" as const,
  },
  {
    title: "Agencia / operador de transporte",
    jobToBeDone: "Gestiona el documento como cargador contractual sin depender de terceros.",
    benefits: [
      "Varias empresas y transportistas",
      "Contrapartes reutilizables",
      "Duplicado rápido",
      "Espacio de trabajo para el equipo",
    ],
    slug: "deca-agencias-transporte",
    event: "persona_agency_cta" as const,
  },
  {
    title: "Cargador / expedidor",
    jobToBeDone: "Genera, conserva y comparte tus DeCA desde un único sitio.",
    benefits: [
      "Transportistas habituales guardados",
      "Historial de documentos",
      "Ruta de inspección directa por QR/PDF",
      "Sin montar un proceso nuevo en tu ERP",
    ],
    slug: "deca-cargadores",
    event: "persona_shipper_cta" as const,
  },
];

export const STEPS = [
  {
    n: 1,
    title: "Introduce los datos",
    body: "Cargador, transportista, origen, destino, mercancía y matrícula. Sin compromiso.",
  },
  {
    n: 2,
    title: "Crea tu cuenta y genera",
    body: "Registro gratuito en segundos — creamos el PDF nativo con QR y una URL única de descarga directa. Nada de lo que ya escribiste se pierde.",
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
    a: "Como mínimo: cargador contractual (nombre o razón social, NIF y domicilio), transportista efectivo (nombre o razón social y NIF), lugar y fecha de carga, lugar y fecha de descarga, naturaleza y peso de la mercancía, y matrícula del vehículo (tractora y remolque si es un conjunto articulado).",
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
