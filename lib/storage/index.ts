import "server-only";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

export class StorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StorageError";
  }
}

export interface PdfStore {
  put(key: string, body: Buffer): Promise<void>;
  get(key: string): Promise<Buffer>;
}

/** Local filesystem store for dev / tests when no Supabase project is configured. */
class LocalFsStore implements PdfStore {
  private root = path.join(process.cwd(), ".storage", "deca-pdfs");
  async put(key: string, body: Buffer) {
    const file = path.join(this.root, key);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, body);
  }
  async get(key: string) {
    const file = path.join(this.root, key);
    if (!existsSync(file)) throw new StorageError(`not found: ${key}`);
    return readFile(file);
  }
}

/** Private Supabase Storage bucket (production). */
class SupabaseStore implements PdfStore {
  constructor(private bucket: string) {}
  private async client() {
    const { getSupabaseServiceClient } = await import("@/lib/supabase/server");
    return getSupabaseServiceClient().storage.from(this.bucket);
  }
  async put(key: string, body: Buffer) {
    const c = await this.client();
    const { error } = await c.upload(key, body, {
      contentType: "application/pdf",
      upsert: true,
    });
    if (error) throw new StorageError(error.message);
  }
  async get(key: string) {
    const c = await this.client();
    const { data, error } = await c.download(key);
    if (error || !data) throw new StorageError(error?.message ?? "download failed");
    return Buffer.from(await data.arrayBuffer());
  }
}

let store: PdfStore | null = null;

export function getPdfStore(): PdfStore {
  if (store) return store;
  const hasSupabase =
    !!process.env.SUPABASE_SERVICE_ROLE_KEY &&
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("YOUR-PROJECT");
  store = hasSupabase
    ? new SupabaseStore(process.env.FVD_PDF_BUCKET || "deca-pdfs")
    : new LocalFsStore();
  return store;
}

export function pdfKey(versionId: string): string {
  return `${versionId}.pdf`;
}
