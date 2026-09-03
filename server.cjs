#!/usr/bin/env node
/**
 * Hostinger Cloud Startup / LiteSpeed (lsnode.js) entry point.
 *
 * Hostinger's LiteSpeed Node launcher starts an app with CommonJS
 * `require(startupFile)`. This file has the `.cjs` extension, so Node ALWAYS
 * loads it as CommonJS regardless of any `"type"` field that might appear in a
 * package.json — it cannot hit `ERR_REQUIRE_ESM`. It then hands off to the
 * Next.js 15 standalone server (`.next/standalone/server.js`, itself emitted as
 * CommonJS because the project's package.json has no `"type": "module"`).
 *
 * Configure Hostinger's **Startup file** to:  server.cjs
 * (Application root = the repository root; Node.js 20+.)
 *
 * Local / Docker deploys use `node .next/standalone/server.js` directly and do
 * not need this wrapper.
 */
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
const standaloneDir = path.join(root, ".next", "standalone");
const serverEntry = path.join(standaloneDir, "server.js");

if (!fs.existsSync(serverEntry)) {
  console.error(
    "[server.cjs] " +
      serverEntry +
      " not found.\n" +
      "Build the standalone output first:  NEXT_STANDALONE=1 npm run build",
  );
  process.exit(1);
}

// Next does NOT place the static assets or public/ inside .next/standalone.
// `npm run build` copies them via scripts/standalone-postbuild.mjs; copy again
// here defensively in case the host ran a bare `next build`.
const copies = [
  [path.join(root, ".next", "static"), path.join(standaloneDir, ".next", "static")],
  [path.join(root, "public"), path.join(standaloneDir, "public")],
];
for (const [from, to] of copies) {
  try {
    if (fs.existsSync(from) && !fs.existsSync(to)) {
      fs.cpSync(from, to, { recursive: true });
    }
  } catch (err) {
    console.warn("[server.cjs] could not copy " + from + " -> " + to + ": " + err.message);
  }
}

// LiteSpeed provides the listening port; Next standalone reads PORT / HOSTNAME.
process.env.PORT = process.env.PORT || process.env.NODE_PORT || "3000";
process.env.HOSTNAME = process.env.HOSTNAME || "0.0.0.0";
process.env.NODE_ENV = process.env.NODE_ENV || "production";

process.chdir(standaloneDir);
require(serverEntry);
