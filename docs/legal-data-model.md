# DeCA legal data model — requirement → field → PDF → test

Implementation evidence for FIX #17. Maps every mandatory data element of the DeCA
to the exact code that produces and validates it. **Legal basis:** Art. 6 Orden
FOM/2861/2012 (documento de control en el transporte público de mercancías por
carretera) as carried forward by the 2026 DeCA regime (BOE-A-2026-12784 +
Resolución 5 jun 2026). Foreign-operator identifiers are accepted (warned, never
blocked).

| # | Legal requirement (Art. 6.1) | zod field (`lib/deca/schema.ts`) | Form field (`components/deca/wizard.tsx`) | PDF location (`lib/pdf/deca-document.tsx`) | Test |
|---|---|---|---|---|---|
| a1 | Nombre / razón social del **cargador contractual** | `shipper.name` (2–200, required) | `#shipperName` — "Cargador contractual › Nombre o razón social" | `CARGADOR CONTRACTUAL` | `deca-validate.test.ts` (missing name), `compliance.spec.ts` R-3 |
| a2 | NIF / identificador del cargador | `shipper.nif` (3–20, required; format = warning) | `#shipperNif` | `NIF DEL CARGADOR` | `deca-validate.test.ts`, `compliance.spec.ts` R-3 |
| a3 | **Domicilio del cargador** | `shipper.address` (4–300, required) | `#shipperAddress` | `DOMICILIO DEL CARGADOR` | `deca-validate.test.ts` (missing address) |
| a4 | Nombre / razón social del **transportista efectivo** | `carrier.name` (2–200, required) | `#carrierName` — "Transportista efectivo › Nombre o razón social" | `TRANSPORTISTA EFECTIVO` | `deca-validate.test.ts`, `compliance.spec.ts` R-3 |
| a5 | NIF / identificador del transportista | `carrier.nif` (3–20, required; format = warning) | `#carrierNif` | `NIF DEL TRANSPORTISTA` | `deca-validate.test.ts` foreign-NIF case, `crear.spec.ts` |
| a6 | **Domicilio del transportista** | `carrier.address` (4–300, required) | `#carrierAddress` | `DOMICILIO DEL TRANSPORTISTA` | `deca-validate.test.ts` (missing carrier address), `crear.spec.ts` review-summary assertion |
| b1 | Naturaleza de la mercancía | `goods` (2–300, required) | `#goods` — "Naturaleza de la mercancía" | `NATURALEZA DE LA MERCANCÍA` | `deca-validate.test.ts`, `compliance.spec.ts` R-3 |
| b2 | Peso o medida legalmente adecuada | `weight` (1–60, required, **verbatim** — rejects zero/placeholder) | `#weight` — "Peso (o medida alternativa)" | `PESO O MEDIDA` | `deca-validate.test.ts` "keeps the weight VERBATIM" + "rejects a meaningless weight" |
| c1 | Lugar de origen | `origin` (2–200, required) | `#origin` | `ORIGEN` | `deca-validate.test.ts`, `compliance.spec.ts` R-3 |
| c2 | Lugar de destino | `destination` (2–200, required) | `#destination` | `DESTINO` | `deca-validate.test.ts`, `compliance.spec.ts` R-3 |
| d | Fecha de realización del transporte | `transportDate` (`AAAA-MM-DD`, required) | `#transportDate` (`<input type=date>`) | `FECHA DEL TRANSPORTE` + `serviceStart` column | `deca-validate.test.ts` malformed-date case |
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
- **Same typed schema for form and PDF.** `decaPayloadSchema` → `DecaPayload` is
  the single source; `toPayload()` in the wizard and the API route both feed
  `validateDeca()`, and `DecaDocument` renders from the same `DecaPayload`. There is
  no second, looser shape.
- **Review before generation.** The wizard's last step renders
  `<ReviewSummary>` (`data-testid="review-summary"`) listing every assembled value
  so the operator confirms the exact final data before `GENERAR DECA`.
- **No signup before the first DeCA** — anonymous creation is unchanged (F1 / D-016).
- The digital native PDF, ≤5 MB, QR-with-unique-HTTPS-URL, direct download and
  timestamp requirements are covered by `docs/07-release.md` R-3…R-13 and
  `tests/e2e/compliance.spec.ts`.
