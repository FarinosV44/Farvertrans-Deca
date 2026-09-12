import "server-only";
import { prisma } from "@/lib/prisma";
import { expiryStatus } from "@/lib/commercial/availability";

/**
 * Read-only admin visibility of the commercial-treatment feature (#84). No
 * matching, no export — just enough to evidence what has been authorised and
 * prepared. Company names are joined for display; the availability records
 * themselves carry only the authorised fields.
 */

export async function commercialModeCounts(): Promise<{
  none: number;
  per_deca: number;
  all: number;
  total: number;
}> {
  const [rows, total] = await Promise.all([
    prisma.commercialConsent.groupBy({ by: ["mode"], _count: { _all: true } }),
    prisma.company.count(),
  ]);
  const by = Object.fromEntries(rows.map((r) => [r.mode, r._count._all])) as Record<string, number>;
  return {
    none: by.none ?? 0,
    per_deca: by.per_deca ?? 0,
    all: by.all ?? 0,
    total,
  };
}

export type AvailabilityRow = {
  decaId: string;
  companyName: string;
  destination: string;
  availabilityDate: Date;
  channel: string;
  /** #119 — "expired" is computed, never stored (see `expiryStatus()`). */
  status: "pending" | "withdrawn" | "expired";
  preparedAt: Date;
  preferredDestination: string | null;
  capacityMode: string;
  linearMeters: number | null;
  maxWeightKg: number | null;
  vehicleType: string | null;
};

export async function recentAvailabilityShares(limit = 50): Promise<AvailabilityRow[]> {
  const rows = await prisma.decaAvailabilityShare.findMany({
    orderBy: { preparedAt: "desc" },
    take: limit,
    include: { company: { select: { name: true } } },
  });
  return rows.map((r) => ({
    decaId: r.decaId,
    companyName: r.company.name,
    destination: r.destination,
    availabilityDate: r.availabilityDate,
    channel: r.channel,
    status: expiryStatus(r),
    preparedAt: r.preparedAt,
    preferredDestination: r.preferredDestination,
    capacityMode: r.capacityMode,
    linearMeters: r.linearMeters,
    maxWeightKg: r.maxWeightKg,
    vehicleType: r.vehicleType,
  }));
}

export type CommercialEventRow = {
  companyName: string;
  kind: string;
  mode: string | null;
  channel: string | null;
  legalVersion: string;
  createdAt: Date;
};

export async function recentCommercialEvents(limit = 60): Promise<CommercialEventRow[]> {
  const rows = await prisma.commercialConsentEvent.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { company: { select: { name: true } } },
  });
  return rows.map((r) => ({
    companyName: r.company.name,
    kind: r.kind,
    mode: r.mode,
    channel: r.channel,
    legalVersion: r.legalVersion,
    createdAt: r.createdAt,
  }));
}
