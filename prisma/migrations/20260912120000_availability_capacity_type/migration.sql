/*
  #119 — expand DECA Conecta's "ficha de disponibilidad" (`deca_availability_share`,
  originally #84) with voluntary next-load preference fields: preferred
  destination, capacity (full truck / partial load + linear meters + max
  weight), vehicle type, and which shipment (for a multi-envío DeCA, #112)
  supplied the zona/fecha defaults.

  Purely additive: every new column is nullable, or has a safe default
  ("full" for capacity_mode, matching the existing behaviour before this
  issue — every DeCA's vehicle was implicitly a full truck). No existing row,
  table, or constraint is touched. RLS is already enabled on this table from
  its original migration — adding columns does not need re-enrolling.
*/

-- AlterTable
ALTER TABLE "deca_availability_share"
  ADD COLUMN "preferred_destination" TEXT,
  ADD COLUMN "capacity_mode" TEXT NOT NULL DEFAULT 'full',
  ADD COLUMN "linear_meters" DOUBLE PRECISION,
  ADD COLUMN "max_weight_kg" INTEGER,
  ADD COLUMN "vehicle_type" TEXT,
  ADD COLUMN "final_shipment_index" INTEGER;
