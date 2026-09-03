import { z } from "zod";

/**
 * Central environment validation.
 *
 * Server code imports `env`; client code must only ever read the `NEXT_PUBLIC_*`
 * values (exposed through `publicEnv`). Missing required server vars fail fast on
 * boot rather than at the first request (fail-closed, per docs/03-technical-plan.md).
 */
const serverSchema = z.object({
  NEXT_PUBLIC_FVD_BASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  DATABASE_URL: z.string().min(1),
  FVD_PDF_BUCKET: z.string().min(1).default("deca-pdfs"),
  FVD_HASH_SECRET: z.string().min(16),
  RESEND_API_KEY: z.string().optional(),
  FVD_MAIL_FROM: z.string().optional(),
  NEXT_PUBLIC_HCAPTCHA_SITE_KEY: z.string().optional().default(""),
  HCAPTCHA_SECRET_KEY: z.string().optional().default(""),
  FVD_DEBUG: z
    .string()
    .optional()
    .default("0")
    .transform((v) => v === "1" || v === "true"),
});

export type ServerEnv = z.infer<typeof serverSchema>;

let cached: ServerEnv | null = null;

/**
 * Parse and cache the server environment. Throws a readable aggregated error if
 * anything required is missing or malformed.
 */
export function getEnv(): ServerEnv {
  if (cached) return cached;
  const parsed = serverSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  cached = parsed.data;
  return cached;
}

/** Values safe to read on the client. */
export const publicEnv = {
  baseUrl: process.env.NEXT_PUBLIC_FVD_BASE_URL ?? "http://localhost:3000",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  hcaptchaSiteKey: process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY ?? "",
};
