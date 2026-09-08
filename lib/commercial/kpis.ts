import "server-only";
import { prisma } from "@/lib/prisma";
import {
  OPPORTUNITY_STATES,
  OPPORTUNITY_STATE_LABEL,
  type OpportunityState,
} from "@/lib/commercial/opportunity-model";
import { matchCorridors, type RouteFacts } from "@/lib/commercial/corridors";

/**
 * `Super Admin` commercial KPIs (#89): the simple funnel
 * `DeCA → oportunidad → contacto → conversión → facturación/margen`, computed
 * entirely from the account's own rows (`CommercialOpportunity`,
 * `CommercialActivityLog`, `DecaRouteIntel`, `Acquisition`). No CRM, no external
 * services. Attribution keeps two things apart: who ACQUIRED the company for
 * DeCA (referral, #2/#86) and who CONVERTED the opportunity for Farvertrans
 * (`convertedByUserId`).
 */

/** Rank of "how far down the funnel" a state sits; negatives are terminal. */
const PROGRESS: Record<OpportunityState, number> = {
  review: 0,
  contacted: 1,
  interested: 2,
  awaiting_load: 3,
  first_load_offered: 4,
  first_load_awarded: 5,
  converted: 6,
  not_interested: -1,
  unavailable: -1,
  discarded: -1,
};

export type CommercialKpiFilter = {
  /** ISO dates bounding the opportunity's last activity / conversion. */
  from?: string;
  to?: string;
  /** Acquisition operator ref code (`Acquisition.firstRefCode`). */
  acquisitionOperator?: string;
  /** Internal commercial operator user id (`convertedByUserId`). */
  commercialOperator?: string;
  /** Free-text country match against the carrier's observed routes. */
  country?: string;
  corridor?: string;
};

export type FunnelRow = { state: OpportunityState; label: string; count: number };

export type CommercialKpis = {
  detected: number;
  contacted: number;
  interested: number;
  converted: number;
  conversionRate: number;
  loads: number;
  revenueEur: number;
  marginEur: number;
  funnel: FunnelRow[];
  byAcquisitionOperator: { code: string; detected: number; converted: number }[];
  byCommercialOperator: { userId: string; email: string; converted: number; actions: number }[];
};

/** Pure: the count of opportunities currently in each state, in funnel order. */
export function rollupFunnel(states: OpportunityState[]): FunnelRow[] {
  const counts = new Map<OpportunityState, number>();
  for (const s of states) counts.set(s, (counts.get(s) ?? 0) + 1);
  return OPPORTUNITY_STATES.map((state) => ({
    state,
    label: OPPORTUNITY_STATE_LABEL[state],
    count: counts.get(state) ?? 0,
  }));
}

/** Pure: highest funnel progress a company reached, from its state history. */
export function maxProgress(
  currentState: OpportunityState,
  everStates: OpportunityState[],
): number {
  return [currentState, ...everStates].reduce((m, s) => Math.max(m, PROGRESS[s] ?? -1), -1);
}

