import { redirect } from "next/navigation";
import Link from "next/link";
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
import {
  ChatIcon,
  MailIcon,
  LifebuoyIcon,
  ScaleIcon,
  DocumentIcon,
} from "@/components/panel/icons";
import type { SVGProps } from "react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ayuda y soporte", robots: { index: false } };

/**
 * #86 p5/p6 — the panel help centre: technical support channels, the "open a
 * ticket" form, the user's own tickets, and the separate legal-assistance
 * channel. #111 part 2: visual polish only — no route, API, form-field or
 * business-rule change; every `data-testid` is unchanged.
 */

type IconCmp = (props: SVGProps<SVGSVGElement>) => React.JSX.Element;

/**
 * A support channel rendered as a clear, tappable action. Either `kind · value`
 * (WhatsApp · Soporte técnico) or a single `label` (Email address, or the legal
 * WhatsApp prompt).
 */
function ChannelAction({
  href,
  Icon,
  kind,
  value,
  label,
  breakValue = false,
}: {
  href: string;
  Icon: IconCmp;
  kind?: string;
  value?: string;
  label?: string;
  breakValue?: boolean;
}) {
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="flex min-h-11 min-w-0 items-center gap-2.5 rounded-[var(--radius-md)] border border-[var(--color-border)] px-3.5 py-2 text-sm no-underline transition-colors hover:border-[var(--color-primary)] hover:bg-[var(--color-surface)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
    >
      <Icon width={18} height={18} className="shrink-0 text-[var(--color-primary)]" />
      {label ? (
        <span className={`min-w-0 font-medium ${breakValue ? "break-all" : ""}`}>{label}</span>
      ) : (
        <span className="min-w-0">
          <span className="font-medium">{kind}</span>
          <span aria-hidden className="mx-1.5 text-[var(--color-text-muted)]">
            ·
          </span>
          <span
            className={
              breakValue
                ? "break-all text-[var(--color-text-muted)]"
                : "text-[var(--color-text-muted)]"
            }
          >
            {value}
          </span>
        </span>
      )}
    </a>
  );
}

export default async function AyudaPage() {
  const user = await getCurrentUser();
  if (!user?.companyId || !user.company) redirect("/registro/completar-empresa");
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
        <p className="mt-1.5 text-sm text-[var(--color-text-muted)]">
          {h.guidesPrompt}{" "}
          <Link href="/guias" className="font-medium text-[var(--color-primary)] underline">
            {h.guidesLink}
          </Link>
          .
        </p>

        <section
          aria-labelledby="tech"
          className="mt-8 rounded-[var(--radius-lg)] border border-[var(--color-border)] p-5"
        >
          <div className="flex items-center gap-2.5">
            <LifebuoyIcon width={20} height={20} className="text-[var(--color-primary)]" />
            <h2 id="tech" className="text-lg font-bold">
              {h.techHeading}
            </h2>
          </div>
          <p className="mt-1.5 text-sm text-[var(--color-text-muted)]">{h.techIntro}</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2" data-testid="support-tech-channels">
            {tech.map((c) =>
              c.kind === "phone" ? (
                <ChannelAction
                  key={c.kind}
                  href={c.href}
                  Icon={ChatIcon}
                  kind={h.phoneLabel}
                  value={c.value}
                />
              ) : c.kind === "email" ? (
                <ChannelAction
                  key={c.kind}
                  href={c.href}
                  Icon={MailIcon}
                  kind="Email"
                  value={c.value}
                  breakValue
                />
              ) : (
                <ChannelAction key={c.kind} href={c.href} Icon={ChatIcon} label={h.whatsappTech} />
              ),
            )}
          </div>
          {BRAND.supportHours && (
            <p className="mt-3 text-xs text-[var(--color-text-muted)]">
              {h.hoursLabel}: {BRAND.supportHours}
            </p>
          )}
        </section>

        <section
          aria-labelledby="open-ticket"
          className="mt-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] p-5"
        >
          <h2 id="open-ticket" className="text-lg font-bold">
            {h.openHeading}
          </h2>
          <p className="mt-1.5 text-sm text-[var(--color-text-muted)]">{h.openIntro}</p>
          <SupportTicketForm />
        </section>

        <section aria-labelledby="my-tickets" className="mt-6">
          <h2 id="my-tickets" className="text-lg font-bold">
            {h.myHeading}
          </h2>
          {tickets.length === 0 ? (
            <div className="mt-3 flex items-start gap-3 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <DocumentIcon
                width={20}
                height={20}
                className="mt-0.5 shrink-0 text-[var(--color-text-muted)]"
              />
              <div>
                <p className="text-sm font-medium">{h.none}</p>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">{h.noneHint}</p>
              </div>
            </div>
          ) : (
            <ul className="mt-3 space-y-2" data-testid="my-tickets">
              {tickets.map((tk) => (
                <li
                  key={tk.id}
                  className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] p-3.5 text-sm transition-colors hover:border-[var(--color-primary)]"
                >
                  <span className="min-w-0">
                    <span className="font-medium">#{tk.number}</span> · {tk.subject}
                    <span className="mt-0.5 block text-xs text-[var(--color-text-muted)]">
                      {h.statuses[tk.status]} · {h.opened(tk.createdAt.toISOString().slice(0, 10))}
                    </span>
                  </span>
                  <Link
                    href={`/panel/ayuda/${tk.id}`}
                    className="shrink-0 font-medium text-[var(--color-primary)] underline"
                  >
                    {h.view}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* #86 p6 — the legal channel is clearly separate from technical support. */}
        <section
          aria-labelledby="legal"
          className="mt-10 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
        >
          <div className="flex items-center gap-2.5">
            <ScaleIcon width={20} height={20} className="text-[var(--color-text-muted)]" />
            <h2 id="legal" className="text-lg font-bold">
              {h.legalHeading}
            </h2>
          </div>
          <p className="mt-1.5 text-sm text-[var(--color-text-muted)]">
            Para cualquier inspección, requerimiento, sanción o incidencia relacionada con el
            transporte, consulta con un abogado.
          </p>
          <div
            className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap"
            data-testid="support-legal-channels"
          >
            {legal && <ChannelAction href={legal.href} Icon={ChatIcon} label={h.whatsappLegal} />}
            <ChannelAction
              href={`mailto:${LEGAL_ENTITY.legalEmail}`}
              Icon={MailIcon}
              label={LEGAL_ENTITY.legalEmail}
              breakValue
            />
          </div>
          <p className="mt-3 text-xs text-[var(--color-text-muted)]">{h.legalDisclaimer}</p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
