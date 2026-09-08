"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Op = {
  id: string;
  name: string;
  lastName: string | null;
  email: string | null;
  refCode: string;
  active: boolean;
  companies: number;
  link: string;
};

/** Create operators and copy their individual acquisition link (#86 part 8). */
export function OperatorManager({ operators }: { operators: Op[] }) {
  const router = useRouter();
  const [f, setF] = useState({ name: "", lastName: "", email: "", phone: "", notes: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/operadores", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(f),
      });
      if (!res.ok) {
        setError("Revisa los datos (el nombre es obligatorio).");
        setBusy(false);
        return;
      }
      setF({ name: "", lastName: "", email: "", phone: "", notes: "" });
      router.refresh();
    } catch {
      setError("Sin conexión.");
    }
    setBusy(false);
  }

  async function toggleActive(op: Op) {
    await fetch(`/api/admin/operadores/${op.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ active: !op.active }),
    });
    router.refresh();
  }

  async function copy(link: string, id: string) {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      /* clipboard unavailable — the link is visible to select manually */
    }
  }

  return (
    <div className="space-y-5">
      <form
        onSubmit={create}
        className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-4"
      >
        <h2 className="text-sm font-bold">Nuevo operador</h2>
        {error && (
          <p role="alert" className="mt-2 text-sm text-[var(--color-danger)]">
            {error}
          </p>
        )}
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="font-medium">Nombre</span>
            <input
              data-testid="operator-name"
              value={f.name}
              onChange={(e) => setF((s) => ({ ...s, name: e.target.value }))}
              className="mt-1 block min-h-9 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 text-sm"
            />
          </label>
          <label className="text-sm">
            <span className="font-medium">Apellidos / denominación</span>
            <input
              value={f.lastName}
              onChange={(e) => setF((s) => ({ ...s, lastName: e.target.value }))}
              className="mt-1 block min-h-9 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 text-sm"
            />
          </label>
          <label className="text-sm">
            <span className="font-medium">Email</span>
            <input
              type="email"
              value={f.email}
              onChange={(e) => setF((s) => ({ ...s, email: e.target.value }))}
              className="mt-1 block min-h-9 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 text-sm"
            />
          </label>
          <label className="text-sm">
            <span className="font-medium">Teléfono</span>
            <input
              value={f.phone}
              onChange={(e) => setF((s) => ({ ...s, phone: e.target.value }))}
              className="mt-1 block min-h-9 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 text-sm"
            />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="font-medium">Notas internas</span>
            <textarea
              value={f.notes}
              onChange={(e) => setF((s) => ({ ...s, notes: e.target.value }))}
              rows={2}
              className="mt-1 block w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 py-1 text-sm"
            />
          </label>
        </div>
        <button
          type="submit"
          data-testid="operator-create"
          disabled={busy}
          className="mt-3 min-h-9 rounded-[var(--radius-sm)] bg-[var(--color-primary)] px-3 text-sm font-medium text-[var(--color-primary-contrast)] disabled:opacity-55"
        >
          Crear operador
        </button>
      </form>

      {operators.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left">
                <th className="py-2 pr-3 font-medium">Operador</th>
                <th className="py-2 pr-3 font-medium">Código</th>
                <th className="py-2 pr-3 font-medium">Enlace</th>
                <th className="py-2 pr-3 font-medium">Empresas</th>
                <th className="py-2 pr-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {operators.map((op) => (
                <tr key={op.id} className="border-b border-[var(--color-border)]">
                  <td className="py-2 pr-3">
                    <a href={`/admin/operadores/${op.id}`} className="underline">
                      {op.name} {op.lastName ?? ""}
                    </a>
                    {op.email && (
                      <span className="block text-xs text-[var(--color-text-muted)]">
                        {op.email}
                      </span>
                    )}
                  </td>
                  <td className="py-2 pr-3 font-mono text-xs">{op.refCode}</td>
                  <td className="py-2 pr-3">
                    <button
                      type="button"
                      data-testid={`operator-copy-${op.refCode}`}
                      onClick={() => copy(op.link, op.id)}
                      className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 py-1 text-xs"
                    >
                      {copied === op.id ? "Copiado" : "Copiar enlace"}
                    </button>
                  </td>
                  <td className="py-2 pr-3 font-mono">{op.companies}</td>
                  <td className="py-2 pr-3">
                    <button
                      type="button"
                      onClick={() => toggleActive(op)}
                      className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 py-1 text-xs"
                    >
                      {op.active ? "Activo · desactivar" : "Inactivo · activar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
