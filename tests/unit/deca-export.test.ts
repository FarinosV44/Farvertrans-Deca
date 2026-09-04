import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { historyToCsv, docWorkflowStatus } from "@/lib/deca/export";
import type { HistoryRow } from "@/lib/data/history";

const row = (over: Partial<HistoryRow> = {}): HistoryRow => ({
  id: "d1",
  reference: "DECA-ABCD1234",
  createdAt: new Date("2026-10-01T08:30:00.000Z"),
  loadDate: "2026-10-06",
  unloadDate: "2026-10-06",
  loadLocation: "Almacén Turia — Valencia",
  unloadLocation: "Plataforma Norte — Madrid",
  shipper: "Cargas SL",
  carrier: "Trans SL",
  goods: "Palés",
  tractorPlate: "1234 BCD",
  trailerPlate: "",
  versionNo: 1,
  token: "tok_abc",
  status: "activo",
  ...over,
});

describe("docWorkflowStatus (PRODUCT #34 §4)", () => {
  it("a current single-version document is Vigente", () => {
    expect(docWorkflowStatus(row())).toBe("Vigente");
  });
  it("a corrected document is Corregida", () => {
    expect(docWorkflowStatus(row({ versionNo: 3 }))).toBe("Corregida");
  });
  it("a deactivated document is No disponible regardless of version", () => {
    expect(docWorkflowStatus(row({ status: "no disponible", versionNo: 2 }))).toBe("No disponible");
  });
});

describe("historyToCsv (PRODUCT #34 §3)", () => {
  it("has a header row with the documented columns and a BOM", () => {
    const csv = historyToCsv([]);
    expect(csv.startsWith("﻿")).toBe(true);
    expect(csv).toContain(
      "referencia,creado,fecha_carga,fecha_descarga,cargador,transportista,lugar_carga,lugar_descarga,matricula_tractora,matricula_remolque,mercancia,version_actual,estado,url_publica",
    );
  });

  it("emits one CRLF-terminated line per row with the workflow status and public URL", () => {
    const csv = historyToCsv([row(), row({ versionNo: 2, reference: "DECA-99998888" })]);
    const lines = csv.trimEnd().split("\r\n");
    expect(lines).toHaveLength(3); // header + 2
    expect(lines[1]).toContain("DECA-ABCD1234");
    expect(lines[1]).toContain("Vigente");
    expect(lines[1]).toMatch(/\/d\/tok_abc$/);
    expect(lines[2]).toContain("Corregida");
  });

  it("quotes fields containing a comma, quote or newline (RFC 4180)", () => {
    const csv = historyToCsv([
      row({ shipper: 'Cargas, "El Puerto" SL', goods: "línea 1\nlínea 2" }),
    ]);
    expect(csv).toContain('"Cargas, ""El Puerto"" SL"');
    expect(csv).toContain('"línea 1\nlínea 2"');
  });
});
