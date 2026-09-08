import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { AppNav } from "@/components/app/app-nav";
import { getCurrentUser } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n/server";
import { BRAND } from "@/lib/brand";
import { LEGAL_ENTITY } from "@/lib/legal-entity";
import { techSupportChannels, legalAssistanceChannel } from "@/lib/support/channels";
import { listUserTickets } from "@/lib/support/tickets";
import { SupportTicketForm } from "@/components/panel/support-ticket-form";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ayuda y soporte", robots: { index: false } };

function ChannelLink({ href, label }: { href: string; label: string }) {
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 text-sm no-underline hover:bg-[var(--color-surface)]"
    >
      {label}
    </a>
  );
}

export default async function AyudaPage() {
  const user = await getCurrentUser();
  if (!user?.companyId || !user.company) redirect("/registro");
  const t = await getDictionary();
  const h = t.panel.help;
  const tech = techSupportChannels();
  const legal = legalAssistanceChannel();
  const tickets = await listUserTickets(user.companyId);

  return (
    <>
      <SiteHeader authed companyName={user.company.name} />
      <main id="contenido" className="mx-auto max-w-[720px] px-4 py-8 md:px-6">
        <h1 className="text-2xl font-bold">{h.title}</h1>
        <AppNav current="ayuda" />
        <p className="mt-4 text-sm text-[var(--color-text-muted)]">{h.intro}</p>

        <section
          aria-labelledby="tech"
          className="mt-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] p-5"
        >
          <h2 id="tech" className="text-lg font-bold">
            {h.techHeading}
          </h2>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">{h.techIntro}</p>
          <div className="mt-3 flex flex-wrap gap-2" data-testid="support-tech-channels">
            {tech.map((c) => (
              <ChannelLink
                key={c.kind}
                href={c.href}
                label={
                  c.kind === "phone"
                    ? `${h.phoneLabel}: ${c.value}`
                    : c.kind === "email"
                      ? `${h.emailLabel}: ${c.value}`
                      : h.whatsappTech
                }
              />
            ))}
          </div>
          {BRAND.supportHours && (
            <p className="mt-3 text-xs text-[var(--color-text-muted)]">
              {h.hoursLabel}: {BRAND.supportHours}
            </p>
          )}
        </section>

        <section
          aria-labelledby="legal"
          className="mt-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] p-5"
        >
          <h2 id="legal" className="text-lg font-bold">
            {h.legalHeading}
          </h2>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">{h.legalIntro}</p>
          <div className="mt-3 flex flex-wrap gap-2" data-testid="support-legal-channels">
            <ChannelLink
              href={`mailto:${LEGAL_ENTITY.supportEmail}`}
              label={LEGAL_ENTITY.supportEmail}
            />
            {legal && <ChannelLink href={legal.href} label={h.whatsappLegal} />}
          </div>
          <p className="mt-3 text-xs text-[var(--color-text-muted)]">{h.legalDisclaimer}</p>
        </section>

        <section
          aria-labelledby="open-ticket"
          className="mt-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] p-5"
        >
          <h2 id="open-ticket" className="text-lg font-bold">
            {h.openHeading}
          </h2>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">{h.openIntro}</p>
          <SupportTicketForm />
        </section>

        <section aria-labelledby="my-tickets" className="mt-6">
          <h2 id="my-tickets" className="text-lg font-bold">
            {h.myHeading}
          </h2>
          {tickets.length === 0 ? (
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">{h.none}</p>
          ) : (
            <ul className="mt-3 space-y-2" data-testid="my-tickets">
              {tickets.map((tk) => (
                <li
                  key={tk.id}
                  className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] p-3 text-sm"
                >
                  <span className="min-w-0">
                    <span className="font-medium">#{tk.number}</span> · {tk.subject}
                    <span className="block text-xs text-[var(--color-text-muted)]">
                      {h.statuses[tk.status]} · {h.opened(tk.createdAt.toISOString().slice(0, 10))}
                    </span>
                  </span>
                  <Link
                    href={`/panel/ayuda/${tk.id}`}
                    className="shrink-0 text-[var(--color-primary)] underline"
                  >
                    {h.view}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
