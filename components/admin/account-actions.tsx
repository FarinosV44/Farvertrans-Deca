"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button, Pill, type PillTone } from "@/components/ui";

type Kind = "usuarios" | "empresas";
type Status = "active" | "blocked" | "deactivated" | "anonymized";

const STATUS_LABEL: Record<Status, string> = {
  active: "Activa",
  blocked: "Bloqueada",
  deactivated: "Baja",
  anonymized: "Anonimizada",
};
const STATUS_TONE: Record<Status, PillTone> = {
  active: "ok",
  blocked: "stop",
  deactivated: "rest",
  anonymized: "rest",
};

/**
 * Superadmin account-lifecycle controls (#62) — the first client-interactive
 * component in `/admin`. Step-up gated server-side; a `step_up_required`
 * response surfaces a "verifica tu identidad" link rather than failing silently.
 *
 * #108 follow-up: the re-verify link now carries the current path as `next`,
 * so completing the 2FA challenge returns the admin to this exact ficha
 * instead of dropping them on the generic `/admin` dashboard with no obvious
 * next step (reported live as the flow feeling "stuck" after entering the code).
 *
 * D-194: the link also carries `stepup=1` (so `/admin/2fa/verify` re-challenges
 * on the 10-minute step-up window, not the 12h admin window — otherwise
 * re-verification is impossible and the action loops on 401), and the reversible
 * action the admin started is replayed automatically on return. `anonymize` is
 * deliberately NOT replayed — an irreversible action always starts from a fresh
 * deliberate click.
 */
const REPLAYABLE = new Set(["block", "deactivate", "reactivate"]);
export function AccountActions({
  kind,
  id,
  status,
  reason,
  name,
}: {
  kind: Kind;
  id: string;
  status: Status;
  reason?: string | null;
  name: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stepUp, setStepUp] = useState(false);
  const [confirmAnon, setConfirmAnon] = useState("");

  const isAnon = status === "anonymized";
  const pendingKey = `fvd:pending:account:${kind}:${id}`;

  async function call(payload: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    setStepUp(false);
    try {
      const res = await fetch(`/api/admin/${kind}/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        router.refresh();
        return;
      }
      if (data?.error?.code === "step_up_required") {
        if (typeof payload.action === "string" && REPLAYABLE.has(payload.action)) {
          try {
            sessionStorage.setItem(pendingKey, JSON.stringify(payload));
          } catch {
            // sessionStorage unavailable — the manual "Verificar" link still works.
          }
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

  // Coming back from a step-up re-verification: replay the reversible action the
  // admin started before being sent to /admin/2fa/verify.
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
      const payload = JSON.parse(raw) as Record<string, unknown>;
      if (typeof payload.action === "string" && REPLAYABLE.has(payload.action)) void call(payload);
    } catch {
      // malformed — ignore, the buttons are still there
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold">Estado de la cuenta</span>
        <Pill tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Pill>
      </div>
      {reason && <p className="mt-1 text-xs text-[var(--color-text-muted)]">Motivo: {reason}</p>}

      {stepUp && (
        <p className="mt-3 text-sm text-[var(--color-danger)]">
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
        <p role="alert" className="mt-3 text-sm text-[var(--color-danger)]">
          {error}
        </p>
      )}

      {isAnon ? (
        <p className="mt-3 text-sm text-[var(--color-text-muted)]">
          Esta cuenta está anonimizada. La operación no es reversible; los DeCA y el registro de
          auditoría se conservan.
        </p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {status !== "blocked" && (
            <Button
              tier="secondary"
              disabled={busy}
              data-testid="account-block"
              onClick={() => call({ action: "block" })}
            >
              Bloquear
            </Button>
          )}
          {status !== "deactivated" && (
            <Button
              tier="secondary"
              disabled={busy}
              data-testid="account-deactivate"
              onClick={() => call({ action: "deactivate" })}
            >
              Dar de baja
            </Button>
          )}
          {status !== "active" && (
            <Button
              tier="primary"
              disabled={busy}
              data-testid="account-reactivate"
              onClick={() => call({ action: "reactivate" })}
            >
              Reactivar
            </Button>
          )}
        </div>
      )}

      {/* #103 follow-up (D-170): a company has NO irreversible action reachable
          from normal Superadmin — the endpoint itself rejects "anonymize" for
          companies now, so this block would 422 if it were rendered here.
          Kept for users only, unchanged from #62. */}
      {!isAnon && kind === "usuarios" && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-[var(--color-danger)]">
            Eliminar / anonimizar (irreversible)
          </summary>
          <p className="mt-2 text-xs text-[var(--color-text-muted)]">
            Se sustituyen los datos personales de {name} por marcadores. Los DeCA generados y el
            registro de auditoría se conservan íntegros. No se puede deshacer.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <input
              value={confirmAnon}
              onChange={(e) => setConfirmAnon(e.target.value)}
              data-testid="account-anon-confirm"
              placeholder="ANONIMIZAR"
              className="min-h-9 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 text-sm"
            />
            <Button
              tier="danger"
              disabled={busy || confirmAnon !== "ANONIMIZAR"}
              data-testid="account-anonymize"
              onClick={() => call({ action: "anonymize", confirm: confirmAnon })}
            >
              Anonimizar definitivamente
            </Button>
          </div>
        </details>
      )}
    </div>
  );
}
