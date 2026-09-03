/**
 * Non-interactive visual of the real product (the /crear step 1 fields + the
 * generated-document result). This is the hero image — deliberately the interface
 * itself, never a stock truck photo (EPIC 01).
 */
export function DecaPreview() {
  return (
    <div
      aria-hidden
      className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[0_4px_16px_rgba(15,23,32,0.08)]"
    >
      <div className="rounded-[var(--radius-md)] bg-white p-4">
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
      <div className="mt-3 flex items-center gap-3 rounded-[var(--radius-md)] bg-white p-3">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--color-success)] text-white">
          ✓
        </span>
        <div className="flex-1">
          <p className="text-sm font-bold">DeCA generado</p>
          <p className="text-xs text-[var(--color-text-muted)]">
            PDF nativo · QR · URL de descarga directa
          </p>
        </div>
        <div className="grid h-12 w-12 grid-cols-4 grid-rows-4 gap-[2px] rounded-[4px] bg-white p-1 ring-1 ring-[var(--color-border)]">
          {Array.from({ length: 16 }).map((_, i) => (
            <span
              key={i}
              className={(i * 7) % 3 === 0 ? "bg-[var(--color-text)]" : "bg-transparent"}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
