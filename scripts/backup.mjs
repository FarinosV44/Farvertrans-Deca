#!/usr/bin/env node
/**
 * Independent, encrypted backup of the DeCA Profesional data (#60).
 *
 * Two halves, both required — a DeCA is only useful if BOTH survive:
 *   1. the Postgres database (`pg_dump -Fc` via `$BACKUP_DIRECT_URL`)
 *   2. every object in the PDF bucket (Supabase Storage, service role)
 *
 * Output: one `tar` archive, encrypted with `age` when `BACKUP_AGE_RECIPIENT`
 * is set (strongly recommended — the dump holds third-party personal data),
 * plus a `manifest.json` with a SHA-256 of every part. Uploading the archive
 * off-machine is the workflow's job (`.github/workflows/backup.yml`).
 *
 * Exits non-zero on ANY failure so the scheduled run turns red — that red is
 * the "alerta si una copia falla" the issue asks for.
 *
 * Env: BACKUP_DIRECT_URL, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 *      FVD_PDF_BUCKET (default "deca-pdfs"), BACKUP_DIR (default "./backups"),
 *      BACKUP_AGE_RECIPIENT (optional "age1..."),
 *      BACKUP_SKIP_STORAGE=1 (DB-only dry run — never a real backup).
 */
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync, readFileSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";

function fail(msg) {
  console.error(`backup: ${msg}`);
  process.exit(1);
}
const need = (k) => process.env[k] || fail(`missing env ${k}`);
const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const root = process.env.BACKUP_DIR || "./backups";
const work = join(root, `deca-${stamp}`);
mkdirSync(join(work, "pdfs"), { recursive: true });

// 1. Database --------------------------------------------------------------
const dumpPath = join(work, "db.dump");
console.log("backup: pg_dump…");
const dump = spawnSync(
  "pg_dump",
  ["--format=custom", "--no-owner", "--file", dumpPath, need("BACKUP_DIRECT_URL")],
  { stdio: ["ignore", "inherit", "inherit"] },
);
if (dump.status !== 0) fail(`pg_dump exited ${dump.status ?? dump.signal}`);
if (statSync(dumpPath).size < 1024) fail("pg_dump produced a suspiciously small file");

// 2. PDF bucket ----------------------------------------------------------
let copied = 0;
const pdfHashes = {};

if (process.env.BACKUP_SKIP_STORAGE === "1") {
  console.warn(
    "backup: BACKUP_SKIP_STORAGE=1 — the PDF bucket is NOT in this archive. Dry run only.",
  );
} else {
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(
    need("NEXT_PUBLIC_SUPABASE_URL"),
    need("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: { persistSession: false },
    },
  );
  const bucket = process.env.FVD_PDF_BUCKET || "deca-pdfs";
  console.log(`backup: copying bucket "${bucket}"…`);

  let offset = 0;
  for (;;) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list("", { limit: 100, offset, sortBy: { column: "name", order: "asc" } });
    if (error) fail(`storage list: ${error.message}`);
    if (!data || data.length === 0) break;
    for (const obj of data) {
      if (obj.id === null) continue; // a "folder" placeholder
      const dl = await supabase.storage.from(bucket).download(obj.name);
      if (dl.error) fail(`storage download ${obj.name}: ${dl.error.message}`);
      const buf = Buffer.from(await dl.data.arrayBuffer());
      writeFileSync(join(work, "pdfs", obj.name), buf);
      pdfHashes[obj.name] = sha256(buf);
      copied++;
    }
    offset += data.length;
    if (data.length < 100) break;
  }
  console.log(`backup: ${copied} PDF objects`);
}

// 3. Manifest + archive -------------------------------------------------
const manifest = {
  generatedAt: new Date().toISOString(),
  db: { file: "db.dump", sha256: sha256(readFileSync(dumpPath)), bytes: statSync(dumpPath).size },
  pdfs: { count: copied, sha256: pdfHashes, skipped: process.env.BACKUP_SKIP_STORAGE === "1" },
};
writeFileSync(join(work, "manifest.json"), JSON.stringify(manifest, null, 2));

const tarPath = join(root, `deca-backup-${stamp}.tar`);
execFileSync("tar", ["-cf", tarPath, "-C", root, `deca-${stamp}`], { stdio: "inherit" });

// 4. Encrypt ----------------------------------------------------------------
let finalPath = tarPath;
if (process.env.BACKUP_AGE_RECIPIENT) {
  finalPath = `${tarPath}.age`;
  const enc = spawnSync("age", ["-r", process.env.BACKUP_AGE_RECIPIENT, "-o", finalPath, tarPath], {
    stdio: "inherit",
  });
  if (enc.status !== 0) fail(`age exited ${enc.status}`);
  execFileSync("rm", ["-f", tarPath]);
} else {
  console.warn(
    "backup: WARNING — BACKUP_AGE_RECIPIENT not set; the archive is NOT encrypted. It holds " +
      "third-party personal data. Do not store it unencrypted off-machine.",
  );
}

const outHash = sha256(readFileSync(finalPath));
writeFileSync(`${finalPath}.sha256`, `${outHash}  ${finalPath.split(/[\\/]/).pop()}\n`);
console.log(`backup: OK → ${finalPath}`);
console.log(`backup: sha256 ${outHash}`);
