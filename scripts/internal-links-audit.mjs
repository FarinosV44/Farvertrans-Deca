#!/usr/bin/env node
/**
 * #97 — internal-linking architecture audit. Complements `seo-audit.mjs`
 * (#95, indexation correctness) with the link-GRAPH checks the issue's own
 * "Auditoría" section asks for:
 *
 *   - orphan indexable pages (nothing crawled links to them);
 *   - "páginas estratégicas" (`lib/content/internal-linking.ts`) with too
 *     few inbound internal links;
 *   - broken internal links (any href found while crawling that isn't 200);
 *   - anchors reused identically, pointing at the same target, far more
 *     than natural variation would produce (keyword-stuffing smell);
 *   - pages carrying an unusually large number of internal links;
 *   - click depth from home (BFS over the crawled link graph).
 *
 * Only BROKEN LINKS are a hard failure (exit 1) — they are an unambiguous
 * defect. The rest are editorial signals (orphans, thin strategic pages,
 * repeated anchors, link-heavy pages, deep pages): real, but a judgement
 * call about content, not a correctness bug, so they are reported and never
 * block CI on their own.
 *
 *   node scripts/internal-links-audit.mjs https://decaprofesional.es
 *   node scripts/internal-links-audit.mjs                              # http://localhost:3000
 */

const base = (process.argv[2] || process.env.FVD_BASE_URL || "http://localhost:3000").replace(
  /\/$/,
  "",
);

// Kept in sync by hand with `STRATEGIC_ROUTES` in
// `lib/content/internal-linking.ts` (this plain-Node script does not import
// TypeScript, same as `seo-audit.mjs`'s self-contained `NEVER_INDEXABLE`).
const STRATEGIC_ROUTES = [
  "/",
  "/deca-gratis",
  "/generador-deca",
  "/que-es-el-deca",
  "/como-hacer-un-deca",
  "/deca-obligatorio-2026",
  "/deca-agencias-transporte",
  "/deca-empresas-transporte",
  "/datos-obligatorios-deca",
];

// A handful of chrome anchors (header/footer/CTA) are expected to repeat on
// every single page — that is normal navigation, not link stuffing — so
// they are excluded from the repeated-anchor check.
const ANCHOR_STOPLIST = new Set([
  "inicio",
  "guías",
  "blog",
  "iniciar sesión",
  "entrar",
  "crear deca",
  "crear deca gratis",
  "crea tu deca ahora",
  "generador deca",
  "landing y generador",
  "contacto",
  "aviso legal",
  "términos",
  "cookies",
  "privacidad",
  "política de privacidad",
  "autoría y revisión legal",
  "normativa",
  "documento electrónico de control", // footer nav item, present on every page
  "deca profesional", // header logo link, present on every page
]);
const ANCHOR_REPEAT_THRESHOLD = 12; // same anchor text → same target, more than this many times
const TOO_MANY_LINKS_THRESHOLD = 120;
const STRATEGIC_MIN_INBOUND = 3;
const DEPTH_WARN = 3;

function internalLinks(html) {
  const links = [];
  const re = /<a\b[^>]*href=["'](\/[a-z0-9\-/]*)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html))) {
    const href = m[1].split("?")[0].split("#")[0].replace(/\/$/, "") || "/";
    const anchor = m[2]
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    links.push({ href, anchor });
  }
  return links;
}

