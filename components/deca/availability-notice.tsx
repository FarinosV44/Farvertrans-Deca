"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Shown on a DeCA's detail page when a commercial availability record has been
 * prepared for that porte (#84). Lets the owner withdraw it at any time. Small,
 * neutral — not an alarm.
 */
export function AvailabilityNotice({
  decaId,
  status,
  destination,
  canWithdraw,
}: {
  decaId: string;
  status: "pending" | "withdrawn";
  destination: string;
  canWithdraw: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function withdraw() {
    if (!window.confirm("¿Retirar este porte de las propuestas de carga? No afecta al DeCA."))
      return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/deca/${decaId}/availability`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "withdraw" }),
      });
      if (!res.ok) {
        setError("No se pudo retirar.");
        setBusy(false);
        return;
      }
      router.refresh();
    } catch {
      setError("Sin conexión.");
      setBusy(false);
    }
  }

  return (
    <div
      data-testid="availability-notice"
      className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] p-3 text-sm"
    >
      {status === "withdrawn" ? (
        <p className="text-[var(--color-text-muted)]">
          Este porte se retiró de las propuestas de carga.
        </p>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p>
            Este porte está marcado para propuestas de carga
            {destination ? ` (${destination})` : ""}.
          </p>
          {canWithdraw && (
            <button
              type="button"
              data-testid="availability-withdraw"
              disabled={busy}
              onClick={withdraw}
              className="min-h-9 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 text-xs font-medium text-[var(--color-danger)]"
            >
              Retirar
            </button>
          )}
        </div>
      )}
      {error && <p className="mt-1 text-xs text-[var(--color-danger)]">{error}</p>}
    </div>
  );
}
