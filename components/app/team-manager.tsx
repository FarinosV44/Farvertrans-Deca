"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/lib/i18n/client";

type CompanyRoleValue = "owner" | "member" | "read_only";

type Member = {
  id: string;
  email: string;
  companyRole: CompanyRoleValue;
  isInternal: boolean;
  joinedAt: string;
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
  // D-246 fix: translated messages are read via `useT()`, not a prop from a
  // Server Component — several of these are functions, and functions cannot
  // cross the RSC server→client boundary (this is a "use client" component).
  const dict = useT();
  const t = dict.panel.team;
  const roleLabel = dict.panel.teamActivity.roleLabel;
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
        setMsg(data?.error?.message ?? t.inviteError);
      } else {
        setLink(data.link);
        setDelivered(!!data.delivered);
        setCopied(false);
        setMsg(
          // #102: whether the recipient already has an account or not, a
          // failed send must never be the end of the road — the admin
          // always gets a link they can hand over themselves.
          data.delivered ? t.delivered(data.email) : t.notDelivered(data.email),
        );
        setEmail("");
        router.refresh();
      }
    } catch {
      setMsg(t.offlineError);
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
      setMsg(data?.error?.message ?? t.roleChangeError);
      return;
    }
    router.refresh();
  }

  async function resend(memberEmail: string) {
    // D-176: this used to fire the request and throw the response away —
    // "Reenviar" ROTATES the invite's token in place (#95/D-166: at most one
    // valid link per email at any moment), so the previous link the admin
    // may have already copied or been shown becomes invalid the instant
    // this succeeds. Never showing the NEW link left no way back in short
    // of the email actually arriving — exactly the reported "I keep
    // generating a new one and it's always expired" loop, since every
    // click here silently invalidated whatever was on screen.
    setBusy(true);
    setMsg(null);
    setLink(null);
    try {
      const res = await fetch("/api/team/invites", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: memberEmail }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(data?.error?.message ?? t.resendError);
      } else {
        setLink(data.link);
        setDelivered(!!data.delivered);
        setCopied(false);
        setMsg(data.delivered ? t.resendDelivered(data.email) : t.resendNotDelivered(data.email));
        router.refresh();
      }
    } catch {
      setMsg(t.offlineError);
    }
    setBusy(false);
  }

  return (
    <div className="mt-6 space-y-8">
      <section aria-labelledby="miembros">
        <h2 id="miembros" className="text-lg font-bold">
          {t.membersHeading}
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
                {m.id === meId && <span className="text-[var(--color-text-muted)]">{t.you}</span>}
                <span className="ml-2 rounded-[4px] bg-[var(--color-surface)] px-1.5 py-0.5 text-xs">
                  {roleLabel[m.companyRole]}
                </span>
                <span className="ml-2 text-xs text-[var(--color-text-muted)]">
                  {t.activeSince(m.joinedAt.slice(0, 10))}
                </span>
              </span>
              {isAdmin && m.id !== meId && (
                <span className="flex items-center gap-3">
                  <label className="sr-only" htmlFor={`role-${m.id}`}>
                    {t.roleOfLabel(m.email)}
                  </label>
                  <select
                    id={`role-${m.id}`}
                    data-testid={`role-${m.email}`}
                    value={m.companyRole}
                    onChange={(e) => setRole(m.id, e.target.value as CompanyRoleValue)}
                    className="min-h-9 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 text-xs"
                  >
                    <option value="member">{roleLabel.member}</option>
                    <option value="read_only">{roleLabel.read_only}</option>
                    <option value="owner">{roleLabel.owner}</option>
                  </select>
                  <button
                    type="button"
                    data-testid={`remove-member-${m.email}`}
                    onClick={() => {
                      // #102: never a bare "Quitar" — the account and every
                      // OTHER company it belongs to are unaffected, and the
                      // confirm text says so explicitly rather than reading
                      // like account deletion.
                      if (window.confirm(t.removeConfirm(m.email, companyName))) {
                        del(`/api/team/members/${m.id}`);
                      }
                    }}
                    className="text-[var(--color-danger)] underline"
                  >
                    {t.removeAccess}
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
            {t.inviteHeading}
          </h2>
          <form onSubmit={invite} className="mt-2 flex flex-wrap items-end gap-2" noValidate>
            <label className="flex-1">
              <span className="block text-sm font-medium">{t.emailLabel}</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                data-testid="invite-email"
                className="mt-1 min-h-11 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3"
              />
            </label>
            <label>
              <span className="block text-sm font-medium">{t.roleFieldLabel}</span>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as CompanyRoleValue)}
                data-testid="invite-role"
                className="mt-1 min-h-11 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 text-sm"
              >
                <option value="member">{roleLabel.member}</option>
                <option value="read_only">{roleLabel.read_only}</option>
                <option value="owner">{roleLabel.owner}</option>
              </select>
            </label>
            <button
              type="submit"
              disabled={busy}
              data-testid="invite-submit"
              className="min-h-11 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 font-medium text-[var(--color-primary-contrast)] disabled:opacity-55"
            >
              {busy ? t.creating : t.createInvite}
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
                  {t.sendWhatsapp}
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
                  {copied ? t.copied : t.copyLink}
                </button>
              </div>
            </div>
          )}

          {invites.length > 0 && (
            <>
              <h3 className="mt-6 text-sm font-bold">{t.pendingInvites}</h3>
              <ul
                className="mt-2 divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]"
                data-testid="pending-invites"
              >
                {invites.map((i) => (
                  <li key={i.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                    <span>
                      {i.email}{" "}
                      <span className="text-xs text-[var(--color-text-muted)]">
                        {t.pendingExpires(i.expiresAt.slice(0, 10))}
                      </span>
                    </span>
                    <span className="flex items-center gap-3">
                      <button
                        type="button"
                        data-testid={`resend-invite-${i.email}`}
                        onClick={() => resend(i.email)}
                        disabled={busy}
                        className="underline disabled:opacity-55"
                      >
                        {t.resend}
                      </button>
                      <button
                        type="button"
                        onClick={() => del(`/api/team/invites/${i.id}`)}
                        disabled={busy}
                        className="text-[var(--color-danger)] underline disabled:opacity-55"
                      >
                        {t.revoke}
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}

      <p className="text-xs text-[var(--color-text-muted)]">{t.footerNote}</p>
    </div>
  );
}
