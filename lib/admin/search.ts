import "server-only";
import { prisma } from "@/lib/prisma";

/**
 * Admin global search (ADMIN #33 §9) — a real support shortcut across the
 * objects a support call is about: a company, a user, a DeCA reference, a
 * generation correlation code, a prospect. Read-only; every hit links to its
 * admin detail page.
 */

export type SearchHit = {
  kind: "empresa" | "usuario" | "deca" | "error" | "prospecto";
  label: string;
  sub: string;
  href: string;
};

export async function adminSearch(raw: string): Promise<SearchHit[]> {
  const q = raw.trim();
  if (q.length < 2) return [];
  const hits: SearchHit[] = [];

  // A DeCA reference is `DECA-XXXXXXXX` — match on the token prefix.
  const tokenPrefix = q.replace(/^deca-/i, "").toLowerCase();

  const [companies, users, decas, failure, prospects] = await Promise.all([
    prisma.company.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { nif: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 5,
      select: { id: true, name: true, nif: true },
    }),
    prisma.user.findMany({
      where: { email: { contains: q, mode: "insensitive" } },
      take: 5,
      select: { id: true, email: true, company: { select: { name: true } } },
    }),
    tokenPrefix.length >= 3
      ? prisma.decaVersion.findMany({
          where: { token: { startsWith: tokenPrefix } },
          take: 5,
          select: { decaId: true, token: true, versionNo: true },
        })
      : Promise.resolve([]),
    /^[A-Za-z2-9]{6}$/.test(q)
      ? prisma.generationFailure.findUnique({
          where: { correlationId: q.toUpperCase() },
          select: { correlationId: true, stage: true },
        })
      : Promise.resolve(null),
    prisma.prospect.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 5,
      select: { id: true, name: true, status: true, refCode: true },
    }),
  ]);

  for (const c of companies)
    hits.push({
      kind: "empresa",
      label: c.name,
      sub: c.nif ?? "sin NIF",
      href: `/admin/empresas/${c.id}`,
    });
  for (const u of users)
    hits.push({
      kind: "usuario",
      label: u.email,
      sub: u.company?.name ?? "sin empresa",
      href: `/admin/usuarios?q=${encodeURIComponent(u.email)}`,
    });
  for (const v of decas)
    hits.push({
      kind: "deca",
      label: `DECA-${v.token.slice(0, 8).toUpperCase()}`,
      sub: `versión ${v.versionNo}`,
      href: `/admin/deca/${v.decaId}`,
    });
  if (failure)
    hits.push({
      kind: "error",
      label: failure.correlationId,
      sub: `etapa ${failure.stage}`,
      href: `/admin/errores/${failure.correlationId}`,
    });
  for (const p of prospects)
    hits.push({
      kind: "prospecto",
      label: p.name,
      sub: `${p.status} · ${p.refCode}`,
      href: `/admin/captacion?q=${encodeURIComponent(p.name)}`,
    });

  return hits;
}
