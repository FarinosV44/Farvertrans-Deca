import { defineConfig, devices } from "@playwright/test";

const PORT = process.env.PORT ?? "3000";
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  globalSetup: "./tests/global-setup.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // The DeCA flow renders a real PDF per generation (@react-pdf, CPU-bound). On a
  // developer machine also running the browsers + the Next server, 6+ concurrent
  // renders starve the event loop and the post-generate navigation times out.
  // Cap local concurrency; CI keeps its tuned default plus retries:1.
  workers: process.env.CI ? undefined : 3,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "on",
    video: "on",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run build && npm run start",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    // Test seam: lets the password-reset e2e read the emailed token. Never set in production.
    env: { FVD_EXPOSE_RESET_TOKEN: "1" },
  },
});
