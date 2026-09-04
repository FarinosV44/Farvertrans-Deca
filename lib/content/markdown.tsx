import type { ReactNode } from "react";
import Link from "next/link";
import { CtaButton } from "@/components/site/cta-button";
import { slugifyHeading } from "./markdown-toc";

export { slugifyHeading, extractHeadings } from "./markdown-toc";

/**
 * A small, safe Markdown → React renderer for CMS content (SEO #32). It renders
 * to React elements only — never `dangerouslySetInnerHTML` (security.md T-5) —
 * and supports the subset the editor needs: headings (h2/h3), paragraphs,
 * bullet/number lists, bold/italic/code/links, blockquote callouts, tables,
 * horizontal rules, an FAQ block (`::: faq` … `:::`) and the `[[cta]]` token.
 * The table-of-contents helpers live in `./markdown-toc` (pure, testable).
 */

/** Inline: **bold**, *italic*, `code`, [text](url). */
function inline(text: string, keyBase: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const re = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const k = `${keyBase}-${i++}`;
    if (m[2] !== undefined) nodes.push(<strong key={k}>{m[2]}</strong>);
    else if (m[3] !== undefined) nodes.push(<em key={k}>{m[3]}</em>);
    else if (m[4] !== undefined)
      nodes.push(
        <code key={k} className="rounded bg-[var(--color-surface)] px-1 text-[0.9em]">
          {m[4]}
        </code>,
      );
    else if (m[5] !== undefined && m[6] !== undefined) {
      const href = m[6];
      const external = /^https?:\/\//.test(href);
      nodes.push(
        external ? (
          <a key={k} href={href} target="_blank" rel="noopener noreferrer">
            {m[5]}
          </a>
        ) : (
          <Link key={k} href={href}>
            {m[5]}
          </Link>
        ),
      );
    }
    last = re.lastIndex;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function Markdown({ source }: { source: string }) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;
  const push = (n: ReactNode) => blocks.push(<div key={key++}>{n}</div>);

  while (i < lines.length) {
    const line = lines[i];
    const t = line.trim();

    if (t === "") {
      i++;
      continue;
    }

    // [[cta]] token
    if (t === "[[cta]]") {
      push(
        <div className="my-6">
          <CtaButton event="content_cta_click">CREAR DECA GRATIS</CtaButton>
        </div>,
      );
      i++;
      continue;
    }

    // horizontal rule
    if (/^(-{3,}|\*{3,})$/.test(t)) {
      push(<hr className="my-8 border-[var(--color-border)]" />);
      i++;
      continue;
    }

    // headings
    const h = /^(#{1,3})\s+(.*)$/.exec(t);
    if (h) {
      const text = h[2].trim();
      const id = slugifyHeading(text);
      if (h[1].length === 1) push(<h1 className="text-3xl font-bold md:text-4xl">{text}</h1>);
      else if (h[1].length === 2)
        push(
          <h2 id={id} className="mt-10 scroll-mt-24 text-2xl font-bold">
            {text}
          </h2>,
        );
      else
        push(
          <h3 id={id} className="mt-6 scroll-mt-24 text-xl font-bold">
            {text}
          </h3>,
        );
      i++;
      continue;
    }

    // FAQ block:  ::: faq  /  Q: ...  /  A: ...  /  :::
    if (t === "::: faq") {
      const qa: { q: string; a: string }[] = [];
      i++;
      let q = "";
      while (i < lines.length && lines[i].trim() !== ":::") {
        const row = lines[i].trim();
        if (row.startsWith("Q:")) q = row.slice(2).trim();
        else if (row.startsWith("A:") && q) {
          qa.push({ q, a: row.slice(2).trim() });
          q = "";
        }
        i++;
      }
      i++; // skip closing :::
      push(
        <dl className="my-6 divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
          {qa.map((x, n) => (
            <div key={n} className="py-3">
              <dt className="font-bold">{x.q}</dt>
              <dd className="mt-1 text-[var(--color-text-muted)]">{inline(x.a, `faq-${n}`)}</dd>
            </div>
          ))}
        </dl>,
      );
      continue;
    }

    // blockquote → callout
    if (t.startsWith(">")) {
      const buf: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        buf.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      push(
        <blockquote className="my-6 rounded-[var(--radius-md)] border-l-4 border-[var(--color-primary)] bg-[var(--color-surface)] p-4">
          {inline(buf.join(" "), "bq")}
        </blockquote>,
      );
      continue;
    }

    // table:  | a | b |  /  | --- | --- |  /  | 1 | 2 |
    if (t.startsWith("|") && i + 1 < lines.length && /^\|[\s:|-]+\|$/.test(lines[i + 1].trim())) {
      const cells = (row: string) =>
        row
          .trim()
          .replace(/^\||\|$/g, "")
          .split("|")
          .map((c) => c.trim());
      const head = cells(lines[i]);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(cells(lines[i]));
        i++;
      }
      push(
        <div className="my-6 overflow-x-auto rounded-[var(--radius-md)] border border-[var(--color-border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface)] text-left">
                {head.map((c, n) => (
                  <th key={n} className="px-3 py-2 font-bold">
                    {inline(c, `th-${n}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, rn) => (
                <tr key={rn} className="border-b border-[var(--color-border)] last:border-0">
                  {r.map((c, cn) => (
                    <td key={cn} className="px-3 py-2 align-top">
                      {inline(c, `td-${rn}-${cn}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    // lists
    const bullet = /^([-*])\s+(.*)$/;
    const numbered = /^(\d+)\.\s+(.*)$/;
    if (bullet.test(t) || numbered.test(t)) {
      const ordered = numbered.test(t);
      const items: string[] = [];
      while (i < lines.length) {
        const row = lines[i].trim();
        const m = ordered ? numbered.exec(row) : bullet.exec(row);
        if (!m) break;
        items.push(m[2]);
        i++;
      }
      const cls = "my-4 ml-5 space-y-1";
      push(
        ordered ? (
          <ol className={`${cls} list-decimal`}>
            {items.map((it, n) => (
              <li key={n}>{inline(it, `li-${n}`)}</li>
            ))}
          </ol>
        ) : (
          <ul className={`${cls} list-disc`}>
            {items.map((it, n) => (
              <li key={n}>{inline(it, `li-${n}`)}</li>
            ))}
          </ul>
        ),
      );
      continue;
    }

    // paragraph (gather consecutive non-blank, non-special lines)
    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^(#{1,3}\s|>|\||[-*]\s|\d+\.\s|:::|\[\[cta\]\]|-{3,}$|\*{3,}$)/.test(lines[i].trim())
    ) {
      para.push(lines[i].trim());
      i++;
    }
    if (para.length) push(<p className="my-4 leading-relaxed">{inline(para.join(" "), "p")}</p>);
  }

  return <div className="content-body">{blocks}</div>;
}
