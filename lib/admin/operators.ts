import "server-only";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { BRAND } from "@/lib/brand";

/**
 * Operator / commercial / collaborator management (#86 part 8). Each operator
 * has an individual `/registro?ref=<code>` link; companies that sign up through
 * it are attributed first-touch and permanently via `Acquisition.firstRefCode`
 * (#11), which is what a future commission engine will read.
 */

export const operatorSchema = z.object({
  name: z.string().trim().min(2, "Indica el nombre.").max(120),
  lastName: z.string().trim().max(160).optional().default(""),
  email: z.string().trim().email("Email no válido.").max(200).optional().or(z.literal("")),
  phone: z.string().trim().max(40).optional().default(""),
  notes: z.string().trim().max(2000).optional().default(""),
});

export const operatorPatchSchema = z
  .object({
    active: z.boolean().optional(),
    name: z.string().trim().min(2).max(120).optional(),
    lastName: z.string().trim().max(160).optional(),
    email: z.string().trim().email().max(200).optional().or(z.literal("")),
    phone: z.string().trim().max(40).optional(),
    notes: z.string().trim().max(2000).optional(),
  })
  .refine((d) => Object.keys(d).length > 0, { message: "Nada que actualizar." });

/** The public individual acquisition link for an operator. */
export function operatorLink(refCode: string): string {
  return `${BRAND.baseUrl.replace(/\/$/, "")}/registro?ref=${encodeURIComponent(refCode)}`;
}

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I

function randomSuffix(n = 4): string {
  const bytes = randomBytes(n);
  let out = "";
  for (let i = 0; i < n; i++) out += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  return out;
}

/** A short, human-ish, collision-checked ref code derived from the name. */
async function uniqueRefCode(name: string): Promise<string> {
  const base =
    name
      .toUpperCase()
      .normalize("NFD")
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 10) || "OP";
  for (let i = 0; i < 12; i++) {
    const code = `${base}${randomSuffix()}`;
    const clash = await prisma.operator.findUnique({ where: { refCode: code } });
    if (!clash) return code;
  }
  // Extremely unlikely — fall back to a pure random code.
  return `OP${randomSuffix(8)}`;
}

export async function createOperator(input: unknown) {
  const d = operatorSchema.parse(input);
  const refCode = await uniqueRefCode(d.name);
  return prisma.operator.create({
    data: {
      name: d.name,
      lastName: d.lastName || null,
      email: d.email || null,
      phone: d.phone || null,
      notes: d.notes || null,
      refCode,
    },
  });
}

export async function updateOperator(id: string, patch: unknown) {
  const d = operatorPatchSchema.parse(patch);
  const res = await prisma.operator.updateMany({
    where: { id },
    data: {
      ...(d.active !== undefined ? { active: d.active } : {}),
      ...(d.name !== undefined ? { name: d.name } : {}),
      ...(d.lastName !== undefined ? { lastName: d.lastName || null } : {}),
      ...(d.email !== undefined ? { email: d.email || null } : {}),
      ...(d.phone !== undefined ? { phone: d.phone || null } : {}),
      ...(d.notes !== undefined ? { notes: d.notes || null } : {}),
    },
  });
  return res.count > 0;
}

/** All operators with their first-touch attributed-company count. */
export async function listOperators() {
  const operators = await prisma.operator.findMany({
    orderBy: [{ active: "desc" }, { name: "asc" }],
  });
  const grouped = await prisma.acquisition.groupBy({
    by: ["firstRefCode"],
    where: { firstRefCode: { in: operators.map((o) => o.refCode) }, companyId: { not: null } },
    _count: { _all: true },
  });
  const byCode = new Map(grouped.map((g) => [g.firstRefCode, g._count._all]));
  return operators.map((o) => ({
    ...o,
    companies: byCode.get(o.refCode) ?? 0,
    link: operatorLink(o.refCode),
  }));
}

export async function getOperator(id: string) {
  const operator = await prisma.operator.findUnique({ where: { id } });
  if (!operator) return null;

  const attributed = await prisma.acquisition.findMany({
    where: { firstRefCode: operator.refCode, companyId: { not: null } },
    orderBy: { signupAt: "desc" },
    select: {
      signupAt: true,
      firstDecaAt: true,
      company: {
        select: {
          id: true,
          name: true,
          status: true,
          createdAt: true,
          _count: { select: { decas: true } },
          users: {
            take: 1,
            orderBy: { createdAt: "asc" },
            select: { email: true, companyRole: true },
          },
        },
      },
    },
  });

  const companies = attributed
    .filter((a) => a.company)
    .map((a) => ({
      id: a.company!.id,
      name: a.company!.name,
      status: a.company!.status,
      signupAt: a.signupAt,
      firstDecaAt: a.firstDecaAt,
      decaCount: a.company!._count.decas,
      primaryUser: a.company!.users[0]?.email ?? null,
    }));

  return {
    operator,
    link: operatorLink(operator.refCode),
    companies,
    totals: {
      companies: companies.length,
      withDeca: companies.filter((c) => c.firstDecaAt).length,
      deca: companies.reduce((n, c) => n + c.decaCount, 0),
    },
  };
}
