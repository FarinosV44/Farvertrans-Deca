-- Data backfill: legal-accuracy correction to two content pieces that were
-- seeded before this fix (2026-09 legal-content pass, see docs/decisions.md
-- D-107). seedContent() is idempotent and skips existing slugs, so a
-- source-only fix in prisma/content-seed.ts does not correct rows already
-- created in any environment. This backfills those exact rows to match the
-- corrected source.
--
-- 1) "como-corregir-un-deca": no longer states a DeCA "cannot be edited" or
--    that a correction "necessarily" generates a new QR/URL — now explains
--    both correction methods the resolution allows (in-place PDF amendment
--    keeping the same URL/QR, or a new PDF with its own URL/QR) and states
--    which one this product implements.
-- 2) "cuenta-atras-deca-5-octubre-2026": no longer states paper "is no
--    longer accepted" in a way that could be read as banning a printed
--    copy — now distinguishes the electronic original (mandatory from the
--    outset) from the paper copy the driver may still carry.
UPDATE "content_item"
SET
  "excerpt" = 'La resolución permite corregir un DeCA modificando el PDF existente o generando uno nuevo. En DeCA Profesional, cada corrección crea una versión nueva con QR y URL propios, y la anterior se conserva.',
  "seo_title" = 'Cómo corregir un DeCA: los dos métodos válidos',
  "meta_description" = 'La resolución permite dos formas de corregir un DeCA: modificar el PDF existente o generar uno nuevo. En DeCA Profesional, cada corrección crea una versión nueva con QR y URL propios.',
  "body" = 'La resolución de 5 de junio de 2026 (artículo 5) permite corregir un DeCA de dos formas: **modificando el PDF existente** — añadiendo el dato nuevo y el motivo del cambio, y conservando el dato anterior marcado como no vigente, sin que cambien la URL ni el QR — o **generando un PDF nuevo**, con su propio QR y su propia URL, conservando el original a efectos de trazabilidad. Ambos métodos son válidos: la normativa no obliga a elegir uno en concreto.

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

[[cta]]'
WHERE "slug" = 'como-corregir-un-deca';

UPDATE "content_item"
SET
  "excerpt" = 'Desde el 5 de octubre de 2026, el DeCA del transporte interior debe generarse en formato electrónico desde el origen. Checklist para llegar preparado.',
  "body" = 'El **5 de octubre de 2026** entra en vigor la obligación de que el documento de control administrativo del transporte interior de mercancías por carretera se genere en formato electrónico desde el origen. **No hay prórroga ni periodo transitorio**. El conductor puede seguir llevando el documento en copia electrónica en el móvil o en copia impresa con el código QR; lo que deja de ser válido es originar el documento en papel y escanearlo después — eso no es un DeCA electrónico nativo.

> Esta es la cuenta atrás práctica. Para el detalle normativo completo — ámbito, sanciones y quién está obligado — consulta [DeCA obligatorio desde el 5 de octubre de 2026](/deca-obligatorio-2026).

## Checklist

- [ ] Una forma de **generar el DeCA antes del inicio efectivo** de cada servicio.
- [ ] Un proceso para **entregar la copia al conductor** (enlace, WhatsApp, impresa) con el QR.
- [ ] **Conservación** de los ficheros durante al menos un año, por el cargador y por el transportista.
- [ ] Tus **datos habituales guardados** (empresa, vehículos, contrapartes) para no repetirlos en cada documento.

## Empieza ya

Puedes generar DeCA válidos desde hoy y llegar rodado a la fecha. Es gratis durante la fase de lanzamiento.

[[cta]]',
  "sources" = '[{"label":"Resolución de 5 de junio de 2026 (BOE de 12 de junio de 2026)","url":"https://www.boe.es/buscar/act.php?id=BOE-A-2026-12784"},{"label":"Ministerio de Transportes — DeCA","url":"https://www.transportes.gob.es/transporte-terrestre/profesionales-transporte/servicios-transportista/documento-electronico-control-administrativo-deca"},{"label":"Ley 9/2025, de 3 de diciembre, de Movilidad Sostenible (BOE)","url":"https://www.boe.es/buscar/act.php?id=BOE-A-2025-24545"}]'::jsonb
WHERE "slug" = 'cuenta-atras-deca-5-octubre-2026';
