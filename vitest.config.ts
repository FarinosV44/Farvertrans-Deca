import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  // Some unit tests render React (@react-pdf) components directly; the source
  // files use the automatic JSX runtime and don't import React.
  esbuild: { jsx: "automatic", jsxImportSource: "react" },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts", "lib/**/*.test.ts"],
    globals: false,
    setupFiles: ["./tests/unit/setup-env.ts"],
  },
});
