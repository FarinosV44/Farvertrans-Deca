import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

/**
 * Company acquisition engine (GROWTH #28). Internal operators seed prospects,
 * send an operator-attributed onboarding link, and see which prospects actually
 * generated a first DeCA (the activation milestone). Internal-only.
 */

const INVITE_TTL_DAYS = 30;
const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

export const prospectInputSchema = z.object({
  name: z.string().trim().min(2).max(200),
  nif: z.string().trim().max(20).optional().default(""),
  contactName: z.string().trim().max(120).optional().default(""),
  email: z.string().trim().max(200).optional().default(""),
  phone: z.string().trim().max(40).optional().default(""),
  refCode: z.string().trim().min(2).max(60),
  source: z.string().trim().max(120).optional().default(""),
});

function clean(s: string) {
  return s.trim() || null;
}

export async function createProspect(input: unknown) {
  const d = prospectInputSchema.parse(input);
  return prisma.prospect.create({
    data: {
      name: d.name,
      nif: clean(d.nif),
      contactName: clean(d.contactName),
      email: clean(d.email)?.toLowerCase() ?? null,
      phone: clean(d.phone),
      refCode: d.refCode,
      source: clean(d.source),
    },
  });
}

/** Parse "name, nif, email, refCode" lines for lightweight bulk seeding (#28). */
export function parseProspectCsv(text: string, fallbackRef?: string) {
  const rows: { line: number; input: z.infer<typeof prospectInputSchema>; error?: string }[] = [];
  text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .forEach((line, i) => {
      const [name = "", nif = "", email = "", refCode = ""] = line.split(",").map((s) => s.trim());
      const parsed = prospectInputSchema.safeParse({
        name,
        nif,
        email,
        refCode: refCode || fallbackRef || "",
      });
      rows.push(
        parsed.success
          ? { line: i + 1, input: parsed.data }
          : {
              line: i + 1,
              input: { name, nif, email, contactName: "", phone: "", refCode, source: "" },
              error: parsed.error.issues[0]?.message ?? "línea no válida",
            },
      );
    });
  return rows;
}

export async function importProspects(text: string, fallbackRef?: string) {
  const rows = parseProspectCsv(text, fallbackRef);
  const valid = rows.filter((r) => !r.error);
  let created = 0;
  for (const r of valid) {
    // avoid an obvious duplicate: same name + refCode not already a prospect
    const dupe = await prisma.prospect.findFirst({
      where: { name: r.input.name, refCode: r.input.refCode },
    });
    if (dupe) continue;
    await createProspect(r.input);
    created += 1;
  }
  return { created, skipped: valid.length - created, errors: rows.filter((r) => r.error) };
}

/** Generate (or rotate) the operator-attributed onboarding link for a prospect. */
export async function issueProspectInvite(prospectId: string): Promise<{ token: string } | null> {
  const p = await prisma.prospect.findUnique({ where: { id: prospectId } });
  if (!p) return null;
  const token = randomBytes(32).toString("base64url");
  await prisma.prospect.update({
    where: { id: prospectId },
    data: {
      inviteTokenHash: sha256(token),
      inviteExpiresAt: new Date(Date.now() + INVITE_TTL_DAYS * 864e5),
      invitedAt: p.invitedAt ?? new Date(),
      status: p.status === "prospect" ? "invited" : p.status,
    },
  });
  return { token };
}

export type ProspectInviteResolved = {
  prospectId: string;
  refCode: string;
  name: string;
  nif: string | null;
};

/** Resolve a prospect onboarding token (used by the signup flow). */
export async function resolveProspectInvite(token: string): Promise<ProspectInviteResolved | null> {
  const p = await prisma.prospect.findUnique({ where: { inviteTokenHash: sha256(token) } });
  if (!p || !p.inviteExpiresAt || p.inviteExpiresAt.getTime() < Date.now() || p.companyId)
    return null;
  return { prospectId: p.id, refCode: p.refCode, name: p.name, nif: p.nif };
}

/** Link a freshly-registered company back to its prospect + mark it registered. */
export async function attachCompanyToProspect(prospectId: string, companyId: string) {
  await prisma.prospect.update({
    where: { id: prospectId },
    data: {
      companyId,
      registeredAt: new Date(),
      status: "registered",
      inviteTokenHash: null, // consume the one-time token
    },
  });
}

/** Called when a company generates a DeCA — advances its prospect through the funnel. */
export async function touchProspectActivity(companyId: string) {
  const p = await prisma.prospect.findUnique({ where: { companyId } });
  if (!p) return;
  const now = new Date();
  await prisma.prospect.update({
    where: { id: p.id },
    data: {
      lastDecaAt: now,
      firstDecaAt: p.firstDecaAt ?? now,
      status: p.firstDecaAt ? "active" : "activated",
    },
  });
}

export type ProspectFunnel = {
  refCode: string;
  prospects: number;
  invited: number;
  registered: number;
  activated: number; // generated a first DeCA
  active7d: number;
  totalDeca: number;
};

/** Per-operator acquisition funnel — primary metric is `activated` (first DeCA). */
export async function acquisitionFunnel(): Promise<{
  byOperator: ProspectFunnel[];
  totals: ProspectFunnel;
}> {
  const rows = await prisma.prospect.findMany();
  const d7 = Date.now() - 7 * 864e5;

  // total DeCA per linked company
  const companyIds = rows.map((r) => r.companyId).filter((x): x is string => !!x);
  const decaCounts = companyIds.length
    ? await prisma.deca.groupBy({
        by: ["companyId"],
        where: { companyId: { in: companyIds } },
        _count: { _all: true },
      })
    : [];
  const decaByCompany = new Map(decaCounts.map((c) => [c.companyId!, c._count._all]));

  const acc = new Map<string, ProspectFunnel>();
  const blank = (refCode: string): ProspectFunnel => ({
    refCode,
    prospects: 0,
    invited: 0,
    registered: 0,
    activated: 0,
    active7d: 0,
    totalDeca: 0,
  });

  for (const r of rows) {
    const f = acc.get(r.refCode) ?? blank(r.refCode);
    f.prospects += 1;
    if (r.invitedAt) f.invited += 1;
    if (r.registeredAt) f.registered += 1;
    if (r.firstDecaAt) f.activated += 1;
    if (r.lastDecaAt && r.lastDecaAt.getTime() >= d7) f.active7d += 1;
    if (r.companyId) f.totalDeca += decaByCompany.get(r.companyId) ?? 0;
    acc.set(r.refCode, f);
  }

  const byOperator = [...acc.values()].sort((a, b) => b.activated - a.activated);
  const totals = byOperator.reduce((t, f) => {
    t.prospects += f.prospects;
    t.invited += f.invited;
    t.registered += f.registered;
    t.activated += f.activated;
    t.active7d += f.active7d;
    t.totalDeca += f.totalDeca;
    return t;
  }, blank("TOTAL"));

  return { byOperator, totals };
}

export async function listProspects(refCode?: string) {
  return prisma.prospect.findMany({
    where: refCode ? { refCode } : undefined,
    orderBy: { createdAt: "desc" },
    take: 500,
  });
}
