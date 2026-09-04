#!/usr/bin/env node
/**
 * Deploy verification for DeCA Fácil (P0 FIX #29 §4).
 *
 * Probes a RUNNING deployment — database, schema, PDF render, storage
 * write/read, public URL, providers — and exits non-zero if anything the DeCA
 * pipeline needs is broken. Run it right after every deploy, before telling
 * anyone the site is up.
 *
 *   node scripts/diagnose.mjs https://deca.example.com
 *   FVD_ADMIN_TOKEN=… node scripts/diagnose.mjs https://deca.example.com
 *
 * The token must match the deployment's own `FVD_ADMIN_TOKEN`; without it the
 * endpoint answers 404 unless you are signed in as an internal user.
 */

const base = (process.argv[2] || process.env.FVD_BASE_URL || "http://localhost:3000").replace(
  /\/$/,
  "",
);
const token = process.env.FVD_ADMIN_TOKEN || "";

const ICON = { ok: "✓", warn: "!", fail: "✗", skipped: "-" };

async function main() {
  let res;
  try {
    res = await fetch(`${base}/api/admin/diagnostics`, {
      headers: token ? { "x-fvd-admin-token": token } : {},
    });
  } catch (e) {
    console.error(`✗ No se ha podido contactar con ${base}: ${e.message}`);
    process.exit(2);
  }

  if (res.status === 404) {
    console.error(
      "✗ 404 — el endpoint interno no ha autorizado la petición.\n" +
        "  Define FVD_ADMIN_TOKEN en el despliegue y pásalo en el entorno de este script.",
    );
    process.exit(2);
  }

  const report = await res.json().catch(() => null);
  if (!report?.checks) {
    console.error(`✗ Respuesta inesperada (HTTP ${res.status}).`);
    process.exit(2);
  }

  console.log(`\nDeCA Fácil — diagnóstico de despliegue`);
  console.log(`  destino     ${base}`);
  console.log(
    `  versión     ${report.version}   entorno ${report.environment}   node ${report.node}`,
  );
  console.log(`  almacén     ${report.storage}`);
  console.log("");
  for (const c of report.checks) {
    const ms = c.ms === undefined ? "" : ` (${c.ms} ms)`;
    console.log(`  ${ICON[c.state] ?? "?"} ${c.label}${ms}\n      ${c.detail}`);
  }
  console.log("");

  const failed = report.checks.filter((c) => c.state === "fail");
  if (failed.length) {
    console.error(`✗ ${failed.length} comprobación(es) han fallado. El despliegue NO está listo.`);
    process.exit(1);
  }
  console.log("✓ Todas las comprobaciones críticas han pasado.");
}

main();
