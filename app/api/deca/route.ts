import { NextResponse } from "next/server";
import { validateDeca, DecaValidationError } from "@/lib/deca/validate";
import { LEAD_COOKIE, leadSchema } from "@/lib/deca/lead";
import { resolveShipments } from "@/lib/deca/schema";

export const runtime = "nodejs";

/**
 * Create a DeCA (F1). Validates the payload against R-2, persists the document
 * and its first version, and returns the ids + public token.
 *
 * D-060 (owner directive, reversing part of D-052/PRIORITY 1): an anonymous
 * visitor may generate ONE DeCA by giving just a name + email (lead capture,
 * `lib/deca/lead.ts`) — no account required. A SECOND anonymous document is
 * not allowed, but that is enforced at the page level (`app/crear/page.tsx`,
 * the `fvd_lead` cookie), never here: this route is also the abuse-control
 * tests' entry point for creating several anonymous documents from one
 * context on purpose, so it captures the lead opportunistically and never
 * hard-requires it.
 *
 * An AUTHENTICATED caller still needs a verified email (D-053) before
 * generation — that gate is unchanged and independent of the anonymous lead
 * path. Enforced here server-side either way, never trusting the client-side
 * UI gate alone (security.md).
 *
 * Fails closed: any validation, persistence or (BUILD 08) render/storage failure
 * returns an error and creates nothing usable.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: { code: "bad_request", message: "Cuerpo de la petición no válido." } },
      { status: 400 },
    );
  }

  const { getCurrentUser } = await import("@/lib/auth");
  const user = await getCurrentUser();

  let owner: { createdByUserId: string; companyId: string } | undefined;
  let lead: { leadName: string; leadEmail: string } | undefined;

  if (user?.companyId) {
    // D-053: authenticated is not enough — the email must be verified, checked
    // fresh from the database (never a session/cookie claim) on every call.
    if (!user.emailVerifiedAt) {
      return NextResponse.json(
        {
          error: {
            code: "email_not_verified",
            message: "Verifica tu correo electrónico para generar el DeCA.",
          },
        },
        { status: 403 },
      );
    }
    // PRODUCT #56: a read_only (Auditor) member can view but never create.
    if (user.companyRole === "read_only") {
      return NextResponse.json(
        {
          error: {
            code: "forbidden",
            message: "Tu rol es de solo lectura y no puede generar documentos.",
          },
        },
        { status: 403 },
      );
    }
    // #59 soft gate: a company registered before the full-ficha requirement
    // must complete its data before creating a new DeCA. Login and existing
    // documents are never blocked — only new generation. Lenient on the
    // CIF/NIF checksum (the owner cannot edit it — the superadmin does, #62).
    const { companyDataComplete, missingCompanyFields, describeMissingFields } = await import(
      "@/lib/company/completeness"
    );
    if (!companyDataComplete(user.company, false)) {
      const missing = describeMissingFields(missingCompanyFields(user.company, false));
      return NextResponse.json(
        {
          error: {
            code: "company_data_incomplete",
            message: `Completa los datos de tu empresa antes de generar un DeCA. Falta o no es válido: ${missing}.`,
          },
        },
        { status: 409 },
      );
    }
    owner = { createdByUserId: user.id, companyId: user.companyId };
  } else {
    const leadParsed = leadSchema.safeParse(body);
    if (leadParsed.success) lead = leadParsed.data;
  }

  let validated;
  try {
    validated = validateDeca(body);
  } catch (e) {
    if (e instanceof DecaValidationError) {
      return NextResponse.json(
        { error: { code: "validation", message: e.message, fields: e.fieldErrors } },
        { status: 422 },
      );
    }
    const { recordGenerationFailure } = await import("@/lib/deca/failures");
    const recorded = await recordGenerationFailure(e, {
      route: "POST /api/deca (validation)",
      authenticated: !!owner,
      companyId: owner?.companyId,
    });
    return NextResponse.json(
      {
        error: {
          code: "generation_failed",
          message: recorded.message,
          correlationId: recorded.correlationId,
          retryable: true,
        },
      },
      { status: 500 },
    );
  }

  const idempotencyKey = req.headers.get("idempotency-key") ?? undefined;

  try {
    // An idempotent replay (the wizard retries a failed generation with the SAME
    // key, D-029) must never be rate-limited: it creates nothing, it only returns
    // the document that already exists.
    let idempotentReplay = false;
    if (idempotencyKey) {
      const { prisma } = await import("@/lib/prisma");
      idempotentReplay = !!(await prisma.deca.findUnique({
        where: { idempotencyKey },
        select: { id: true },
      }));
    }

    // Abuse controls apply to ANONYMOUS creation only — a signed-in company is
    // already accountable.
    if (!owner && !idempotentReplay) {
      const { checkAbuse } = await import("@/lib/abuse");
      const { abuseResponse } = await import("@/lib/abuse/response");
      const decision = await checkAbuse("anon_create", req.headers, {
        fingerprint: req.headers.get("x-fvd-fp"),
        challengeToken: req.headers.get("x-fvd-challenge"),
      });
      const blocked = abuseResponse(decision);
      if (blocked) return blocked;
    }

    const { createDeca } = await import("@/lib/deca/persist");
    const created = await createDeca(validated, {
      idempotencyKey,
      ...owner,
      creatorName: lead?.leadName,
      creatorEmail: lead?.leadEmail,
    });

    // WORKSPACE #24: bump "last used" on whichever saved records populated
    // this DeCA. Only meaningful for an authenticated company — anonymous
    // creation has no saved records to touch.
    if (owner) {
      const usedSaved = (body as { usedSaved?: unknown } | null)?.usedSaved;
      if (usedSaved && typeof usedSaved === "object") {
        const u = usedSaved as Record<string, unknown>;
        const asId = (v: unknown) => (typeof v === "string" && v ? v : undefined);
        const asIdList = (v: unknown) =>
          Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && !!x) : [];
        const companyIds = [asId(u.shipperId), asId(u.carrierId)].filter((v): v is string => !!v);
        // #113: `extraLocationIds` covers envíos beyond the first, which
        // `loadLocationId`/`unloadLocationId` (shipment 1 only) don't reach.
        const locationIds = [
          asId(u.loadLocationId),
          asId(u.unloadLocationId),
          ...asIdList(u.extraLocationIds),
        ].filter((v): v is string => !!v);
        const { touchSavedUsage } = await import("@/lib/data/saved");
        touchSavedUsage(owner.companyId, {
          companyIds,
          vehicleId: asId(u.vehicleId),
          locationIds,
        }).catch(() => {
          // never block or fail generation over a "last used" bookkeeping hiccup
        });
        const shipmentIds = asIdList(u.shipmentIds);
        if (shipmentIds.length) {
          const { touchSavedShipmentUsage } = await import("@/lib/data/saved-shipments");
          touchSavedShipmentUsage(owner.companyId, shipmentIds).catch(() => {
            // never block or fail generation over a "last used" bookkeeping hiccup
          });
        }
      }

      // #84: per-DeCA commercial-share opt-in. A SEPARATE top-level key, never
      // part of `validated`/`data_json`. `recordAvailabilityShare` re-checks the
      // company's live preference and writes ONLY the authorised fields.
      // #119: `DecaFacts` now carries EVERY shipment's resolved unload side, so
      // a multi-envío DeCA (#112) can name which one is the "descarga final"
      // for availability purposes via `finalShipmentIndex` — never altering
      // the DeCA's own shipment numbering or legal order.
      const cs = (body as { commercialShare?: unknown } | null)?.commercialShare;
      if (cs && typeof cs === "object") {
        const c = cs as Record<string, unknown>;
        const s = (v: unknown) => (typeof v === "string" && v ? v : undefined);
        const n = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : undefined);
        const ch = s(c.channel);
        const vt = s(c.vehicleType);
        const { recordAvailabilityShare } = await import("@/lib/commercial/availability");
        const { isVehicleType } = await import("@/lib/commercial/types");
        recordAvailabilityShare(
          created.decaId,
          owner.companyId,
          {
            carrier: validated.data.carrier,
            shipments: resolveShipments(validated.data).map((sh) => ({
              unloadLocation: sh.unloadLocation,
              unloadDate: sh.unloadDate,
            })),
          },
          {
            enabled: c.enabled === true,
            destination: s(c.destination),
            availabilityDate: s(c.availabilityDate),
            channel: ch === "email" || ch === "phone" || ch === "both" ? ch : undefined,
            preferredDestination: s(c.preferredDestination),
            capacityMode: c.capacityMode === "partial" ? "partial" : undefined,
            linearMeters: n(c.linearMeters),
            maxWeightKg: n(c.maxWeightKg),
            vehicleType: isVehicleType(vt) ? vt : undefined,
            vehicleTypeOther: s(c.vehicleTypeOther),
            availabilityPostalCode: s(c.availabilityPostalCode),
            preferredDestinationPostalCode: s(c.preferredDestinationPostalCode),
            finalShipmentIndex: n(c.finalShipmentIndex),
          },
        ).catch(() => {
          // best-effort — never blocks generation
        });
      }
    }

    const res = NextResponse.json(
      {
        decaId: created.decaId,
        token: created.token,
        pdfSha256: created.pdfSha256,
        firstForCompany: created.firstForCompany,
        claimToken: created.claimToken || undefined,
        claimExpiresAt: created.claimToken ? created.claimExpiresAt.toISOString() : undefined,
        warnings: validated.warnings,
      },
      { status: 201 },
    );

    if (lead) {
      // TRUST #42 §4: marks this browser as having used its one lead-gated
      // document — `/crear`'s page-level gate reads this to require a full
      // account for the next one.
      res.cookies.set(LEAD_COOKIE, "1", {
        httpOnly: false,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
      });
      // Best-effort: the lead's email doubles as their claim/verification link.
      try {
        const { publicEnv } = await import("@/lib/env");
        const { BRAND } = await import("@/lib/brand");
        const { sendMail } = await import("@/lib/mailer");
        const { renderTransactionalHtml } = await import("@/lib/email-template");
        const publicUrl = `${publicEnv.baseUrl.replace(/\/$/, "")}/d/${created.token}`;
        const claimUrl = `${publicEnv.baseUrl.replace(/\/$/, "")}/registro?claim=${encodeURIComponent(created.claimToken)}`;
        const text = `Hola ${lead.leadName},\n\nTu Documento Electrónico de Control ya está generado:\n${publicUrl}\n\nCrea una cuenta para guardarlo, reutilizar tus datos y hacer el siguiente mucho más rápido:\n${claimUrl}\n\nEste enlace caduca en 30 días.`;
        await sendMail({
          to: lead.leadEmail,
          subject: `Tu DeCA está listo — ${BRAND.name}`,
          text,
          html: renderTransactionalHtml({ text, link: publicUrl, ctaLabel: "Ver mi DeCA" }),
        });
      } catch {
        // never block generation on a mail-provider hiccup
      }
    }

    return res;
  } catch (e) {
    // Stage-aware failure (#29): the client gets a calm message plus a short
    // correlation code; the stage itself is exposed only when FVD_DEBUG is on.
    const { recordGenerationFailure } = await import("@/lib/deca/failures");
    const recorded = await recordGenerationFailure(e, {
      route: "POST /api/deca",
      authenticated: !!owner,
      companyId: owner?.companyId,
    });
    return NextResponse.json(
      {
        error: {
          code: "generation_failed",
          message: recorded.message,
          correlationId: recorded.correlationId,
          retryable: true,
          ...(process.env.FVD_DEBUG === "1" ? { stage: recorded.stage } : {}),
        },
      },
      { status: 500 },
    );
  }
}
