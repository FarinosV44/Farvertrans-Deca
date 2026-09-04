import type { HistoryRow } from "@/lib/data/history";
import { publicEnv } from "@/lib/env";

/**
 * Company DeCA history export (PRODUCT #34 §3) and the operational workflow
 * status (#34 §4). Pure — the route handler is the only I/O.
 *
 * "Workflow status" is a PRODUCT state, deliberately NOT a legal status: it
 * describes where the document is in the product's own lifecycle, nothing more.
 */

export type WorkflowStatus = "Vigente" | "Corregida" | "No disponible";

export function docWorkflowStatus(row: Pick<HistoryRow, "versionNo" | "status">): WorkflowStatus {
  if (row.status === "no disponible") return "No disponible";
  return row.versionNo > 1 ? "Corregida" : "Vigente";
}

/** RFC 4180 field quoting. */
function csvField(v: string | number): string {
  const s = String(v ?? "");
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const COLUMNS: { header: string; get: (r: HistoryRow) => string }[] = [
  { header: "referencia", get: (r) => r.reference },
  { header: "creado", get: (r) => r.createdAt.toISOString() },
  { header: "fecha_transporte", get: (r) => r.transportDate },
  { header: "cargador", get: (r) => r.shipper },
  { header: "transportista", get: (r) => r.carrier },
  { header: "origen", get: (r) => r.origin },
  { header: "destino", get: (r) => r.destination },
  { header: "matricula_tractora", get: (r) => r.tractorPlate },
  { header: "matricula_remolque", get: (r) => r.trailerPlate },
  { header: "mercancia", get: (r) => r.goods },
  { header: "version_actual", get: (r) => String(r.versionNo) },
  { header: "estado", get: (r) => docWorkflowStatus(r) },
  {
    header: "url_publica",
    get: (r) => `${publicEnv.baseUrl.replace(/\/$/, "")}/d/${r.token}`,
  },
];

/**
 * Serialise history rows to CSV (UTF-8, `\r\n`, BOM so Excel opens it as UTF-8).
 * Tenant scoping is the caller's job — this only formats what it is given.
 */
export function historyToCsv(rows: HistoryRow[]): string {
  const lines = [COLUMNS.map((c) => c.header).join(",")];
  for (const r of rows) lines.push(COLUMNS.map((c) => csvField(c.get(r))).join(","));
  return "﻿" + lines.join("\r\n") + "\r\n";
}
