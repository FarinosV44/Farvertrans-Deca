-- 2026 correction to #119 (DECA Conecta): postal code becomes the canonical
-- zone/destination-preferente matching value, and the vehicle-type list
-- expands from lona/frigorifico to also include megatrailer/jumbo/
-- frigolona/otro (with a free-text specify field for "otro").
--
-- Purely additive, all nullable — no existing row is affected, and matching
-- safely falls back to the existing free-text destination/preferredDestination
-- columns whenever a postal code is absent on either side of a comparison
-- (see zonesMatch() in lib/commercial/availability.ts). No DeCA/PDF table is
-- touched by this migration.
--
-- Hand-written, not `prisma migrate dev` generated: the local shadow database
-- cannot apply D-186's RLS-lockdown migration cleanly (documented
-- pre-existing issue — D-203 and D-228 hit the same thing).
ALTER TABLE "deca_availability_share" ADD COLUMN "vehicle_type_other" TEXT;
ALTER TABLE "deca_availability_share" ADD COLUMN "availability_postal_code" TEXT;
ALTER TABLE "deca_availability_share" ADD COLUMN "preferred_destination_postal_code" TEXT;