async function fetchSitemapUrls() {
  const res = await fetch(`${base}/sitemap.xml`);
  if (!res.ok) throw new Error(`sitemap.xml → ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
}

async function main() {
  console.log(`Internal-linking audit — ${base}\n`);

  let sitemapPaths;
  try {
    sitemapPaths = await fetchSitemapUrls();
  } catch (e) {
    console.error(`✗ Could not read sitemap: ${e.message}`);
    process.exit(2);
  }
  const pageSet = new Set(sitemapPaths.map((p) => p.replace(/\/$/, "") || "/"));
  console.log(`Sitemap: ${sitemapPaths.length} pages to crawl\n`);

  // Crawl every sitemap page, collecting its outbound internal links.
  const graph = new Map(); // path -> [{href, anchor}]
  const linkTargets = new Set(); // every distinct href seen, for the broken-link check
  for (const path of sitemapPaths) {
    const res = await fetch(`${base}${path}`);
    if (!res.ok) {
      graph.set(path, []);
      continue;
    }
    const html = await res.text();
    const links = internalLinks(html);
    graph.set(path, links);
    for (const l of links) linkTargets.add(l.href);
  }

  // Broken links: fetch every distinct internal href found anywhere.
  const brokenLinks = [];
  for (const href of linkTargets) {
    const res = await fetch(`${base}${href}`, { redirect: "manual" });
    if (res.status >= 400) brokenLinks.push({ href, status: res.status });
  }

  // Inbound-link counts, per target page (only counting targets that are
  // themselves sitemap pages — i.e. the indexable set).
  const inbound = new Map();
  for (const path of sitemapPaths) inbound.set(path, 0);
  for (const [, links] of graph) {
    for (const l of links) {
      if (inbound.has(l.href)) inbound.set(l.href, inbound.get(l.href) + 1);
    }
  }
  const orphans = sitemapPaths.filter((p) => p !== "/" && (inbound.get(p) ?? 0) === 0);
  const thinStrategic = STRATEGIC_ROUTES.filter(
    (r) => pageSet.has(r) && (inbound.get(r) ?? 0) < STRATEGIC_MIN_INBOUND,
  ).map((r) => ({ route: r, inbound: inbound.get(r) ?? 0 }));

  // Repeated-anchor smell: identical (anchor, target) pairs across the whole crawl.
  const anchorCounts = new Map(); // "anchor||href" -> count
  for (const [, links] of graph) {
    for (const l of links) {
      const key = l.anchor.toLowerCase();
      if (!l.anchor || ANCHOR_STOPLIST.has(key)) continue;
      const k = `${key}||${l.href}`;
      anchorCounts.set(k, (anchorCounts.get(k) ?? 0) + 1);
    }
  }
  const repeatedAnchors = [...anchorCounts.entries()]
    .filter(([, n]) => n > ANCHOR_REPEAT_THRESHOLD)
    .map(([k, n]) => {
      const [anchor, href] = k.split("||");
      return { anchor, href, count: n };
    });

  // Link-heavy pages.
  const linkHeavy = sitemapPaths
    .map((p) => ({ path: p, count: (graph.get(p) ?? []).length }))
    .filter((r) => r.count > TOO_MANY_LINKS_THRESHOLD);

  // Click depth from home — BFS over the crawled graph, restricted to sitemap pages.
  const depth = new Map([["/", 0]]);
  const queue = ["/"];
  while (queue.length > 0) {
    const cur = queue.shift();
    for (const l of graph.get(cur) ?? []) {
      if (pageSet.has(l.href) && !depth.has(l.href)) {
        depth.set(l.href, depth.get(cur) + 1);
        queue.push(l.href);
      }
    }
  }
  const deepPages = sitemapPaths
    .map((p) => ({ path: p, depth: depth.get(p) ?? null }))
    .filter((r) => r.depth === null || r.depth > DEPTH_WARN);

  console.log("## Orphan pages (no crawled inbound internal link)\n");
  if (orphans.length === 0) console.log("✓ none\n");
  else orphans.forEach((p) => console.log(`  - ${p}`));

  console.log("\n## Strategic pages with thin inbound linking (< " + STRATEGIC_MIN_INBOUND + ")\n");
  if (thinStrategic.length === 0) console.log("✓ none\n");
  else thinStrategic.forEach((r) => console.log(`  - ${r.route}: ${r.inbound} inbound`));

  console.log("\n## Broken internal links\n");
  if (brokenLinks.length === 0) console.log("✓ none\n");
  else brokenLinks.forEach((b) => console.log(`  - ${b.href} → ${b.status}`));

  console.log("\n## Repeated exact anchors (> " + ANCHOR_REPEAT_THRESHOLD + "x, same target)\n");
  if (repeatedAnchors.length === 0) console.log("✓ none\n");
  else repeatedAnchors.forEach((r) => console.log(`  - "${r.anchor}" → ${r.href} (${r.count}x)`));

  console.log(
    "\n## Pages with an unusually large number of internal links (> " +
      TOO_MANY_LINKS_THRESHOLD +
      ")\n",
  );
  if (linkHeavy.length === 0) console.log("✓ none\n");
  else linkHeavy.forEach((r) => console.log(`  - ${r.path}: ${r.count} links`));

  console.log("\n## Click depth from home (> " + DEPTH_WARN + " or unreachable)\n");
  if (deepPages.length === 0) console.log("✓ none\n");
  else
    deepPages.forEach((r) =>
      console.log(
        `  - ${r.path}: ${r.depth === null ? "unreachable from home" : `depth ${r.depth}`}`,
      ),
    );

  console.log(
    `\n${brokenLinks.length === 0 ? "✓" : "✗"} ${brokenLinks.length} broken internal link(s)`,
  );
  console.log(
    `ℹ ${orphans.length} orphan page(s), ${thinStrategic.length} thin strategic page(s), ${repeatedAnchors.length} repeated-anchor pattern(s), ${linkHeavy.length} link-heavy page(s), ${deepPages.length} page(s) deeper than ${DEPTH_WARN} clicks — editorial signals, not blocking`,
  );

  if (brokenLinks.length > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
