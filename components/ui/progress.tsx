/**
 * Sistema Vía (#67) — the "línea de creación". A row of nodes joined by a
 * rule; done + current segments are the route colour. Used ONLY in the
 * `/crear` DeCA flow. Announces the current step to assistive tech.
 */
export function Progress({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div
      className="flex w-full items-start text-[11px]"
      role="img"
      aria-label={`Paso ${current + 1} de ${steps.length}: ${steps[current]}`}
    >
      {steps.map((label, i) => {
        const done = i < current;
        const now = i === current;
        return (
          <div key={label} className="contents">
            {i > 0 && (
              <span
                aria-hidden
                className="mt-[7px] h-[2px] flex-1"
                style={{ background: done || now ? "var(--color-route)" : "var(--color-border)" }}
              />
            )}
            <span className="flex w-[110px] flex-none flex-col items-center gap-1.5 text-center">
              <span
                aria-hidden
                className="h-[15px] w-[15px] rounded-full border-2"
                style={{
                  background: done ? "var(--color-route)" : "var(--color-bg)",
                  borderColor: done || now ? "var(--color-route)" : "var(--color-border)",
                  boxShadow: now ? "0 0 0 3px var(--color-route-bg)" : "none",
                }}
              />
              <span
                className="font-semibold uppercase tracking-[0.06em]"
                style={{ color: now ? "var(--color-route)" : "var(--color-text-muted)" }}
              >
                {label}
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );
}
