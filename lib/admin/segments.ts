import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * Rule-based company segmentation, activation funnel and "companies to contact"
 * (#72 / #82 / #83). No AI, no opaque scoring — every tag maps to a documented,
 * reproducible rule over data the product already stores. These are usage
 * labels, never legal or billing states.
 */

export const SEGMENT_RULES = {
  registered_inactive: "Cuenta creada y 0 DeCA",
  profile_incomplete: "Ficha de empresa sin completar (#59)",
  first_deca: "Exactamente 1 DeCA en total",
  recurring: "2+ DeCA y actividad en los últimos 30 días",
  active_7d: "Al menos 1 DeCA en los últimos 7 días",
  active_30d: "Al menos 1 DeCA en los últimos 30 días",
  multi_user: "2+ miembros",
  high_volume: "Supera el umbral de DeCA/30d (configurable)",
  api_interested: "Ha enviado una solicitud de integración (#74)",
  inactive_30d: "Tiene DeCA pero ninguno en los últimos 30 días",
  recent_incident: "Fallo de generación en los últimos 7 días",
} as const;

export type SegmentTag = keyof typeof SEGMENT_RULES;

export const SEGMENT_LABEL: Record<SegmentTag, string> = {
  registered_inactive: "Registrado sin activar",
  profile_incomplete: "Perfil incompleto",
  first_deca: "Primer DeCA creado",
  recurring: "Usuario recurrente",
  active_7d: "Activa 7d",
  active_30d: "Activa 30d",
  multi_user: "Multiusuario",
  high_volume: "Alto volumen",
  api_interested: "Interesado en API/ERP",
  inactive_30d: "Inactivo 30d",
  recent_incident: "Incidencia reciente",
};

const HIGH_VOLUME_30D = 30; // configurable threshold

export type CompanySegment = {
  id: string;
  name: string;
  nif: string | null;
  status: string;
  contactName: string | null;
  email: string | null;
  createdAt: Date;
  members: number;
  total: number;
  d7: number;
  d30: number;
  firstDecaAt: Date | null;
  lastDecaAt: Date | null;
  dataComplete: boolean;
  tags: SegmentTag[];
};

export type ContactReason = {
  company: CompanySegment;
  reason: string;
  bucket: "onboarding_stalled" | "no_repeat" | "high_use" | "team";
};

function tagsFor(
  c: Omit<CompanySegment, "tags">,
  hasIncident: boolean,
  apiInterested: boolean,
): SegmentTag[] {
  const t: SegmentTag[] = [];
  if (c.total === 0) t.push("registered_inactive");
  if (!c.dataComplete) t.push("profile_incomplete");
  if (c.total === 1) t.push("first_deca");
  if (c.total >= 2 && c.d30 > 0) t.push("recurring");
  if (c.d7 > 0) t.push("active_7d");
  if (c.d30 > 0) t.push("active_30d");
  if (c.members >= 2) t.push("multi_user");
  if (c.d30 >= HIGH_VOLUME_30D) t.push("high_volume");
  if (apiInterested) t.push("api_interested");
  if (c.total > 0 && c.d30 === 0) t.push("inactive_30d");
  if (hasIncident) t.push("recent_incident");
  return t;
}

/** All companies with their computed usage tags — powers `/admin/empresas` chip filters. */
export async function listCompanySegments(now = new Date()): Promise<CompanySegment[]> {
  const d7 = new Date(now.getTime() - 7 * 864e5);
  const d30 = new Date(now.getTime() - 30 * 864e5);

  const [companies, decaByCompany, failures, integ] = await Promise.all([
    prisma.company.findMany({
      include: {
        _count: { select: { users: true } },
        acquisition: { select: { firstDecaAt: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.deca.findMany({
      where: { companyId: { not: null } },
      select: { companyId: true, createdAt: true },
    }),
    prisma.generationFailure.findMany({
      where: { companyId: { not: null }, createdAt: { gte: d7 } },
      select: { companyId: true },
    }),
    prisma.integrationRequest
      .findMany({ select: { companyId: true } })
      .catch(() => [] as { companyId: string }[]),
  ]);

  const byCompany = new Map<
    string,
    { total: number; d7: number; d30: number; last: Date | null }
  >();
  for (const d of decaByCompany) {
    if (!d.companyId) continue;
    const e = byCompany.get(d.companyId) ?? { total: 0, d7: 0, d30: 0, last: null };
    e.total += 1;
    if (d.createdAt >= d7) e.d7 += 1;
    if (d.createdAt >= d30) e.d30 += 1;
    if (!e.last || d.createdAt > e.last) e.last = d.createdAt;
    byCompany.set(d.companyId, e);
  }
  const incidentCompanies = new Set(failures.map((f) => f.companyId!));
  const apiCompanies = new Set(integ.map((i) => i.companyId));

  return companies.map((c) => {
    const agg = byCompany.get(c.id) ?? { total: 0, d7: 0, d30: 0, last: null };
    const base = {
      id: c.id,
      name: c.name,
      nif: c.nif,
      status: c.status,
      contactName: c.contactName,
      email: c.email,
      createdAt: c.createdAt,
      members: c._count.users,
      total: agg.total,
      d7: agg.d7,
      d30: agg.d30,
      firstDecaAt: c.acquisition?.firstDecaAt ?? null,
      lastDecaAt: agg.last,
      dataComplete: !!c.dataCompletedAt,
    };
    return { ...base, tags: tagsFor(base, incidentCompanies.has(c.id), apiCompanies.has(c.id)) };
  });
}

export type Funnel = {
  registered: number;
  profileComplete: number;
  firstDeca: number;
  repeated: number;
  active7d: number;
  active30d: number;
};

export function funnelFromSegments(segs: CompanySegment[]): Funnel {
  return {
    registered: segs.length,
    profileComplete: segs.filter((s) => s.dataComplete).length,
    firstDeca: segs.filter((s) => s.total >= 1).length,
    repeated: segs.filter((s) => s.total >= 2).length,
    active7d: segs.filter((s) => s.d7 > 0).length,
    active30d: segs.filter((s) => s.d30 > 0).length,
  };
}

/** "Empresas a contactar" — transparent rules, most-actionable first. */
export function companiesToContact(segs: CompanySegment[], now = new Date()): ContactReason[] {
  const out: ContactReason[] = [];
  const h48 = new Date(now.getTime() - 48 * 3600e3);
  const d14 = new Date(now.getTime() - 14 * 864e5);
  for (const c of segs) {
    if (c.status !== "active") continue;
    if (c.createdAt < h48 && (c.total === 0 || !c.dataComplete)) {
      out.push({
        company: c,
        bucket: "onboarding_stalled",
        reason:
          c.total === 0
            ? "Registrada hace >48 h y sin ningún DeCA"
            : "Registrada hace >48 h y sin completar la ficha de empresa",
      });
      continue;
    }
    if (c.total === 1 && c.lastDecaAt && c.lastDecaAt < d14) {
      out.push({
        company: c,
        bucket: "no_repeat",
        reason: "Generó 1 DeCA y no ha vuelto en 14 días",
      });
      continue;
    }
    if (c.d30 >= HIGH_VOLUME_30D) {
      out.push({ company: c, bucket: "high_use", reason: `Alto uso: ${c.d30} DeCA en 30 días` });
      continue;
    }
    if (c.members >= 3 && c.d30 > 0) {
      out.push({
        company: c,
        bucket: "team",
        reason: `Equipo consolidado: ${c.members} miembros activos`,
      });
    }
  }
  return out;
}

/** "Señales de oportunidad de producto" (#83) — usage patterns worth noticing. */
export function opportunitySignals(
  segs: CompanySegment[],
): { company: CompanySegment; signal: string }[] {
  const out: { company: CompanySegment; signal: string }[] = [];
  for (const c of segs) {
    if (c.d30 >= HIGH_VOLUME_30D)
      out.push({ company: c, signal: `Alto uso: ${c.d30} DeCA en 30 días` });
    else if (c.members >= 4 && c.d30 > 0)
      out.push({ company: c, signal: `Equipo consolidado: ${c.members} usuarios` });
    else if (c.tags.includes("api_interested"))
      out.push({ company: c, signal: "Solicitó integración con un sistema externo" });
    else if (c.total >= 5 && c.d7 > 0 && c.d7 >= Math.ceil(c.d30 / 2))
      out.push({ company: c, signal: "Crecimiento fuerte de uso en los últimos 7 días" });
  }
  return out;
}
