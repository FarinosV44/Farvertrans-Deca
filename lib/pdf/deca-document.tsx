import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import type { DecaPayload } from "@/lib/deca/schema";
import { BRAND } from "@/lib/brand";

const s = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Inter", color: "#0f1720" },
  h1: { fontSize: 14, fontFamily: "Inter", fontWeight: 700 },
  meta: { fontSize: 8, color: "#5b6673", marginTop: 4 },
  section: { marginTop: 14 },
  row: { flexDirection: "row", flexWrap: "wrap" },
  block: { width: "50%", paddingRight: 10, marginBottom: 10 },
  label: { fontSize: 8, color: "#5b6673", fontFamily: "Inter", fontWeight: 700 },
  value: { fontSize: 10, marginTop: 2 },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  url: { fontSize: 8, color: "#0b5cff", maxWidth: 380 },
  qr: { width: 90, height: 90 },
});

function B({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.block}>
      <Text style={s.label}>{label}</Text>
      <Text style={s.value}>{value}</Text>
    </View>
  );
}

export type DecaDocProps = {
  data: DecaPayload;
  publicUrl: string;
  qrDataUri: string;
  reference: string;
  versionNo: number;
  createdAt: Date;
  modifiedAt?: Date;
  appVersion: string;
};

/** The compliant DeCA document — every value is real selectable text (R-3). */
export function DecaDocument(p: DecaDocProps) {
  const fmt = (d: Date) => d.toISOString().replace("T", " ").slice(0, 19) + " UTC";
  return (
    <Document
      title={`DeCA ${p.reference}`}
      author={BRAND.name}
      subject="Documento Electrónico de Control Administrativo"
      creator={`${BRAND.name} v${p.appVersion}`}
      producer={`${BRAND.name} v${p.appVersion}`}
      creationDate={p.createdAt}
      modificationDate={p.modifiedAt ?? p.createdAt}
    >
      <Page size="A4" style={s.page}>
        <Text style={s.h1}>DOCUMENTO ELECTRÓNICO DE CONTROL (DeCA)</Text>
        <Text style={s.meta}>
          Referencia: {p.reference} · Versión: {p.versionNo} · Creado: {fmt(p.createdAt)}
          {p.modifiedAt ? ` · Modificado: ${fmt(p.modifiedAt)}` : ""}
        </Text>

        <View style={s.section}>
          <View style={s.row}>
            <B label="CARGADOR CONTRACTUAL" value={p.data.shipper.name} />
            <B label="NIF DEL CARGADOR" value={p.data.shipper.nif} />
            <B label="DOMICILIO DEL CARGADOR" value={p.data.shipper.address} />
            <B label="TRANSPORTISTA EFECTIVO" value={p.data.carrier.name} />
            <B label="NIF DEL TRANSPORTISTA" value={p.data.carrier.nif} />
            <B label="DOMICILIO DEL TRANSPORTISTA" value={p.data.carrier.address} />
            <B label="FECHA DEL TRANSPORTE" value={p.data.transportDate} />
            <B label="ORIGEN" value={p.data.origin} />
            <B label="DESTINO" value={p.data.destination} />
            <B label="NATURALEZA DE LA MERCANCÍA" value={p.data.goods} />
            <B label="PESO O MEDIDA" value={p.data.weight} />
            <B label="MATRÍCULA TRACTORA" value={p.data.tractorPlate} />
            <B label="MATRÍCULA REMOLQUE" value={p.data.trailerPlate || "—"} />
          </View>
        </View>

        <View style={s.footer}>
          <View>
            <Text style={s.label}>URL DE VERIFICACIÓN (descarga directa)</Text>
            <Text style={s.url}>{p.publicUrl}</Text>
            <Text style={s.meta}>
              Generado por {BRAND.name} · {BRAND.attribution} · v{p.appVersion}
            </Text>
          </View>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image style={s.qr} src={p.qrDataUri} />
        </View>
      </Page>
    </Document>
  );
}
