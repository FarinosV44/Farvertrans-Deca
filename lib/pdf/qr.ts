import QRCode from "qrcode";

/**
 * Encode `url` as a QR PNG data URI for embedding in the DeCA PDF (R-5).
 * High error correction so it survives print + a phone camera at a roadside stop.
 */
export async function qrPngDataUri(url: string): Promise<string> {
  return QRCode.toDataURL(url, {
    errorCorrectionLevel: "H",
    margin: 1,
    scale: 6,
    color: { dark: "#0f1720", light: "#ffffff" },
  });
}

/** Raw PNG buffer variant (used by tests to decode-verify the round trip). */
export async function qrPngBuffer(url: string): Promise<Buffer> {
  return QRCode.toBuffer(url, { errorCorrectionLevel: "H", margin: 1, scale: 6 });
}

/**
 * Memoized {@link qrPngDataUri}. A DeCA's public token is immutable, so the QR
 * for a given URL never changes — the document cockpit (#36) renders it on every
 * result-page load, and encoding it each time would add needless CPU under load.
 * Bounded so a long-lived process cannot grow the map without limit.
 */
const qrCache = new Map<string, string>();
const QR_CACHE_MAX = 1000;

export async function qrPngDataUriCached(url: string): Promise<string> {
  const hit = qrCache.get(url);
  if (hit) return hit;
  const uri = await qrPngDataUri(url);
  if (qrCache.size >= QR_CACHE_MAX) qrCache.delete(qrCache.keys().next().value as string);
  qrCache.set(url, uri);
  return uri;
}
