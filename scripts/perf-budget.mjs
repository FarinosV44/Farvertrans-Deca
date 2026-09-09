#!/usr/bin/env node
/**
 * #96 — performance budgets for the public routes' initial JS weight.
 *
 * Runs a real production build and parses its own route table (`next
 * build`'s "First Load JS" column — the actual bytes shipped to the browser
 * before any interaction) against a budget per priority route. Budgets are
 * NOT invented numbers — each one is the actual measured size at the time
 * this script was written (2026-09-09, after the Inter-font removal and the
 * SiteHeader static-locale fix), plus a deliberate small margin, per the
 * issue's own "los umbrales deben basarse en medición actual" instruction.
 * A route regressing past its budget is a real, actionable signal: someone
 * added a client dependency or a big client component to a page that used
 * to be lean.
 *
 * A standalone script (like `seo-audit.mjs`/`internal-links-audit.mjs`), not
 * wired into `test:e2e`'s CI job — it runs its own `next build`, and
 * duplicating that on every push would add several minutes to CI for a
 * budget check meant to be run at deploy time / when touching a public page.
 *
 *   node scripts/perf-budget.mjs
 */

import { execSync } from "node:child_process";

// kB, "First Load JS" — measured 2026-09-09, +10% margin over the real
// number so a build's normal noise doesn't false-positive, while a genuine
// regression (a new heavy import) still trips it.
const BUDGETS = {
  "/": 145,
  "/crear": 235,
  "/entrar": 225,
  "/registro": 225,
  "/guias": 145,
  "/blog": 145,
  "/soy-obligado": 145,
  "/[slug]": 145, // the whole SEO cluster (all 15 pages share one build entry)
};

function parseKb(cell) {
  const m = /([\d.]+)\s*(kB|B)/.exec(cell.trim());
  if (!m) return null;
  const n = parseFloat(m[1]);
  return m[2] === "kB" ? n : n / 1000;
}

function main() {
  console.log("Performance budget — running a production build (this takes a minute)…\n");
  let out;
  try {
    out = execSync("npm run build", { encoding: "utf-8", maxBuffer: 32 * 1024 * 1024 });
  } catch (e) {
    console.error("✗ Build failed — cannot check budgets against a broken build.");
    console.error(e.stdout ?? e.message);
    process.exit(2);
  }

  const lines = out.split("\n");
  const sizes = {}; // route -> First Load JS, in kB
  for (const line of lines) {
    // e.g. "├ ƒ /entrar                                     187 B         201 kB"
    const m = /[│├└┌]\s*[○●ƒ]\s+(\/\S*)\s+([\d.]+\s*(?:kB|B))\s+([\d.]+\s*(?:kB|B))/.exec(line);
    if (!m) continue;
    const [, route, , firstLoad] = m;
    const kb = parseKb(firstLoad);
    if (kb !== null) sizes[route] = kb;
  }

  if (Object.keys(sizes).length === 0) {
    console.error("✗ Could not parse any route from the build output — format may have changed.");
    process.exit(2);
  }

  console.log("## Priority routes vs. budget\n");
  console.log("| Route | First Load JS | Budget | Status |");
  console.log("|---|---|---|---|");
  let overBudget = 0;
  for (const [route, budget] of Object.entries(BUDGETS)) {
    const actual = sizes[route];
    if (actual === undefined) {
      console.log(`| ${route} | — | ${budget} kB | ⚠ not found in this build |`);
      continue;
    }
    const ok = actual <= budget;
    if (!ok) overBudget++;
    console.log(
      `| ${route} | ${actual} kB | ${budget} kB | ${ok ? "✓" : `✗ +${(actual - budget).toFixed(1)} kB`} |`,
    );
  }

  console.log(
    `\n${overBudget === 0 ? "✓" : "✗"} ${Object.keys(BUDGETS).length - overBudget}/${Object.keys(BUDGETS).length} priority routes within budget`,
  );
  if (overBudget > 0) process.exit(1);
}

main();
