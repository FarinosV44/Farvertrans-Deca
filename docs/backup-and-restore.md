# Backup & restore — Farvertrans DeCA (#60)

> A backup is not a backup until a restore from it has been proven. See the
> restoration-test log in `docs/07-release.md` §6.

## 1. What has to survive, and where it lives

| Data | Store | Notes |
|---|---|---|
| DeCA documents + versions + all metadata | Supabase **Postgres** (`deca`, `deca_version`, `deca_access_log`, `acquisition`, `company`, `user`, …) | `deca_version` is append-only; `pdf_sha256` per version is the integrity anchor |
| The rendered PDF bytes | Supabase **Storage** bucket `deca-pdfs` (one immutable object per version, key = the version token) | `SupabaseStore.put()` uses `upsert:true`, but every key is a ≥128-bit token so collisions do not happen in practice |
| Structured snapshot each PDF is rendered from | `deca_version.data_json` (in Postgres) | **Second recovery path** — a lost PDF store is recoverable by re-rendering from Postgres alone (byte-identical only for pre-D-056 documents; later re-renders are content-faithful, not byte-identical) |
| Route-intel, analytics events | Postgres | Derived / low-value; recomputable or acceptable to lose |

**What Hostinger and Supabase cover by default is NOT enough:** Hostinger hosts the Next.js app only — it holds no durable data. Supabase's free tier keeps a few days of automatic daily database backups and **no** point-in-time recovery; Storage has **no** object versioning unless enabled. Neither is independent of the Supabase account itself. #60 adds an encrypted copy in a **separate** object store under **separate** credentials.

## 2. What happens to documents on account lifecycle events (ties to #62)

| Event | DeCA documents | PDF bytes | `/d/[token]` |
|---|---|---|---|
| User blocked / deactivated | kept | kept | still resolves |
| Company blocked / deactivated | kept | kept | still resolves |
| Company / user **anonymized** (#62) | kept — only account PII is overwritten in place | kept | still resolves |
| Hard delete | **not possible** — there is no delete path anywhere in the code (D-067), and none may be added without revisiting the 1-year retention obligation (R-10) |

Nothing about the account lifecycle cascades to a `Deca`, a `DecaVersion`, a PDF object, or a `SecurityAuditLog` row.

## 3. Recovery targets

- **RPO (max data loss): ≤ 24 h.** The scheduled backup runs daily; a failure between runs loses at most one day of new DeCA. Acceptable because a DeCA is regenerable by its author from the same inputs, and the legal obligation is on the *parties* to keep their copy, not solely on this service.
- **RTO (max time to restore): ≤ 4 h.** Restore procedure below is a documented, rehearsed sequence against a scratch database; promoting a scratch restore to production is a connection-string swap.

## 4. The backup

`scripts/backup.mjs` (run by `.github/workflows/backup.yml`, daily + `workflow_dispatch`):

1. `pg_dump --format=custom` of the database via `BACKUP_DIRECT_URL` (the session pooler, :5432 — `pg_dump` needs a real session).
2. Downloads **every** object in the `deca-pdfs` bucket with the service role.
3. Writes `manifest.json` — a SHA-256 of the dump and of every PDF, plus counts.
4. `tar`s the lot and **encrypts it with `age`** to `BACKUP_AGE_RECIPIENT` (the archive holds third-party personal data — an unencrypted archive is refused off-machine; the script warns loudly if the recipient is unset).
5. The workflow uploads `deca-backup-<ts>.tar.age` to an S3-compatible bucket (Cloudflare R2 / Backblaze B2 / AWS S3) under credentials unrelated to Supabase.

**Integrity:** the archive's own SHA-256 is written beside it; `manifest.json` lets a restore verify each part.

**Retention & rotation:** `daily/<date>/` and, on the 1st of the month, `monthly/<month>/`. Keep **30 dailies + 12 monthlies** via a **lifecycle rule on the destination bucket** (not the workflow) so expiry survives a workflow outage.

**Alerting:** a failed run is the alert. Watch the Backup workflow, or add a `on failure` notification step (Slack / email) — do not rely on noticing a missing green tick.

## 5. Restore (rehearsed; never over production first)

```bash
# 1. provision a scratch Postgres (local docker, or a throwaway Supabase project)
createdb deca_restore_test   # or docker exec <db> createdb ...

# 2. pull the archive from the object store, then:
BACKUP_AGE_IDENTITY_FILE=~/age-key.txt \
  node scripts/restore.mjs deca-backup-<ts>.tar.age \
  "postgresql://postgres:postgres@localhost:5432/deca_restore_test"
#   -> refuses a production-looking target unless --force-production AND
#      I_UNDERSTAND=overwrite-production (you almost never should)

# 3. verify — THIS is what makes the copy "válida":
DATABASE_URL=<scratch> DIRECT_URL=<scratch> npx prisma migrate status   # -> "up to date"
#   - log in as a seeded/known user, open a /panel/historico row, download its PDF
#   - for a pre-D-056 document, confirm the PDF bytes hash == its stored pdf_sha256
#   - the restored PDFs are in the archive under deca-<ts>/pdfs/

# 4. record the outcome + date in docs/07-release.md §6 "Restoration-test log"
```

Promote to production only by pointing `DATABASE_URL` / `DIRECT_URL` at the restored instance after the checks pass — never by restoring straight onto the live database.

## 6. RGPD

The database dump contains third-party personal data (shippers, carriers, drivers) inside `deca_version.data_json` and the PDFs. Therefore: the archive is **always** encrypted at rest (`age`) and in transit (HTTPS to the object store); access is restricted to the backup credentials; retention matches the live data's legal basis (1-year minimum, R-10); and the same "no self-service erasure vs the retention obligation" position applies (`docs/threat-model.md`, D-016). An erasure request is handled by #62's in-place anonymisation, which the next backup then captures.

## 7. Operator checklist (one-time, user)

- [ ] Create an object-store bucket **with its own access key**. Prefer an **independent** provider
      (Cloudflare R2 free tier, Backblaze B2) — a bucket inside the same Supabase project is not an
      independent backup and dies with the project. Supabase Storage's S3 endpoint
      (`https://<ref>.storage.supabase.co/storage/v1/s3`) works as a stopgap but see the two caveats below.
- [ ] Generate an `age` keypair (`age-keygen -o age-key.txt`); keep the private key OUT of the repo
      and CI logs; set the public `age1…` key as `BACKUP_AGE_RECIPIENT`.
- [ ] Set the repository secrets listed at the top of `.github/workflows/backup.yml`. `DIRECT_URL`,
      `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` and `FVD_PDF_BUCKET` are reused from the
      deploy config; the backup-only ones are `BACKUP_AGE_RECIPIENT`, `BACKUP_S3_ENDPOINT`,
      `BACKUP_S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and — for Supabase Storage or
      any non-R2 endpoint — `BACKUP_S3_REGION` (the project region, e.g. `eu-west-1`).
- [ ] Retention: on R2/B2/S3 add a bucket lifecycle rule (expire `daily/` after 30 days, `monthly/`
      after 400). **Supabase Storage has no lifecycle rules** — prune manually or with a small
      scheduled job until the destination is moved to an independent store.
- [ ] Run the workflow once via `workflow_dispatch`; confirm an archive lands in the bucket.
- [ ] Do one full restore-test into a scratch DB and record it in `docs/07-release.md` §6.
