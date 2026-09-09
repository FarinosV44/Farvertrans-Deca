#!/usr/bin/env node
/**
 * #96 — a real mobile Core Web Vitals baseline: a real browser (Chromium),
 * a real mobile device profile (Pixel 5), and REAL throttling (CPU +
 * network) — Lighthouse's own "Slow 4G" mobile profile, so the numbers are
 * comparable to any Lighthouse/PSI report, per the issue's own "medir
 * también condiciones reales... no optimizar Lighthouse para la captura".
 *
 * Reports, per priority route: TTFB, FCP, LCP, CLS, total transferred bytes,
 * and JS bytes. No budget/pass-fail here — this is the measurement `npm run
 * perf:budget` needs a real number to be based on; run it before and after
 * a performance change to see the actual effect.
 *
 *   node scripts/perf-baseline.mjs https://decaprofesional.es
 *   node scripts/perf-baseline.mjs                              # http://localhost:3000
 */

import { chromium, devices } from "@playwright/test";

const base = (process.argv[2] || process.env.FVD_BASE_URL || "http://localhost:3000").replace(
  /\/$/,
  "",
);

// The issue's own priority list: home/landing, /crear, SEO core, guías,
// blog, registro/login.
const ROUTES = [
  "/",
  "/crear",
  "/que-es-el-deca",
  "/como-hacer-un-deca",
  "/deca-obligatorio-2026",
  "/guias",
  "/blog",
  "/registro",
  "/entrar",
];

// Lighthouse's own mobile "Slow 4G" profile (RTT 150ms, 1.6 Mbps down /
// 750 Kbps up) + its default 4x CPU slowdown — chosen for comparability
// with any Lighthouse/PSI report, not invented.
const NETWORK = {
  offline: false,
  downloadThroughput: (1.6 * 1024 * 1024) / 8,
  uploadThroughput: (750 * 1024) / 8,
  latency: 150,
};
const CPU_THROTTLE = 4;

const VITALS_INIT_SCRIPT = `
  window.__vitals = { lcp: 0, cls: 0 };
  try {
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const last = entries[entries.length - 1];
      if (last) window.__vitals.lcp = last.startTime;
    }).observe({ type: "largest-contentful-paint", buffered: true });
  } catch {}
  try {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) window.__vitals.cls += entry.value;
      }
    }).observe({ type: "layout-shift", buffered: true });
  } catch {}
`;

async function measure(browser, route) {
  const ctx = await browser.newContext({ ...devices["Pixel 5"] });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await page.addInitScript(VITALS_INIT_SCRIPT);

  // CDP's actual transfer-size events (`encodedDataLength`), not the
  // `content-length` response header — Hostinger's CDN/Next serve most
  // responses compressed and chunked, with no `content-length` header at
  // all, which silently undercounted every byte total to ~0.
  let totalBytes = 0;
  let jsBytes = 0;
  const requestKind = new Map(); // requestId -> resourceType
  cdp.on("Network.responseReceived", (e) => {
    requestKind.set(e.requestId, e.type);
  });
  cdp.on("Network.loadingFinished", (e) => {
    totalBytes += e.encodedDataLength;
    if (requestKind.get(e.requestId) === "Script") jsBytes += e.encodedDataLength;
  });
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", NETWORK);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: CPU_THROTTLE });

  const start = Date.now();
  const res = await page.goto(`${base}${route}`, { waitUntil: "load", timeout: 60000 });
  const ttfb = res
    ? ((await page.evaluate(() => performance.getEntriesByType("navigation")[0]?.responseStart)) ??
      null)
    : null;
  const fcp = await page.evaluate(
    () =>
      performance.getEntriesByType("paint").find((e) => e.name === "first-contentful-paint")
        ?.startTime ?? null,
  );
  // let LCP/CLS observers settle — nothing left to load, no interaction
  await page.waitForTimeout(2000);
  const vitals = await page.evaluate(() => window.__vitals);
  const loadMs = Date.now() - start;

  await ctx.close();
  return {
    route,
    status: res?.status() ?? null,
    loadMs,
    ttfb: ttfb !== null ? Math.round(ttfb) : null,
    fcp: fcp !== null ? Math.round(fcp) : null,
    lcp: Math.round(vitals.lcp),
    cls: Math.round(vitals.cls * 1000) / 1000,
    totalKb: Math.round(totalBytes / 1024),
    jsKb: Math.round(jsBytes / 1024),
  };
}

async function main() {
  console.log(
    `Mobile Core Web Vitals baseline — ${base} (Pixel 5, Slow 4G, ${CPU_THROTTLE}x CPU throttle)\n`,
  );
  const browser = await chromium.launch();
  const rows = [];
  try {
    for (const route of ROUTES) {
      process.stderr.write(`  measuring ${route}…\n`);
      rows.push(await measure(browser, route));
    }
  } finally {
    await browser.close();
  }

  console.log("| Route | Status | TTFB | FCP | LCP | CLS | Total | JS |");
  console.log("|---|---|---|---|---|---|---|---|");
  for (const r of rows) {
    console.log(
      `| ${r.route} | ${r.status} | ${r.ttfb ?? "—"} ms | ${r.fcp ?? "—"} ms | ${r.lcp} ms | ${r.cls} | ${r.totalKb} kB | ${r.jsKb} kB |`,
    );
  }

  console.log(
    '\nThresholds for reference (Core Web Vitals "good", field data — lab numbers here run somewhat higher under fixed throttling): LCP ≤ 2500 ms, CLS ≤ 0.1.',
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
