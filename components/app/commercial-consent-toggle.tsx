"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Commercial route-offer consent toggle (DATA #45 §3). Separate from the
 * mandatory Terms acceptance — opt-in, never pre-checked, revocable at any
 * time. Owner-only; members see the current state read-only.
 */
export function CommercialConsentToggle({
  granted,
  canChange,
}: {
  granted: boolean;
  canChange: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/company/consent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ granted: !granted }),
      });
      if (!res.ok) {
        setError("No se pudo guardar tu preferencia.");
        setBusy(false);
        return;
      }
      router.refresh();
    } catch {
      setError("Sin conexión.");
    }
    setBusy(false);
  }

  return (
    <section
      aria-labelledby="consent-comercial"
      className="mt-10 rounded-[var(--radius-lg)] border border-[var(--color-border)] p-5"
    >
      <h2 id="consent-comercial" className="text-lg font-bold">
        Oportunidades de transporte
      </h2>
      <p className="mt-2 text-sm text-[var(--color-text-muted)]">
        Quiero recibir oportunidades de transporte adaptadas a mis rutas habituales.
      </p>
      <p className="mt-1 text-xs text-[var(--color-text-muted)]">
        Si lo autorizas, podremos analizar los lugares y fechas de carga y descarga de los DeCA que
        generes para proponerte portes que encajen con tus trayectos habituales. Tus datos no se
        venden. Puedes retirar esta autorización en cualquier momento.
      </p>
      {error && (
        <p role="alert" className="mt-2 text-sm text-[var(--color-danger)]">
          {error}
        </p>
      )}
      <label className="mt-3 flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          data-testid="commercial-consent-checkbox"
          checked={granted}
          disabled={busy || !canChange}
          onChange={toggle}
          className="h-5 w-5"
        />
        {granted ? "Autorización activa" : "No autorizado"}
      </label>
      {!canChange && (
        <p className="mt-2 text-xs text-[var(--color-text-muted)]">
          Solo el administrador de la empresa puede cambiar esta preferencia.
        </p>
      )}
    </section>
  );
}
