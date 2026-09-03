#!/usr/bin/env node
/**
 * keel-doctor — environment preflight, compiled from docs/03-technical-plan.md
 * "## Environment requirements". Read-only: reports, never installs.
 * Usage: node scripts/keel-doctor.mjs [--check|--json]
 */
import { execSync } from "node:child_process";

const asJson = process.argv.includes("--json");

function probe(cmd) {
  try {
    return execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return null;
  }
}

const checks = [
  {
    name: "Node.js >=20.11",
    detected: probe("node --version"),
    required: ">=20.11",
    blocking: true,
  },
  { name: "npm", detected: probe("npm --version"), required: "any", blocking: true },
  {
    name: "Docker (playground/integration)",
    detected: probe("docker --version"),
    required: "24+",
    blocking: true,
  },
  {
    name: "Docker daemon running",
    detected: probe("docker info --format {{.ServerVersion}}") ? "running" : null,
    required: "running",
    blocking: false,
  },
  { name: "git", detected: probe("git --version"), required: "2.40+", blocking: true },
  {
    name: "gh (issue automation)",
    detected: probe("gh --version")?.split("\n")[0] ?? null,
    required: "authenticated",
    blocking: false,
  },
];

const credentialStops = [
  "Supabase project (NEXT_PUBLIC_SUPABASE_URL / keys) — create at supabase.com",
  "Hostinger VPS — provision for deploy only",
  "Domain + DNS — placeholder deca.farvertrans.es until decided",
  "Resend API key — for claim links / driver email",
  "hCaptcha keys — abuse challenge (optional until abuse slice)",
];

const result = {
  checks: checks.map((c) => ({
    ...c,
    state: c.detected ? "OK" : c.blocking ? "MISSING (blocking)" : "MISSING (optional)",
  })),
  credentialStops,
};

if (asJson) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log("keel-doctor — environment\n");
  for (const c of result.checks) {
    console.log(`  [${c.state.padEnd(18)}] ${c.name}  ${c.detected ? `(${c.detected})` : ""}`);
  }
  console.log("\n  CREDENTIAL stops (the user provides these; not installable):");
  for (const s of credentialStops) console.log(`   - ${s}`);
}

const blockingMissing = result.checks.filter((c) => !c.detected && c.blocking);
process.exit(blockingMissing.length ? 1 : 0);
