# Competitive landscape — Farvertrans DeCA

> Scan date: 2026-09-03. Category: DeCA (Documento electrónico de Control Administrativo) generators for
> Spanish road-freight transport, mandatory from 2026-10-05. Scan status: **done** (partial on some free-tier
> details — see per-competitor "not determined" notes).

## Regulatory baseline (drives EPIC 04 — the real product core)

Source: [Resolución de 5 de junio de 2026, BOE-A-2026-12784](https://www.boe.es/buscar/act.php?id=BOE-A-2026-12784),
[Ministerio de Transportes — DeCA](https://www.transportes.gob.es/transporte-terrestre/profesionales-transporte/servicios-transportista/documento-electronico-control-administrativo-deca),
[CETM — requisitos del DeCA](https://www.cetm.es/asi-son-los-requisitos-que-debe-cumplir-el-documento-electronico-de-control-administrativo-deca/),
[Orden FOM/2861/2012, art. 6](https://www.boe.es/buscar/act.php?id=BOE-A-2013-154).

| # | Requirement | Detail |
|---|---|---|
| R-1 | Mandatory date | 2026-10-05 for interior (national) transport. No paper accepted, no transitional period. |
| R-2 | Data fields (freight) | Art. 6 Orden FOM/2861/2012 minimum: contractual shipper (name/razón social, NIF, address); effective carrier (name/razón social, NIF); origin and destination of the shipment; nature and weight of goods (or alternative measure where exact weight is impractical); date of transport; vehicle plate(s) — tractor + trailer/semi-trailer if articulated. |
| R-3 | Format | PDF, **native digital** (structured data → legible text). Scans / digitised images explicitly **invalid**. |
| R-4 | Max size | ≤ 5 MB. |
| R-5 | QR | PDF must embed a QR containing the document's unique specific URL. QR may also exist standalone. |
| R-6 | URL — protocol | HTTPS, TLS 1.2 or higher. |
| R-7 | URL — no auth | URL must not lead to a page requiring credentials or authentication. |
| R-8 | URL — direct download | No download buttons or other elements requiring manual interaction. The URL downloads the PDF directly. |
| R-9 | Availability | Accessible throughout the service; may be deactivated 7 natural days after the service ends. |
| R-10 | Retention | Kept **at least 1 year** by both the contractual shipper and the effective carrier. |
| R-11 | Metadata / audit | Record creation date & time and any modification — audit trail of changes. |
| R-12 | Driver copy | Before the effective start of the service: electronic copy viewable on a mobile device, or printed copy — always with the QR. |
| R-13 | Modifications | Either update the existing PDF keeping the same URL, or generate a new file (new URL/QR); the original is retained for traceability. |

## Per-competitor inventory

### DecaDoc — https://decadoc.es
- Type: web SaaS, no install. License/pricing: freemium.
- Status: active (2026).
- Free plan: **50 DeCA/month**, 12-month history, no card, no trial limit. Also a "probar sin registro" mode up to **20 DeCA/month** without an account.
- Paid: from €5/month (more capacity, multi-user, templates, bulk import, API).
- Functionalities: native PDF + embedded metadata; QR → direct HTTPS URL; traceable versions (correct data, keep history); saved frequent companies/vehicles/addresses; share by link; driver keeps digital or printed copy.
- CTA: "Crear mi DeCA gratis", "Empezar gratis".
- Source: [decadoc.es/generador-deca](https://decadoc.es/generador-deca/).

### DeCAtrans — https://decatransporte.com
- Type: web SaaS. Pricing: multiple plans, several requiring sales contact.
- Status: active.
- Functionalities: 3-step flow (enter data → generate verifiable PDF with QR → save history); accessible from any device en route or at inspection; normative explanation content.
- Weakness (per EPIC 01): several plans gated behind "Solicitar información"; multiple plans/prices add decision friction; product cannot be experienced immediately.
- Source: [decatransporte.com](https://decatransporte.com/), [decatransporte.com/deca](https://decatransporte.com/deca/).

### Control Digital Transporte (DCDT) — https://www.controldigitaltransporte.es
- Type: cloud SaaS. Pricing: **prepaid bundles, no subscription** — €0.10–€0.25/document, min 60 docs (€15 +VAT), 24-month validity.
- Status: active.
- Functionalities: PDF + QR; HTTPS verification URL; version control (vehicle swaps, route changes, incidents); 24-month archive; driver mobile access; change traceability. Optional WhatsApp delivery (€0.06/template msg).
- Note: no free tier — pay per document from doc 1.
- Source: [controldigitaltransporte.es](https://www.controldigitaltransporte.es/).

### Pretium Gestión — https://pretiumgestion.com
- Type: cloud SaaS for transport companies, logistics operators, loaders.
- Status: active.
- Functionalities: generate, manage and conserve DeCA; regulatory compliance; cloud storage.
- Free-tier / pricing: not determined.
- Source: [pretiumgestion.com/documento-control-digital](https://pretiumgestion.com/documento-control-digital/).

### Other named / adjacent players
- **Surtia** — DeCA inside a larger suite; 2-month trial + prior onboarding/verification. More than needed for someone who only wants DeCA compliance. (per EPIC 01; site not re-fetched.)
- **Truckio** — reportedly already offers "DeCA gratis" plus agenda/reuse. Free-tier limits: not determined (search inconclusive).
- **DecaHub** — reportedly limits its free plan. Details: not determined (search returned an unrelated VR product; needs manual confirmation).
- **Radius / Movertis** — B2B fleet/telematics with strong lead capture, form + quote + assisted sale oriented. Not DeCA-first.
- **TrazaQR, decadoc, documentodeca.es, controldeca.com, decadoc.es, programadetransporte.es, bluecmr.com, dashdoc, docuten** — additional DeCA or transport-doc tools in the same SERP; not individually inventoried. Signal: the "DeCA" SERP is already crowded.
- **CETM, Develoop, Tandem HSE, AECOC, camionactualidad** — informational content about the norm (not tools). These are the SEO competitors for EPIC 03.

## Unified feature list (category baseline — what users already take for granted)

| Feature | Who has it |
|---|---|
| 3-step guided DeCA creation | DecaDoc, DeCAtrans, DCDT |
| Native PDF (not scan) with metadata | DecaDoc, DCDT, DeCAtrans (compliance-forced) |
| QR embedded in PDF → unique HTTPS URL | all |
| Direct no-auth PDF download from URL | all (compliance-forced) |
| Document history / archive (12–24 months) | DecaDoc (12m), DCDT (24m), DeCAtrans |
| Traceable versions / change log on correction | DecaDoc, DCDT |
| Saved frequent data (companies, vehicles, addresses) | DecaDoc |
| Duplicate / reuse a previous DeCA | DecaDoc, Truckio (reported) |
| Share with driver by link | DecaDoc, DeCAtrans, DCDT |
| WhatsApp delivery to driver | DCDT (paid add-on), Truckio (reported) |
| Works on mobile / tablet / desktop, no install | all |
| Free tier | DecaDoc (50/mo + 20/mo no-signup), Truckio (reported), DecaHub (limited) |
| Try without registration | DecaDoc (20/mo) |
| Multi-user / team accounts | DecaDoc (paid), DCDT |
| API for integration | DecaDoc (paid) |
| Bulk import / templates | DecaDoc (paid) |
| Regulatory explainer content on-site | DeCAtrans, CETM, Develoop, Tandem, AECOC |

## External-demand list (what users ask for that is NOT standard)

Grounded evidence is thin from search alone (forums/reviews for this niche are sparse — the mandate is recent). Recorded honestly:

| Demand | Source / evidence | Confidence |
|---|---|---|
| Truly **unlimited** free generation (not 50/mo caps) | Implied by EPIC 01's own market read; DecaDoc/DecaHub cap free tiers | low — needs validation |
| **Instant use with zero signup** for the first document | DecaDoc partially offers this (20/mo no-signup); friction complaint pattern is common in this SaaS category | medium |
| One-tap driver delivery (WhatsApp/SMS) included, not paid add-on | DCDT charges for it | low–medium |
| Clear "am I obligated?" guidance tied to the tool | CETM/Develoop pages are informational only, no tool; EPIC 03 thesis | medium |
| Fast correction → new compliant version without re-typing | DecaDoc/DCDT have versions but re-entry friction cited in EPIC 04 | low |
| No pricing/checkout wall while learning the product | EPIC 01 competitive read of DeCAtrans/Surtia | medium |

> "no competitors found" does NOT apply — the niche is already competitive, including at least one free offering. "Gratis" alone is not a differentiator (EPIC 01 acknowledges this).
