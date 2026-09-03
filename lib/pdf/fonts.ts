import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";
import { Font } from "@react-pdf/renderer";

/**
 * @react-pdf ships without usable standard-font metrics in a bundled server
 * runtime, so we register a real subsetted Inter (OFL 1.1) as a data URI. The
 * TTF files are traced into the standalone build via next.config
 * `outputFileTracingIncludes`.
 */
let registered = false;

function dataUri(file: string): string {
  const buf = readFileSync(path.join(process.cwd(), "lib", "pdf", "fonts", file));
  return `data:font/ttf;base64,${buf.toString("base64")}`;
}

export function ensureFonts(): void {
  if (registered) return;
  Font.register({
    family: "Inter",
    fonts: [
      { src: dataUri("Inter-Regular.ttf"), fontWeight: 400 },
      { src: dataUri("Inter-Bold.ttf"), fontWeight: 700 },
    ],
  });
  Font.registerHyphenationCallback((word) => [word]); // no hyphenation
  registered = true;
}
