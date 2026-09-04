"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Member = {
  id: string;
  email: string;
  companyRole: "owner" | "member";
  isInternal: boolean;
  joinedAt: string;
};
type Invite = { id: string; email: string; role: string; expiresAt: string };

export function TeamManager({
  members,
  invites,
  isAdmin,
  meId,
}: {
  members: Member[];
  invites: Invite[];
  isAdmin: boolean;
  meId: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !email) return;
    setBusy(true);
    setMsg(null);
    setLink(null);
    try {
      const res = await fetch("/api/team/invites", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(data?.error?.message ?? "No se pudo invitar.");
      } else {
        setLink(data.link);
        setMsg(
          data.delivered
            ? `Invitación enviada a ${data.email}.`
            : `Invitación creada. Copia el enlace y envíaselo a ${data.email}.`,
        );
        setEmail("");
        router.refresh();
      }
    } catch {
      setMsg("Sin conexión.");
    }
    setBusy(false);
  }

  async function del(url: string) {
    await fetch(url, { method: "DELETE" });
    router.refresh();
  }

  async function setRole(memberId: string, role: "owner" | "member") {
    setMsg(null);
    const res = await fetch(`/api/team/members/${memberId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setMsg(data?.error?.message ?? "No se pudo cambiar el rol.");
      return;
    }
    router.refresh();
  }

  async function resend(memberEmail: string) {
    setEmail(memberEmail);
    await fetch("/api/team/invites", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: memberEmail }),
    }).catch(() => {});
    setMsg(`Se ha vuelto a crear la invitación para ${memberEmail}.`);
    setEmail("");
    router.refresh();
  }

  return (
    <div className="mt-6 space-y-8">
      <section aria-labelledby="miembros">
        <h2 id="miembros" className="text-lg font-bold">
          Miembros
        </h2>
        <ul
          className="mt-2 divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]"
          data-testid="member-list"
        >
          {members.map((m) => (
            <li
              key={m.id}
              className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 py-2 text-sm"
            >
              <span className="min-w-0">
                <span className="font-medium">{m.email}</span>
                {m.id === meId && <span className="text-[var(--color-text-muted)]"> (tú)</span>}
                <span className="ml-2 rounded-[4px] bg-[var(--color-surface)] px-1.5 py-0.5 text-xs">
                  {m.companyRole === "owner" ? "Administrador" : "Operador"}
                </span>
                <span className="ml-2 text-xs text-[var(--color-text-muted)]">
                  Activo · desde {m.joinedAt.slice(0, 10)}
                </span>
              </span>
              {isAdmin && m.id !== meId && (
                <span className="flex items-center gap-3">
                  <label className="sr-only" htmlFor={`role-${m.id}`}>
                    Rol de {m.email}
                  </label>
                  <select
                    id={`role-${m.id}`}
                    data-testid={`role-${m.email}`}
                    value={m.companyRole}
                    onChange={(e) => setRole(m.id, e.target.value as "owner" | "member")}
                    className="min-h-9 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 text-xs"
                  >
                    <option value="member">Operador</option>
                    <option value="owner">Administrador</option>
                  </select>
                  <button
                    type="button"
                    data-testid={`remove-member-${m.email}`}
                    onClick={() => del(`/api/team/members/${m.id}`)}
                    className="text-[var(--color-danger)] underline"
                  >
                    Quitar
                  </button>
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>

      {isAdmin && (
        <section aria-labelledby="invitar">
          <h2 id="invitar" className="text-lg font-bold">
            Invitar a un compañero
          </h2>
          <form onSubmit={invite} className="mt-2 flex flex-wrap items-end gap-2" noValidate>
            <label className="flex-1">
              <span className="block text-sm font-medium">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                data-testid="invite-email"
                className="mt-1 min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3"
              />
            </label>
            <button
              type="submit"
              disabled={busy}
              data-testid="invite-submit"
              className="min-h-11 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 font-medium text-[var(--color-primary-contrast)] disabled:opacity-55"
            >
              {busy ? "Creando…" : "Crear invitación"}
            </button>
          </form>
          {msg && (
            <p className="mt-2 text-sm" data-testid="invite-msg">
              {msg}
            </p>
          )}
          {link && (
            <p className="mt-1 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-2 font-mono text-xs break-all">
              {link}
            </p>
          )}

          {invites.length > 0 && (
            <>
              <h3 className="mt-6 text-sm font-bold">Invitaciones pendientes</h3>
              <ul
                className="mt-2 divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]"
                data-testid="pending-invites"
              >
                {invites.map((i) => (
                  <li key={i.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                    <span>
                      {i.email}{" "}
                      <span className="text-xs text-[var(--color-text-muted)]">
                        · pendiente · caduca {i.expiresAt.slice(0, 10)}
                      </span>
                    </span>
                    <span className="flex items-center gap-3">
                      <button
                        type="button"
                        data-testid={`resend-invite-${i.email}`}
                        onClick={() => resend(i.email)}
                        className="underline"
                      >
                        Reenviar
                      </button>
                      <button
                        type="button"
                        onClick={() => del(`/api/team/invites/${i.id}`)}
                        className="text-[var(--color-danger)] underline"
                      >
                        Revocar
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}

      <p className="text-xs text-[var(--color-text-muted)]">
        Todos los miembros comparten los DeCA, los datos habituales, los vehículos y las plantillas
        de la empresa. Cada documento guarda quién lo generó o corrigió.
      </p>
    </div>
  );
}
