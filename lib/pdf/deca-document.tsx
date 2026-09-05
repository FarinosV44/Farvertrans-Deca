import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import type { DecaPayload } from "@/lib/deca/schema";
import { BRAND } from "@/lib/brand";

/**
 * Premium corporate layout (PRODUCT #49). Structural inspiration only from
 * the owner-supplied reference — no competitor branding copied. Every value
 * stays a real `<Text>` node (R-3: native, selectable text, never an image)
 * and every mandatory field keeps exactly the same content as before; only
 * the visual system changed. QR stays in its own fixed bottom-right zone
 * with generous quiet space, never sharing a line with body text.
 */

const NAVY = "#0b1f3a";
const NAVY_SOFT = "#33455e";
const ACCENT = "#0b5cff"; // BRAND.color
const BORDER = "#d7dde6";
const MUTED = "#5b6673";
const BG_SOFT = "#f4f7fc";

const s = StyleSheet.create({
  page: {
    paddingTop: 0,
    paddingBottom: 64,
    paddingHorizontal: 0,
    fontSize: 9.5,
    fontFamily: "Inter",
    color: "#101828",
  },
  content: { paddingHorizontal: 36 },

  // Header
  header: {
    backgroundColor: NAVY,
    paddingHorizontal: 36,
    paddingTop: 26,
    paddingBottom: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandMark: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: ACCENT,
    alignItems: "center",
    justifyContent: "center",
  },
  brandMarkText: { color: "#ffffff", fontFamily: "Inter", fontWeight: 700, fontSize: 12 },
  brandName: { color: "#ffffff", fontFamily: "Inter", fontWeight: 700, fontSize: 13 },
  brandSub: { color: "#aeb9cc", fontSize: 8, marginTop: 1 },
  customerLogo: { width: 96, height: 32, marginLeft: 14, objectFit: "contain" },
  headerRight: { alignItems: "flex-end" },
  docTitle: {
    color: "#ffffff",
    fontFamily: "Inter",
    fontWeight: 700,
    fontSize: 11,
    letterSpacing: 0.4,
  },
  docMeta: { color: "#c7d0e0", fontSize: 8, marginTop: 3, textAlign: "right" },
  statusPill: {
    marginTop: 6,
    alignSelf: "flex-end",
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    borderRadius: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  statusPillText: {
    color: "#ffffff",
    fontSize: 7.5,
    fontFamily: "Inter",
    fontWeight: 700,
    letterSpacing: 0.6,
  },

  // Section shell
  section: { marginTop: 16 },
  sectionHeading: {
    fontSize: 8.5,
    fontFamily: "Inter",
    fontWeight: 700,
    color: NAVY,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1.5,
    borderBottomColor: ACCENT,
  },

  // Two-column party cards
  cardsRow: { flexDirection: "row", gap: 12 },
  card: {
    flex: 1,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 6,
    padding: 12,
    backgroundColor: BG_SOFT,
  },
  cardLabel: {
    fontSize: 7.5,
    fontFamily: "Inter",
    fontWeight: 700,
    color: ACCENT,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  cardValue: { fontSize: 11, fontFamily: "Inter", fontWeight: 700, color: "#101828", marginTop: 4 },
  fieldLabel: { fontSize: 7.5, color: MUTED, marginTop: 8 },
  fieldValue: { fontSize: 9.5, color: "#101828", marginTop: 1.5 },

  // Route timeline
  routeRow: { flexDirection: "row", gap: 12 },
  routeCard: { flex: 1, borderWidth: 1, borderColor: BORDER, borderRadius: 6, padding: 12 },
  routeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: ACCENT, marginRight: 6 },
  routeKind: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  routeKindText: {
    fontSize: 8,
    fontFamily: "Inter",
    fontWeight: 700,
    color: NAVY,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  routeName: { fontSize: 10.5, fontFamily: "Inter", fontWeight: 700, color: "#101828" },
  routeAddress: { fontSize: 9, color: "#374151", marginTop: 3, lineHeight: 1.35 },
  routeDate: { fontSize: 8.5, color: MUTED, marginTop: 7 },
  routeDateValue: {
    fontSize: 9.5,
    fontFamily: "Inter",
    fontWeight: 700,
    color: NAVY_SOFT,
    marginTop: 1,
  },

  // Goods / vehicle grid
  grid: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -8 },
  gridBlock: { width: "50%", paddingHorizontal: 8, marginBottom: 10 },
  gridLabel: { fontSize: 7.5, color: MUTED, textTransform: "uppercase", letterSpacing: 0.4 },
  gridValue: { fontSize: 10, fontFamily: "Inter", fontWeight: 700, color: "#101828", marginTop: 2 },

  divider: { borderBottomWidth: 1, borderBottomColor: BORDER, marginTop: 16 },

  // Footer / digital control
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingHorizontal: 36,
    paddingTop: 12,
    paddingBottom: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  footerLeft: { flex: 1, paddingRight: 16 },
  footerLabel: { fontSize: 7, color: MUTED, textTransform: "uppercase", letterSpacing: 0.5 },
  footerUrl: { fontSize: 8, color: ACCENT, marginTop: 2, maxWidth: 360 },
  footerOperator: { fontSize: 7, color: MUTED, marginTop: 8 },
  qrBlock: { alignItems: "center" },
  qr: { width: 70, height: 70 },
  qrCaption: { fontSize: 6.5, color: MUTED, marginTop: 3, textAlign: "center" },

  pageNumber: {
    position: "absolute",
    top: 10,
    right: 36,
    fontSize: 7,
    color: MUTED,
  },
});

function PartyCard({
  role,
  name,
  nif,
  address,
}: {
  role: string;
  name: string;
  nif: string;
  address: string;
}) {
  return (
    <View style={s.card}>
      <Text style={s.cardLabel}>{role}</Text>
      <Text style={s.cardValue}>{name}</Text>
      <Text style={s.fieldLabel}>NIF / VAT</Text>
      <Text style={s.fieldValue}>{nif}</Text>
      <Text style={s.fieldLabel}>Domicilio</Text>
      <Text style={s.fieldValue}>{address}</Text>
    </View>
  );
}

function RouteCard({
  kind,
  name,
  address,
  postalCode,
  city,
  province,
  country,
  dateLabel,
  dateValue,
}: {
  kind: string;
  name: string;
  address: string;
  postalCode: string;
  city: string;
  province: string;
  country: string;
  dateLabel: string;
  dateValue: string;
}) {
  return (
    <View style={s.routeCard}>
      <View style={s.routeKind}>
        <View style={s.routeDot} />
        <Text style={s.routeKindText}>{kind}</Text>
      </View>
      <Text style={s.routeName}>{name}</Text>
      <Text style={s.routeAddress}>{address}</Text>
      <Text style={s.routeAddress}>
        {postalCode} {city} — {province}, {country}
      </Text>
      <Text style={s.routeDate}>{dateLabel}</Text>
      <Text style={s.routeDateValue}>{dateValue}</Text>
    </View>
  );
}

function GridField({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.gridBlock}>
      <Text style={s.gridLabel}>{label}</Text>
      <Text style={s.gridValue}>{value}</Text>
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
  /** Baked into THIS render only — a later logo change never touches stored bytes (PRODUCT #39). */
  customerLogoDataUri?: string | null;
};

/** The compliant, premium DeCA document — every value is real selectable text (R-3). */
export function DecaDocument(p: DecaDocProps) {
  const fmt = (d: Date) => d.toISOString().replace("T", " ").slice(0, 19) + " UTC";
  const isCorrection = p.versionNo > 1;

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
      <Page size="A4" style={s.page} wrap>
        {/* HEADER */}
        <View style={s.header} fixed>
          <View style={s.brandRow}>
            <View style={s.brandMark}>
              <Text style={s.brandMarkText}>D</Text>
            </View>
            <View>
              <Text style={s.brandName}>{BRAND.name}</Text>
              <Text style={s.brandSub}>Documento Electrónico de Control</Text>
            </View>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            {p.customerLogoDataUri && <Image style={s.customerLogo} src={p.customerLogoDataUri} />}
          </View>
          <View style={s.headerRight}>
            <Text style={s.docTitle}>DeCA · {p.reference}</Text>
            <Text style={s.docMeta}>
              Versión {p.versionNo} · {fmt(p.createdAt)}
            </Text>
            <View style={s.statusPill}>
              <Text style={s.statusPillText}>
                {isCorrection ? "DOCUMENTO CORREGIDO" : "DOCUMENTO VIGENTE"}
              </Text>
            </View>
          </View>
        </View>

        <View style={s.content}>
          {/* PARTIES */}
          <View style={s.section}>
            <Text style={s.sectionHeading}>Partes del transporte</Text>
            <View style={s.cardsRow}>
              <PartyCard
                role="Cargador contractual"
                name={p.data.shipper.name}
                nif={p.data.shipper.nif}
                address={p.data.shipper.address}
              />
              <PartyCard
                role="Transportista efectivo"
                name={p.data.carrier.name}
                nif={p.data.carrier.nif}
                address={p.data.carrier.address}
              />
            </View>
          </View>

          {/* ROUTE */}
          <View style={s.section}>
            <Text style={s.sectionHeading}>Ruta del transporte</Text>
            <View style={s.routeRow}>
              <RouteCard
                kind="Lugar de carga"
                name={p.data.loadLocation.name}
                address={p.data.loadLocation.address}
                postalCode={p.data.loadLocation.postalCode}
                city={p.data.loadLocation.city}
                province={p.data.loadLocation.province}
                country={p.data.loadLocation.country}
                dateLabel="Fecha de carga"
                dateValue={p.data.loadDate}
              />
              <RouteCard
                kind="Lugar de descarga"
                name={p.data.unloadLocation.name}
                address={p.data.unloadLocation.address}
                postalCode={p.data.unloadLocation.postalCode}
                city={p.data.unloadLocation.city}
                province={p.data.unloadLocation.province}
                country={p.data.unloadLocation.country}
                dateLabel="Fecha de descarga"
                dateValue={p.data.unloadDate}
              />
            </View>
          </View>

          {/* GOODS + VEHICLE */}
          <View style={s.section}>
            <Text style={s.sectionHeading}>Mercancía y vehículo</Text>
            <View style={s.grid}>
              <GridField label="Naturaleza de la mercancía" value={p.data.goods} />
              <GridField label="Peso o medida" value={p.data.weight} />
              <GridField label="Matrícula tractora" value={p.data.tractorPlate} />
              <GridField label="Matrícula remolque" value={p.data.trailerPlate || "—"} />
            </View>
          </View>

          <View style={s.divider} />
        </View>

        {/* FOOTER / DIGITAL CONTROL */}
        <View style={s.footer} fixed>
          <View style={s.footerLeft}>
            <Text style={s.footerLabel}>Documento público de verificación</Text>
            <Text style={s.footerUrl}>{p.publicUrl}</Text>
            <Text style={s.footerOperator}>
              Generado el {fmt(p.createdAt)}
              {p.modifiedAt ? ` · Modificado el ${fmt(p.modifiedAt)}` : ""} · {BRAND.name} v
              {p.appVersion}
            </Text>
          </View>
          <View style={s.qrBlock}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image style={s.qr} src={p.qrDataUri} />
            <Text style={s.qrCaption}>Escanea para verificar</Text>
          </View>
        </View>

        <Text
          style={s.pageNumber}
          render={({ pageNumber, totalPages }) =>
            totalPages > 1 ? `Página ${pageNumber} de ${totalPages}` : ""
          }
          fixed
        />
      </Page>
    </Document>
  );
}
