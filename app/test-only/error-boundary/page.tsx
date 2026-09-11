import { notFound } from "next/navigation";
// Note: NOT under app/_test/ — a leading underscore makes Next.js treat a
// folder as private and exclude it from routing entirely (opt-out), which
// would make this route permanently 404 regardless of the env flag below.

/**
 * E2E-only render-time throw (#118), at /test-only/error-boundary. Exists to
 * exercise the REAL `app/error.tsx` boundary in Playwright with a genuine
 * server-render error, not a mocked API response. Gated by
 * FVD_ENABLE_TEST_ROUTES — Test seam ONLY (E2E). Never set
 * FVD_ENABLE_TEST_ROUTES in production; without it this route 404s like any
 * other nonexistent path.
 */
export default function ErrorBoundaryTestRoute(): never {
  if (process.env.FVD_ENABLE_TEST_ROUTES !== "1") notFound();
  throw new Error("[e2e] intentional test-only render error");
}
