import "server-only";
import { APP_VERSION } from "@/lib/version";
import type { DecaPayload } from "@/lib/deca/schema";

/**
 * Production readiness diagnostics (P0 FIX #29 §4, surfaced by ADMIN #33 at
 * `/admin/sistema`). Every dependency the DeCA pipeline needs is probed
 * individually so a deploy failure names its stage instead of collapsing into
 * "No se pudo generar el DeCA".
 *
 * NEVER returns a secret: no keys, no passwords, no connection strings — only
 * whether something is configured and whether it answers.
 */

export type CheckState = "ok" | "warn" | "fail" | "skipped";

export type DiagnosticCheck = {
  /** Stable machine key (`db`, `schema`, `storage_write`, …). */
  id: string;
  /** Spanish label for the admin screen. */
  label: string;
  state: CheckState;
  /** Safe, human explanation — never a raw stack or a credential. */
  detail: string;
  /** Milliseconds the probe took, when it ran. */
  ms?: number;
};

export type DiagnosticsReport = {
  ok: boolean;
  version: string;
  environment: string;
  node: string;
  baseUrl: string;
  storage: string;
  checks: DiagnosticCheck[];
  generatedAt: string;
};

async function timed<T>(fn: () => Promise<T>): Promise<{ value?: T; error?: unknown; ms: number }> {
  const t0 = Date.now();
  try {
    return { value: await fn(), ms: Date.now() - t0 };
  } catch (error) {
    return { error, ms: Date.now() - t0 };
  }
}

function required(name: string): boolean {
  const v = process.env[name];
  return !!v && v.trim().length > 0 && !v.includes("YOUR-PROJECT");
}

/** Env vars the app cannot generate a DeCA without. */
const REQUIRED_ENV = ["DATABASE_URL", "NEXT_PUBLIC_FVD_BASE_URL", "FVD_HASH_SECRET"];

/** Tables the DeCA pipeline writes on every generation. */
const REQUIRED_TABLES = [
  "deca",
  "deca_version",
  "generation_failure",
  "deca_route_intel",
  "commercial_consent",
];

/**
 * Run every readiness probe. Safe to call from an internal route or a CLI
 * script; it performs one real PDF render and one real storage round-trip, so
 * it is a genuine smoke test rather than a configuration echo.
 */
