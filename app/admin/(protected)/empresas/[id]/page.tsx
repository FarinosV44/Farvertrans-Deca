import Link from "next/link";
import { notFound } from "next/navigation";
import { getCompanyAdmin } from "@/lib/admin/records";
import { listCompanySegments, SEGMENT_LABEL } from "@/lib/admin/segments";
import { companyTimeline } from "@/lib/admin/timeline";
import { buildCarrierProfile } from "@/lib/commercial/carrier-profile";
import { WEEKDAY_LABEL } from "@/lib/commercial/activity";
import { carrierCommercialActivity } from "@/lib/commercial/kpis";
import { OPPORTUNITY_STATE_LABEL } from "@/lib/commercial/opportunity-model";
import { AccountActions } from "@/components/admin/account-actions";
import { MarkTest } from "@/components/admin/mark-test";
import { CompanyEditForm } from "@/components/admin/company-edit-form";
import {
  PageHeader,
  DefinitionList,
  Badge,
  BackLink,
  Kpi,
  KpiGrid,
  Table,
  Row,
  Cell,
  Empty,
} from "@/components/admin/ui";
import { requireInternal } from "@/lib/admin/guard";

export const dynamic = "force-dynamic";

const fmt = (d: Date | null | undefined) =>
  d ? d.toISOString().replace("T", " ").slice(0, 16) + " UTC" : "—";
const day = (d: Date | null | undefined) => (d ? d.toISOString().slice(0, 10) : "—");

function Panel({
  title,
  children,
  open = false,
}: {
  title: string;
  children: React.ReactNode;
  open?: boolean;
}) {
  return (
    <details
      open={open}
      className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)]"
    >
      <summary className="cursor-pointer px-4 py-3 text-sm font-bold">{title}</summary>
      <div className="border-t border-[var(--color-border)] p-4">{children}</div>
    </details>
  );
}

function FreqLine({ label, rows }: { label: string; rows: { name: string; count: number }[] }) {
  if (rows.length === 0) return null;
  return (
    <p className="text-sm">
      <span className="text-xs text-[var(--color-text-muted)]">{label}: </span>
      {rows.map((r) => `${r.name} (${r.count})`).join(", ")}
    </p>
  );
}

/**
 * "Actividad de transporte / Perfil comercial" (#88). Shown only when the
 * company has an active commercial consent; otherwise a one-line note and
 * nothing derived is rendered.
 */
