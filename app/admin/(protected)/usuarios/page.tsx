import Link from "next/link";
import { listUsersAdmin } from "@/lib/admin/records";
import { PageHeader, Table, Row, Cell, Badge, Empty } from "@/components/admin/ui";
import { requireInternal } from "@/lib/admin/guard";

const fmt = (d: Date) => d.toISOString().slice(0, 10);
type SP = { [k: string]: string | string[] | undefined };

export default async function AdminUsuarios({ searchParams }: { searchParams: Promise<SP> }) {
  // SECURITY #94: the guard lives in the PAGE, not only in the layout. Next
  // renders layout and page in parallel, so a layout-only `notFound()` still
  // let this segment's Flight payload reach an unauthorised caller.
  await requireInternal();
  const sp = await searchParams;
  const q = Array.isArray(sp.q) ? sp.q[0] : (sp.q as string | undefined);
  const rows = await listUsersAdmin(q);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Usuarios"
        lead="Identidades registradas. Nunca se muestran contraseñas ni secretos de autenticación."
      />

      <form method="get" className="flex items-end gap-3">
        <label className="text-sm">
          <span className="block text-xs text-[var(--color-text-muted)]">Buscar por email</span>
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            data-testid="usuario-search"
            className="mt-1 w-72 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm"
          />
        </label>
        <button
          type="submit"
          className="min-h-10 rounded-[var(--radius-sm)] bg-[var(--color-primary)] px-4 text-sm font-medium text-[var(--color-primary-contrast)]"
        >
          Buscar
        </button>
      </form>

      {rows.length === 0 ? (
        <Empty>Ningún usuario{q ? ` para "${q}"` : ""}.</Empty>
      ) : (
        <Table head={["Email", "Proveedor", "Empresa", "Rol workspace", "Estado", "Alta"]}>
          {rows.map((u) => (
            <Row key={u.id}>
              <Cell>
                <Link href={`/admin/usuarios/${u.id}`} className="no-underline">
                  {u.email}
                </Link>
              </Cell>
              <Cell>
                <Badge tone="muted">{u.provider === "google" ? "Google" : "email"}</Badge>
              </Cell>
              <Cell>
                {u.companyId ? (
                  <Link href={`/admin/empresas/${u.companyId}`} className="no-underline">
                    {u.companyName ?? u.companyId}
                  </Link>
                ) : (
                  "—"
                )}
              </Cell>
              <Cell>{u.companyRole === "owner" ? "administrador" : "miembro"}</Cell>
              <Cell>
                {u.status === "active" ? (
                  <Badge tone="green">activa</Badge>
                ) : (
                  <Badge tone="muted">{u.status}</Badge>
                )}
              </Cell>
              <Cell mono>{fmt(u.createdAt)}</Cell>
            </Row>
          ))}
        </Table>
      )}
      <p className="text-xs text-[var(--color-text-muted)]">
        La gestión de membresía (revocar acceso, reenviar invitación) se hace desde la ficha de la
        empresa y el panel de equipo, con la lógica de permisos existente (#27).
      </p>
    </div>
  );
}
