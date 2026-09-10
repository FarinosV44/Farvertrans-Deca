/**
 * Pure string helpers for CMS markdown (SEO #32) — table of contents plus the
 * block-syntax parsers added for the product usage guide (#111). Kept out of
 * `markdown.tsx` so they can be unit-tested without pulling in React or
 * `next/link`.
 */

export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);
}

/** The h2/h3 headings of a markdown source, in document order. */
export function extractHeadings(source: string): { level: 2 | 3; text: string; id: string }[] {
  const out: { level: 2 | 3; text: string; id: string }[] = [];
  for (const line of source.split(/\r?\n/)) {
    const m = /^(#{2,3})\s+(.*)$/.exec(line.trim());
    if (m) {
      const text = m[2].trim();
      out.push({ level: m[1].length as 2 | 3, text, id: slugifyHeading(text) });
    }
  }
  return out;
}

/**
 * Typed callout boxes for the usage guide (#111): `::: tip` / `::: important` /
 * `::: example` … `:::`, mirroring the existing `::: faq` fence. The bare `>`
 * blockquote keeps its own generic style — this is for labelled asides.
 */
export const CALLOUT_LABEL = {
  tip: "Consejo",
  important: "Importante",
  example: "Ejemplo",
} as const;

export type CalloutVariant = keyof typeof CALLOUT_LABEL;

export function calloutVariant(fenceLine: string): CalloutVariant | null {
  const m = /^:::\s+(\w+)\s*$/.exec(fenceLine.trim());
  const v = m?.[1];
  return v && v in CALLOUT_LABEL ? (v as CalloutVariant) : null;
}

/**
 * A block-level image with an optional caption:
 *   `![alt](/guia/x.png)` or `![alt](/guia/x.png "Un pie de foto")`
 * Only local paths (`/…`) are accepted — editor/guide content never points an
 * `<img>` at an arbitrary remote host (same posture as `heroImage`). Returns
 * `null` for anything else so the line falls through to normal parsing.
 */
export function parseImageLine(
  line: string,
): { alt: string; src: string; caption: string | null } | null {
  // `/foo` only — never `//host` (protocol-relative → remote) and never `http…`.
  const m = /^!\[([^\]]*)\]\((\/(?!\/)[^)\s"]+)(?:\s+"([^"]*)")?\)$/.exec(line.trim());
  if (!m) return null;
  return { alt: m[1].trim(), src: m[2], caption: m[3]?.trim() || null };
}
