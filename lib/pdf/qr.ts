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