function CarrierProfileSection({
  profile,
  commercialActivity,
}: {
  profile: Awaited<ReturnType<typeof buildCarrierProfile>>;
  commercialActivity: Awaited<ReturnType<typeof carrierCommercialActivity>>;
}) {
  if (!profile.eligible) {
    return (
      <p className="text-sm text-[var(--color-text-muted)]">
        Esta empresa no tiene consentimiento comercial activo, así que no se muestra perfil
        comercial derivado.
      </p>
    );
  }

  const { activity, routeSummary, affinity, tags } = profile;
  const busiest = activity.busiestWeekday !== null ? WEEKDAY_LABEL[activity.busiestWeekday] : "—";

  return (
    <div className="space-y-4" data-testid="carrier-commercial-profile">
      <div className="flex flex-wrap items-center gap-2">
        <span
          data-testid="affinity-score"
          className="rounded-[var(--radius-sm)] border border-[var(--color-primary)] px-2 py-0.5 text-sm font-bold text-[var(--color-primary)]"
        >
          Afinidad Farvertrans: {affinity.score}/100 · {affinity.band}
        </span>
        {tags.map((t) => (
          <Badge key={t} tone="muted">
            {t}
          </Badge>
        ))}
      </div>

      <div>
        <p className="mb-1 text-xs font-semibold text-[var(--color-text-muted)]">
          Cómo se calcula la afinidad
        </p>
        <ul className="space-y-0.5 text-sm" data-testid="affinity-breakdown">
          {affinity.breakdown.length === 0 ? (
            <li className="text-[var(--color-text-muted)]">Sin señales todavía.</li>
          ) : (
            affinity.breakdown.map((r, i) => (
              <li key={i} className="flex justify-between gap-3">
                <span>{r.label}</span>
                <span className="font-mono">{r.points > 0 ? `+${r.points}` : r.points}</span>
              </li>
            ))
          )}
        </ul>
      </div>

      <KpiGrid>
        <Kpi label="DeCA 7 / 30 d" value={`${activity.d7} / ${activity.d30}`} />
        <Kpi label="DeCA 60 / 90 d" value={`${activity.d60} / ${activity.d90}`} />
        <Kpi label="Tendencia 30d" value={activity.trend} sub={`prev. ${activity.prev30}`} />
        <Kpi label="Primer DeCA" value={day(activity.firstAt)} />
        <Kpi
          label="Último DeCA"
          value={day(activity.lastAt)}
          sub={activity.daysSinceLast !== null ? `hace ${activity.daysSinceLast} d` : undefined}
        />
        <Kpi label="Día más activo" value={busiest} />
      </KpiGrid>

      <div className="space-y-1">
        <FreqLine label="Países de descarga" rows={routeSummary.unloadCountries} />
        <FreqLine label="Provincias de descarga" rows={routeSummary.unloadProvinces} />
        <FreqLine label="Ciudades de descarga" rows={routeSummary.unloadCities} />
        <FreqLine label="Ciudades de carga" rows={routeSummary.loadCities} />
        {routeSummary.plates.length > 0 && (
          <FreqLine
            label="Matrículas recurrentes"
            rows={routeSummary.plates.map((p) => ({ name: p.plate, count: p.count }))}
          />
        )}
      </div>

      {routeSummary.routes.length === 0 ? (
        <Empty>Sin rutas observadas todavía.</Empty>
      ) : (
        <Table head={["Ruta", "Repeticiones", "≈/mes", "Corredor", "Última vez (UTC)"]}>
          {routeSummary.routes.map((r) => (
            <Row key={r.routeKey}>
              <Cell>{r.label}</Cell>
              <Cell mono>{r.count}</Cell>
              <Cell mono>{r.perMonth || "—"}</Cell>
              <Cell>{r.corridorLabels.join(", ") || r.endZoneLabel || "—"}</Cell>
              <Cell mono>{fmt(r.lastSeen)}</Cell>
            </Row>
          ))}
        </Table>
      )}

      {commercialActivity.length > 0 && (
        <div>
          <p className="mb-1 text-xs font-semibold text-[var(--color-text-muted)]">
            Historial comercial
          </p>
          <ol className="space-y-1 text-sm" data-testid="carrier-commercial-activity">
            {commercialActivity.map((a, i) => (
              <li key={i} className="flex gap-3">
                <span className="w-24 shrink-0 font-mono text-xs text-[var(--color-text-muted)]">
                  {day(a.createdAt)}
                </span>
                <span>
                  {a.fromState ? OPPORTUNITY_STATE_LABEL[a.fromState] : "—"} →{" "}
                  {a.toState ? OPPORTUNITY_STATE_LABEL[a.toState] : "—"}
                  {a.actorEmail ? ` · ${a.actorEmail}` : ""}
                  {a.note ? ` · "${a.note}"` : ""}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

/**
 * Customer 360 (#81) — one compact card per company: a KPI header, then detail
 * in collapsible sections, then the admin actions in their own separated zone.
 * The activity timeline (#83) is one of the sections. #88 adds the
 * "Actividad de transporte / Perfil comercial" section.
 */
export default async function AdminEmpresaDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  // SECURITY #94: the guard lives in the PAGE, not only in the layout. Next
  // renders layout and page in parallel, so a layout-only `notFound()` still
  // let this segment's Flight payload reach an unauthorised caller.
  await requireInternal();
  const { id } = await params;
  const { from } = await searchParams;
  const [c, segments, timeline, carrierProfile, commercialActivity] = await Promise.all([
    getCompanyAdmin(id),
    listCompanySegments(),
    companyTimeline(id),
    buildCarrierProfile(id),
    carrierCommercialActivity(id),
  ]);
  if (!c) notFound();
  const seg = segments.find((s) => s.id === id);
  // Return to the list with the filters that were active when this company was
  // opened (#81). Next decodes the `from` value once, so it is already a plain
  // query string ("q=…&seg=…"); re-validate it so only known keys survive.
  const backHref = (() => {
    if (!from) return "/admin/empresas";
    const src = new URLSearchParams(from);
    const out = new URLSearchParams();
    for (const k of ["q", "seg"]) {
      const v = src.get(k);
      if (v) out.set(k, v);
    }
    const s = out.toString();
    return s ? `/admin/empresas?${s}` : "/admin/empresas";
  })();

  return (
    <div className="max-w-4xl space-y-4">
      <BackLink href={backHref}>Empresas</BackLink>
      <PageHeader
        title={c.name}
        lead={`${c.nif ?? "sin NIF"} · alta ${day(c.createdAt)} · última actividad ${day(c.lastDecaAt)}`}
        action={
          c.recentDeca.length > 0 ? (
            <Link
              href={`/admin/deca?empresa=${encodeURIComponent(c.name)}`}
              className="inline-flex min-h-9 items-center rounded-[var(--radius-sm)] border border-[var(--color-primary)] px-3 text-sm font-medium text-[var(--color-primary)] no-underline"
            >
              Ver DeCA
            </Link>
          ) : undefined
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={c.status === "active" ? "green" : c.status === "blocked" ? "red" : "muted"}>
          {c.status}
        </Badge>
        {c.isTest && <Badge tone="yellow">TEST</Badge>}
        {seg?.tags.slice(0, 4).map((t) => (
          <Badge key={t} tone="muted">
            {SEGMENT_LABEL[t]}
          </Badge>
        ))}
      </div>

      <KpiGrid>
        <Kpi label="DeCA total" value={c.totalDeca} />
        <Kpi label="DeCA 30d" value={c.decaCounts.d30} sub={`${c.decaCounts.d7} en 7d`} />
        <Kpi
          label="Miembros activos"
          value={c.members.filter((m) => m.status === "active").length}
        />
        <Kpi label="Primer DeCA" value={day(c.acquisition?.firstDecaAt)} />
        <Kpi label="Último DeCA" value={day(c.lastDecaAt)} />
        <Kpi label="Ficha completa" value={c.dataComplete ? "Sí" : "No"} />
      </KpiGrid>

      <Panel title="Empresa — datos legales, contacto y dirección">
        <DefinitionList
          items={[
            { label: "NIF", value: c.nif ?? "—" },
            { label: "Dirección", value: c.address ?? "—" },
            { label: "Código postal", value: c.postalCode ?? "—" },
            { label: "Población", value: c.city ?? "—" },
            { label: "Contacto", value: c.contactName ?? "—" },
            { label: "Teléfono", value: c.phone ?? "—" },
            { label: "Correo", value: c.email ?? "—" },
            { label: "Perfil", value: c.profile ?? "—" },
            { label: "Logo en PDF", value: c.hasLogo ? "Sí" : "No" },
            {
              label: "Términos",
              value: c.terms ? `v${c.terms.version} · ${fmt(c.terms.acceptedAt)}` : "—",
            },
            {
              label: "DECA Conecta",
              value: c.commercialConsent
                ? c.commercialConsent.mode === "none"
                  ? "No autorizado"
                  : `${
                      c.commercialConsent.mode === "all" ? "Todos los portes" : "Por porte"
                    } · v${c.commercialConsent.version}`
                : "No configurado",
            },
            {
              label: "Operador (first / last)",
              value: `${c.acquisition?.firstRefCode ?? "—"} / ${c.acquisition?.lastRefCode ?? "—"}`,
            },
          ]}
        />
      </Panel>

      <Panel title="Uso">
        <DefinitionList
          items={[
            {
              label: "DeCA",
              value: `${c.totalDeca} totales · ${c.decaCounts.d7} (7d) · ${c.decaCounts.d30} (30d) · ${c.decaCounts.d90} (90d)`,
            },
            {
              label: "Datos guardados",
              value: `${c.saved.companies} cargadores · ${c.saved.vehicles} vehículos · ${c.saved.locations} lugares`,
            },
            { label: "Fuente (UTM)", value: c.acquisition?.firstUtmSource ?? "—" },
          ]}
        />
      </Panel>

      <Panel title="Actividad de transporte · Perfil comercial" open>
        <CarrierProfileSection profile={carrierProfile} commercialActivity={commercialActivity} />
      </Panel>

      <Panel title={`Equipo (${c.members.length})`}>
        <Table head={["Email", "Rol", "Estado", "Email verificado", "Alta"]}>
          {c.members.map((m) => (
            <Row key={m.id}>
              <Cell>
                <Link href={`/admin/usuarios/${m.id}`} className="no-underline">
                  {m.email}
                </Link>
              </Cell>
              <Cell>{m.companyRole === "owner" ? "administrador" : "miembro"}</Cell>
              <Cell>
                <Badge tone={m.status === "active" ? "green" : "muted"}>{m.status}</Badge>
              </Cell>
              <Cell>
                <Badge tone={m.emailVerifiedAt ? "green" : "muted"}>
                  {m.emailVerifiedAt ? "verificado" : "pendiente"}
                </Badge>
              </Cell>
              <Cell mono>{day(m.createdAt)}</Cell>
            </Row>
          ))}
        </Table>
        {c.invites.length > 0 && (
          <div className="mt-3">
            <p className="mb-1 text-xs font-semibold text-[var(--color-text-muted)]">
              Invitaciones
            </p>
            <Table head={["Email", "Estado", "Creada"]}>
              {c.invites.map((iv, i) => (
                <Row key={i}>
                  <Cell>{iv.email}</Cell>
                  <Cell>
                    <Badge
                      tone={
                        iv.acceptedAt ? "green" : iv.expiresAt < new Date() ? "muted" : "yellow"
                      }
                    >
                      {iv.acceptedAt
                        ? "aceptada"
                        : iv.expiresAt < new Date()
                          ? "caducada"
                          : "pendiente"}
                    </Badge>
                  </Cell>
                  <Cell mono>{day(iv.createdAt)}</Cell>
                </Row>
              ))}
            </Table>
          </div>
        )}
      </Panel>

      <Panel title="Documentos">
        {c.recentDeca.length === 0 ? (
          <Empty>Sin DeCA todavía.</Empty>
        ) : (
          <Table head={["Referencia", "Creado", "Versión"]}>
            {c.recentDeca.map((d) => (
              <Row key={d.id}>
                <Cell>
                  <Link href={`/admin/deca/${d.id}`} className="font-mono no-underline">
                    {d.reference}
                  </Link>
                </Cell>
                <Cell mono>{fmt(d.createdAt)}</Cell>
                <Cell>v{d.versionNo}</Cell>
              </Row>
            ))}
          </Table>
        )}
      </Panel>

      <Panel title="Actividad" open>
        {timeline.length === 0 ? (
          <Empty>Sin hitos registrados.</Empty>
        ) : (
          <ol className="space-y-1.5 text-sm" data-testid="company-timeline">
            {timeline.map((e, i) => (
              <li key={i} className="flex gap-3">
                <span className="w-32 shrink-0 font-mono text-xs text-[var(--color-text-muted)]">
                  {fmt(e.at)}
                </span>
                <span>{e.text}</span>
              </li>
            ))}
          </ol>
        )}
      </Panel>

      {/* Administration — kept visible but clearly separated from the rest */}
      <section
        aria-labelledby="admin-zone"
        className="mt-6 rounded-[var(--radius-md)] border-2 border-dashed border-[var(--color-border)] p-4"
      >
        <h2 id="admin-zone" className="mb-3 text-sm font-bold text-[var(--color-text-muted)]">
          Acciones de administración
        </h2>
        <div className="space-y-4">
          <MarkTest id={c.id} isTest={c.isTest} />
          <AccountActions
            kind="empresas"
            id={c.id}
            status={c.status as "active" | "blocked" | "deactivated" | "anonymized"}
            reason={c.statusReason}
            name={c.name}
          />
          {c.status !== "anonymized" && (
            <CompanyEditForm
              id={c.id}
              initial={{
                name: c.name,
                nif: c.nif ?? "",
                contactName: c.contactName ?? "",
                phone: c.phone ?? "",
                email: c.email ?? "",
                address: c.address ?? "",
                postalCode: c.postalCode ?? "",
                city: c.city ?? "",
              }}
            />
          )}
        </div>
      </section>
    </div>
  );
}
