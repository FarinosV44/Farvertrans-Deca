import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { getCurrentUser } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n/server";
import { getUserTicket } from "@/lib/support/tickets";
import { SupportTicketReply } from "@/components/panel/support-ticket-reply";

export const dynamic = "force-dynamic";
export const metadata = { title: "Incidencia", robots: { index: false } };

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user?.companyId || !user.company) redirect("/registro");
  const t = await getDictionary();
  const s = t.panel.help;

  const { id } = await params;
  const ticket = await getUserTicket(id, user.companyId);
  if (!ticket) notFound();

  const closed = ticket.status === "closed";

  return (
    <>
      <SiteHeader authed companyName={user.company.name} />
      <main id="contenido" className="mx-auto max-w-[720px] px-4 py-8 md:px-6">
        <Link href="/panel/ayuda" className="text-sm text-[var(--color-primary)] underline">
          ← {s.myHeading}
        </Link>
        <h1 className="mt-2 text-2xl font-bold">
          #{ticket.number} · {ticket.subject}
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          {s.categories[ticket.category as keyof typeof s.categories] ?? ticket.category} ·{" "}
          {s.statuses[ticket.status]} · {s.opened(ticket.createdAt.toISOString().slice(0, 10))}
        </p>

        <ol className="mt-5 space-y-3">
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
                {m.authorType === "admin" ? s.team : s.you} ·{" "}
                {m.createdAt.toISOString().slice(0, 16).replace("T", " ")}
              </p>
              <p className="mt-1 whitespace-pre-wrap">{m.body}</p>
            </li>
          ))}
        </ol>

        {closed ? (
          <p className="mt-4 text-sm text-[var(--color-text-muted)]">{s.statuses.closed}</p>
        ) : (
          <SupportTicketReply ticketId={ticket.id} />
        )}
      </main>
      <SiteFooter />
    </>
  );
}
