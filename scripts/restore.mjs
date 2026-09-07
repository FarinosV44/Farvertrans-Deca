#!/usr/bin/env node
/**
 * Restore a #60 backup archive into a SCRATCH database, then print the
 * spot-checks that make the copy "verified" (a backup is not a backup until a
 * restore has been proven — the issue's own rule).
 *
 *   node scripts/restore.mjs <archive.tar[.age]> <scratch DATABASE_URL>
 *
 * Refuses a target that looks like production (a Supabase pooler host, or any
 * host listed in RESTORE_PROD_DENY) unless `--force-production` is passed AND
 * `I_UNDERSTAND=overwrite-production` is in the environment. Restoring over a
 * live database is never the happy path.
 *
 * `--dry-run` validates + lists the archive and stops.
 */
import { spawnSync, execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { restoreAllowed } from "../lib/backup/target.mjs";

const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const flags = new Set(process.argv.slice(2).filter((a) => a.startsWith("--")));
const [archive, targetUrl] = args;

function fail(m) {
  console.error(`restore: ${m}`);
  process.exit(1);
}
if (!archive || !existsSync(archive)) fail("archive path missing or not found");
if (!flags.has("--dry-run") && !targetUrl) fail("target DATABASE_URL required");

if (targetUrl) {
  const deny = process.env.RESTORE_PROD_DENY
    ? process.env.RESTORE_PROD_DENY.split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : undefined;
  const verdict = restoreAllowed(
    targetUrl,
    { forceFlag: flags.has("--force-production"), understand: process.env.I_UNDERSTAND },
    deny,
  );
  if (!verdict.allowed) {
    fail(
      `${verdict.reason}. To override (you almost never should): ` +
        "--force-production and I_UNDERSTAND=overwrite-production",
    );
  }
  if (verdict.warning) console.warn(`restore: !!! ${verdict.warning} !!!`);
}

// Decrypt + unpack --------------------------------------------------------
const dir = mkdtempSync(join(tmpdir(), "deca-restore-"));
let tarPath = archive;
if (archive.endsWith(".age")) {
  if (!process.env.BACKUP_AGE_IDENTITY_FILE)
    fail("BACKUP_AGE_IDENTITY_FILE required for a .age archive");
  tarPath = join(dir, "backup.tar");
  const d = spawnSync(
    "age",
    ["-d", "-i", process.env.BACKUP_AGE_IDENTITY_FILE, "-o", tarPath, archive],
    { stdio: "inherit" },
  );
  if (d.status !== 0) fail(`age -d exited ${d.status}`);
}
execFileSync("tar", ["-xf", tarPath, "-C", dir], { stdio: "inherit" });

const entry = execFileSync("find", [dir, "-name", "manifest.json"])
  .toString()
  .trim()
  .split("\n")[0];
if (!entry) fail("no manifest.json in the archive");
const backupRoot = entry.replace(/\/manifest\.json$/, "");
const manifest = JSON.parse(readFileSync(entry, "utf8"));
console.log(
  `restore: archive from ${manifest.generatedAt} — db ${manifest.db.bytes} bytes, ${manifest.pdfs.count} PDFs`,
);

if (flags.has("--dry-run")) {
  console.log("restore: --dry-run OK (archive is readable and well-formed)");
  process.exit(0);
}

// pg_restore ------------------------------------------------------------
console.log("restore: pg_restore into the scratch target…");
const r = spawnSync(
  "pg_restore",
  ["--clean", "--if-exists", "--no-owner", "--dbname", targetUrl, join(backupRoot, "db.dump")],
  { stdio: ["ignore", "inherit", "inherit"] },
);
// pg_restore returns non-zero on benign "does not exist" notices with --clean;
// treat only a hard failure (>1) as fatal.
if (r.status && r.status > 1) fail(`pg_restore exited ${r.status}`);

console.log(`
restore: DB restored. Now VERIFY (this is what makes the backup "válida"):
  1. npx prisma migrate status            (with DATABASE_URL/DIRECT_URL = the scratch target)
  2. log in as a seeded user, open a /panel/historico row, download its PDF
  3. confirm the PDF's bytes hash matches its stored pdf_sha256 for a
     pre-D-056 document (post-D-056 re-renders are content-faithful, not
     byte-identical — a mismatch there is expected, not tampering)
  4. PDFs from this archive are under: ${join(backupRoot, "pdfs")}
Record the outcome + date in docs/07-release.md §6 "Restoration-test log".
`);
