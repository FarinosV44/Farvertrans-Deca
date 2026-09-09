import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/ui";
import { getSupportTicket } from "@/lib/support/tickets";
import { SUPPORT_STATUS_LABEL, SUPPORT_CATEGORY_LABEL } from "@/lib/support/schema";
import { SupportTicketActions } from "@/components/admin/support-ticket-actions";
import { requireInternal } from "@/lib/admin/guard";

export default async function AdminSoporteDetail({ params }: { params: Promise<{ id: string }> }) {
  // SECURITY #94: the guard lives in the PAGE, not only in the layout. Next
  // renders layout and page in parallel, so a layout-only `notFound()` still
  // let this segment's Flight payload reach an unauthorised caller.
  await requireInternal();
  const { id } = await params;
  const ticket = await getSupportTicket(id);
  if (!ticket) notFound();

  return (
    <div className="space-y-5">
      <Link href="/admin/soporte" className="text-sm text-[var(--color-primary)] underline">
        ← Soporte
      </Link>
      <PageHeader
        title={`#${ticket.number} · ${ticket.subject}`}
        lead={`${SUPPORT_CATEGORY_LABEL[ticket.category as keyof typeof SUPPORT_CATEGORY_LABEL] ?? ticket.category} · ${SUPPORT_STATUS_LABEL[ticket.status]}`}
      />

      <dl className="grid gap-1 rounded-[var(--radius-md)] border border-[var(--color-border)] p-4 text-sm">
        <div className="flex gap-2">
          <dt className="font-medium text-[var(--color-text-muted)]">Empresa</dt>
          <dd>{ticket.company?.name ?? ticket.companyName ?? "—"}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="font-medium text-[var(--color-text-muted)]">Usuario</dt>
          <dd>
            {ticket.userName ? `${ticket.userName} · ` : ""}
            <a href={`mailto:${ticket.userEmail}`} className="underline">
              {ticket.userEmail}
            </a>
          </dd>
        </div>
        <div className="flex gap-2">
          <dt className="font-medium text-[var(--color-text-muted)]">Creada</dt>
          <dd className="font-mono">
            {ticket.createdAt.toISOString().slice(0, 16).replace("T", " ")} UTC
          </dd>
        </div>
      </dl>

      <ol className="space-y-3">
        {ticket.messages.map((m) => (
          <li
            key={m.id}
            className={`rounded-[var(--radius-md)] border p-3 text-sm ${
              m.authorType === "admin"
                ? "border-[var(--color-primary)] bg-[var(--color-surface)]"
                : "border-[var(--color-border)]"
            }`}
          >
            <p className="text-xs font-medium text-[var(--color-text-muted)]">
              {m.authorType === "admin" ? "Soporte" : "Usuario"} ·{" "}
              {m.createdAt.toISOString().slice(0, 16).replace("T", " ")} UTC
            </p>
            <p className="mt-1 whitespace-pre-wrap">{m.body}</p>
          </li>
        ))}
      </ol>

      <SupportTicketActions ticketId={ticket.id} status={ticket.status} />
    </div>
  );
}
