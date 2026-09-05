import "server-only";
import { prisma } from "@/lib/prisma";
import { publicEnv } from "@/lib/env";
import { isPubliclyAvailable } from "@/lib/deca/deactivation";
import { formatLocationShort } from "@/lib/deca/location";
import type { DecaPayloadData } from "@/lib/data/history";

/**
 * Cross-tenant read models for the admin command center (ADMIN #33 §2–§4).
 * These deliberately bypass the company scoping that `lib/data/*` enforces —
 * they are only ever reached through `requireInternal()`. Document CONTENT is
 * summarised, never returned whole, and no auth secret is ever included.
 */

function refOf(token: string): string {
  return `DECA-${token.slice(0, 8).toUpperCase()}`;
}

export type DecaAdminFilter = {
  q?: string;
  scope?: "all" | "anonymous" | "authenticated";
  status?: "active" | "unavailable";
  corrected?: "current" | "corrected";
};

export type DecaAdminRow = {
  id: string;
  reference: string;
  createdAt: Date;
  serviceDate: string;
  scope: "anónimo" | "empresa";
  companyName: string | null;
  route: string;
  versionNo: number;
  corrected: boolean;
  status: "activo" | "no disponible";
  pdfStored: boolean;
};

export async function listDecaAdmin(
  filter: DecaAdminFilter = {},
  take = 300,
): Promise<DecaAdminRow[]> {
  const decas = await prisma.deca.findMany({
    where: {
      ...(filter.scope === "anonymous" ? { companyId: null } : {}),
      ...(filter.scope === "authenticated" ? { companyId: { not: null } } : {}),
    },
    include: {
      currentVersion: true,
      company: { select: { name: true } },
      _count: { select: { versions: true } },
    },
    orderBy: { createdAt: "desc" },
    take,
  });

  const q = filter.q?.trim().toLowerCase();
  const rows: DecaAdminRow[] = [];
  for (const d of decas) {
    if (!d.currentVersion) continue;
    const data = (d.currentVersion.dataJson ?? {}) as DecaPayloadData;
    const corrected = d._count.versions > 1;
    const status = isPubliclyAvailable(d.serviceEnd) ? "activo" : "no disponible";
    if (filter.status === "active" && status !== "activo") continue;
    if (filter.status === "unavailable" && status !== "no disponible") continue;
    if (filter.corrected === "current" && corrected) continue;
    if (filter.corrected === "corrected" && !corrected) continue;

    const reference = refOf(d.currentVersion.token);
    const loadShort = formatLocationShort(data.loadLocation) || "—";
    const unloadShort = formatLocationShort(data.unloadLocation) || "—";
    const route = `${loadShort} → ${unloadShort}`;
    if (
      q &&
      ![
        reference,
        d.company?.name,
        data.shipper?.name,
        data.carrier?.name,
        data.loadLocation?.name,
        data.loadLocation?.city,
        data.unloadLocation?.name,
        data.unloadLocation?.city,
      ]
        .filter(Boolean)
        .some((s) => s!.toLowerCase().includes(q))
    )
      continue;

    rows.push({
      id: d.id,
      reference,
      createdAt: d.createdAt,
      serviceDate: data.loadDate ?? "",
      scope: d.companyId ? "empresa" : "anónimo",
      companyName: d.company?.name ?? null,
      route,
      versionNo: d.currentVersion.versionNo,
      corrected,
      status,
      pdfStored: !!d.currentVersion.pdfPath,
    });
  }
  return rows;
}

export async function getDecaAdmin(id: string) {
  const deca = await prisma.deca.findUnique({
    where: { id },
    include: {
      company: true,
      createdByUser: { select: { id: true, email: true } },
      currentVersion: true,
      versions: { orderBy: { versionNo: "desc" } },
      claimTokens: { select: { expiresAt: true, usedAt: true } },
    },
  });
  if (!deca?.currentVersion) return null;

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

  const acq = deca.companyId
    ? await prisma.acquisition.findUnique({ where: { companyId: deca.companyId } })
    : null;

  const base = publicEnv.baseUrl.replace(/\/$/, "");
  const data = (deca.currentVersion.dataJson ?? {}) as DecaPayloadData;

  return {
    id: deca.id,
    reference: refOf(deca.currentVersion.token),
    createdAt: deca.createdAt,
    serviceStart: deca.serviceStart,
    serviceEnd: deca.serviceEnd,
    scope: deca.companyId ? ("empresa" as const) : ("anónimo" as const),
    company: deca.company
      ? { id: deca.company.id, name: deca.company.name, nif: deca.company.nif }
      : null,
    creator: deca.createdByUser?.email ?? null,
    route: `${formatLocationShort(data.loadLocation) || "—"} → ${formatLocationShort(data.unloadLocation) || "—"}`,
    goodsSummary: data.goods ?? "",
    parties: {
      shipper: data.shipper?.name ?? "",
      carrier: data.carrier?.name ?? "",
    },
    current: {
      versionNo: deca.currentVersion.versionNo,
      token: deca.currentVersion.token,
      pdfSha256: deca.currentVersion.pdfSha256 ?? "",
      pdfPath: deca.currentVersion.pdfPath ?? null,
      publicUrl: `${base}/d/${deca.currentVersion.token}`,
    },
    versions: deca.versions.map((v) => ({
      versionNo: v.versionNo,
      token: v.token,
      createdAt: v.createdAt,
      changeReason: v.changeReason,
      pdfSha256: v.pdfSha256 ?? "",
      author: v.createdByUserId ? (emailById.get(v.createdByUserId) ?? null) : null,
      isCurrent: v.id === deca.currentVersionId,
      publicUrl: `${base}/d/${v.token}`,
    })),
    claim: deca.claimTokens[0]
      ? { expiresAt: deca.claimTokens[0].expiresAt, used: !!deca.claimTokens[0].usedAt }
      : null,
    acquisition: acq
      ? {
          firstRefCode: acq.firstRefCode,
          lastRefCode: acq.lastRefCode,
          firstUtmSource: acq.firstUtmSource,
          firstUtmCampaign: acq.firstUtmCampaign,
          signupAt: acq.signupAt,
          firstDecaAt: acq.firstDecaAt,
        }
      : null,
  };
}

