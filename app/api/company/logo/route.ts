import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateLogoUpload, toDataUri, LogoValidationError } from "@/lib/company/logo";

export const runtime = "nodejs";

const bodySchema = z.object({
  /** `data:<mime>;base64,<...>` from a `<input type="file">` read client-side, or a bare base64 string. */
  dataUri: z.string().trim().min(1).max(2_000_000),
});

/**
 * Upload the company's optional PDF header logo (PRODUCT #39). Owner-only —
 * a company-wide setting, not a per-member preference. Validated from the
 * DECODED bytes (magic bytes + real dimensions), never from the client's
 * claimed MIME type. Only affects DOCUMENTS GENERATED FROM NOW ON — every
 * already-rendered PDF's bytes are already stored and untouched.
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user?.companyId)
    return NextResponse.json({ error: { code: "unauthorized" } }, { status: 401 });
  if (user.companyRole !== "owner")
    return NextResponse.json({ error: { code: "forbidden" } }, { status: 403 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success)
    return NextResponse.json(
      { error: { code: "bad_input", message: "Falta el archivo del logo." } },
      { status: 422 },
    );

  const match = /^data:([^;]+);base64,(.+)$/s.exec(parsed.data.dataUri.trim());
  const base64 = match ? match[2] : parsed.data.dataUri.trim();
  let buf: Buffer;
  try {
    buf = Buffer.from(base64, "base64");
  } catch {
    return NextResponse.json(
      { error: { code: "bad_input", message: "El archivo no es válido." } },
      { status: 422 },
    );
  }

  let info;
  try {
    info = validateLogoUpload(buf);
  } catch (e) {
    if (e instanceof LogoValidationError) {
      return NextResponse.json({ error: { code: e.code, message: e.message } }, { status: 422 });
    }
    return NextResponse.json({ error: { code: "internal" } }, { status: 500 });
  }

  const canonicalDataUri = toDataUri(buf, info.mime);
  await prisma.company.update({
    where: { id: user.companyId },
    data: { logoDataUri: canonicalDataUri },
  });

  return NextResponse.json({ ok: true, logoDataUri: canonicalDataUri });
}

/** Removes the company logo. Owner-only. Historical PDFs are never affected. */
export async function DELETE() {
  const user = await getCurrentUser();
  if (!user?.companyId)
    return NextResponse.json({ error: { code: "unauthorized" } }, { status: 401 });
  if (user.companyRole !== "owner")
    return NextResponse.json({ error: { code: "forbidden" } }, { status: 403 });

  await prisma.company.update({ where: { id: user.companyId }, data: { logoDataUri: null } });
  return NextResponse.json({ ok: true });
}
