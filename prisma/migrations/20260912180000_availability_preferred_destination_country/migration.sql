-- #119 ACLARACIÓN FINAL: DECA Conecta's "destino preferente" becomes código
-- postal + país only. The earlier free-text `preferred_destination` column
-- (nullable, never required, no data-loss concern — the postal-code column
-- added by the prior #119 correction is already the canonical matching
-- value) is dropped entirely rather than left as an unused duplicate; the
-- new `preferred_destination_country` column travels alongside
-- `preferred_destination_postal_code`, defaulting to "España" at the
-- application layer.
--
-- `destination` ("Zona de disponibilidad") stays untouched by this
-- migration: it becomes an internal/derived value (no more separate visible
-- input), but the column itself is unchanged — still NOT NULL, still the
-- legacy free-text matching/display fallback.
--
-- Hand-written, not `prisma migrate dev` generated: the local shadow
-- database cannot apply D-186's RLS-lockdown migration cleanly (documented
-- pre-existing issue — D-203, D-228, and D-230 all hit the same thing).
ALTER TABLE "deca_availability_share" DROP COLUMN "preferred_destination";
ALTER TABLE "deca_availability_share" ADD COLUMN "preferred_destination_country" TEXT;
