# Flow — commercial treatment ("Tratamiento comercial", #84)

An optional, granular, revocable, audited authorisation that lets a transportista
share a small **availability record** with "cargadores interesados en ofrecer una
propuesta comercial personalizada y preferente de carga". Evolves DATA #45's
company-level boolean (D-048).

**No recipient side exists yet** (`lib/admin/route-intelligence.ts`: "Nothing
here is used for commercial matching yet"). This flow stops at *preparing* a
`DecaAvailabilityShare` (status `pending`); actual transmission is a future
issue. Free use of the product is never conditioned on any of this.

## The three modes (`CommercialConsent.mode`)

| mode | meaning | per-DeCA control default |
|---|---|---|
| `none` | never share; the wizard block is absent | — (hidden) |
| `per_deca` | decide on each DeCA | **off** |
| `all` | share on every DeCA unless disabled for that porte | **on** |

`none` is the default for every company (the #84 migration reset all existing
`granted:true` rows to `none` — the new legal text is materially different).

## Where it is set

- **Registration** — a small, unchecked, one-line checkbox (`commercial-opt-in`)
  low in the sign-up form. Ticking it → `setCommercialMode(companyId, "all")` +
  `setCommercialChannel(companyId, {channel:"email", contactEmail: companyEmail})`
  after signup (`app/api/auth/register/route.ts`). Never required, never blocks,
  absent for team joins.
- **`/panel/privacidad`** (`app/panel/privacidad/page.tsx` +
  `components/app/commercial-treatment-settings.tsx`) — the full control: three
  mode radios, channel (`email`/`phone`/`both`; the `phone` value is shown to
  users as "WhatsApp" since #85 — the stored enum is unchanged) + the contact
  value, an exact
  "datos que se compartirán" preview (`sharedFieldKeys()`), the acceptance date,
  a "Más información" disclosure, and a "Retirar autorización" button. Owner-only
  editable; members read-only. → `POST /api/company/consent`
  (`{mode}` | `{channel,contactEmail?,contactPhone?}` | `{action:"revoke"}`).
- **Per-DeCA** — a compact `<fieldset data-testid="commercial-share">` in the
  wizard's last step, shown only when `authed && !isCorrection && company &&
  mode !== "none"`. Rides as a **separate `commercialShare` body key** on
  `POST /api/deca` — never merged into `validated`/`data_json`.

## What is shared vs. never shared

`buildAvailabilityPayload()` (`lib/commercial/availability.ts`) is the single
place that decides. It returns exhaustively `{ carrierName, destination,
availabilityDate, channel, contactEmail?, contactPhone? }`.

**Never shared** (the `deca_availability_share` table has no column for them):
origin, cargador identity/contact, load address, goods/quantity/weight, price,
plates, driver, public token, document URL, QR, other portes' history. Enforced
structurally + by `commercial-availability.test.ts` + e2e case 8.

## Recording & revocation

- Every change and every prepared/withdrawn record → an append-only
  `CommercialConsentEvent` (`recordCommercialEvent()`), carrying the modalidad,
  decaId, channel, the accepted `legalVersion`, and a `detail` snapshot.
- `recordAvailabilityShare()` runs **best-effort after** the DeCA is persisted
  (like `recordRouteIntel`) and **re-reads the live preference** — a global
  revocation between choosing and generating is honoured.
- `withdrawAvailabilityShare()` (`POST /api/deca/[id]/availability`,
  `{action:"withdraw"}`, owner-only) flips the record's status. Never deletes,
  never touches the DeCA. Surfaced on the DeCA detail page
  (`<AvailabilityNotice>`).
- Global revocation is immediate for future portes; it does not alter any DeCA
  or any communication already made lawfully.

## Legal text

`app/privacidad/page.tsx` + `app/terminos/page.tsx` carry the versioned sections
(finalidad, base jurídica, categorías de destinatarios, datos comunicados, datos
excluidos, modalidades, revocación, registro). `LEGAL_ENTITY.termsVersion` and
`COMMERCIAL_CONSENT_VERSION` are both `2026-09-15`. The sections are marked
`LEGAL REVIEW PENDING` — this feature does not merge to `main` before sign-off.

## Admin

`/admin/tratamiento-comercial` — read-only: mode split, prepared availability
records, consent-event trail. `lib/admin/route-intelligence.ts` now gates on
`mode != "none"` instead of `granted:true`.
