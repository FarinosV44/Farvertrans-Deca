"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

/**
 * #103 — "Marcar como prueba" / "Quitar marca de prueba". Purely a
 * visibility/metrics toggle: reversible, never touches access, sessions, or
 * data — kept visually simple (a plain button, not a confirm dialog) because
 * it carries none of the risk the status/anonymize actions above it do.
 *
 * #108 fix: the endpoint is step-up gated (same as block/deactivate/reactivate/
 * edit), so a stale TOTP check (>10 min) makes it 401 with
 * `step_up_required` — previously swallowed silently, making the button look
 * broken with zero feedback. Mirrors `AccountActions`'s error/step-up
 * handling exactly rather than inventing a second pattern for the same class
 * of endpoint.
 */
export function MarkTest({ id, isTest }: { id: string; isTest: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stepUp, setStepUp] = useState(false);

  async function toggle() {
    setBusy(true);
    setError(null);
    setStepUp(false);
    try {
      const res = await fetch(`/api/admin/empresas/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "set_test", isTest: !isTest }),
      });
      if (res.ok) {
        router.refresh();
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (data?.error?.code === "step_up_required") {
        setStepUp(true);
        return;
      }
      setError(data?.error?.message ?? "No se pudo completar la acción.");
    } catch {
      setError("Sin conexión. Inténtalo de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={toggle}
        disabled={busy}
        data-testid="mark-test-toggle"
        className="min-h-9 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 text-sm font-medium"
      >
        {isTest ? "Quitar marca de prueba" : "Marcar como prueba"}
      </button>
      {stepUp && (
        <p className="mt-2 text-sm text-[var(--color-danger)]">
          Verifica tu identidad de nuevo para esta acción.{" "}
          <Link href="/admin/2fa/verify" className="underline">
            Verificar
          </Link>
        </p>
      )}
      {error && (
        <p role="alert" className="mt-2 text-sm text-[var(--color-danger)]">
          {error}
        </p>
      )}
    </div>
  );
}
