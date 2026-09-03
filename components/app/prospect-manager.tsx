"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Prospect = {
  id: string;
  name: string;
  nif: string | null;
  email: string | null;
  refCode: string;
  status: string;
  registeredAt: string | null;
  firstDecaAt: string | null;
  lastDecaAt: string | null;
};

const STATUS_ES: Record<string, string> = {
  prospect: "Prospecto",
  invited: "Invitado",
  registered: "Registrado",
  activated: "Activado (1er DeCA)",
  active: "Activo",
};

export function ProspectManager({ prospects }: { prospects: Prospect[] }) {
  const router = useRouter();
  const [f, setF] = useState({ name: "", nif: "", email: "", phone: "", refCode: "", source: "" });
  const [busy, setBusy] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [csv, setCsv] = useState("");

  async function post(body: Record<string, unknown>) {
    const res = await fetch("/api/operadores/prospects", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    return res.json().catch(() => ({}));
  }

  async function addProspect(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !f.name || !f.refCode) return;
    setBusy(true);
    setMsg(null);
    const data = await post({ action: "create", ...f });
    setBusy(false);
    if (data.ok) {
      setF({ name: "", nif: "", email: "", phone: "", refCode: f.refCode, source: f.source });
      router.refresh();
    } else {
      setMsg(data?.error?.message ?? "No se pudo crear el prospecto.");
    }
  }

  async function invite(id: string) {
    const data = await post({ action: "invite", prospectId: id });
    if (data.ok) {
      setLink(data.link);
      router.refresh();
    }
  }

  async function doImport() {
    if (!csv.trim()) return;
    const data = await post({ action: "import", text: csv, fallbackRef: f.refCode || undefined });
    setMsg(
      data.ok
        ? `Importados ${data.created}, omitidos ${data.skipped}, con errores ${data.errors.length}.`
        : "No se pudo importar.",
    );
    setCsv("");
    router.refresh();
  }

  return (
    <div className="mt-8 space-y-8">
      <section aria-labelledby="add-p">
        <h2 id="add-p" className="text-lg font-bold">
          Añadir prospecto
        </h2>
        <form onSubmit={addProspect} className="mt-2 grid gap-2 sm:grid-cols-3" noValidate>
          {(
            [
              ["name", "Empresa *"],
              ["nif", "NIF"],
              ["email", "Email"],
              ["phone", "Teléfono"],
              ["refCode", "Código de operador *"],
              ["source", "Origen / campaña"],
            ] as const
          ).map(([k, label]) => (
            <label key={k} className="text-sm">
              <span className="block font-medium">{label}</span>
              <input
                value={f[k]}
                onChange={(e) => setF((s) => ({ ...s, [k]: e.target.value }))}
                data-testid={`prospect-${k}`}
                className="mt-1 min-h-10 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2"
              />
            </label>
          ))}
          <div className="sm:col-span-3">
            <button
              type="submit"
              disabled={busy}
              data-testid="prospect-add"
              className="min-h-10 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 text-sm font-medium text-[var(--color-primary-contrast)] disabled:opacity-55"
            >
              Guardar prospecto
            </button>
          </div>
        </form>
        {msg && <p className="mt-2 text-sm">{msg}</p>}
        {link && (
          <p
            data-testid="invite-link"
            className="mt-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-2 font-mono text-xs break-all"
          >
            {link}
          </p>
        )}
      </section>

      <section aria-labelledby="bulk">
        <h2 id="bulk" className="text-lg font-bold">
          Importar (una línea por prospecto)
        </h2>
        <p className="text-xs text-[var(--color-text-muted)]">
          Formato: <code>empresa, NIF, email, código</code>. El código usa el del formulario si se
          omite.
        </p>
        <textarea
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
          data-testid="prospect-csv"
          rows={4}
          className="mt-2 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 py-1 font-mono text-xs"
        />
        <button
          type="button"
          onClick={doImport}
          data-testid="prospect-import"
          className="mt-2 min-h-10 rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 text-sm font-medium"
        >
          Importar
        </button>
      </section>

      <section aria-labelledby="p-list">
        <h2 id="p-list" className="text-lg font-bold">
          Prospectos ({prospects.length})
        </h2>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm" data-testid="prospect-table">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left text-xs text-[var(--color-text-muted)]">
                <th className="py-2">Empresa</th>
                <th>Operador</th>
                <th>Estado</th>
                <th>Registro</th>
                <th>1er DeCA</th>
                <th>Última act.</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {prospects.map((p) => (
                <tr key={p.id} className="border-b border-[var(--color-border)]">
                  <td className="py-2">
                    <span className="font-medium">{p.name}</span>
                    {p.nif ? (
                      <span className="text-xs text-[var(--color-text-muted)]"> · {p.nif}</span>
                    ) : null}
                  </td>
                  <td>{p.refCode}</td>
                  <td>{STATUS_ES[p.status] ?? p.status}</td>
                  <td>{p.registeredAt?.slice(0, 10) ?? "—"}</td>
                  <td>{p.firstDecaAt?.slice(0, 10) ?? "—"}</td>
                  <td>{p.lastDecaAt?.slice(0, 10) ?? "—"}</td>
                  <td>
                    {!p.registeredAt && (
                      <button
                        type="button"
                        data-testid={`invite-${p.id}`}
                        onClick={() => invite(p.id)}
                        className="underline"
                      >
                        Enlace de alta
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
