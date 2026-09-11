import { test, expect } from "@playwright/test";

/**
 * D-203 — LIVE INCIDENT root cause: the registration button gave so little
 * immediate feedback that users double-submitted, and `signup()`'s duplicate
 * check (`prisma.user.findFirst`) was a TOCTOU race — two near-simultaneous
 * requests for the same email could both pass it before either transaction
 * committed, each creating its own user + company. Fixed at the DB level
 * (`User.email @unique`) with the race translated into the same honest
 * `email_taken` 409 the slower fast-path check already returns.
 *
 * This fires two real concurrent requests at the endpoint — the only way to
 * actually exercise the race, as opposed to the sequential retry covered by
 * the idempotency-key test in `reliability.spec.ts`.
 */
test.describe("D-203 — concurrent registration cannot create duplicate accounts/companies", () => {
  test("two simultaneous requests for the same email: exactly one succeeds, the other gets a clean 409", async ({
    request,
  }) => {
    const email = `race${Date.now()}${Math.floor(Math.random() * 1e5)}@example.com`;
    const payload = {
      email,
      password: "Supersecret123!",
      companyName: "Race Condition SL",
      companyNif: "B12345674",
      companyContactName: "Ana Ejemplo",
      companyPhone: "600111222",
      companyEmail: "empresa@example.com",
      companyAddress: "Calle Prueba 1",
      companyPostalCode: "46540",
      companyCity: "El Puig",
      acceptTerms: true,
    };

    const [a, b] = await Promise.all([
      request.post("/api/auth/register", { data: payload }),
      request.post("/api/auth/register", { data: payload }),
    ]);

    const statuses = [a.status(), b.status()].sort();
    // Never both succeed (duplicate account+company) and never a raw 500 —
    // exactly one 201 and one clean, typed 409 email_taken.
    expect(statuses).toEqual([201, 409]);

    const loser = a.status() === 409 ? a : b;
    const loserBody = await loser.json();
    expect(loserBody.error.code).toBe("email_taken");
  });
});
