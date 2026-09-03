import type { NextConfig } from "next";

/**
 * `SKIP_BUILD_CHECKS=1` skips ESLint + type-checking during `next build`. Set it
 * ONLY on a resource-constrained deploy host (e.g. Hostinger Cloud Startup):
 * lint and typecheck are already enforced on every push to `main` in CI, and
 * skipping them here drops `eslint` / `unrs-resolver` / `typescript` from the
 * build's critical path. Never set it in CI.
 */
const skipChecks = process.env.SKIP_BUILD_CHECKS === "1";

const nextConfig: NextConfig = {
  // Standalone output is for the production Docker image (Hostinger); local dev,
  // `next start` and the test webServer use the default output.
  output: process.env.NEXT_STANDALONE === "1" ? "standalone" : undefined,
  reactStrictMode: true,
  poweredByHeader: false,
  // The DeCA PDF renderer reads bundled font files at runtime; make sure the
  // standalone trace ships them.
  outputFileTracingIncludes: {
    "/api/deca": ["./lib/pdf/fonts/**"],
    "/api/deca/[id]/version": ["./lib/pdf/fonts/**"],
  },
  eslint: {
    // lint runs in CI on every push to main; optionally skip it on a slow deploy host.
    ignoreDuringBuilds: skipChecks,
  },
  typescript: {
    // tsc runs in CI on every push to main; optionally skip it on a slow deploy host.
    ignoreBuildErrors: skipChecks,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};

export default nextConfig;
