import Link from "next/link";
import { operatorStats, type OperatorRow } from "@/lib/attribution/persist";
import { PageHeader, Table, Row, Cell } from "@/components/admin/ui";

const pct = (num: number, den: number) => (den > 0 ? `${Math.round((num / den) * 100)}%` : "—");

export default async function AdminOperadores() {
  const stats = await operatorStats();
  const rows: OperatorRow[] = [...stats.operators, ...stats.unknown, stats.organic];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Operadores"
        lead="Métricas de uso real por código de operador: visitas de eventos y DeCA generados por las empresas captadas."
        action={
          <Link href="/admin/captacion" className="text-sm no-underline">
            Gestionar captación →
          </Link>
        }
      />

      <Table
        head={[
          "Operador",
          "Visitas",
          "Empresas",
          "1er DeCA",
          "DeCA",
          "Activas 7d",
          "Activas 30d",
          "Visita→empresa",
          "Empresa→1er DeCA",
          "Empresa→activa 30d",
        ]}
      >
        {rows.map((r) => (
          <Row key={r.refCode}>
            <Cell>
              <span className="font-medium">{r.name}</span>
              {r.active === false && r.refCode !== stats.organic.refCode && (
                <span className="ml-1 text-xs text-[var(--color-text-muted)]">(inactivo)</span>
              )}
              <br />
              <span className="font-mono text-xs text-[var(--color-text-muted)]">{r.refCode}</span>
            </Cell>
            <Cell>{r.visits}</Cell>
            <Cell>{r.companies}</Cell>
            <Cell>{r.firstDeca}</Cell>
            <Cell>{r.totalDeca}</Cell>
            <Cell>{r.active7d}</Cell>
            <Cell>{r.active30d}</Cell>
            <Cell>{pct(r.companies, r.visits)}</Cell>
            <Cell>{pct(r.firstDeca, r.companies)}</Cell>
            <Cell>{pct(r.active30d, r.companies)}</Cell>
          </Row>
        ))}
      </Table>
      <p className="text-xs text-[var(--color-text-muted)]">
        «Empresas» son altas atribuidas a ese código (first-touch). Una empresa que se registra pero
        nunca genera un DeCA tiene «1er DeCA» = 0.
      </p>
    </div>
  );
}