export type CompanyAdminRow = {
  id: string;
  name: string;
  nif: string | null;
  createdAt: Date;
  members: number;
  totalDeca: number;
  lastDecaAt: Date | null;
  refCode: string | null;
  active30d: boolean;
};

export async function listCompaniesAdmin(q?: string, take = 300): Promise<CompanyAdminRow[]> {
  const companies = await prisma.company.findMany({
    where: q?.trim()
      ? {
          OR: [
            { name: { contains: q.trim(), mode: "insensitive" } },
            { nif: { contains: q.trim(), mode: "insensitive" } },
          ],
        }
      : undefined,
    include: {
      _count: { select: { users: true, decas: true } },
      decas: { orderBy: { createdAt: "desc" }, take: 1, select: { createdAt: true } },
      acquisition: { select: { firstRefCode: true } },
    },
    orderBy: { createdAt: "desc" },
    take,
  });
  const d30 = new Date(Date.now() - 30 * 864e5);
  return companies.map((c) => ({
    id: c.id,
    name: c.name,
    nif: c.nif,
    createdAt: c.createdAt,
    members: c._count.users,
    totalDeca: c._count.decas,
    lastDecaAt: c.decas[0]?.createdAt ?? null,
    refCode: c.acquisition?.firstRefCode ?? null,
    active30d: !!c.decas[0] && c.decas[0].createdAt >= d30,
  }));
}

export async function getCompanyAdmin(id: string) {
  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      users: {
        select: {
          id: true,
          email: true,
          role: true,
          companyRole: true,
          createdAt: true,
          emailVerifiedAt: true,
        },
      },
      acquisition: true,
      commercialConsent: true,
      invites: {
        orderBy: { createdAt: "desc" },
        select: { email: true, role: true, acceptedAt: true, expiresAt: true, createdAt: true },
      },
      _count: { select: { decas: true } },
    },
  });
  if (!company) return null;

  const now = new Date();
  const since = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  const [
    savedCompanies,
    savedVehicles,
    savedAddresses,
    recentDeca,
    deca7d,
    deca30d,
    deca90d,
    latestTerms,
  ] = await Promise.all([
    prisma.savedCompany.count({ where: { user: { companyId: id } } }),
    prisma.savedVehicle.count({ where: { user: { companyId: id } } }),
    prisma.savedAddress.count({ where: { user: { companyId: id } } }),
    prisma.deca.findMany({
      where: { companyId: id },
      include: { currentVersion: { select: { token: true, versionNo: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.deca.count({ where: { companyId: id, createdAt: { gte: since(7) } } }),
    prisma.deca.count({ where: { companyId: id, createdAt: { gte: since(30) } } }),
    prisma.deca.count({ where: { companyId: id, createdAt: { gte: since(90) } } }),
    prisma.termsAcceptance.findFirst({
      where: { companyId: id },
      orderBy: { acceptedAt: "desc" },
    }),
  ]);

  return {
    id: company.id,
    name: company.name,
    nif: company.nif,
    address: company.address,
    contactName: company.contactName,
    phone: company.phone,
    profile: company.profile,
    createdAt: company.createdAt,
    totalDeca: company._count.decas,
    decaCounts: { d7: deca7d, d30: deca30d, d90: deca90d },
    lastDecaAt: recentDeca[0]?.createdAt ?? null,
    terms: latestTerms
      ? { version: latestTerms.version, acceptedAt: latestTerms.acceptedAt }
      : null,
    commercialConsent: company.commercialConsent
      ? {
          granted: company.commercialConsent.granted,
          version: company.commercialConsent.version,
          grantedAt: company.commercialConsent.grantedAt,
          revokedAt: company.commercialConsent.revokedAt,
        }
      : null,
    members: company.users
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .map((u) => ({
        id: u.id,
        email: u.email,
        role: u.role,
        companyRole: u.companyRole,
        createdAt: u.createdAt,
        emailVerifiedAt: u.emailVerifiedAt,
      })),
    saved: { companies: savedCompanies, vehicles: savedVehicles, addresses: savedAddresses },
    acquisition: company.acquisition,
    invites: company.invites,
    recentDeca: recentDeca
      .filter((d) => d.currentVersion)
      .map((d) => ({
        id: d.id,
        reference: refOf(d.currentVersion!.token),
        createdAt: d.createdAt,
        versionNo: d.currentVersion!.versionNo,
      })),
  };
}

export type UserAdminRow = {
  id: string;
  email: string;
  provider: "email" | "google";
  role: string;
  companyId: string | null;
  companyName: string | null;
  companyRole: string;
  createdAt: Date;
};

export async function listUsersAdmin(q?: string, take = 400): Promise<UserAdminRow[]> {
  const users = await prisma.user.findMany({
    where: q?.trim() ? { email: { contains: q.trim(), mode: "insensitive" } } : undefined,
    include: { company: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take,
  });
  return users.map((u) => ({
    id: u.id,
    email: u.email,
    // Google-linked users have no local password hash (#30, once OAuth lands).
    provider: u.passwordHash ? "email" : "google",
    role: u.role,
    companyId: u.companyId,
    companyName: u.company?.name ?? null,
    companyRole: u.companyRole,
    createdAt: u.createdAt,
  }));
}
