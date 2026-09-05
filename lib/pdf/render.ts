import "server-only";
import { renderToBuffer } from "@react-pdf/renderer";
import { DecaDocument } from "./deca-document";
import { ensureFonts } from "./fonts";
import { qrPngDataUri } from "./qr";
import { APP_VERSION } from "@/lib/version";
import type { DecaPayload } from "@/lib/deca/schema";

const MAX_BYTES = 5 * 1024 * 1024; // R-4

export class PdfRenderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PdfRenderError";
  }
}

export type RenderInput = {
  data: DecaPayload;
  publicUrl: string;
  reference: string;
  versionNo: number;
  createdAt: Date;
  modifiedAt?: Date;
  /** Baked into this render only (PRODUCT #39) — never re-read for an already-stored PDF. */
  customerLogoDataUri?: string | null;
};

/**
 * Render a compliant DeCA PDF to a Buffer (R-3). Embeds the QR for `publicUrl`
 * (R-5) and PDF metadata timestamps (R-11). Throws {@link PdfRenderError} if the
 * output would exceed 5 MB (R-4) — the caller must fail closed.
 */
export async function renderDecaPdf(input: RenderInput): Promise<Buffer> {
  ensureFonts();
  const qrDataUri = await qrPngDataUri(input.publicUrl);
  const buffer = await renderToBuffer(
    DecaDocument({
      data: input.data,
      publicUrl: input.publicUrl,
      qrDataUri,
      reference: input.reference,
      versionNo: input.versionNo,
      createdAt: input.createdAt,
      modifiedAt: input.modifiedAt,
      appVersion: APP_VERSION,
      customerLogoDataUri: input.customerLogoDataUri,
    }),
  );
  if (buffer.byteLength > MAX_BYTES) {
    throw new PdfRenderError(`PDF exceeds 5 MB (${buffer.byteLength} bytes)`);
  }
  return buffer;
}
