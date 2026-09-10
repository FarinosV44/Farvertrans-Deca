/**
 * #111 — capture the screenshots used by "Guía de uso de DeCA Profesional"
 * (`prisma/content/guia-de-uso.ts`) into `public/guia/`.
 *
 * SYNTHETIC DATA ONLY. Registers a throwaway demo company, creates a couple of
 * DeCAs and a few saved records, then screenshots each panel screen. No real
 * company data, no real credentials.
 *
 * Usage:
 *   1. npm run db:up && npm run db:migrate && npm run seed
 *   2. npm run build && npm run start        (a server on :3000)
 *   3. node scripts/guide-screenshots.mjs
 *
 * Re-run any time the UI changes; the guide text never changes, only the PNGs.
 */
import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "../prisma/generated/client/index.js";

const BASE = process.env.GUIDE_SHOTS_BASE ?? "http://localhost:3000";
const OUT = fileURLToPath(new URL("../public/guia/", import.meta.url));
const VIEWPORT = { width: 1280, height: 900 };
const rnd = Math.floor(Math.random() * 1e6);
const EMAIL = `guia.demo.${Date.now()}.${rnd}@example.com`;
const PASSWORD = "Demo-Guia-2026!";

const COMPANY = {
  companyName: "Transportes Demo SL",
  companyNif: "B12345674",
  companyContactName: "Laura Ejemplo",
  companyPhone: "600 100 200",
  companyEmail: "operaciones@transportesdemo.example",
  companyAddress: "Polígono La Demo, Nave 4",
  companyPostalCode: "46540",
  companyCity: "El Puig",
};

