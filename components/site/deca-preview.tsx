import { DocumentIcon } from "@/components/panel/icons";

/**
 * Non-interactive visual of the real product — the landing hero/product-proof
 * illustration (DESIGN #55 §1). Two layered cards: the creator step behind,
 * the generated-document result in front, overlapping — "product-led
 * graphics", not a stock photo or an abstract shape (EPIC 01).
 *
 * The QR shown is a REAL, server-generated QR code pointing at the site's own
 * public base URL (`qrDataUri`, produced by `lib/pdf/qr.ts` — the exact same
 * QR library the real PDF uses) — never a decorative pixel grid. Scanning it
 * takes you somewhere real; it does not claim to be a specific document's QR,
 * it demonstrates the actual QR mechanism the product ships.
 */
export function DecaPreview({ qrDataUri }: { qrDataUri: string }) {
  return (
    <div aria-hidden className="relative min-w-0">
      {/* Back card: the creator, step 1 of 3 */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-4 shadow-[0_4px_16px_rgba(15,23,32,0.08)] sm:mr-10">
        <p className="text-xs font-medium text-[var(--color-text-muted)]">Paso 1 de 3</p>
        <p className="mt-1 text-sm font-bold">Cargador contractual y transportista</p>
        <div className="mt-3 space-y-2">
          {["Cargador — NIF y domicilio", "Transportista efectivo — NIF", "Origen → Destino"].map(
            (l) => (
              <div
                key={l}
                className="rounded-[6px] border border-[var(--color-border)] px-3 py-2 text-xs text-[var(--color-text-muted)]"
              >
                {l}
              </div>
            ),
          )}
        </div>
        <div className="mt-3 flex h-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary)] text-xs font-bold tracking-wide text-[var(--color-primary-contrast)]">
          GENERAR DECA
        </div>
      </div>

      {/* Front card: the generated document, overlapping the creator card */}
      <div className="relative z-10 -mt-8 ml-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white p-4 shadow-[0_12px_32px_-8px_rgba(15,23,32,0.18)] sm:ml-16">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--color-success)] text-white">
            ✓
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold">DeCA generado</p>
            <p className="truncate text-xs text-[var(--color-text-muted)]">
              Valencia → Madrid · v1
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-[var(--color-success)] px-2 py-0.5 text-[10px] font-medium text-white">
            Vigente
          </span>
        </div>

        <div className="mt-3 flex items-center gap-3 rounded-[var(--radius-md)] bg-[var(--color-surface)] p-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrDataUri}
            alt=""
            width={56}
            height={56}
            className="shrink-0 rounded-[6px] border border-[var(--color-border)] bg-white p-0.5"
          />
          <div className="min-w-0">
            <p className="text-xs font-medium">PDF nativo · QR · URL directa</p>
            <p className="mt-0.5 truncate font-mono text-[10px] text-[var(--color-text-muted)]">
              https://…/d/8fq2…
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <span className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--color-primary)] text-xs font-medium text-[var(--color-primary-contrast)]">
            <DocumentIcon width={14} height={14} />
            Descargar PDF
          </span>
          <span className="flex h-8 items-center rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 text-xs font-medium">
            Compartir
          </span>
        </div>
      </div>
    </div>
  );
}
