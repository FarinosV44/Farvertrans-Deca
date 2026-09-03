"use client";
import { track } from "@/lib/analytics/client";

/**
 * FAQ as native <details> — full content is in the SSR HTML (indexable, works
 * with JS disabled). Opening one fires `faq_open` once (#22 analytics).
 */
export function FaqAccordion({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="mt-6 divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
      {items.map((f) => (
        <details
          key={f.q}
          className="group py-4"
          onToggle={(e) => {
            if ((e.currentTarget as HTMLDetailsElement).open) track("faq_open");
          }}
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-bold">
            {f.q}
            <span
              aria-hidden
              className="text-[var(--color-text-muted)] transition-transform group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
