import "server-only";
import { prisma } from "@/lib/prisma";
import { isPubliclyAvailable } from "@/lib/deca/deactivation";
import { rowMatches, type HistoryFilters } from "./history-filter";

export type { HistoryFilters } from "./history-filter";

export type HistoryRow = {
  id: string;
  reference: string;
  createdAt: Date;
  transportDate: string;
  origin: string;
  destination: string;
  carrier: string;
  tractorPlate: string;
  token: string;
  status: "activo" | "no disponible";
};

type Data = {
  reference?: string;
  origin?: string;
  destination?: string;
  transportDate?: string;
  goods?: string;
  weight?: string;
  tractorPlate?: string;
  trailerPlate?: string;
  shipper?: { name?: string; nif?: string; address?: string };
  carrier?: { name?: string; nif?: string };
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
      transportDate: data.transportDate ?? "",
      origin: data.origin ?? "",
      destination: data.destination ?? "",
      carrier: data.carrier?.name ?? "",
      tractorPlate: data.tractorPlate ?? "",
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
  return {
    id: deca.id,
    createdAt: deca.createdAt,
    current: {
      versionNo: deca.currentVersion.versionNo,
      token: deca.currentVersion.token,
      data: currentData,
    },
    versions: deca.versions.map((v) => ({
      versionNo: v.versionNo,
      token: v.token,
      createdAt: v.createdAt,
      changeReason: v.changeReason,
      isCurrent: v.id === deca.currentVersionId,
    })),
  };
}