function fold(s: string | null | undefined): string {
  return (s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").trim().toLowerCase();
}

export async function commercialKpis(filter: CommercialKpiFilter = {}): Promise<CommercialKpis> {
  const eligible = await prisma.commercialConsent.findMany({
    where: { mode: { not: "none" } },
    select: { companyId: true },
  });
  const eligibleIds = eligible.map((e) => e.companyId);
  if (eligibleIds.length === 0) return empty();

  const [opps, logs, routeRows, acquisitions, users] = await Promise.all([
    prisma.commercialOpportunity.findMany({
      where: { companyId: { in: eligibleIds } },
    }),
    prisma.commercialActivityLog.findMany({
      where: { companyId: { in: eligibleIds } },
      select: { companyId: true, toState: true, channel: true, actorUserId: true, createdAt: true },
    }),
    prisma.decaRouteIntel.findMany({
      where: { companyId: { in: eligibleIds } },
      select: {
        companyId: true,
        loadCountry: true,
        loadProvince: true,
        loadCity: true,
        unloadCountry: true,
        unloadProvince: true,
        unloadCity: true,
      },
    }),
    prisma.acquisition.findMany({
      where: { companyId: { in: eligibleIds } },
      select: { companyId: true, firstRefCode: true },
    }),
    prisma.user.findMany({ where: { role: "internal" }, select: { id: true, email: true } }),
  ]);

  const emailByUser = new Map(users.map((u) => [u.id, u.email]));
  const acqByCompany = new Map(acquisitions.map((a) => [a.companyId, a.firstRefCode]));

  // company → set of observed countries + corridor ids (for the geo filter)
  const routeFacts = new Map<string, { countries: Set<string>; corridors: Set<string> }>();
  for (const r of routeRows) {
    if (!r.companyId) continue;
    const e = routeFacts.get(r.companyId) ?? { countries: new Set(), corridors: new Set() };
    for (const c of [r.loadCountry, r.unloadCountry]) if (c) e.countries.add(fold(c));
    const facts: RouteFacts = r;
    for (const m of matchCorridors(facts)) e.corridors.add(m.id);
    routeFacts.set(r.companyId, e);
  }
  const companiesWithActivity = new Set(
    routeRows.map((r) => r.companyId).filter(Boolean) as string[],
  );

  const from = filter.from ? new Date(`${filter.from}T00:00:00Z`) : null;
  const to = filter.to ? new Date(`${filter.to}T23:59:59Z`) : null;

  const logsByCompany = new Map<string, typeof logs>();
  for (const l of logs) {
    const list = logsByCompany.get(l.companyId) ?? [];
    list.push(l);
    logsByCompany.set(l.companyId, list);
  }

  const geoOk = (companyId: string) => {
    if (!filter.country && !filter.corridor) return true;
    const f = routeFacts.get(companyId);
    if (!f) return false;
    if (filter.country && ![...f.countries].some((c) => c.includes(fold(filter.country))))
      return false;
    if (filter.corridor && !f.corridors.has(filter.corridor)) return false;
    return true;
  };

  let detected = 0;
  let contacted = 0;
  let interested = 0;
  let converted = 0;
  let loads = 0;
  let revenueEur = 0;
  let marginEur = 0;
  const funnelStates: OpportunityState[] = [];
  const byAcq = new Map<string, { detected: number; converted: number }>();
  const byCom = new Map<string, { converted: number; actions: number }>();

  for (const companyId of eligibleIds) {
    if (!geoOk(companyId)) continue;
    if (filter.acquisitionOperator && acqByCompany.get(companyId) !== filter.acquisitionOperator)
      continue;

    const opp = opps.find((o) => o.companyId === companyId);
    const companyLogs = (logsByCompany.get(companyId) ?? []).filter((l) => {
      if (from && l.createdAt < from) return false;
      if (to && l.createdAt > to) return false;
      return true;
    });

    // period filter: keep the company when it has activity in the window, or
    // (no window set) whenever it has any opportunity/route presence.
    const inWindow =
      (!from && !to) || companyLogs.length > 0 || (opp && within(opp.updatedAt, from, to));
    if (!inWindow) continue;

    const onRadar = companiesWithActivity.has(companyId) || !!opp;
    if (!onRadar) continue;

    if (filter.commercialOperator) {
      const touched =
        opp?.convertedByUserId === filter.commercialOperator ||
        companyLogs.some((l) => l.actorUserId === filter.commercialOperator);
      if (!touched) continue;
    }

    detected += 1;
    const currentState = (opp?.state ?? "review") as OpportunityState;
    funnelStates.push(currentState);

    const ever = companyLogs.map((l) => l.toState).filter((s): s is OpportunityState => !!s);
    const progress = maxProgress(currentState, ever);
    const hadRealChannel = companyLogs.some((l) => l.channel && l.channel !== "none");
    if (progress >= 1 || hadRealChannel) contacted += 1;
    if (progress >= 2) interested += 1;

    if (currentState === "converted") {
      converted += 1;
      loads += opp?.loadsGenerated ?? 0;
      revenueEur += opp?.revenueEur ?? 0;
      marginEur += opp?.marginEur ?? 0;
      const code = acqByCompany.get(companyId);
      if (code) {
        const a = byAcq.get(code) ?? { detected: 0, converted: 0 };
        a.converted += 1;
        byAcq.set(code, a);
      }
      if (opp?.convertedByUserId) {
        const c = byCom.get(opp.convertedByUserId) ?? { converted: 0, actions: 0 };
        c.converted += 1;
        byCom.set(opp.convertedByUserId, c);
      }
    }

    const code = acqByCompany.get(companyId);
    if (code) {
      const a = byAcq.get(code) ?? { detected: 0, converted: 0 };
      a.detected += 1;
      byAcq.set(code, a);
    }
    for (const l of companyLogs) {
      if (!l.actorUserId) continue;
      const c = byCom.get(l.actorUserId) ?? { converted: 0, actions: 0 };
      c.actions += 1;
      byCom.set(l.actorUserId, c);
    }
  }

  return {
    detected,
    contacted,
    interested,
    converted,
    conversionRate: detected > 0 ? Math.round((converted / detected) * 1000) / 10 : 0,
    loads,
    revenueEur,
    marginEur,
    funnel: rollupFunnel(funnelStates),
    byAcquisitionOperator: [...byAcq.entries()]
      .map(([code, v]) => ({ code, ...v }))
      .sort((a, b) => b.converted - a.converted || b.detected - a.detected),
    byCommercialOperator: [...byCom.entries()]
      .map(([userId, v]) => ({ userId, email: emailByUser.get(userId) ?? userId, ...v }))
      .sort((a, b) => b.converted - a.converted || b.actions - a.actions),
  };
}

export type ActivityEntry = {
  companyId: string;
  companyName: string;
  actorEmail: string | null;
  fromState: OpportunityState | null;
  toState: OpportunityState | null;
  channel: string;
  note: string | null;
  routeContext: string | null;
  createdAt: Date;
};

/** The most recent commercial actions across every carrier (#89 activity trail). */
export async function recentCommercialActivity(limit = 40): Promise<ActivityEntry[]> {
  const rows = await prisma.commercialActivityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { company: { select: { name: true } } },
  });
  const actorIds = [...new Set(rows.map((r) => r.actorUserId).filter((x): x is string => !!x))];
  const users = actorIds.length
    ? await prisma.user.findMany({
        where: { id: { in: actorIds } },
        select: { id: true, email: true },
      })
    : [];
  const emailById = new Map(users.map((u) => [u.id, u.email]));
  return rows.map((r) => ({
    companyId: r.companyId,
    companyName: r.company.name,
    actorEmail: r.actorUserId ? (emailById.get(r.actorUserId) ?? null) : null,
    fromState: r.fromState,
    toState: r.toState,
    channel: r.channel,
    note: r.note,
    routeContext: r.routeContext,
    createdAt: r.createdAt,
  }));
}

