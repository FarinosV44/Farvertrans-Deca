import "server-only";
import { prisma } from "@/lib/prisma";
import { listOpportunities } from "@/lib/commercial/opportunities";
import { ZONE_LABEL } from "@/lib/commercial/corridors";
import {
  ALERT_RULES,
  evaluateAlerts,
  type AlertCandidate,
  type AlertConfig,
  type AlertInput,
} from "@/lib/commercial/alert-rules";

/**
 * Internal, rule-based commercial alerts (#90). Computed from the account's own
 * data — never sent anywhere, never using external AI/geocoding/messaging. Only
 * for companies eligible for commercial use (`listOpportunities` already gates
 * on active `CommercialConsent`). `refreshAlerts()` recomputes the candidate set
 * and reconciles it with the stored alerts, de-duplicated by `dedupeKey`.
 */

export { ALERT_RULES, type AlertConfig, type AlertCandidate };

export const DEFAULT_ALERT_CONFIG: AlertConfig = {
  priorityCorridors: [],
  priorityCountries: [],
  minMovements: 2,
  windowDays: 30,
  staleFollowUpDays: 10,
  reactivationDays: 60,
};

export async function getAlertConfig(): Promise<AlertConfig> {
  const row = await prisma.commercialAlertConfig.findUnique({ where: { id: "singleton" } });
  if (!row) return DEFAULT_ALERT_CONFIG;
  return {
    priorityCorridors: row.priorityCorridors,
    priorityCountries: row.priorityCountries,
    minMovements: row.minMovements,
    windowDays: row.windowDays,
    staleFollowUpDays: row.staleFollowUpDays,
    reactivationDays: row.reactivationDays,
  };
}

export async function saveAlertConfig(
  patch: Partial<AlertConfig>,
  actorUserId: string,
): Promise<void> {
  const data = {
    ...(patch.priorityCorridors !== undefined
      ? { priorityCorridors: patch.priorityCorridors }
      : {}),
    ...(patch.priorityCountries !== undefined
      ? { priorityCountries: patch.priorityCountries }
      : {}),
    ...(patch.minMovements !== undefined ? { minMovements: patch.minMovements } : {}),
    ...(patch.windowDays !== undefined ? { windowDays: patch.windowDays } : {}),
    ...(patch.staleFollowUpDays !== undefined
      ? { staleFollowUpDays: patch.staleFollowUpDays }
      : {}),
    ...(patch.reactivationDays !== undefined ? { reactivationDays: patch.reactivationDays } : {}),
    updatedByUserId: actorUserId,
  };
  await prisma.commercialAlertConfig.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", ...DEFAULT_ALERT_CONFIG, ...data },
    update: data,
  });
}

export type StoredAlert = {
  id: string;
  companyId: string;
  companyName: string;
  kind: string;
  title: string;
  detail: string;
  score: number;
  routeContext: string | null;
  status: "pending" | "reviewed" | "dismissed";
  createdAt: Date;
};

/**
 * Recompute every company's alert candidates and reconcile with the stored
 * rows: new candidates are inserted; a `pending` alert whose condition no longer
 * holds is removed; `reviewed` / `dismissed` alerts are never resurrected or
 * touched.
 */