const DECA = (i) => ({
  shipper: {
    name: "Cargas del Levante SL",
    nif: "B96789011",
    address: "Av. del Puerto 120, Valencia",
  },
  carrier: {
    name: "Transportes Demo SL",
    nif: "B12345674",
    address: "Polígono La Demo, Nave 4, El Puig",
  },
  loadDate: "2026-10-06",
  unloadDate: "2026-10-06",
  loadLocation: {
    name: "Nave central",
    address: "Calle Uno 1",
    postalCode: "46023",
    city: "Valencia",
    province: "Valencia",
    country: "España",
  },
  unloadLocation: {
    name: i === 0 ? "Plataforma norte" : "Centro logístico",
    address: "Calle Dos 2",
    postalCode: "28053",
    city: "Madrid",
    province: "Madrid",
    country: "España",
  },
  tractorPlate: i === 0 ? "1234 BCD" : "5678 FGH",
  goods: i === 0 ? "Palés de alimentación" : "Bobinas de papel",
  weight: "12.000 kg",
});

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: VIEWPORT, baseURL: BASE, locale: "es-ES" });
  const api = ctx.request;

  // 1. Register + verify a throwaway demo company.
  const reg = await api.post("/api/auth/register", {
    data: { email: EMAIL, password: PASSWORD, acceptTerms: true, ...COMPANY },
  });
  if (![200, 201].includes(reg.status()))
    throw new Error(`register: ${reg.status()} ${await reg.text()}`);
  const { verifyTestToken } = await reg.json();
  if (verifyTestToken) await api.get(`/verificar-email/${verifyTestToken}`);

  // In a production build the verify seam is off — mark the throwaway demo
  // account verified directly so the panel screens are shown fully populated.
  const prisma = new PrismaClient();
  await prisma.user.updateMany({ where: { email: EMAIL }, data: { emailVerifiedAt: new Date() } });
  await prisma.$disconnect();

  // 2. Seed a little workspace content so the screens are not empty.
  for (let i = 0; i < 2; i++) {
    const r = await api.post("/api/deca", { data: DECA(i) });
    if (r.status() !== 201) console.warn(`  deca ${i}: ${r.status()} ${await r.text()}`);
  }
  await api.post("/api/saved/company", {
    data: {
      name: "Cargas del Levante SL",
      nif: "B96789011",
      address: "Av. del Puerto 120",
      postalCode: "46023",
      city: "Valencia",
      role: "shipper",
    },
  });
  await api.post("/api/saved/vehicle", {
    data: { tractorPlate: "1234 BCD", trailerPlate: "R 4321 BC", alias: "Cabeza 1" },
  });
  await api.post("/api/saved/location", {
    data: {
      name: "Plataforma norte",
      address: "Calle Dos 2",
      postalCode: "28053",
      city: "Madrid",
      province: "Madrid",
      type: "unload",
    },
  });
  await api.post("/api/templates", {
    data: {
      name: "Valencia → Madrid (cliente habitual)",
      shipper: {
        name: "Cargas del Levante SL",
        nif: "B96789011",
        address: "Av. del Puerto 120",
        postalCode: "46023",
        city: "Valencia",
      },
      carrier: {
        name: "Transportes Demo SL",
        nif: "B12345674",
        address: "Polígono La Demo",
        postalCode: "46540",
        city: "El Puig",
      },
      goods: "Palés de alimentación",
      weight: "12.000 kg",
      tractorPlate: "1234 BCD",
    },
  });

  const page = await ctx.newPage();
  const shot = async (name, url, waitFor) => {
    await page.goto(url, { waitUntil: "networkidle" });
    if (waitFor)
      await page
        .locator(waitFor)
        .first()
        .waitFor({ state: "visible", timeout: 15000 })
        .catch(() => {});
    await page.evaluate(() => document.fonts.ready).catch(() => {});
    // Drop focus + move the pointer away from the top-left corner so the
    // accessibility "skip to content" link (correct: visible only on focus) is
    // not captured on screen.
    await page.keyboard.press("Escape").catch(() => {});
    await page.evaluate(() => {
      const el = document.activeElement;
      if (el instanceof HTMLElement) el.blur();
      document.querySelectorAll(".skip-link").forEach((s) => s instanceof HTMLElement && s.blur());
      window.scrollTo(0, 0);
    });
    await page.mouse.move(VIEWPORT.width / 2, VIEWPORT.height / 2);
    await page.waitForTimeout(700);
    // Clip to the <main> content box against a full-page render — deterministic,
    // and never captures the sticky header or the focus-only skip link.
    const box = await page
      .locator("main#contenido")
      .first()
      .evaluate((el) => {
        const r = el.getBoundingClientRect();
        return {
          x: Math.max(0, Math.floor(r.x)),
          y: Math.max(0, Math.floor(r.y + window.scrollY)),
          width: Math.ceil(r.width),
          height: Math.ceil(r.height),
        };
      })
      .catch(() => null);
    await page.screenshot({
      path: `${OUT}${name}.png`,
      ...(box && box.height > 40 ? { fullPage: true, clip: box } : {}),
    });
    console.log(`  ✓ ${name}.png`);
  };

  await shot("panel-inicio", "/panel", "[data-testid='app-crear']");
  await shot("mis-deca", "/panel/historico", "text=Histórico");
  await shot("plantillas", "/panel/plantillas", "text=Plantillas");
  await shot("datos-habituales", "/panel/datos", "text=Datos habituales");
  await shot("equipo", "/panel/equipo", "text=Equipo");
  await shot("mi-empresa", "/panel/empresa", "text=Mi empresa");
  await shot("privacidad", "/panel/privacidad", "text=Privacidad");
  await shot("ayuda", "/panel/ayuda", "[data-testid='ticket-submit']");

  // Step 1 of the creation wizard, from a fresh anonymous context.
  const anon = await browser.newContext({ viewport: VIEWPORT, baseURL: BASE, locale: "es-ES" });
  const anonPage = await anon.newPage();
  await anonPage.goto("/crear", { waitUntil: "networkidle" });
  await anonPage.evaluate(() => document.fonts.ready).catch(() => {});
  await anonPage.evaluate(() =>
    document.activeElement instanceof HTMLElement ? document.activeElement.blur() : null,
  );
  await anonPage.mouse.move(VIEWPORT.width / 2, VIEWPORT.height / 2);
  await anonPage.waitForTimeout(700);
  {
    const m = anonPage.locator("main#contenido");
    await ((await m.count()) ? m : anonPage).screenshot({ path: `${OUT}crear-paso-1.png` });
    console.log("  ✓ crear-paso-1.png");
  }

  await browser.close();
  console.log(`\nDone → ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
