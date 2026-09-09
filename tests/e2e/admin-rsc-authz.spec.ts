import { test, expect, type APIRequestContext } from "@playwright/test";
import { loginAdminApi } from "./helpers/admin-auth";

/**
 * SECURITY #94 — the internal area must be closed by default to every caller
 * that is not an authenticated internal user, on EVERY transport, not only on
 * a plain browser navigation.
 *
 * The bug this suite reproduces: every page under `app/admin/(protected)/`
 * relied solely on the parent layout's `requireInternal()`. In the App Router
 * the layout and the page render in PARALLEL, so the page segment's Flight
 * payload was streamed to the client even when the layout aborted with
 * `notFound()`. A single `RSC: 1` header therefore returned the whole
 * server-rendered internal payload — companies, users, NIFs, DeCA, acquisition
 * — to an ANONYMOUS caller, while `page.goto()` correctly answered 404 and the
 * existing admin tests stayed green.
 *
 * The contract asserted here is about the BYTES that leave the server, because
 * that is what actually leaked: an unauthorised caller receives none of the
 * page's data and none of the page's own chrome, whatever status code the
 * Flight response happens to carry. `/operadores` and `/panel/*` — which have
 * always called their guard inside the page — are the reference behaviour.
 */

/** Every route under the `(protected)` group, with the heading only its own page renders. */
const PROTECTED: { path: string; heading: string }[] = [
  { path: "/admin", heading: "Resumen" },
  { path: "/admin/activacion", heading: "Activación" },
  { path: "/admin/alertas-comerciales", heading: "Alertas comerciales" },
  { path: "/admin/auditoria", heading: "Auditoría de seguridad" },
  { path: "/admin/captacion", heading: "Captación" },
  { path: "/admin/comercial", heading: "Panel comercial" },
  { path: "/admin/contenido", heading: "Contenido" },
  { path: "/admin/contenido/nuevo", heading: "Nuevo contenido" },
  // Not the bare title "DeCA" — that is the product's own name and appears in
  // the public 404 chrome, so it cannot discriminate. The lead text can.
  { path: "/admin/deca", heading: "Todos los documentos generados, de cualquier empresa" },
  { path: "/admin/empresas", heading: "Empresas" },
  { path: "/admin/errores", heading: "Errores de generación" },
  { path: "/admin/integraciones", heading: "Integraciones" },
  { path: "/admin/inteligencia-rutas", heading: "Inteligencia de rutas" },
  { path: "/admin/operadores", heading: "Operadores" },
  { path: "/admin/oportunidades", heading: "Oportunidades" },
  // "Seguridad" alone also appears in the public chrome — use the lead text.
  { path: "/admin/seguridad", heading: "Claves de acceso, verificación en dos pasos" },
  { path: "/admin/sistema", heading: "Sistema" },
  { path: "/admin/soporte", heading: "Soporte / Incidencias" },
  { path: "/admin/tratamiento-comercial", heading: "Tratamiento comercial" },
  { path: "/admin/usuarios", heading: "Usuarios" },
];

/** The detail routes, which take an id straight from the URL. */
const PROTECTED_DETAIL = [
  "/admin/empresas/does-not-exist",
  "/admin/usuarios/does-not-exist",
  "/admin/deca/does-not-exist",
  "/admin/operadores/does-not-exist",
  "/admin/soporte/does-not-exist",
  "/admin/errores/does-not-exist",
  "/admin/contenido/does-not-exist",
];

/** The transports an unauthorised caller can reach a server component through. */
const RSC_HEADERS: { name: string; headers: Record<string, string> }[] = [
  { name: "RSC", headers: { RSC: "1" } },
  {
    name: "RSC + router state tree",
    headers: {
      RSC: "1",
      "Next-Router-State-Tree": encodeURIComponent(
        JSON.stringify(["", { children: ["admin", { children: ["__PAGE__", {}] }] }]),
      ),
    },
  },
  { name: "prefetch", headers: { RSC: "1", "Next-Router-Prefetch": "1" } },
];

/** A company whose name exists nowhere else, to prove real records are not in the payload. */
async function seedProbeCompany(request: APIRequestContext): Promise<string> {
  const name = `RSC Probe ${Date.now()}${Math.floor(Math.random() * 1e5)} SL`;
  const res = await request.post("/api/auth/register", {
    data: {
      email: `rsc-probe-${Date.now()}${Math.floor(Math.random() * 1e5)}@example.com`,
      password: "Supersecret123!",
      companyName: name,
      companyNif: "B12345674",
      companyContactName: "Ana Ejemplo",
      companyPhone: "600111222",
      companyEmail: "empresa@example.com",
      companyAddress: "Calle Prueba 1",
      companyPostalCode: "46540",
      companyCity: "El Puig",
      acceptTerms: true,
    },
  });
  expect(res.status()).toBe(201);
  return name;
}

test.describe("SECURITY #94 — internal pages are closed on every transport", () => {
  test("an internal user can still read the internal pages (the guard is not a wall)", async ({
    playwright,
  }) => {
    const ctx = await playwright.request.newContext({
      baseURL: `http://localhost:${process.env.PORT ?? "3000"}`,
    });
    await loginAdminApi(ctx);
    for (const { path, heading } of PROTECTED) {
      const res = await ctx.get(path, { headers: { RSC: "1" } });
      expect(res.status(), `${path} must serve an authorised internal caller`).toBe(200);
      expect(await res.text(), `${path} must render for an internal caller`).toContain(heading);
    }
    await ctx.dispose();
  });

  for (const transport of RSC_HEADERS) {
    test(`anonymous caller gets no internal payload over ${transport.name}`, async ({
      request,
    }) => {
      const probe = await seedProbeCompany(request);
      for (const { path, heading } of PROTECTED) {
        const body = await (await request.get(path, { headers: transport.headers })).text();
        expect(body, `${path} leaked a real company record to an anonymous caller`).not.toContain(
          probe,
        );
        expect(
          body,
          `${path} leaked its own rendered payload to an anonymous caller`,
        ).not.toContain(heading);
      }
      for (const path of PROTECTED_DETAIL) {
        const body = await (await request.get(path, { headers: transport.headers })).text();
        expect(body, `${path} leaked a real company record to an anonymous caller`).not.toContain(
          probe,
        );
      }
    });
  }

  test("a normal authenticated customer gets no internal payload either", async ({
    playwright,
  }) => {
    const baseURL = `http://localhost:${process.env.PORT ?? "3000"}`;
    const ctx = await playwright.request.newContext({ baseURL });
    const probe = await seedProbeCompany(ctx);
    // `seedProbeCompany` registered and signed this context in as a normal
    // (role=user) customer — exactly the caller #94 cares about most.
    for (const { path, heading } of PROTECTED) {
      const body = await (await ctx.get(path, { headers: { RSC: "1" } })).text();
      expect(body, `${path} leaked a real company record to a normal customer`).not.toContain(
        probe,
      );
      expect(body, `${path} leaked its own rendered payload to a normal customer`).not.toContain(
        heading,
      );
    }
    await ctx.dispose();
  });

  test("a plain navigation still answers 404, and stays 404", async ({ page }) => {
    for (const { path } of PROTECTED) {
      expect((await page.goto(path))?.status(), `${path} must 404 for an anonymous caller`).toBe(
        404,
      );
    }
  });
});
