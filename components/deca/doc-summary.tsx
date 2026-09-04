import type { DecaPayloadData } from "@/lib/data/history";

/**
 * The generated DeCA's structured data, in the exact sections of the PDF
 * (PRODUCT #36 §2). Read-only and derived from the stored version payload, so
 * it can never diverge from the document.
 */
export function DocSummary({ data }: { data: DecaPayloadData }) {
  const sections: { title: string; rows: [string, string][] }[] = [
    {
      title: "Empresa que contrata el transporte",
      rows: [
        ["Nombre o razón social", data.shipper?.name ?? ""],
        ["NIF / VAT", data.shipper?.nif ?? ""],
        ["Domicilio", data.shipper?.address ?? ""],
      ],
    },
    {
      title: "Transportista efectivo",
      rows: [
        ["Nombre o razón social", data.carrier?.name ?? ""],
        ["NIF / VAT", data.carrier?.nif ?? ""],
        ["Domicilio", data.carrier?.address ?? ""],
      ],
    },
    {
      title: "Transporte",
      rows: [
        ["Fecha", data.transportDate ?? ""],
        ["Origen", data.origin ?? ""],
        ["Destino", data.destination ?? ""],
        ["Matrícula tractora", data.tractorPlate ?? ""],
        ["Matrícula remolque / semirremolque", data.trailerPlate || "—"],
      ],
    },
    {
      title: "Mercancía",
      rows: [
        ["Naturaleza", data.goods ?? ""],
        ["Peso o medida", data.weight ?? ""],
        ...(data.reference ? ([["Referencia / notas", data.reference]] as [string, string][]) : []),
      ],
    },
  ];

  return (
    <div className="space-y-3">
      {sections.map((s) => (
        <section
          key={s.title}
          className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] p-4"
        >
          <h3 className="text-sm font-bold">{s.title}</h3>
          <dl className="mt-2 grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
            {s.rows.map(([k, v]) => (
              <div key={k} className="flex flex-col">
                <dt className="text-xs text-[var(--color-text-muted)]">{k}</dt>
                <dd className="text-sm break-words">{v || "—"}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}