export async function refreshAlerts(
  now: Date = new Date(),
): Promise<{ created: number; removed: number }> {
  const [{ opportunities }, config, lastTouches] = await Promise.all([
    listOpportunities({}, now),
    getAlertConfig(),
    prisma.commercialActivityLog.groupBy({
      by: ["companyId"],
      _max: { createdAt: true },
    }),
  ]);
  const lastTouchByCompany = new Map(
    lastTouches.map((t) => [t.companyId, t._max.createdAt ?? null]),
  );

  const acqTiming = await prisma.acquisition.findMany({
    where: { companyId: { in: opportunities.map((o) => o.companyId) } },
    select: { companyId: true, signupAt: true, firstDecaAt: true },
  });
  const acqByCompany = new Map(acqTiming.map((a) => [a.companyId, a]));

  const candidates: (AlertCandidate & { companyId: string })[] = [];
  for (const o of opportunities) {
    const acq = acqByCompany.get(o.companyId);
    const input: AlertInput = {
      companyId: o.companyId,
      companyName: o.companyName,
      state: o.state,
      corridors: o.corridors,
      endZoneLabels: o.endZoneLabels,
      endZones: o.endZones,
      movements: {
        d7: o.movements.d7,
        d30: o.movements.d30,
        d60: o.movements.d60,
        d90: o.movements.d90,
        total: o.movements.total,
      },
      topRouteRepeat: o.topRouteRepeat,
      topRouteLabel: o.topRouteLabel,
      nextUnloadDate: o.nextUnloadDate,
      lastActivityAt: o.lastActivityAt,
      routeGapDays: routeGapDays(o.routes),
      lastCommercialTouchAt: lastTouchByCompany.get(o.companyId) ?? null,
      hasAcquisitionOperator: !!o.operator,
      signupAt: acq?.signupAt ?? null,
      firstDecaAt: acq?.firstDecaAt ?? null,
    };
    for (const c of evaluateAlerts(input, config, now)) {
      candidates.push({ ...c, companyId: o.companyId });
    }
  }

  const wantKeys = new Set(candidates.map((c) => c.dedupeKey));
  const existing = await prisma.commercialAlert.findMany({
    select: { id: true, dedupeKey: true, status: true },
  });
  const existingByKey = new Map(existing.map((e) => [e.dedupeKey, e]));

  let created = 0;
  for (const c of candidates) {
    const prev = existingByKey.get(c.dedupeKey);
    if (prev) {
      if (prev.status === "pending") {
        await prisma.commercialAlert.update({
          where: { id: prev.id },
          data: { title: c.title, detail: c.detail, score: c.score, routeContext: c.routeContext },
        });
      }
      continue;
    }
    await prisma.commercialAlert.create({
      data: {
        companyId: c.companyId,
        kind: c.kind,
        dedupeKey: c.dedupeKey,
        title: c.title,
        detail: c.detail,
        score: c.score,
        routeContext: c.routeContext,
      },
    });
    created += 1;
  }

  const stalePending = existing.filter((e) => e.status === "pending" && !wantKeys.has(e.dedupeKey));
  if (stalePending.length > 0) {
    await prisma.commercialAlert.deleteMany({
      where: { id: { in: stalePending.map((e) => e.id) } },
    });
  }

  return { created, removed: stalePending.length };
}

/** Days between the two most recent route observations, or null. */
function routeGapDays(routes: { observedAt: Date }[]): number | null {
  if (routes.length < 2) return null;
  const sorted = [...routes].sort((a, b) => b.observedAt.getTime() - a.observedAt.getTime());
  return Math.round((sorted[0].observedAt.getTime() - sorted[1].observedAt.getTime()) / 864e5);
}

export async function listAlerts(
  status: "pending" | "reviewed" | "dismissed" | "all" = "pending",
): Promise<StoredAlert[]> {
  const rows = await prisma.commercialAlert.findMany({
    where: status === "all" ? {} : { status },
    orderBy: [{ score: "desc" }, { createdAt: "desc" }],
    take: 200,
    include: { company: { select: { name: true } } },
  });
  return rows.map((r) => ({
    id: r.id,
    companyId: r.companyId,
    companyName: r.company.name,
    kind: r.kind,
    title: r.title,
    detail: r.detail,
    score: r.score,
    routeContext: r.routeContext,
    status: r.status as StoredAlert["status"],
    createdAt: r.createdAt,
  }));
}

export async function pendingAlertCount(): Promise<number> {
  return prisma.commercialAlert.count({ where: { status: "pending" } });
}

export async function setAlertStatus(
  id: string,
  status: "reviewed" | "dismissed" | "pending",
  actorUserId: string,
): Promise<boolean> {
  const res = await prisma.commercialAlert.updateMany({
    where: { id },
    data: { status, reviewedByUserId: status === "pending" ? null : actorUserId },
  });
  return res.count > 0;
}

/** Human label for a zone label list (used by the config UI). */
export function zoneLabelList(): { id: string; label: string }[] {
  return Object.entries(ZONE_LABEL).map(([id, label]) => ({ id, label }));
}
