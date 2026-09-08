import Link from "next/link";
import { PageHeader, Table, Row, Cell, Empty } from "@/components/admin/ui";
import { listSupportTickets } from "@/lib/support/tickets";
import {
  SUPPORT_STATUSES,
  SUPPORT_STATUS_LABEL,
  SUPPORT_CATEGORY_LABEL,
  type SupportStatus,
} from "@/lib/support/schema";

/**
 * Superadmin technical-support inbox (#86 part 5). Every message from the
 * panel's "Asistencia técnica" is here — filter by state and date, open the
 * detail, reply and change the state from the panel itself.
 */
export default async function AdminSoporte({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; from?: string; to?: string; company?: string }>;
}) {
  const sp = await searchParams;
  const status = (SUPPORT_STATUSES as readonly string[]).includes(sp.status ?? "")
    ? (sp.status as SupportStatus)
    : undefined;
  const from = sp.from ? new Date(sp.from) : undefined;
  const to = sp.to ? new Date(`${sp.to}T23:59:59`) : undefined;

  const tickets = await listSupportTickets({
    status,
    from: from && !isNaN(+from) ? from : undefined,
    to: to && !isNaN(+to) ? to : undefined,
    companyId: sp.company || undefined,
  });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Soporte / Incidencias"
        lead="Incidencias técnicas enviadas desde el panel de usuario (#86). Las consultas jurídicas NO entran aquí."
      />

      <form className="flex flex-wrap items-end gap-3 text-sm" method="get">
        <label className="flex flex-col gap-1">
          <span className="font-medium">Estado</span>
          <select
            name="status"
            defaultValue={sp.status ?? ""}
            className="min-h-9 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2"
          >
            <option value="">Todos</option>
            {SUPPORT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {SUPPORT_STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-medium">Desde</span>
          <input
            type="date"
            name="from"
            defaultValue={sp.from ?? ""}
            className="min-h-9 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-medium">Hasta</span>
          <input
            type="date"
            name="to"
            defaultValue={sp.to ?? ""}
            className="min-h-9 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2"
          />
        </label>
        {sp.company && <input type="hidden" name="company" value={sp.company} />}
        <button
          type="submit"
          className="min-h-9 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 font-medium"
        >
          Filtrar
        </button>
      </form>

      {tickets.length === 0 ? (
        <Empty>Sin incidencias con estos filtros.</Empty>
      ) : (
        <Table head={["#", "Asunto", "Empresa", "Categoría", "Estado", "Mensajes", "Creada"]}>
          {tickets.map((tk) => (
            <Row key={tk.id}>
              <Cell mono>
                <Link href={`/admin/soporte/${tk.id}`} className="underline">
                  {tk.number}
                </Link>
              </Cell>
              <Cell>{tk.subject}</Cell>
              <Cell>{tk.companyName ?? "—"}</Cell>
              <Cell>
                {SUPPORT_CATEGORY_LABEL[tk.category as keyof typeof SUPPORT_CATEGORY_LABEL] ??
                  tk.category}
              </Cell>
              <Cell>{SUPPORT_STATUS_LABEL[tk.status]}</Cell>
              <Cell mono>{tk._count.messages}</Cell>
              <Cell mono>{tk.createdAt.toISOString().slice(0, 10)}</Cell>
            </Row>
          ))}
        </Table>
      )}
    </div>
  );
}
