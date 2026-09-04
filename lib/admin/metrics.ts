import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * Admin V2 overview metrics (ADMIN #33 §1). An operational cockpit, not a vanity
 * dashboard: every number comes from a real row (DeCA versions, generation
 * failures, companies, acquisition), never from a counter that could drift.
 */

export type Window = "today" | "7d" | "30d";

const WINDOWS: Record<Window, number> = {
  today: 0,
  "7d": 7 * 864e5,
  "30d": 30 * 864e5,
};

/** Start of the given window relative to now (UTC midnight for `today`). */
export function windowStart(w: Window, now = new Date()): Date {
  if (w === "today") {
    const d = new Date(now);
    d.setUTCHours(0, 0, 0, 0);
    return d;
  }
  return new Date(now.getTime() - WINDOWS[w]);
}

export type WindowMetrics = {
  window: Window;
  decaGenerated: number;
  decaFailed: number;
  successRate: number | null;
  anonymousDeca: number;
  authenticatedDeca: number;
  newCompanies: number;
  activeCompanies: number;
  firstDecaActivations: number;
  newUsers: number;
};

async function windowMetrics(w: Window, now: Date): Promise<WindowMetrics> {
  const since = windowStart(w, now);

  const [creates, failed, anon, newCompanies, activeCompanyIds, activations, newUsers] =
    await Promise.all([
      prisma.decaVersion.count({ where: { versionNo: 1, createdAt: { gte: since } } }),
      prisma.generationFailure.count({ where: { createdAt: { gte: since } } }),
      prisma.deca.count({ where: { createdAt: { gte: since }, companyId: null } }),
      prisma.company.count({ where: { createdAt: { gte: since } } }),
      prisma.deca.findMany({
        where: { createdAt: { gte: since }, companyId: { not: null } },
        select: { companyId: true },
        distinct: ["companyId"],
      }),
      prisma.acquisition.count({ where: { firstDecaAt: { gte: since } } }),
      prisma.user.count({ where: { createdAt: { gte: since }, role: "user" } }),
    ]);

  const attempts = creates + failed;
  return {
    window: w,
    decaGenerated: creates,
    decaFailed: failed,
    successRate: attempts > 0 ? creates / attempts : null,
    anonymousDeca: anon,
    authenticatedDeca: creates - anon >= 0 ? creates - anon : 0,
    newCompanies,
    activeCompanies: activeCompanyIds.length,
    firstDecaActivations: activations,
    newUsers,
  };
}

export type OverviewMetrics = {
  windows: WindowMetrics[];
  totals: { companies: number; users: number; deca: number; unresolvedFailures: number };
  acquisition: {
    prospectsAwaitingActivation: number;
    topRefCode: { code: string; companies: number } | null;
    topSource: { source: string; count: number } | null;
  };
};

export async function overviewMetrics(now = new Date()): Promise<OverviewMetrics> {
  const [windows, companies, users, deca, unresolvedFailures, prospectsAwaiting, refRows, srcRows] =
    await Promise.all([
      Promise.all((["today", "7d", "30d"] as Window[]).map((w) => windowMetrics(w, now))),
      prisma.company.count(),
      prisma.user.count({ where: { role: "user" } }),
      prisma.deca.count(),
      prisma.generationFailure.count({ where: { resolvedAt: null, retriedOk: false } }),
      prisma.prospect.count({ where: { status: { in: ["prospect", "invited", "registered"] } } }),
      prisma.acquisition.groupBy({
        by: ["firstRefCode"],
        where: { firstRefCode: { not: null }, companyId: { not: null } },
        _count: { _all: true },
        orderBy: { _count: { firstRefCode: "desc" } },
        take: 1,
      }),
      prisma.acquisition.groupBy({
        by: ["firstUtmSource"],
        where: { firstUtmSource: { not: null } },
        _count: { _all: true },
        orderBy: { _count: { firstUtmSource: "desc" } },
        take: 1,
      }),
    ]);

  return {
    windows,
    totals: { companies, users, deca, unresolvedFailures },
    acquisition: {
      prospectsAwaitingActivation: prospectsAwaiting,
      topRefCode: refRows[0]?.firstRefCode
        ? { code: refRows[0].firstRefCode, companies: refRows[0]._count._all }
        : null,
      topSource: srcRows[0]?.firstUtmSource
        ? { source: srcRows[0].firstUtmSource, count: srcRows[0]._count._all }
        : null,
    },
  };
}

export type Alert = {
  level: "red" | "yellow";
  title: string;
  detail: string;
  href?: string;
};

/**
 * Operational alerts for the overview banner (#33 §1). "Do not hide a broken
 * product behind green vanity metrics" — these are the things an internal user
 * must see the moment they open `/admin`.
 */
export async function operationalAlerts(now = new Date()): Promise<Alert[]> {
  const alerts: Alert[] = [];
  const since24h = new Date(now.getTime() - 864e5);

  const [ok24, failed24, unresolved, staleStage] = await Promise.all([
    prisma.decaVersion.count({ where: { versionNo: 1, createdAt: { gte: since24h } } }),
    prisma.generationFailure.count({ where: { createdAt: { gte: since24h } } }),
    prisma.generationFailure.count({ where: { resolvedAt: null, retriedOk: false } }),
    prisma.generationFailure.groupBy({
      by: ["stage"],
      where: {
        createdAt: { gte: since24h },
        stage: { in: ["pdf_storage", "database", "configuration"] },
      },
      _count: { _all: true },
    }),
  ]);

  const attempts24 = ok24 + failed24;
  const failRate = attempts24 > 0 ? failed24 / attempts24 : 0;
  if (attempts24 >= 5 && failRate >= 0.2) {
    alerts.push({
      level: failRate >= 0.5 ? "red" : "yellow",
      title: `Tasa de fallo de generación ${Math.round(failRate * 100)}% (últimas 24 h)`,
      detail: `${failed24} intentos fallidos de ${attempts24}. Revisa los errores por etapa.`,
      href: "/admin/errores",
    });
  }

  for (const s of staleStage) {
    if (s._count._all >= 3) {
      alerts.push({
        level: "red",
        title: `Fallos repetidos en la etapa "${s.stage}" (${s._count._all} en 24 h)`,
        detail:
          s.stage === "pdf_storage"
            ? "El almacén de PDF está rechazando escrituras — comprueba el proveedor y las credenciales."
            : s.stage === "database"
              ? "La base de datos está fallando durante la generación."
              : "Falta configuración de entorno en producción.",
        href: "/admin/sistema",
      });
    }
  }

  if (unresolved >= 10) {
    alerts.push({
      level: "yellow",
      title: `${unresolved} fallos de generación sin resolver`,
      detail: "Correlaciones pendientes de revisión o de marcar como recuperadas.",
      href: "/admin/errores",
    });
  }

  return alerts;
}
