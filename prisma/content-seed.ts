/**
 * Initial editorial content for the CMS (SEO #32) so it is never empty on a
 * fresh deploy. These are the pieces that ADD to the core SEO cluster
 * (`content/seo/pages.ts`) rather than duplicating it. Idempotent: run via
 * `npm run seed:content` (deploy runbook) and from `prisma/seed.ts` for dev.
 */
import { PrismaClient } from "./generated/client";
import { GUIA_DE_USO_SLUG, GUIA_DE_USO_BODY } from "./content/guia-de-uso";

const BOE = {
  label: "Resolución de 5 de junio de 2026 (BOE de 12 de junio de 2026)",
  url: "https://www.boe.es/buscar/act.php?id=BOE-A-2026-12784",
};
const MIN = {
  label: "Ministerio de Transportes — DeCA",
  url: "https://www.transportes.gob.es/transporte-terrestre/profesionales-transporte/servicios-transportista/documento-electronico-control-administrativo-deca",
};
// The enabling law behind the 5 October 2026 deadline (verified against the
// BOE, 2026-09 legal-content pass — docs/decisions.md D-107).
const LEY_MOVILIDAD = {
  label: "Ley 9/2025, de 3 de diciembre, de Movilidad Sostenible (BOE)",
  url: "https://www.boe.es/buscar/act.php?id=BOE-A-2025-24545",
};
const REVIEWED = new Date("2026-09-04");

type Seed = {
  slug: string;
  type: "guide" | "blog";
  title: string;
  excerpt: string;
  body: string;
  category: string;
  authorName: string;
  seoTitle: string;
  metaDescription: string;
  sources: { label: string; url: string }[];
  relatedSlugs: string[];
  lastReviewedAt?: Date;
};

