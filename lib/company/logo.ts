/**
 * Optional company logo for the PDF header (PRODUCT #39). Validated
 * server-side from the raw bytes (never trusts a client-reported MIME type):
 * PNG or JPEG only (magic bytes + real header parse, SVG and anything else
 * rejected), size-capped, max pixel dimensions capped. Stored as a data URI
 * on `Company.logoDataUri` — small enough that a dedicated object-store
 * round trip isn't worth the complexity for this one asset.
 *
 * Pure logic — no I/O, no `server-only`, safe to unit-test. The Prisma
 * read/write itself lives inline in the API route (two one-line calls; not
 * worth its own I/O module).
 */

export const LOGO_MAX_BYTES = 512 * 1024; // ≈512 KB
export const LOGO_MAX_DIMENSION_PX = 2000; // either side

export class LogoValidationError extends Error {
  constructor(
    public code: "type" | "size" | "dimensions" | "corrupt",
    message: string,
  ) {
    super(message);
    this.name = "LogoValidationError";
  }
}

export type LogoImageInfo = { mime: "image/png" | "image/jpeg"; width: number; height: number };

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function readPngDimensions(buf: Buffer): { width: number; height: number } | null {
  if (buf.length < 24 || !buf.subarray(0, 8).equals(PNG_SIGNATURE)) return null;
  if (buf.toString("ascii", 12, 16) !== "IHDR") return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

/** Scans JPEG markers for the first Start-Of-Frame segment (baseline or progressive). */
function readJpegDimensions(buf: Buffer): { width: number; height: number } | null {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return null; // SOI
  let offset = 2;
  while (offset + 9 <= buf.length) {
    if (buf[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = buf[offset + 1];
    if (marker === 0xff) {
      offset += 1; // fill byte between markers
      continue;
    }
    // SOFn markers, excluding DHT(C4)/JPG(C8, reserved)/DAC(CC)
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { height: buf.readUInt16BE(offset + 5), width: buf.readUInt16BE(offset + 7) };
    }
    if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) {
      offset += 2; // markers with no payload
      continue;
    }
    const segmentLength = buf.readUInt16BE(offset + 2);
    if (segmentLength < 2) return null;
    offset += 2 + segmentLength;
  }
  return null;
}

/** Detects PNG/JPEG from the real file bytes and reads its pixel dimensions. Never trusts a claimed MIME type. */
export function detectLogoImage(buf: Buffer): LogoImageInfo | null {
  const png = readPngDimensions(buf);
  if (png) return { mime: "image/png", ...png };
  const jpeg = readJpegDimensions(buf);
  if (jpeg) return { mime: "image/jpeg", ...jpeg };
  return null;
}

/** Validates an uploaded logo. Throws {@link LogoValidationError} on any rejection. */
export function validateLogoUpload(buf: Buffer): LogoImageInfo {
  if (buf.length === 0 || buf.length > LOGO_MAX_BYTES) {
    throw new LogoValidationError(
      "size",
      `El logo debe pesar como máximo ${Math.round(LOGO_MAX_BYTES / 1024)} KB.`,
    );
  }
  const info = detectLogoImage(buf);
  if (!info) {
    throw new LogoValidationError(
      "type",
      "El logo debe ser una imagen PNG o JPEG. No se admiten SVG ni otros formatos.",
    );
  }
  if (info.width > LOGO_MAX_DIMENSION_PX || info.height > LOGO_MAX_DIMENSION_PX) {
    throw new LogoValidationError(
      "dimensions",
      `La imagen es demasiado grande (máximo ${LOGO_MAX_DIMENSION_PX}px por lado).`,
    );
  }
  return info;
}

export function toDataUri(buf: Buffer, mime: string): string {
  return `data:${mime};base64,${buf.toString("base64")}`;
}
