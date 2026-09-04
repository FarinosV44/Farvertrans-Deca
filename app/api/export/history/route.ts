import { getCurrentUser } from "@/lib/auth";
import { listHistory } from "@/lib/data/history";
import { historyToCsv } from "@/lib/deca/export";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Export the signed-in company's DeCA history to CSV (PRODUCT #34 §3). Scoped
 * server-side to the caller's company (T-1); honours the same filter params as
 * `/panel/historico`.
 */
export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user?.companyId) return new Response("No autorizado", { status: 401 });

  const p = new URL(req.url).searchParams;
  const rows = await listHistory(user.companyId, {
    q: p.get("q") ?? undefined,
    from: p.get("from") ?? undefined,
    to: p.get("to") ?? undefined,
    carrier: p.get("carrier") ?? undefined,
    plate: p.get("plate") ?? undefined,
  });

  const csv = historyToCsv(rows);
  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="deca-historial-${stamp}.csv"`,
      "cache-control": "no-store",
    },
  });
}
