#!/usr/bin/env node
/**
 * keel-verify — project release linter. Fails (exit 1) on a broken invariant.
 * Grows as the project grows; run before every commit and in CI.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";

const problems = [];
const ok = (m) => console.log(`  ok   ${m}`);
const bad = (m) => {
  problems.push(m);
  console.log(`  FAIL ${m}`);
};

// 1. No secret-shaped strings in tracked files (cheap heuristic; the pre-commit gate is the real guard).
try {
  const tracked = execSync("git ls-files", { encoding: "utf8" }).split("\n").filter(Boolean);
  // Real assigned secrets — not bare pattern names (the CI workflow and hooks contain those on purpose).
  const secretRe =
    /(-----BEGIN [A-Z ]*PRIVATE KEY-----|sk_live_[A-Za-z0-9]{20,}|SUPABASE_SERVICE_ROLE_KEY\s*[:=]\s*["'][A-Za-z0-9._-]{20,}|eyJ[A-Za-z0-9_-]{30,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,})/;
  const skip = (f) =>
    f === "scripts/keel-verify.mjs" ||
    f.startsWith("docs/") ||
    f.startsWith(".github/") ||
    f.startsWith(".githooks/") ||
    f === ".env.example" ||
    f === ".env.prod.example";
  let hits = 0;
  for (const f of tracked) {
    if (skip(f)) continue;
    if (!/\.(ts|tsx|js|mjs|json|env|yml|yaml|prisma)$/.test(f)) continue;
    if (!existsSync(f)) continue;
    if (secretRe.test(readFileSync(f, "utf8"))) {
      bad(`possible secret in ${f}`);
      hits++;
    }
  }
  if (!hits) ok("no secret-shaped strings in tracked source");
} catch {
  ok("git not available — skipped secret scan");
}

// 2. .env is not tracked.
try {
  const tracked = execSync("git ls-files .env", { encoding: "utf8" }).trim();
  if (tracked) bad(".env is tracked by git");
  else ok(".env is not tracked");
} catch {
  ok(".env is not tracked");
}

// 3. Required project files exist.
for (const f of [
  "package.json",
  "prisma/schema.prisma",
  "docs/PROGRESS.md",
  "docs/02-functional-spec.md",
  "docs/03-technical-plan.md",
  "docs/05-test-points.md",
  "docs/api/INDEX.md",
]) {
  if (existsSync(f)) ok(`present: ${f}`);
  else bad(`missing: ${f}`);
}

// 4. APP_VERSION matches package.json version.
try {
  const pkg = JSON.parse(readFileSync("package.json", "utf8"));
  const v = readFileSync("lib/version.ts", "utf8").match(/APP_VERSION\s*=\s*"([^"]+)"/)?.[1];
  if (v === pkg.version) ok(`version in sync (${v})`);
  else bad(`version drift: package.json ${pkg.version} vs lib/version.ts ${v}`);
} catch (e) {
  bad(`version check failed: ${e.message}`);
}

// 5. SECURITY #94 — every internal page authorises ITSELF, never via the layout alone.
//    A layout guard does not stop the page segment's Flight payload: Next renders
//    layout and page in parallel, so `notFound()` in the layout still let an
//    anonymous `RSC: 1` request read the whole internal payload. Prose could not
//    keep this closed — a new page under the group would simply forget it — so the
//    rule is mechanical: the page file must call a guard from `lib/admin/guard`.
try {
  const root = "app/admin/(protected)";
  const pages = [];
  const walk = (dir) => {
    for (const e of readdirSync(dir)) {
      const p = join(dir, e);
      if (statSync(p).isDirectory()) walk(p);
      else if (e === "page.tsx") pages.push(p.split("\\").join("/"));
    }
  };
  if (existsSync(root)) {
    walk(root);
    const unguarded = pages.filter(
      (f) => !/\b(requireInternal|requireStepUp)\s*\(/.test(readFileSync(f, "utf8")),
    );
    if (unguarded.length)
      for (const f of unguarded) bad(`internal page without its own guard: ${f}`);
    else ok(`all ${pages.length} internal pages call requireInternal() themselves (#94)`);
  } else {
    ok(`no ${root} directory — internal-page guard check not applicable`);
  }
} catch (e) {
  bad(`internal-page guard check failed: ${e.message}`);
}

console.log("");
if (problems.length) {
  console.error(`keel-verify: ${problems.length} problem(s).`);
  process.exit(1);
}
console.log("keel-verify: all checks passed.");
