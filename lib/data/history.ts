import "server-only";
import { prisma } from "@/lib/prisma";
import { isPubliclyAvailable } from "@/lib/deca/deactivation";
import { formatLocationShort, type TransportLocation } from "@/lib/deca/location";
import { rowMatches, type HistoryFilters } from "./history-filter";

export type { HistoryFilters } from "./history-filter";

export type HistoryRow = {
  id: string;
  reference: string;
  createdAt: Date;
  loadDate: string;
  unloadDate: string;
  loadLocation: string;
  unloadLocation: string;
  shipper: string;
  carrier: string;
  goods: string;
  tractorPlate: string;
  trailerPlate: string;
  versionNo: number;
  token: string;
  status: "activo" | "no disponible";
};

type Data = {
  reference?: string;
  loadLocation?: Partial<TransportLocation>;
  unloadLocation?: Partial<TransportLocation>;
  loadDate?: string;
  unloadDate?: string;
  goods?: string;
  weight?: string;
  tractorPlate?: string;
  trailerPlate?: string;
  shipper?: { name?: string; nif?: string; address?: string };
  carrier?: { name?: string; nif?: string; address?: string };
};

export type DecaPayloadData = Data;

/**
 * Company-scoped DeCA history with in-memory filtering over the stored payload.
 * Volumes per company are low enough for a fetch-then-filter in v1; revisit with
 * indexed columns if a company exceeds a few thousand documents.
 */
export async function listHistory(
  companyId: string,
  filters: HistoryFilters = {},
): Promise<HistoryRow[]> {
  const decas = await prisma.deca.findMany({
    where: { companyId },
    include: { currentVersion: true },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  const rows: HistoryRow[] = [];
  for (const d of decas) {
    if (!d.currentVersion) continue;
    const data = (d.currentVersion.dataJson ?? {}) as Data;
    const row: HistoryRow = {
      id: d.id,
      reference: `DECA-${d.currentVersion.token.slice(0, 8).toUpperCase()}`,
      createdAt: d.createdAt,
      loadDate: data.loadDate ?? "",
      unloadDate: data.unloadDate ?? "",
      loadLocation: formatLocationShort(data.loadLocation),
      unloadLocation: formatLocationShort(data.unloadLocation),
      shipper: data.shipper?.name ?? "",
      carrier: data.carrier?.name ?? "",
      goods: data.goods ?? "",
      tractorPlate: data.tractorPlate ?? "",
      trailerPlate: data.trailerPlate ?? "",
      versionNo: d.currentVersion.versionNo,
      token: d.currentVersion.token,
      status: isPubliclyAvailable(d.serviceEnd) ? "activo" : "no disponible",
    };
    if (
      rowMatches(
        {
          ...row,
          shipperName: data.shipper?.name,
          shipperNif: data.shipper?.nif,
          carrierNif: data.carrier?.nif,
        },
        filters,
      )
    ) {
      rows.push(row);
    }
  }
  return rows;
}

/** Distinct effective-carrier names across a company's history (WORKSPACE #24 filter). */
export async function listHistoryCarriers(companyId: string): Promise<string[]> {
  const rows = await listHistory(companyId);
  return [...new Set(rows.map((r) => r.carrier).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "es"),
  );
}

/** A source DeCA's payload for the duplicate flow — company-scoped. */
export async function getDecaForDuplicate(companyId: string, decaId: string) {
  const deca = await prisma.deca.findFirst({
    where: { id: decaId, companyId },
    include: { currentVersion: true },
  });
  if (!deca?.currentVersion) return null;
  return deca.currentVersion.dataJson as Data;
}

/** Full company-scoped DeCA detail with its version history (F5). */
export async function getDecaDetail(companyId: string, decaId: string) {
  const deca = await prisma.deca.findFirst({
    where: { id: decaId, companyId },
    include: { versions: { orderBy: { versionNo: "desc" } }, currentVersion: true },
  });
  if (!deca?.currentVersion) return null;
  const currentData = deca.currentVersion.dataJson as Data;

  // Resolve version authors (correction audit — FIX #19). Private to the owner UI;
  // never exposed through the public inspection token.
  const authorIds = [
    ...new Set(deca.versions.map((v) => v.createdByUserId).filter((x): x is string => !!x)),
  ];
  const authors = authorIds.length
    ? await prisma.user.findMany({
        where: { id: { in: authorIds } },
        select: { id: true, email: true },
      })
    : [];
  const emailById = new Map(authors.map((a) => [a.id, a.email]));

  return {
    id: deca.id,
    createdAt: deca.createdAt,
    current: {
      versionNo: deca.currentVersion.versionNo,
      token: deca.currentVersion.token,
      pdfSha256: deca.currentVersion.pdfSha256 ?? "",
      data: currentData,
    },
    versions: deca.versions.map((v) => ({
      versionNo: v.versionNo,
      token: v.token,
      createdAt: v.createdAt,
      changeReason: v.changeReason,
      author: v.createdByUserId ? (emailById.get(v.createdByUserId) ?? null) : null,
      isCurrent: v.id === deca.currentVersionId,
    })),
  };
}
