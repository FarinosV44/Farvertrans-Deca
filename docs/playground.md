# Playground — Farvertrans DeCA

> Local verification environment. Synthetic data only. `last verified: 2026-09-03 (BUILD 05)`.

## Prerequisites
- Node ≥ 20.11, npm, Docker (daemon running). Check: `node scripts/keel-doctor.mjs`.

## First-time setup
```bash
npm install
cp .env.example .env            # fill NEXT_PUBLIC_SUPABASE_* / SUPABASE_SERVICE_ROLE_KEY for auth+storage flows;
                                # DATABASE_URL works as-is against the local docker DB
npm run db:up                   # starts postgres:15 on localhost:5432
npm run db:migrate              # applies prisma/migrations
npm run seed                    # inserts synthetic operators adrian/maria/diana/alejandro
```

## Run
```bash
npm run dev                     # http://localhost:3000
```

## Try-it flows (exact URLs / commands)
| Flow | How |
|---|---|
| Landing | open `http://localhost:3000/` — one h1 "DeCA GRATIS", CTA "CREAR DECA GRATIS" → `/crear` |
| Health | `curl http://localhost:3000/health` → `{ "status": "ok", "version": "...", "db": "up" }` |
| Create a DeCA (anonymous) | open `/crear` — 3-step wizard, no login (BUILD 07) |
| Download via QR/URL | scan the QR in the generated PDF or open `/d/<token>` — direct PDF, no auth (BUILD 08) |
| Attribution | open `/?ref=adrian&utm_source=whatsapp&utm_medium=direct&utm_campaign=lanzamiento` then sign up (BUILD 09/11) |
| Operator dashboard | open `/operadores` as an internal-role user (BUILD 12) |

## Reset
```bash
npm run db:down && npm run db:up && npm run db:migrate && npm run seed
```

## Automated suites
```bash
npm run test:unit        # Vitest — pure logic
npm run test:e2e         # Playwright — browser flows (builds + starts the app)
npm run lint && npm run typecheck
```

## CREDENTIAL / HARDWARE legs (the user, not the assistant)
- A real Supabase project for auth + storage flows (BUILD 08/09 onward).
- Scanning a generated QR with a real phone camera and confirming the PDF opens directly.
- Real WhatsApp / email delivery to a phone/inbox.
- A legal check that a generated DeCA is accepted at inspection.
