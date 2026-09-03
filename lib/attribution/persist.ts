import "server-only";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { ATTR_COOKIE } from "./parse";
import { EMPTY_ATTRIBUTION, toAcquisitionRow, type Attribution } from "./merge";

/** Read the first-party attribution cookie on the server. Best-effort. */
export async function readAttributionCookie(): Promise<Attribution> {
  try {
    const raw = (await cookies()).get(ATTR_COOKIE)?.value;
    if (!raw) return EMPTY_ATTRIBUTION;
    return JSON.parse(decodeURIComponent(raw)) as Attribution;
  } catch {
    return EMPTY_ATTRIBUTION;
  }
}

/**
 * Write the `acquisition` row at signup (F12 / EPIC 02). One row per company;
 * first-touch is written once and this is the only place it is set from a cookie.
 */
export async function writeAcquisitionAtSignup(userId: string, companyId: string): Promise<void> {
  const attr = await readAttributionCookie();
  const row = toAcquisitionRow(attr);
  const now = new Date();

  await prisma.acquisition.upsert({
    where: { companyId },
    create: { ...row, userId, companyId, signupAt: now },
    update: {}, // never overwrite an existing acquisition row
  });
}

/** Set `first_deca_at` the first time a company generates a DeCA. */
export async function markFirstDeca(companyId: string): Promise<void> {
  await prisma.acquisition.updateMany({
    where: { companyId, firstDecaAt: null },
    data: { firstDecaAt: new Date() },
  });
}

const ORGANIC = "(directo/orgánico)";

export type OperatorRow = {
  refCode: string;
  name: string;
  active: boolean;
  visits: number;
  companies: number;
  firstDeca: number;
  totalDeca: number;
  active7d: number;
  active30d: number;
};

/**
 * Per-operator acquisition + usage stats (feeds the /operadores dashboard, F13).
 * Metrics come from real events (`landing_view` visits) and real company usage
 * (DeCA generation), never from vanity counters.
 */
export async function operatorStats() {
  const now = Date.now();
  const d7 = new Date(now - 7 * 864e5);
  const d30 = new Date(now - 30 * 864e5);

  const operators = await prisma.operator.findMany({ orderBy: { name: "asc" } });
  const acqs = await prisma.acquisition.findMany({
    select: { firstRefCode: true, companyId: true, firstDecaAt: true },
  });
  const decas = await prisma.deca.findMany({
    where: { companyId: { not: null } },
    select: { companyId: true, createdAt: true },
  });

  const totalByCompany = new Map<string, number>();
  const active7ByCompany = new Set<string>();
  const active30ByCompany = new Set<string>();
  for (const d of decas) {
    if (!d.companyId) continue;
    totalByCompany.set(d.companyId, (totalByCompany.get(d.companyId) ?? 0) + 1);
    if (d.createdAt >= d7) active7ByCompany.add(d.companyId);
    if (d.createdAt >= d30) active30ByCompany.add(d.companyId);
  }

  // Visits: distinct sessions whose event ref snapshot names this code.
  const visitsByCode = new Map<string, number>();
  for (const o of operators) {
    const rows = await prisma.event.findMany({
      where: { refSnapshot: { path: ["ref"], equals: o.refCode } },
      select: { sessionId: true },
      distinct: ["sessionId"],
    });
    visitsByCode.set(o.refCode, rows.length);
  }

  const agg = new Map<
    string,
    { companies: number; firstDeca: number; totalDeca: number; a7: number; a30: number }
  >();
  const known = new Set(operators.map((o) => o.refCode));

  for (const a of acqs) {
    const code = a.firstRefCode && known.has(a.firstRefCode) ? a.firstRefCode : a.firstRefCode ?? ORGANIC;
    const s = agg.get(code) ?? { companies: 0, firstDeca: 0, totalDeca: 0, a7: 0, a30: 0 };
    s.companies += 1;
    if (a.firstDecaAt) s.firstDeca += 1;
    if (a.companyId) {
      s.totalDeca += totalByCompany.get(a.companyId) ?? 0;
      if (active7ByCompany.has(a.companyId)) s.a7 += 1;
      if (active30ByCompany.has(a.companyId)) s.a30 += 1;
    }
    agg.set(code, s);
  }

  const row = (code: string, name: string, active: boolean): OperatorRow => {
    const s = agg.get(code) ?? { companies: 0, firstDeca: 0, totalDeca: 0, a7: 0, a30: 0 };
    return {
      refCode: code,
      name,
      active,
      visits: visitsByCode.get(code) ?? 0,
      companies: s.companies,
      firstDeca: s.firstDeca,
      totalDeca: s.totalDeca,
      active7d: s.a7,
      active30d: s.a30,
    };
  };

  return {
    operators: operators.map((o) => row(o.refCode, o.name, o.active)),
    unknown: [...agg.keys()]
      .filter((c) => c !== ORGANIC && !known.has(c))
      .map((c) => row(c, `Código desconocido: ${c}`, false)),
    organic: row(ORGANIC, "Directo / orgánico", true),
  };
}
