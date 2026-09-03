/**
 * Post-`next build` step for `output: "standalone"` builds.
 *
 * Next.js copies a minimal node_modules and the server into `.next/standalone`,
 * but NOT the static assets, `public/`, or the Prisma migrations. Copy them in
 * so `.next/standalone` is a complete, runnable unit for both the Docker image
 * and Hostinger Cloud Startup (`server.cjs`).
 *
 * No-ops when `.next/standalone` is absent — i.e. a normal `next build`
 * (CI, `npm run test:e2e`), so it is safe to run unconditionally after `build`.
 */
import { existsSync, cpSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const standalone = join(root, ".next", "standalone");

if (!existsSync(standalone)) {
  process.exit(0);
}

const jobs = [
  [join(root, ".next", "static"), join(standalone, ".next", "static")],
  [join(root, "public"), join(standalone, "public")],
  [join(root, "prisma", "migrations"), join(standalone, "prisma", "migrations")],
];

for (const [from, to] of jobs) {
  if (existsSync(from)) {
    cpSync(from, to, { recursive: true });
    console.log(`[standalone-postbuild] ${from} -> ${to}`);
  }
}
