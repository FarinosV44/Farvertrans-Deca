import "server-only";
import { prisma } from "@/lib/prisma";
import { publicEnv } from "@/lib/env";
import { isPubliclyAvailable } from "@/lib/deca/deactivation";
import type { DecaPayloadData } from "@/lib/data/history";

/**
 * The full data behind the post-generation document cockpit (PRODUCT #36) —
 * used by both `/crear/[id]` (anonymous result) and `/panel/deca/[id]`
 * (authenticated workspace view). Everything comes from the stored version
 * payload, so the on-screen summary can never diverge from the generated PDF.
 */

export type CockpitVersion = {
  versionNo: number;
  token: string;
  createdAt: Date;
  changeReason: string | null;
  pdfSha256: string;
  author: string | null;
  isCurrent: boolean;
  publicUrl: string;
  data: DecaPayloadData;
};

export type CockpitData = {
  id: string;
  reference: string;
  createdAt: Date;
  status: "activo" | "no disponible";
  scope: "anónimo" | "empresa";
  companyName: string | null;
  current: CockpitVersion;
  versions: CockpitVersion[];
  /** Field-level diff of the current version against the previous one (#36 §6). */
  changes: { label: string; from: string; to: string }[] | null;
};

const FIELDS: { key: string; label: string; get: (d: DecaPayloadData) => string }[] = [
  { key: "shipper.name", label: "Cargador — nombre", get: (d) => d.shipper?.name ?? "" },
  { key: "shipper.nif", label: "Cargador — NIF/VAT", get: (d) => d.shipper?.nif ?? "" },
  { key: "shipper.address", label: "Cargador — domicilio", get: (d) => d.shipper?.address ?? "" },
  { key: "carrier.name", label: "Transportista — nombre", get: (d) => d.carrier?.name ?? "" },
  { key: "carrier.nif", label: "Transportista — NIF/VAT", get: (d) => d.carrier?.nif ?? "" },
  {
    key: "carrier.address",
    label: "Transportista — domicilio",
    get: (d) => d.carrier?.address ?? "",
  },
  { key: "origin", label: "Origen", get: (d) => d.origin ?? "" },
  { key: "destination", label: "Destino", get: (d) => d.destination ?? "" },
  { key: "transportDate", label: "Fecha del transporte", get: (d) => d.transportDate ?? "" },
  { key: "goods", label: "Mercancía", get: (d) => d.goods ?? "" },
  { key: "weight", label: "Peso o medida", get: (d) => d.weight ?? "" },
  { key: "tractorPlate", label: "Matrícula tractora", get: (d) => d.tractorPlate ?? "" },
  { key: "trailerPlate", label: "Matrícula remolque", get: (d) => d.trailerPlate ?? "" },
  { key: "reference", label: "Referencia", get: (d) => d.reference ?? "" },
];

/** The changed fields between two version payloads (#36 §6). */
export function diffVersions(
  from: DecaPayloadData,
  to: DecaPayloadData,
): { label: string; from: string; to: string }[] {
  const out: { label: string; from: string; to: string }[] = [];
  for (const f of FIELDS) {
    const a = f.get(from);
    const b = f.get(to);
    if (a !== b) out.push({ label: f.label, from: a || "—", to: b || "—" });
  }
  return out;
}

function refOf(token: string): string {
  return `DECA-${token.slice(0, 8).toUpperCase()}`;
}

/**
 * Cockpit data for a DeCA.
 *
 * - `companyId` set → workspace view: the DeCA must belong to that company
 *   (tenant isolation, T-1), and version authors are resolved.
 * - `companyId` omitted → anonymous result view: any holder of the `id` may see
 *   it (the result page has never been secret; the claim token is what matters).
 */
export async function getDecaCockpit(
  id: string,
  opts: { companyId?: string } = {},
): Promise<CockpitData | null> {
  const deca = await prisma.deca.findUnique({
    where: { id },
    include: {
      company: { select: { name: true } },
      currentVersion: true,
      versions: { orderBy: { versionNo: "desc" } },
    },
  });
  if (!deca?.currentVersion) return null;
  if (opts.companyId && deca.companyId !== opts.companyId) return null;

  const authorIds =
    opts.companyId != null
      ? [...new Set(deca.versions.map((v) => v.createdByUserId).filter((x): x is string => !!x))]
      : [];
  const authors = authorIds.length
    ? await prisma.user.findMany({
        where: { id: { in: authorIds } },
        select: { id: true, email: true },
      })
    : [];
  const emailById = new Map(authors.map((a) => [a.id, a.email]));

  const base = publicEnv.baseUrl.replace(/\/$/, "");
  const toVersion = (v: (typeof deca.versions)[number]): CockpitVersion => ({
    versionNo: v.versionNo,
    token: v.token,
    createdAt: v.createdAt,
    changeReason: v.changeReason,
    pdfSha256: v.pdfSha256 ?? "",
    author: v.createdByUserId ? (emailById.get(v.createdByUserId) ?? null) : null,
    isCurrent: v.id === deca.currentVersionId,
    publicUrl: `${base}/d/${v.token}`,
    data: (v.dataJson ?? {}) as DecaPayloadData,
  });

  const versions = deca.versions.map(toVersion);
  const current = versions.find((v) => v.isCurrent) ?? toVersion(deca.currentVersion);
  const previous = versions
    .filter((v) => v.versionNo < current.versionNo)
    .sort((a, b) => b.versionNo - a.versionNo)[0];

  return {
    id: deca.id,
    reference: refOf(current.token),
    createdAt: deca.createdAt,
    status: isPubliclyAvailable(deca.serviceEnd) ? "activo" : "no disponible",
    scope: deca.companyId ? "empresa" : "anónimo",
    companyName: deca.company?.name ?? null,
    current,
    versions,
    changes: previous ? diffVersions(previous.data, current.data) : null,
  };
}