export const CONTENT_SEED: Seed[] = [
  {
    // #111 — the complete product usage guide, inside the existing Guías section.
    slug: GUIA_DE_USO_SLUG,
    type: "guide",
    title: "Guía de uso de DeCA Profesional",
    excerpt:
      "Aprende paso a paso a utilizar las principales funciones de la plataforma: crear un DeCA, el PDF y el QR, plantillas, datos habituales, equipo, privacidad, soporte e inspección.",
    category: "Uso del producto",
    authorName: "Equipo DeCA Profesional",
    seoTitle: "Guía de uso de DeCA Profesional paso a paso",
    metaDescription:
      "Guía completa de DeCA Profesional: crear una cuenta, generar un DeCA en tres pasos, el PDF con QR, Mis DeCA e historial, plantillas, datos habituales, equipo y roles, privacidad, soporte e inspección.",
    sources: [MIN],
    relatedSlugs: [
      "como-corregir-un-deca",
      "errores-frecuentes-al-generar-un-deca",
      "como-llevar-el-deca-en-el-movil",
    ],
    lastReviewedAt: REVIEWED,
    body: GUIA_DE_USO_BODY,
  },
  {
    slug: "como-corregir-un-deca",
    type: "guide",
    title: "Cómo corregir o modificar un DeCA",
    excerpt:
      "La resolución permite corregir un DeCA modificando el PDF existente o generando uno nuevo. En DeCA Profesional, cada corrección crea una versión nueva con QR y URL propios, y la anterior se conserva.",
    category: "Uso del producto",
    authorName: "Equipo DeCA Profesional",
    seoTitle: "Cómo corregir un DeCA: los dos métodos válidos",
    metaDescription:
      "La resolución permite dos formas de corregir un DeCA: modificar el PDF existente o generar uno nuevo. En DeCA Profesional, cada corrección crea una versión nueva con QR y URL propios.",
    sources: [BOE, MIN],
    relatedSlugs: ["como-llevar-el-deca-en-el-movil"],
    lastReviewedAt: REVIEWED,
    body: `La resolución de 5 de junio de 2026 (artículo 5) permite corregir un DeCA de dos formas: **modificando el PDF existente** — añadiendo el dato nuevo y el motivo del cambio, y conservando el dato anterior marcado como no vigente, sin que cambien la URL ni el QR — o **generando un PDF nuevo**, con su propio QR y su propia URL, conservando el original a efectos de trazabilidad. Ambos métodos son válidos: la normativa no obliga a elegir uno en concreto.

**DeCA Profesional implementa el segundo método**: cada corrección genera una versión nueva, con su propio código QR y su propia URL de inspección. La versión anterior no se borra y sigue siendo consultable.

## Cuándo corregir y cuándo generar de nuevo

- **Corregir**: el servicio es el mismo pero un dato era incorrecto o ha cambiado. Mantiene la trazabilidad (v1 → v2) y el motivo de la corrección.
- **Generar de nuevo**: es otro servicio distinto. Usa «Duplicar» si comparte casi todos los datos.

## Paso a paso

1. Abre el DeCA desde el historial y pulsa **Corregir**.
2. Cambia solo lo que toca y escribe el **motivo de la corrección** (obligatorio).
3. Pulsa **Guardar corrección**. Se genera la versión nueva.
4. **Reenvía al conductor la versión vigente.** La anterior queda como histórico.

> El registro guarda la fecha y hora de creación y de cada modificación, y quién la hizo si estás en una cuenta de empresa.

::: faq
Q: ¿La URL antigua deja de funcionar?
A: No. Cada versión conserva su URL; la inspección debe usar la del QR de la copia que lleva el conductor.
Q: ¿Puedo corregir un DeCA de hace meses?
A: Sí, mientras conserves el acceso. La corrección no reinicia el plazo de conservación.
Q: ¿Puedo modificar el PDF existente en lugar de generar uno nuevo?
A: La normativa lo permite como alternativa, pero DeCA Profesional solo genera versiones nuevas con QR y URL propios; no ofrece la edición del PDF existente conservando la misma URL.
:::

[[cta]]`,
  },
  {
    slug: "como-llevar-el-deca-en-el-movil",
    type: "guide",
    title: "Cómo lleva el conductor el DeCA en el móvil",
    excerpt:
      "Qué tiene que poder enseñar el conductor en una inspección y cómo preparar el documento para que se abra sin depender de la cobertura.",
    category: "Uso del producto",
    authorName: "Equipo DeCA Profesional",
    seoTitle: "Cómo llevar el DeCA en el móvil en carretera",
    metaDescription:
      "El conductor lleva el DeCA en copia electrónica o impresa, siempre con el QR visible. Cómo compartirlo y qué comprobar antes de salir.",
    sources: [BOE, MIN],
    relatedSlugs: ["como-corregir-un-deca"],
    lastReviewedAt: REVIEWED,
    body: `Antes del inicio del servicio, el conductor debe poder mostrar el DeCA: en **copia electrónica** visible en el móvil o en **copia impresa**, siempre con el **código QR** disponible.

## Antes de salir

- Comparte el enlace del DeCA por WhatsApp, correo o el botón **Enviar al conductor**.
- Comprueba que es la **versión vigente** (si hubo una corrección).
- Abre el enlace una vez con conexión para que quede en el historial del navegador.

## En la inspección

La URL del QR abre el PDF **directamente**, sin registro ni contraseña. El agente escanea el QR o teclea la dirección.

| Formato | Vale para inspección |
| --- | --- |
| Enlace / PDF en el móvil | Sí |
| Copia impresa con el QR | Sí |
| Captura de pantalla del formulario | No — tiene que ser el PDF generado |

[[cta]]`,
  },
  {
    slug: "errores-frecuentes-al-generar-un-deca",
    type: "guide",
    title: "Errores frecuentes al generar un DeCA (y cómo evitarlos)",
    excerpt:
      "NIF mal escrito, confundir cargador y transportista, dejar el peso en blanco: los fallos que más se repiten y cómo no cometerlos.",
    category: "Uso del producto",
    authorName: "Equipo DeCA Profesional",
    seoTitle: "Errores frecuentes al hacer el DeCA",
    metaDescription:
      "Los errores más comunes al generar el DeCA: cargador vs transportista, NIF, peso, matrícula del remolque. Cómo detectarlos antes de generar.",
    sources: [BOE, MIN],
    relatedSlugs: ["como-corregir-un-deca"],
    lastReviewedAt: REVIEWED,
    body: `## Confundir cargador y transportista

- **Cargador contractual**: quien *contrata* el transporte.
- **Transportista efectivo**: quien lo *realiza* físicamente.

Si eres autónomo y transportas para un cliente, tú eres el transportista y el cliente el cargador. Si eres una agencia que subcontrata, tú eres el cargador contractual.

## Dejar el peso sin una unidad clara

Pon siempre la unidad: \`12.000 kg\`. Si el peso exacto no es determinable, describe la medida: «una plataforma completa».

## Olvidar el remolque… o ponerlo cuando no hay

La matrícula del remolque solo se rellena si es un conjunto articulado. Si no hay remolque, se deja vacío.

## NIF/VAT mal escrito

El formulario acepta identificadores extranjeros. Revisa letra inicial y dígito de control.

> Antes de pulsar **GENERAR DECA**, la pantalla de revisión muestra exactamente lo que irá en el PDF. Úsala.

[[cta]]`,
  },
  {
    slug: "cuenta-atras-deca-5-octubre-2026",
    type: "blog",
    title: "Cuenta atrás para el DeCA: qué tener listo antes del 5 de octubre de 2026",
    excerpt:
      "Desde el 5 de octubre de 2026, el DeCA del transporte interior debe generarse en formato electrónico desde el origen. Checklist para llegar preparado.",
    category: "Normativa",
    authorName: "Equipo DeCA Profesional",
    seoTitle: "DeCA obligatorio 5 de octubre de 2026: checklist",
    metaDescription:
      "El 5 de octubre de 2026 el documento de control del transporte interior debe ser electrónico. Qué necesitas tener listo, sin prórroga ni transición.",
    sources: [BOE, MIN, LEY_MOVILIDAD],
    relatedSlugs: ["como-corregir-un-deca", "como-llevar-el-deca-en-el-movil"],
    lastReviewedAt: REVIEWED,
    body: `El **5 de octubre de 2026** entra en vigor la obligación de que el documento de control administrativo del transporte interior de mercancías por carretera se genere en formato electrónico desde el origen. **No hay prórroga ni periodo transitorio**. El conductor puede seguir llevando el documento en copia electrónica en el móvil o en copia impresa con el código QR; lo que deja de ser válido es originar el documento en papel y escanearlo después — eso no es un DeCA electrónico nativo.

> Esta es la cuenta atrás práctica. Para el detalle normativo completo — ámbito, sanciones y quién está obligado — consulta [DeCA obligatorio desde el 5 de octubre de 2026](/deca-obligatorio-2026).

## Checklist

- [ ] Una forma de **generar el DeCA antes del inicio efectivo** de cada servicio.
- [ ] Un proceso para **entregar la copia al conductor** (enlace, WhatsApp, impresa) con el QR.
- [ ] **Conservación** de los ficheros durante al menos un año, por el cargador y por el transportista.
- [ ] Tus **datos habituales guardados** (empresa, vehículos, contrapartes) para no repetirlos en cada documento.

## Empieza ya

Puedes generar DeCA válidos desde hoy y llegar rodado a la fecha. Es gratis durante la fase de lanzamiento.

[[cta]]`,
  },
];

export async function seedContent(prisma = new PrismaClient()) {
  let created = 0;
  for (const s of CONTENT_SEED) {
    const existing = await prisma.contentItem.findUnique({ where: { slug: s.slug } });
    if (existing) continue;
    await prisma.contentItem.create({
      data: {
        type: s.type,
        slug: s.slug,
        status: "published",
        title: s.title,
        excerpt: s.excerpt,
        body: s.body,
        category: s.category,
        authorName: s.authorName,
        seoTitle: s.seoTitle,
        metaDescription: s.metaDescription,
        sources: s.sources as unknown as object,
        relatedSlugs: s.relatedSlugs,
        lastReviewedAt: s.lastReviewedAt ?? null,
        publishedAt: new Date(),
      },
    });
    created++;
  }
  return created;
}

if (process.argv[1]?.endsWith("content-seed.ts")) {
  const prisma = new PrismaClient();
  seedContent(prisma)
    .then((n) => console.log(`Seeded ${n} content item(s).`))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
