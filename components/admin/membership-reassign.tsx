"use client";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

type Role = "owner" | "member" | "read_only";

/**
 * #102 Superadmin recovery tool — "reasociar un usuario existente a una
 * empresa existente de forma auditada", for the case pre-#102's bug already
 * produced and for any future one shaped like it. Creates (or confirms) a
 * `Membership` and makes it active; never creates a company, never touches
 * any other membership this user holds.
 */
export function MembershipReassign({ userId }: { userId: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [companyId, setCompanyId] = useState("");
  const [role, setRole] = useState<Role>("owner");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [stepUp, setStepUp] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !companyId.trim() || !reason.trim()) return;
    setBusy(true);
    setMsg(null);
    setStepUp(false);
    try {
      const res = await fetch(`/api/admin/usuarios/${userId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "reassign", companyId: companyId.trim(), role, reason }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        // #138 — same D-184/D-194 defect class: a bare error message with no
        // link left the admin stuck, unable to re-verify from here at all.
        if (data?.error?.code === "step_up_required") {
          setStepUp(true);
        } else {
          setMsg(data?.error?.message ?? "No se pudo reasignar.");
        }
      } else {
        setMsg("Membresía creada/activada.");
        setCompanyId("");
        setReason("");
        router.refresh();
      }
    } catch {
      setMsg("Sin conexión.");
    }
    setBusy(false);
  }

  return (
    <details
      className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-3"
      open={open}
      onToggle={(e) => setOpen(e.currentTarget.open)}
      data-testid="membership-reassign"
    >
      <summary className="cursor-pointer text-sm font-semibold">
        Reasignar a una empresa existente
      </summary>
      <p className="mt-2 text-xs text-[var(--color-text-muted)]">
        Crea (o confirma) una membresía en la empresa indicada y la deja como activa. Nunca crea una
        empresa nueva ni toca otras membresías de este usuario.
      </p>
      <form onSubmit={submit} className="mt-3 flex flex-wrap items-end gap-2">
        <div>
          <label htmlFor="reassign-company" className="block text-xs font-medium">
            ID de empresa
          </label>
          <input
            id="reassign-company"
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            data-testid="reassign-company-id"
            className="mt-1 min-h-9 w-56 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 text-sm"
            required
          />
        </div>
        <div>
          <label htmlFor="reassign-role" className="block text-xs font-medium">
            Rol
          </label>
          <select
            id="reassign-role"
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            data-testid="reassign-role"
            className="mt-1 min-h-9 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 text-sm"
          >
            <option value="owner">Administrador</option>
            <option value="member">Operador</option>
            <option value="read_only">Solo lectura</option>
          </select>
        </div>
        <div className="min-w-[220px] flex-1">
          <label htmlFor="reassign-reason" className="block text-xs font-medium">
            Motivo (obligatorio, se audita)
          </label>
          <input
            id="reassign-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            data-testid="reassign-reason"
            className="mt-1 min-h-9 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 text-sm"
            required
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          data-testid="reassign-submit"
          className="min-h-9 rounded-[var(--radius-sm)] bg-[var(--color-primary)] px-3 text-sm font-medium text-[var(--color-primary-contrast)]"
        >
          Reasignar
        </button>
      </form>
      {msg && (
        <p className="mt-2 text-sm" data-testid="reassign-msg">
          {msg}
        </p>
      )}
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
    </details>
  );
}