export async function runDiagnostics(): Promise<DiagnosticsReport> {
  const checks: DiagnosticCheck[] = [];
  const { safeErrorSummary } = await import("@/lib/deca/generation");
  const fail = (e: unknown) => safeErrorSummary(e).message || safeErrorSummary(e).errorClass;

  // 1. Configuration -------------------------------------------------------
  const missing = REQUIRED_ENV.filter((n) => !required(n));
  checks.push({
    id: "config",
    label: "Configuración de entorno",
    state: missing.length ? "fail" : "ok",
    detail: missing.length
      ? `Faltan variables: ${missing.join(", ")}`
      : "Todas las variables requeridas están definidas.",
  });

  const storage = process.env.FVD_STORAGE === "supabase" ? "supabase" : "local";
  const storageDirSet = !!process.env.FVD_STORAGE_DIR?.trim();
  checks.push({
    id: "storage_config",
    label: "Almacenamiento de PDF configurado",
    state:
      storage === "supabase"
        ? required("SUPABASE_SERVICE_ROLE_KEY") && required("NEXT_PUBLIC_SUPABASE_URL")
          ? "ok"
          : "fail"
        : storageDirSet
          ? "ok"
          : process.env.NODE_ENV === "production"
            ? "warn"
            : "ok",
    detail:
      storage === "supabase"
        ? "Proveedor: Supabase Storage."
        : storageDirSet
          ? `Proveedor: disco local en FVD_STORAGE_DIR (persistente).`
          : "Proveedor: disco local sin FVD_STORAGE_DIR — en producción un redespliegue puede borrar los PDF (R-10).",
  });

  // 2. Database ------------------------------------------------------------
  const db = await timed(async () => {
    const { prisma } = await import("@/lib/prisma");
    await prisma.$queryRaw`SELECT 1`;
    return true;
  });
  checks.push({
    id: "db",
    label: "Base de datos accesible",
    state: db.error ? "fail" : "ok",
    detail: db.error ? fail(db.error) : "Conexión establecida.",
    ms: db.ms,
  });

  // 3. Schema / migrations --------------------------------------------------
  if (db.error) {
    checks.push({
      id: "schema",
      label: "Esquema y migraciones",
      state: "skipped",
      detail: "No se ha podido comprobar: la base de datos no responde.",
    });
  } else {
    const schema = await timed(async () => {
      const { prisma } = await import("@/lib/prisma");
      const rows = await prisma.$queryRaw<{ table_name: string }[]>`
        SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
      const present = new Set(rows.map((r) => r.table_name));
      return REQUIRED_TABLES.filter((t) => !present.has(t));
    });
    const missingTables = schema.value ?? [];
    checks.push({
      id: "schema",
      label: "Esquema y migraciones",
      state: schema.error ? "fail" : missingTables.length ? "fail" : "ok",
      detail: schema.error
        ? fail(schema.error)
        : missingTables.length
          ? `Faltan tablas: ${missingTables.join(", ")} — ejecuta prisma migrate deploy.`
          : "Todas las tablas del flujo DeCA existen.",
      ms: schema.ms,
    });
  }

  // 4. PDF render smoke test ------------------------------------------------
  const render = await timed(async () => {
    const { renderDecaPdf } = await import("@/lib/pdf/render");
    const pdf = await renderDecaPdf({
      data: SMOKE_PAYLOAD,
      publicUrl: `${(process.env.NEXT_PUBLIC_FVD_BASE_URL ?? "http://localhost:3000").replace(/\/$/, "")}/d/diagnostics`,
      reference: "DECA-DIAGNOS",
      versionNo: 1,
      createdAt: new Date(),
    });
    return pdf.length;
  });
  checks.push({
    id: "pdf_render",
    label: "Generación de PDF",
    state: render.error ? "fail" : "ok",
    detail: render.error
      ? fail(render.error)
      : `PDF de prueba generado (${Math.round((render.value ?? 0) / 1024)} kB).`,
    ms: render.ms,
  });

  // 5. Storage write/read round-trip ----------------------------------------
  const storageCheck = await timed(async () => {
    const { getPdfStore } = await import("@/lib/storage");
    const store = getPdfStore();
    const key = `diagnostics/${Date.now()}.pdf`;
    const body = Buffer.from("%PDF-1.4 diagnostics\n");
    await store.put(key, body);
    const back = await store.get(key);
    await store.del(key);
    if (back.length !== body.length) throw new Error("readback mismatch");
    return true;
  });
  checks.push({
    id: "storage_write",
    label: "Escritura/lectura en el almacén de PDF",
    state: storageCheck.error ? "fail" : "ok",
    detail: storageCheck.error
      ? fail(storageCheck.error)
      : "Escritura, lectura y borrado correctos.",
    ms: storageCheck.ms,
  });

  // 6. Public base URL -------------------------------------------------------
  const baseUrl = process.env.NEXT_PUBLIC_FVD_BASE_URL ?? "";
  const httpsOk = baseUrl.startsWith("https://") || process.env.NODE_ENV !== "production";
  checks.push({
    id: "base_url",
    label: "URL pública",
    state: !baseUrl ? "fail" : httpsOk ? "ok" : "fail",
    detail: !baseUrl
      ? "NEXT_PUBLIC_FVD_BASE_URL no está definida — el QR apuntaría a una URL inválida."
      : httpsOk
        ? baseUrl
        : `${baseUrl} — la inspección pública exige HTTPS (R-7).`,
  });

  // 7. Optional providers ----------------------------------------------------
  checks.push({
    id: "mail",
    label: "Proveedor de email",
    state: required("RESEND_API_KEY") ? "ok" : "warn",
    detail: required("RESEND_API_KEY")
      ? "Configurado."
      : "Sin configurar: el envío por email usa el enlace mailto como alternativa.",
  });
  checks.push({
    id: "google_oauth",
    label: "Google OAuth",
    state: required("GOOGLE_CLIENT_ID") && required("GOOGLE_CLIENT_SECRET") ? "ok" : "warn",
    detail:
      required("GOOGLE_CLIENT_ID") && required("GOOGLE_CLIENT_SECRET")
        ? "Configurado."
        : "Sin configurar: sólo está disponible el acceso con email y contraseña.",
  });

  // 8. Recent generation health ----------------------------------------------
  if (!db.error) {
    const recent = await timed(async () => {
      const { prisma } = await import("@/lib/prisma");
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const [ok, failed, last] = await Promise.all([
        prisma.decaVersion.count({ where: { createdAt: { gte: since } } }),
        prisma.generationFailure.count({ where: { createdAt: { gte: since } } }),
        prisma.decaVersion.findFirst({
          orderBy: { createdAt: "desc" },
          select: { createdAt: true },
        }),
      ]);
      return { ok, failed, last: last?.createdAt ?? null };
    });
    const r = recent.value;
    checks.push({
      id: "generation_health",
      label: "Generación en las últimas 24 h",
      state: recent.error ? "warn" : r && r.failed > 0 && r.failed >= r.ok ? "warn" : "ok",
      detail: recent.error
        ? fail(recent.error)
        : `${r?.ok ?? 0} correctas · ${r?.failed ?? 0} fallidas · última: ${
            r?.last ? r.last.toISOString() : "nunca"
          }`,
      ms: recent.ms,
    });
  }

  return {
    ok: !checks.some((c) => c.state === "fail"),
    version: APP_VERSION,
    environment: process.env.NODE_ENV ?? "development",
    node: process.version,
    baseUrl,
    storage,
    checks,
    generatedAt: new Date().toISOString(),
  };
}

/** Synthetic payload for the render smoke test — never real data. */
const SMOKE_PAYLOAD = {
  shipper: { name: "Diagnóstico S.L.", nif: "B00000000", address: "Calle Prueba 1, Madrid" },
  carrier: {
    name: "Transportes Diagnóstico S.L.",
    nif: "B00000001",
    address: "Calle Prueba 2, Madrid",
  },
  loadLocation: {
    name: "Almacén Diagnóstico",
    address: "Calle Prueba 1",
    postalCode: "28001",
    city: "Madrid",
    province: "Madrid",
    country: "España",
  },
  unloadLocation: {
    name: "Almacén Diagnóstico Destino",
    address: "Calle Prueba 2",
    postalCode: "08001",
    city: "Barcelona",
    province: "Barcelona",
    country: "España",
  },
  loadDate: new Date().toISOString().slice(0, 10),
  unloadDate: new Date().toISOString().slice(0, 10),
  goods: "Prueba de diagnóstico",
  weight: "1000 kg",
  tractorPlate: "0000 XXX",
  trailerPlate: "",
  reference: "DIAGNOSTICS",
} satisfies DecaPayload;
