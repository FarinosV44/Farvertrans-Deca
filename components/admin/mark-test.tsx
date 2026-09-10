"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
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
 *
 * #108 follow-up (D-184): the "Verificar" link carries the current path as
 * `next` so verifying returns the admin to this exact ficha.
 *
 * D-194: two remaining gaps in that flow —
 *  1. the link now also carries `stepup=1`, so `/admin/2fa/verify` re-challenges
 *     on the 10-minute step-up window instead of skipping on the 12h admin
 *     window (which made re-verification impossible — an unbreakable loop);
 *  2. the action the admin started is stashed and replayed automatically once
 *     they return with a fresh check, so they don't have to find and click the
 *     button again ("se queda pillado").
 */
export function MarkTest({ id, isTest }: { id: string; isTest: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stepUp, setStepUp] = useState(false);

  const pendingKey = `fvd:pending:set-test:${id}`;

  async function run(target: boolean) {
    setBusy(true);
    setError(null);
    setStepUp(false);
    try {
      const res = await fetch(`/api/admin/empresas/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "set_test", isTest: target }),
      });
      if (res.ok) {
        router.refresh();
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (data?.error?.code === "step_up_required") {
        try {
          sessionStorage.setItem(pendingKey, JSON.stringify({ target }));
        } catch {
          // sessionStorage unavailable — the manual "Verificar" link still works.
        }
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

  // Coming back from a step-up re-verification: replay the action the admin
  // started before being sent to /admin/2fa/verify.
  useEffect(() => {
    let raw: string | null = null;
    try {
      raw = sessionStorage.getItem(pendingKey);
      if (raw) sessionStorage.removeItem(pendingKey);
    } catch {
      return;
    }
    if (!raw) return;
    try {
      const { target } = JSON.parse(raw) as { target: boolean };
      if (typeof target === "boolean") void run(target);
    } catch {
      // malformed — ignore, the button is still there
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <button
        type="button"
        onClick={() => run(!isTest)}
        disabled={busy}
        data-testid="mark-test-toggle"
        className="min-h-9 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 text-sm font-medium"
      >
        {isTest ? "Quitar marca de prueba" : "Marcar como prueba"}
      </button>
      {stepUp && (
        <p className="mt-2 text-sm text-[var(--color-danger)]">
          Verifica tu identidad de nuevo para esta acción.{" "}
          <Link
            href={`/admin/2fa/verify?next=${encodeURIComponent(pathname)}&stepup=1`}
            className="underline"
          >
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
