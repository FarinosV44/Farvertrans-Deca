# Subscription / dunning / billing — data model design (#64)

> **Design only. Nothing here is built, wired, migrated or shipped.** Pricing,
> plans and checkout are forbidden for v1 (D-007 row 32, EPIC 01, the execution
> scope guard). This document exists so that a future paid tier — which the
> Terms already reserve the right to introduce (D-068: "no perpetual-free
> promise, future paid plans possible") — can be built **without reworking
> `User` or `Company`**. When it is greenlit, it gets its own Keel phase: a
> decision, a spec, a payment-provider choice, and its own build.

## 1. Where it attaches

`Company` is the tenant and the billing entity. `User` is a login within it;
`CompanyRole.owner` is already the billing-authorised role (the schema comment
on `CompanyRole` reserves "billing" as an owner-only capability — currently
unused). So every new model hangs off `Company` by `companyId`, `onDelete:
Cascade` — the exact shape `CommercialConsent` already uses.

`Company.email` (added D-104, "for invoicing/support contact") is the general
contact. Billing needs its **own** address — see `Subscription.billingEmail`
below — because the person who receives invoices is often not the person who
signed up.

## 2. Proposed Prisma models (paste-ready, NOT in schema.prisma yet)

```prisma
/// A company's subscription to a paid plan (#64 — design only).
model Subscription {
  id                String             @id @default(cuid())
  companyId         String             @unique @map("company_id")
  planKey           String             @map("plan_key")        // -> lib/billing/plans.ts
  status            SubscriptionStatus @default(trialing)
  /// Which price version the company agreed to (append-only history in
  /// `SubscriptionEvent`); mirrors the `TermsAcceptance.version` pattern.
  priceVersion      String             @map("price_version")
  billingEmail      String             @map("billing_email")
  currentPeriodEnd  DateTime?          @map("current_period_end")
  cancelAt          DateTime?          @map("cancel_at")
  canceledAt        DateTime?          @map("canceled_at")
  gracePeriodEnd    DateTime?          @map("grace_period_end")
  /// Opaque id from whichever payment provider is later chosen. Null until then.
  providerCustomerId String?           @map("provider_customer_id")
  createdAt         DateTime           @default(now()) @map("created_at")
  updatedAt         DateTime           @updatedAt @map("updated_at")

  company Company            @relation(fields: [companyId], references: [id], onDelete: Cascade)
  invoices Invoice[]
  events   SubscriptionEvent[]

  @@map("subscription")
}

enum SubscriptionStatus {
  trialing      // in a free trial
  active        // paid, current
  past_due      // a payment failed, inside the retry window
  grace         // retries exhausted, inside the courtesy period (still usable)
  suspended     // courtesy period over, access limited, data kept
  canceled      // ended by the customer or by us; data kept
  expired       // a fixed-term plan reached its end
}

/// Append-only audit of every subscription state change (#64).
model SubscriptionEvent {
  id             String   @id @default(cuid())
  subscriptionId String   @map("subscription_id")
  fromStatus     String?  @map("from_status")
  toStatus       String   @map("to_status")
  reason         String?
  actorId        String?  @map("actor_id")  // plain string, survives deletion, like SecurityAuditLog
  createdAt      DateTime @default(now()) @map("created_at")

  subscription Subscription @relation(fields: [subscriptionId], references: [id], onDelete: Cascade)

  @@index([subscriptionId])
  @@map("subscription_event")
}

/// An issued invoice (#64). Append-only — a correction is a new
/// `type = "rectificativa"` invoice that references the original.
model Invoice {
  id             String        @id @default(cuid())
  subscriptionId String        @map("subscription_id")
  /// Sequential fiscal number, per series, never reused. Assigned at issue time.
  number         String        @unique
  series         String        @default("A")
  type           String        @default("normal")   // normal | rectificativa
  correctsId     String?       @map("corrects_id")
  status         String        @default("issued")   // issued | paid | void | uncollectible
  currency       String        @default("EUR")
  subtotalCents  Int           @map("subtotal_cents")
  taxRate        Int           @map("tax_rate")      // basis points, e.g. 2100 = 21% IVA
  taxCents       Int           @map("tax_cents")
  totalCents     Int           @map("total_cents")
  issuedAt       DateTime      @map("issued_at")
  dueAt          DateTime      @map("due_at")
  /// A rendered PDF, stored like a DeCA PDF (immutable, its own key). Null
  /// until the invoice-rendering slice exists.
  pdfPath        String?       @map("pdf_path")
  pdfSha256      String?       @map("pdf_sha256")
  createdAt      DateTime      @default(now()) @map("created_at")

  subscription Subscription @relation(fields: [subscriptionId], references: [id], onDelete: Cascade)
  payments     Payment[]

  @@index([subscriptionId])
  @@map("invoice")
}

/// A payment attempt / receipt (#64). Append-only. NO card data ever — only
/// the provider's opaque reference.
model Payment {
  id              String   @id @default(cuid())
  invoiceId       String   @map("invoice_id")
  amountCents     Int      @map("amount_cents")
  currency        String   @default("EUR")
  status          String   // succeeded | failed | refunded
  providerRef     String?  @map("provider_ref")
  failureCode     String?  @map("failure_code")
  attemptedAt     DateTime @map("attempted_at")
  createdAt       DateTime @default(now()) @map("created_at")

  invoice Invoice @relation(fields: [invoiceId], references: [id], onDelete: Cascade)

  @@index([invoiceId])
  @@map("payment")
}
```

`Company` would gain: `subscription Subscription?` and nothing else.

## 3. State machine, retries, courtesy period

```
trialing ──(trial ends, payment ok)──▶ active
active ──(renewal payment fails)──▶ past_due
past_due ──(retry succeeds)──▶ active
past_due ──(retries exhausted: 3 attempts over ~7 days)──▶ grace
grace ──(payment succeeds)──▶ active
grace ──(courtesy period ends, ~7 more days, still fully usable)──▶ suspended
suspended ──(payment succeeds)──▶ active
active / past_due / grace ──(customer cancels)──▶ cancel scheduled at currentPeriodEnd ──▶ canceled
```

- **Retries:** 3 attempts, roughly day 1 / day 3 / day 7 after the failed renewal.
- **Courtesy period (`grace`):** ~7 days after retries are exhausted, the
  company keeps **full** access. This is `gracePeriodEnd`.
- **`suspended`:** access to *new* DeCA creation is limited; existing documents
  and `/d/[token]` are **never** affected (same rule as #62 — the legal
  document trail is untouchable, D-067).
- Every transition writes a `SubscriptionEvent` and notifies the billing email
  before a downgrade (`past_due` → warn; `grace` → warn; `suspended` → notify).
- The superadmin (`/admin`) can read every subscription and force an
  exceptional transition (e.g. re-activate after a manual bank transfer),
  audited via `SubscriptionEvent.actorId` + `SecurityAuditLog`.

## 4. Invoicing, tax, corrections, retention

- **Numbering:** sequential per `series`, assigned at issue, never reused; a
  gap is a defect. A `rectificativa` is a new invoice of `type` referencing
  `correctsId` — the original is never edited (append-only, like
  `deca_version`).
- **Tax:** `taxRate` in basis points on the invoice (IVA 21% today); stored on
  the row so a later rate change does not rewrite history.
- **Retention:** invoices kept indefinitely (fiscal obligation ≥ the DeCA
  retention). The rendered PDF stored immutably with its own `pdfSha256`,
  exactly like a DeCA PDF.
- **Delivery:** emailed to `Subscription.billingEmail`; downloadable from
  `/panel` (a future "Facturación" section, owner-only).

## 5. Permissions, audit, data protection

- All billing reads/writes are **owner-only** (`CompanyRole.owner`), enforced
  server-side.
- `SubscriptionEvent` + `SecurityAuditLog` record every state change with the
  actor.
- Billing data is **personal + financial** data → `docs/threat-model.md` gains
  a row; the RGPD controller/processor split already anticipates "billing
  data" (privacidad page, D area). **No card data is ever stored** — only the
  payment provider's opaque references. A provider is chosen in its own
  decision (Redsys / Stripe / GoCardless / …) — not here.

## 6. Plans

Kept as a TS constant, not a DB catalogue — `lib/billing/plans.ts`. A price
change is a new `priceVersion` string + a code deploy, recorded like
`TermsAcceptance.version`. The v1 "free during launch" everyone is on is
represented by the absence of a `Subscription` row (or a `planKey: "launch"`,
`status: active`, `currentPeriodEnd: null` row) — TBD when the feature is built.

## 7. Why this does not need `User` / `Company` rework later

- The tenant (`Company`) and the billing-authorised role (`owner`) already
  exist.
- Every new table hangs off `companyId` — additive, `onDelete: Cascade`.
- `Company` gains exactly one optional relation (`subscription`).
- The "free during launch" state is the *absence* of a paid subscription, so
  existing companies need no migration of data, only the new (empty) tables.

## Acceptance criteria (from the issue) — status

- [x] Data-model + states proposal — §2, §3
- [x] Transitions, retries, courtesy period — §3
- [x] General contact vs billing email separated — §1, §2 (`billingEmail`)
- [x] Numbering, tax, rectificativas, invoice retention — §4
- [x] Permissions, audit, data protection documented — §5
- [x] Ready for later implementation, production not activated — this whole
      document; no schema change, no migration, no UI
