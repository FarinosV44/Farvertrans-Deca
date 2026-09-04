/**
 * Table-of-contents helpers for CMS markdown (SEO #32). Pure string functions,
 * kept out of `markdown.tsx` so they can be unit-tested without pulling in React
 * or `next/link`.
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
