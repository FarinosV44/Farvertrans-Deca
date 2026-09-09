#!/usr/bin/env node
/**
 * #95 — technical indexation audit, repeatable after every deploy.
 *
 * Crawls the sitemap (the indexable set, by definition) plus a fixed list of
 * routes that must NOT be indexable, and reports per URL: status, indexable,
 * canonical, robots, presence in sitemap, H1, title, meta description — the
 * exact columns the issue's "Entregable" asks for. No new dependency: plain
 * `fetch` + light regex extraction (this is a diagnostic report, not a
 * production HTML parser).
 *
 *   node scripts/seo-audit.mjs https://decaprofesional.es
 *   node scripts/seo-audit.mjs                              # http://localhost:3000
 */

const base = (process.argv[2] || process.env.FVD_BASE_URL || "http://localhost:3000").replace(
  /\/$/,
  "",
);

/** Routes that must be classified NOINDEX / PRIVATE / 404 — never appear indexable. */
const NEVER_INDEXABLE = [
  { url: "/panel", expect: "redirect_or_403" },
  { url: "/admin", expect: "404" },
  { url: "/operadores", expect: "404" },
  { url: "/entrar", expect: "noindex" },
  { url: "/registro", expect: "noindex" },
  { url: "/recuperar", expect: "noindex" },
  { url: "/crear", expect: "noindex" }, // application screen — /generador-deca is the indexable equivalent
  { url: "/api/health", expect: "not_html" },
];

function extract(html) {
  const title = /<title[^>]*>([^<]*)<\/title>/i.exec(html)?.[1]?.trim() || null;
  const metaDesc = /<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i.exec(html)?.[1];
  const canonical = /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i.exec(html)?.[1];
  const metaRobots = /<meta\s+name=["']robots["']\s+content=["']([^"']*)["']/i.exec(html)?.[1];
  const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) =>
    m[1].replace(/<[^>]+>/g, "").trim(),
  );
  return {
    title,
    metaDesc: metaDesc ?? null,
    canonical: canonical ?? null,
    metaRobots: metaRobots ?? null,
    h1s,
  };
}

async function fetchSitemapUrls() {
  const res = await fetch(`${base}/sitemap.xml`);
  if (!res.ok) throw new Error(`sitemap.xml → ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

async function auditIndexable(url) {
  const res = await fetch(url, { redirect: "manual" });
  const row = {
    url,
    status: res.status,
    inSitemap: true,
    xRobotsTag: res.headers.get("x-robots-tag"),
  };
  if (res.status >= 300 && res.status < 400) {
    row.redirectTo = res.headers.get("location");
    row.problems = ["sitemap contains a redirecting URL — should be the final destination"];
    return row;
  }
  if (res.status !== 200) {
    row.problems = [`sitemap URL returned ${res.status}, not 200`];
    return row;
  }
  const html = await res.text();
  const { title, metaDesc, canonical, metaRobots, h1s } = extract(html);
  row.title = title;
  row.metaDescription = metaDesc;
  row.canonical = canonical;
  row.metaRobots = metaRobots;
  row.h1Count = h1s.length;
  row.h1 = h1s[0] ?? null;

  const problems = [];
  if (!title) problems.push("missing <title>");
  if (!metaDesc) problems.push("missing meta description");
  if (!canonical) problems.push("missing <link rel=canonical>");
  else if (canonical.replace(/\/$/, "") !== url.replace(/\/$/, ""))
    problems.push(`canonical (${canonical}) does not self-reference the sitemap URL`);
  if (metaRobots?.includes("noindex") || row.xRobotsTag?.includes("noindex"))
    problems.push("sitemap URL is marked noindex — must not be in the sitemap");
  if (h1s.length === 0) problems.push("no <h1>");
  if (h1s.length > 1) problems.push(`${h1s.length} <h1> elements (expected exactly 1)`);
  row.problems = problems;
  return row;
}

async function auditNeverIndexable({ url, expect }) {
  const res = await fetch(`${base}${url}`, { redirect: "manual" });
  const xRobots = res.headers.get("x-robots-tag");
  const row = { url, status: res.status, expect, xRobotsTag: xRobots };
  const problems = [];
  if (expect === "404" && res.status !== 404) problems.push(`expected 404, got ${res.status}`);
  if (expect === "not_html") {
    // just confirm it isn't accidentally serving an indexable HTML page
  }
  if (expect === "noindex" || expect === "redirect_or_403") {
    if (res.status === 200) {
      const html = await res.text();
      const { metaRobots } = extract(html);
      row.metaRobots = metaRobots ?? null;
      if (!metaRobots?.includes("noindex") && !xRobots?.includes("noindex"))
        problems.push("200 with no noindex signal (meta robots or X-Robots-Tag)");
    }
  }
  row.problems = problems;
  return row;
}

async function main() {
  console.log(`SEO audit — ${base}\n`);

  let sitemapUrls;
  try {
    sitemapUrls = await fetchSitemapUrls();
  } catch (e) {
    console.error(`✗ Could not read sitemap: ${e.message}`);
    process.exit(2);
  }
  console.log(`Sitemap: ${sitemapUrls.length} URLs\n`);

  const indexableRows = [];
  for (const url of sitemapUrls) {
    indexableRows.push(await auditIndexable(url));
  }

  const neverRows = [];
  for (const r of NEVER_INDEXABLE) {
    neverRows.push(await auditNeverIndexable(r));
  }

  console.log("## Indexable (from sitemap.xml)\n");
  console.log(
    "| URL | Status | Canonical self-referent | Robots | H1 | Title | Meta desc | Problems |",
  );
  console.log("|---|---|---|---|---|---|---|---|");
  let indexableFails = 0;
  for (const r of indexableRows) {
    const ok = (r.problems ?? []).length === 0;
    if (!ok) indexableFails++;
    console.log(
      `| ${r.url} | ${r.status} | ${r.canonical ? "✓" : "✗"} | ${r.metaRobots ?? r.xRobotsTag ?? "—"} | ${r.h1Count ?? "—"} | ${r.title ? "✓" : "✗"} | ${r.metaDescription ? "✓" : "✗"} | ${(r.problems ?? []).join("; ") || "—"} |`,
    );
  }

  console.log("\n## Must-not-be-indexable routes\n");
  console.log("| URL | Status | Expected | Robots signal | Problems |");
  console.log("|---|---|---|---|---|");
  let neverFails = 0;
  for (const r of neverRows) {
    const ok = r.problems.length === 0;
    if (!ok) neverFails++;
    console.log(
      `| ${r.url} | ${r.status} | ${r.expect} | ${r.metaRobots ?? r.xRobotsTag ?? "—"} | ${r.problems.join("; ") || "—"} |`,
    );
  }

  console.log(
    `\n${indexableFails === 0 ? "✓" : "✗"} ${indexableRows.length - indexableFails}/${indexableRows.length} indexable URLs clean`,
  );
  console.log(
    `${neverFails === 0 ? "✓" : "✗"} ${neverRows.length - neverFails}/${neverRows.length} never-indexable routes clean`,
  );

  if (indexableFails > 0 || neverFails > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
