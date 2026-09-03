import { NextResponse } from "next/server";
import { isPubliclyAvailable } from "@/lib/deca/deactivation";
import { clientIp, hashIdentifier } from "@/lib/hash";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Public inspection endpoint (F4 / R-6…R-9). Streams the exact stored PDF with no
 * auth, no cookie, no HTML interstitial and no button. Unknown token → 404.
 * Outside the availability window → 410 (document still retained, R-10).
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  if (!token || token.length < 16 || token.length > 128) {
    return notFound();
  }

  const { prisma } = await import("@/lib/prisma");
  const version = await prisma.decaVersion.findUnique({
    where: { token },
    include: { deca: true },
  });
  if (!version || !version.pdfPath) return notFound();

  if (!isPubliclyAvailable(version.deca.serviceEnd)) {
    return new NextResponse(
      "Este documento ya no está disponible públicamente. El titular puede volver a compartirlo desde su cuenta.",
      { status: 410, headers: { "content-type": "text/plain; charset=utf-8", "x-robots-tag": "noindex" } },
    );
  }

  let body: Buffer;
  try {
    const { getPdfStore } = await import("@/lib/storage");
    body = await getPdfStore().get(version.pdfPath);
  } catch {
    return new NextResponse("Documento temporalmente no disponible. Inténtalo de nuevo.", {
      status: 503,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }

  // Minimal access log (R-11): hashed IP + timestamp + version id only.
  try {
    await prisma.decaAccessLog.create({
      data: { decaVersionId: version.id, ipHash: hashIdentifier(clientIp(req.headers)) },
    });
  } catch {
    // logging failure must not block a legitimate inspection
  }

  const filename = `DeCA-${token.slice(0, 8).toUpperCase()}.pdf`;
  return new NextResponse(new Uint8Array(body), {
    status: 200,
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `inline; filename="${filename}"`,
      "x-robots-tag": "noindex, nofollow",
      "cache-control": "public, max-age=60, must-revalidate",
      "content-length": String(body.byteLength),
    },
  });
}

function notFound() {
  return new NextResponse("Documento no encontrado.", {
    status: 404,
    headers: { "content-type": "text/plain; charset=utf-8", "x-robots-tag": "noindex" },
  });
}
