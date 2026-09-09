"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type CompanyRoleValue = "owner" | "member" | "read_only";

type Member = {
  id: string;
  email: string;
  companyRole: CompanyRoleValue;
  isInternal: boolean;
  joinedAt: string;
};

const ROLE_LABEL: Record<CompanyRoleValue, string> = {
  owner: "Administrador",
  member: "Operador",
  read_only: "Solo lectura",
};
type Invite = { id: string; email: string; role: string; expiresAt: string };

export function TeamManager({
  members,
  invites,
  isAdmin,
  meId,
  companyName,
}: {
  members: Member[];
  invites: Invite[];
  isAdmin: boolean;
  meId: string;
  /** #102: named in the "Eliminar acceso" confirmation, so it is unmistakable
   *  that only THIS workspace's access is being revoked. */
  companyName: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<CompanyRoleValue>("member");
  const [delivered, setDelivered] = useState(true);
  const [copied, setCopied] = useState(false);
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
        body: JSON.stringify({ email, role: inviteRole }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(data?.error?.message ?? "No se pudo invitar.");
      } else {
        setLink(data.link);
        setDelivered(!!data.delivered);
        setCopied(false);
        setMsg(
          // #102: whether the recipient already has an account or not, a
          // failed send must never be the end of the road — the admin
          // always gets a link they can hand over themselves.
          data.delivered
            ? `Invitación enviada a ${data.email}.`
            : `No se pudo enviar el correo automáticamente. Comparte este enlace con ${data.email} tú mismo:`,
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

  async function setRole(memberId: string, role: CompanyRoleValue) {
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
                  {ROLE_LABEL[m.companyRole]}
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
                    onChange={(e) => setRole(m.id, e.target.value as CompanyRoleValue)}
                    className="min-h-9 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 text-xs"
                  >
                    <option value="member">Operador</option>
                    <option value="read_only">Solo lectura</option>
                    <option value="owner">Administrador</option>
                  </select>
                  <button
                    type="button"
                    data-testid={`remove-member-${m.email}`}
                    onClick={() => {
                      // #102: never a bare "Quitar" — the account and every
                      // OTHER company it belongs to are unaffected, and the
                      // confirm text says so explicitly rather than reading
                      // like account deletion.
                      if (
                        window.confirm(
                          `${m.email} perderá acceso a ${companyName}, pero su cuenta y otras empresas no se eliminarán.`,
                        )
                      ) {
                        del(`/api/team/members/${m.id}`);
                      }
                    }}
                    className="text-[var(--color-danger)] underline"
                  >
                    Eliminar acceso
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
            <label>
              <span className="block text-sm font-medium">Rol</span>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as CompanyRoleValue)}
                data-testid="invite-role"
                className="mt-1 min-h-11 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 text-sm"
              >
                <option value="member">Operador</option>
                <option value="read_only">Solo lectura</option>
                <option value="owner">Administrador</option>
              </select>
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
            <p
              className={`mt-2 text-sm ${!delivered && link ? "font-medium text-[var(--color-warn)]" : ""}`}
              data-testid="invite-msg"
            >
              {msg}
            </p>
          )}
          {link && (
            <div
              className={`mt-1 rounded-[var(--radius-md)] border p-2 ${
                delivered
                  ? "border-[var(--color-border)] bg-[var(--color-surface)]"
                  : "border-[var(--color-warn)] bg-[var(--color-warn-bg)]"
              }`}
            >
              <p className="font-mono text-xs break-all" data-testid="invite-link">
                {link}
              </p>
              <div className="mt-1.5 flex flex-wrap gap-3 text-xs">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(link)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[var(--color-primary)] underline"
                >
                  Enviar por WhatsApp
                </a>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(link);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    } catch {
                      setCopied(false);
                    }
                  }}
                  className="font-medium text-[var(--color-primary)] underline"
                >
                  {copied ? "Copiado" : "Copiar enlace"}
                </button>
              </div>
            </div>
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