/** Company-scoped activity trail — for the #88 carrier profile panel. */
export async function carrierCommercialActivity(
  companyId: string,
  limit = 20,
): Promise<ActivityEntry[]> {
  const rows = await prisma.commercialActivityLog.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { company: { select: { name: true } } },
  });
  const actorIds = [...new Set(rows.map((r) => r.actorUserId).filter((x): x is string => !!x))];
  const users = actorIds.length
    ? await prisma.user.findMany({
        where: { id: { in: actorIds } },
        select: { id: true, email: true },
      })
    : [];
  const emailById = new Map(users.map((u) => [u.id, u.email]));
  return rows.map((r) => ({
    companyId: r.companyId,
    companyName: r.company.name,
    actorEmail: r.actorUserId ? (emailById.get(r.actorUserId) ?? null) : null,
    fromState: r.fromState,
    toState: r.toState,
    channel: r.channel,
    note: r.note,
    routeContext: r.routeContext,
    createdAt: r.createdAt,
  }));
}

function within(d: Date, from: Date | null, to: Date | null): boolean {
  if (from && d < from) return false;
  if (to && d > to) return false;
  return true;
}

function empty(): CommercialKpis {
  return {
    detected: 0,
    contacted: 0,
    interested: 0,
    converted: 0,
    conversionRate: 0,
    loads: 0,
    revenueEur: 0,
    marginEur: 0,
    funnel: rollupFunnel([]),
    byAcquisitionOperator: [],
    byCommercialOperator: [],
  };
}
