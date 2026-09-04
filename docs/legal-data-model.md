# DeCA legal data model — requirement → field → PDF → test

Implementation evidence for FIX #17 + PRODUCT #41. Maps every mandatory data element of the DeCA
(goods transport) to the exact code that produces and validates it. **Legal basis:** Art. 6 Orden
FOM/2861/2012 (documento de control en el transporte público de mercancías por carretera) as carried
forward by the 2026 DeCA regime (BOE-A-2026-12784 + Resolución 5 jun 2026). Foreign-operator
identifiers are accepted (warned, never blocked).

**Scope note (#41):** this table covers **goods (`mercancías`) transport only**. A separate passenger
(`viajeros`) document schema is explicitly out of scope until the passenger legal requirement matrix
is researched and validated — see `docs/decisions.md` D-042.

| # | Legal requirement (Art. 6.1) | zod field (`lib/deca/schema.ts` / `lib/deca/location.ts`) | Form field (`components/deca/wizard.tsx`) | PDF location (`lib/pdf/deca-document.tsx`) | Test |
|---|---|---|---|---|---|
| a1 | Nombre / razón social del **cargador contractual** | `shipper.name` (2–200, required) | `#shipperName` — "Empresa que contrata el transporte › Nombre o razón social" | `CARGADOR CONTRACTUAL` | `deca-validate.test.ts` (missing name), `compliance.spec.ts` R-3 |
| a2 | NIF / identificador del cargador | `shipper.nif` (3–20, required; format = warning) | `#shipperNif` | `NIF DEL CARGADOR` | `deca-validate.test.ts`, `compliance.spec.ts` R-3 |
| a3 | **Domicilio del cargador** | `shipper.address` (4–300, required) | `#shipperAddress` | `DOMICILIO DEL CARGADOR` | `deca-validate.test.ts` (missing address) |
| a4 | Nombre / razón social del **transportista efectivo** | `carrier.name` (2–200, required) | `#carrierName` — "Transportista que realiza el transporte › Nombre o razón social" | `TRANSPORTISTA EFECTIVO` | `deca-validate.test.ts`, `compliance.spec.ts` R-3 |
| a5 | NIF / identificador del transportista | `carrier.nif` (3–20, required; format = warning) | `#carrierNif` | `NIF DEL TRANSPORTISTA` | `deca-validate.test.ts` foreign-NIF case, `crear.spec.ts` |
| a6 | **Domicilio del transportista** | `carrier.address` (4–300, required) | `#carrierAddress` | `DOMICILIO DEL TRANSPORTISTA` | `deca-validate.test.ts` (missing carrier address), `crear.spec.ts` review-summary assertion |
| b1 | Naturaleza de la mercancía | `goods` (2–300, required) | `#goods` — "Naturaleza de la mercancía" | `NATURALEZA DE LA MERCANCÍA` | `deca-validate.test.ts`, `compliance.spec.ts` R-3 |
| b2 | Peso o medida legalmente adecuada | `weight` (1–60, required, **verbatim** — rejects zero/placeholder) | `#weight` — "Peso (o medida alternativa)" | `PESO O MEDIDA` | `deca-validate.test.ts` "keeps the weight VERBATIM" + "rejects a meaningless weight" |
| c1 | Lugar de origen — **empresa/establecimiento + dirección completa** | `loadLocation` (`{name, address, postalCode, city, province, country}`, each field required) | `#loadLocationName/Address/PostalCode/City/Province/Country` — "Lugar de carga" | `LUGAR DE CARGA` (full formatted address via `formatLocationFull`) | `deca-validate.test.ts` (missing loadLocation subfields), `compliance.spec.ts` R-3 |
| c2 | Lugar de destino — **empresa/establecimiento + dirección completa** | `unloadLocation` (same shape, required) | `#unloadLocationName/Address/PostalCode/City/Province/Country` — "Lugar de descarga" | `LUGAR DE DESCARGA` (full formatted address) | `deca-validate.test.ts` (missing unloadLocation subfields), `compliance.spec.ts` R-3 |
| d1 | Fecha de carga | `loadDate` (`AAAA-MM-DD`, required) | `#loadDate` (`<input type=date>`) | `FECHA DE CARGA` + `serviceStart` column | `deca-validate.test.ts` malformed-date case |
| d2 | Fecha de descarga (no anterior a la de carga; mismo día permitido) | `unloadDate` (`AAAA-MM-DD`, required, `>= loadDate`) | `#unloadDate` (`<input type=date>`) | `FECHA DE DESCARGA` + `serviceEnd` column | `deca-validate.test.ts` "rejects an unload date before the load date (same day is allowed)" |
| e1 | Matrícula del vehículo / tractora | `tractorPlate` (normalised, 2–20, required) | `#tractorPlate` | `MATRÍCULA TRACTORA` | `deca-validate.test.ts` plate normalisation, `deca-pdf-logic.test.ts` |
| e2 | Matrícula del remolque / semirremolque (si procede) | `trailerPlate` (normalised, ≤20, **optional**) | `#trailerPlate` | `MATRÍCULA REMOLQUE` (— when absent) | `deca-validate.test.ts`, `build13.spec.ts` |
| — | Referencia / nº interno de transporte (conveniencia) | `reference` (≤120, optional) | `#reference` | not on the PDF | `crear.spec.ts` |

## Notes on legal fidelity

- **Both domicilios are required** (a3, a6). The v1 form previously omitted the
  carrier address; FIX #17 added it. Correcting a pre-#17 DeCA now prompts for the
  missing carrier address before a new compliant version can be generated.
- **Weight is never silently reformatted** (b2). `"12.500 kg"`, `"12,5 t"` and
  `"una plataforma completa (aprox. 24 t)"` all reach the PDF exactly as typed. A
  regex rejects only meaningless values (`0`, `0 kg`, `-`, `n/a`, `sin especificar`)
  so a real weight or a concrete alternative measure is always present.
- **Structured loading/unloading locations (#41).** The v1 form captured `origin`/
  `destination` as loose free-text strings. PRODUCT #41 replaced them with
  `loadLocation`/`unloadLocation`, each a required structured address (company/
  establishment name, full street address, postal code, city, province, country) —
  the legal minimum for a control document to identify WHERE the goods were loaded
  and unloaded, not just a place name. `lib/deca/location.ts` holds the shared
  schema and the two display formatters (`formatLocationShort` for tables/CSV/
  history, `formatLocationFull` for the review screen and the PDF).
- **Separate load and unload dates (#41).** `transportDate` (a single date) was
  replaced by `loadDate`/`unloadDate`. `unloadDate >= loadDate` is enforced by a
  zod `.refine()` on both the wizard's step-2 schema (immediate feedback) and the
  full `decaPayloadSchema` (server-side, so the rule can never be bypassed by a
  direct API call). Same-day loading/unloading is explicitly allowed (`>=`, not
  `>`). `loadDate` maps to `Deca.serviceStart` and `unloadDate` to `Deca.serviceEnd`
  at persistence (`lib/deca/persist.ts`) — `serviceEnd` was previously never
  populated, so this is also the first time the R-9 public-URL deactivation window
  (`lib/deca/deactivation.ts`, 7 days after service end) becomes active for new
  documents; existing pre-#41 documents keep `serviceEnd = null` and stay always
  available (`isPubliclyAvailable(null) === true`), so nothing already generated is
  retroactively deactivated.
- **Same typed schema for form and PDF.** `decaPayloadSchema` → `DecaPayload` is
  the single source; `toPayload()` in the wizard and the API route both feed
  `validateDeca()`, and `DecaDocument` renders from the same `DecaPayload`. There is
  no second, looser shape.
- **Review before generation.** The wizard's last step renders
  `<ReviewSummary>` (`data-testid="review-summary"`) with two dedicated blocks —
  "Lugar y fecha de carga" and "Lugar y fecha de descarga" — listing every
  assembled value so the operator confirms the exact final data before GENERAR
  DECA.
- **No signup before the first DeCA** — anonymous creation is unchanged (F1 / D-016).
- The digital native PDF, ≤5 MB, QR-with-unique-HTTPS-URL, direct download and
  timestamp requirements are covered by `docs/07-release.md` R-3…R-13 and
  `tests/e2e/compliance.spec.ts`.

## Deferred from #41 (recorded, not forgotten)

- **Passenger (`viajeros`) document schema** — #41 §4 explicitly requires mapping
  the exact mandatory passenger-transport data against the applicable regulation
  BEFORE building a schema/form/PDF ("Do not invent passenger fields by analogy
  with goods"). Not started this slice — see D-042.
- **Company/account default transport type** (`GOODS | PASSENGERS`) and the
  `/crear` first-time type picker — depend on the passenger schema existing.
- **Structured saved addresses.** `SavedAddress` (`{label, address}`) is unchanged;
  the wizard's saved-address autofill was already unused for the load/unload step
  before #41 (dead prop) and stays that way. Upgrading it to structured locations
  is its own slice (schema migration + autocomplete UI), tracked in D-042.
