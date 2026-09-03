# Production smoke checklist — Farvertrans DeCA (LAUNCH #20)

Run this against the **real production URL** after every deploy that could affect
the DeCA flow. The automated part is `tests/e2e/launch-happy-path.spec.ts`; the
rows below marked **manual** need a phone and a second device.

## 0. Environment sanity

- [ ] `GET https://<domain>/health` → `{"status":"ok","db":"up"}`
- [ ] `NEXT_PUBLIC_FVD_BASE_URL` equals the real HTTPS origin (drives every QR)
- [ ] `FVD_STORAGE` is `supabase`, **or** `FVD_STORAGE=local` with `FVD_STORAGE_DIR`
      pointing at a path that survives redeploy (see `docs/retention-policy.md`)
- [ ] TLS 1.2+ and HSTS present on `https://<domain>` (R-6)
- [ ] `FVD_DEBUG=0`

## 1. Anonymous happy path (automatable — mirrors the e2e spec)

- [ ] Landing on a 360 px viewport: one `<h1>` "DeCA GRATIS", CTA to `/crear`
- [ ] `/crear` shows "No necesitas registrarte" — **no signup wall**
- [ ] Fill a legally valid DeCA (both domicilios, real weight, plate)
- [ ] Last step shows the **review summary** with the exact final data
- [ ] `GENERAR DECA` → `/crear/<id>` "DeCA generado" (clear success, not a fake state)
- [ ] Download link points at `https://<domain>/d/<token>` (not localhost/wrong host)
- [ ] `curl -sI https://<domain>/d/<token>` → `content-type: application/pdf`,
      `x-robots-tag: noindex`, **no `set-cookie`**
- [ ] `curl -s https://<domain>/d/<token> | head -c 5` → `%PDF-` (not HTML)
- [ ] Fetch twice — the bytes are identical (repository of record, not regenerated)

## 2. QR — **manual, second device**

- [ ] Open the downloaded PDF on phone A; the QR is crisp and scannable
- [ ] Scan the QR with **phone B** (different network, logged out of everything)
- [ ] Phone B's browser downloads/opens the PDF **immediately** — no login page,
      no "click to download" button, no cookie banner, no interstitial
- [ ] The PDF on phone B is the same document (same reference, same data)
- [ ] Print the PDF — the QR still scans from paper

## 3. PDF legal content — **manual review of one real sample**

- [ ] All Art. 6 fields present as **selectable text** (not an image): cargador
      name/NIF/domicilio, transportista name/NIF/domicilio, origen, destino, fecha,
      naturaleza mercancía, peso/medida, matrícula tractora (+ remolque if set)
- [ ] Weight shows exactly what was typed (`12.500 kg` stays `12.500 kg`)
- [ ] PDF metadata: creation date/time present; ≤ 5 MB (expect ~20 KB)
- [ ] Verification URL printed on the page matches the QR target

## 4. Account after value

- [ ] "Guardar mis DeCA" only appears **after** the document exists
- [ ] Register → `/panel`; the claimed DeCA is in the history **without regeneration**
      (same `/d/<token>` URL still works, identical bytes)
- [ ] Duplicate → new independent DeCA, date reset, new token
- [ ] Saved companies/addresses/vehicles autofill on the next DeCA

## 5. Corrections & retention

- [ ] Correct one field → version 2 with a **new** QR/URL; version 1's URL still
      returns its original PDF, byte-for-byte (`docs/retention-policy.md`)
- [ ] `/panel/deca/<id>` shows the version list with reason + timestamp + author

## 6. Analytics / privacy

- [ ] `landing_view`, `deca_started`, `deca_generated` each fire once
- [ ] No event payload contains a name, NIF, email or token (check the network tab)

## Launch blockers (issue #20 — cannot go live while any is true)

- [ ] Hostinger returns 503
- [ ] DB or storage is ephemeral / not configured
- [ ] `/api/deca` returns a mock document
- [ ] QR points at localhost or the wrong host
- [ ] `/d/[token]` renders HTML instead of the PDF bytes
- [ ] A required legal field is missing from the form or the PDF
- [ ] A PDF disappears after redeploy
- [ ] The first DeCA requires signup
