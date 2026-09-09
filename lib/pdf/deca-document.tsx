import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import { type DecaPayload, formatPartyAddressLines } from "@/lib/deca/schema";
import { BRAND } from "@/lib/brand";
import { DECA_ROLES } from "@/lib/deca/roles";
import { formatLocationCityLine } from "@/lib/deca/location";

/**
 * #107 — editorial redesign (Vignelli-inspired: grid, typographic hierarchy,
 * economy of means — never a literal copy of any specific Vignelli work,
 * and never a CMR). Structural inspiration only from the owner-supplied
 * reference — no competitor branding copied. Every value stays a real
 * `<Text>` node (R-3: native, selectable text, never an image) and every
 * mandatory field keeps EXACTLY the same content as before (#107's own "no
 * tocar contenido legal ni estructura de datos") — only the visual system
 * changed:
 *  - a light masthead (no dark app-style header band, no rounded logo
 *    badge) under one strong rule, like a document's own nameplate;
 *  - the CMR-style numbered cell badges are GONE — #107 explicitly flags
 *    them as one of the "looks like a dashboard" symptoms;
 *  - the party/route "cards" (border + radius + fill) are gone too, replaced
 *    by two plain typographic columns per section, separated by one hairline;
 *  - the verification block is a full-width tinted band, not a floating
 *    corner QR — reads as the document's own closing stamp;
 *  - the footer is no longer `position: absolute` at the page's physical
 *    bottom — it now flows right after the content. That absolute
 *    positioning, reserving space regardless of how much content precedes
 *    it, was the direct cause of #107's "too much empty white space in the
 *    lower half" — a short DeCA now simply ends after its own content, no
 *    artificial gap; `wrap={false}` keeps the whole verification band on
 *    one page rather than splitting it across a page break.
 */

const NAVY = "#16181d"; // ink — headings, primary text
const ACCENT = "#0a3d91"; // línea DeCA — the one sparingly-used accent
const BORDER = "#c9c4b8"; // firm hairline, holds up in print
const MUTED = "#5c5f66";
const BG = "#fbfaf7"; // warm paper, matches the product's own --color-bg
const BG_SOFT = "#f1efe9"; // the verification band's tint only

const s = StyleSheet.create({
  page: {
    paddingTop: 30,
    paddingBottom: 30,
    paddingHorizontal: 40,
    fontSize: 9.5,
    fontFamily: "Inter",
    color: NAVY,
    backgroundColor: BG,
  },

  // Masthead — light, editorial, no colour block
  masthead: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  brandName: {
    fontSize: 13,
    fontFamily: "Inter",
    fontWeight: 700,
    letterSpacing: 0.6,
    color: NAVY,
  },
  brandSub: { fontSize: 8.5, color: MUTED, marginTop: 2 },
  customerLogoRow: { flexDirection: "row", justifyContent: "flex-end", marginBottom: 6 },
  customerLogo: { width: 84, height: 28, objectFit: "contain" },
  headerRight: { alignItems: "flex-end" },
  docRef: { fontSize: 13, fontFamily: "Inter", fontWeight: 700, color: NAVY },
  docMeta: { fontSize: 8.5, color: MUTED, marginTop: 3, textAlign: "right" },
  statusRow: { flexDirection: "row", alignItems: "center", marginTop: 5 },
  statusDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: ACCENT, marginRight: 5 },
  statusText: {
    fontSize: 8,
    fontFamily: "Inter",
    fontWeight: 700,
    letterSpacing: 0.5,
    color: ACCENT,
  },
  mastheadRule: {
    borderBottomWidth: 2,
    borderBottomColor: ACCENT,
    marginTop: 14,
    marginBottom: 22,
  },

  // Section shell — a label + generous space, no coloured underline, no card.
  section: { marginTop: 22 },
  sectionHeading: {
    fontSize: 8,
    fontFamily: "Inter",
    fontWeight: 700,
    color: MUTED,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 12,
  },

  // Two-column editorial layout, shared by parties + route. One hairline
  // down the middle instead of two bordered/filled cards.
  twoCol: { flexDirection: "row" },
  colLeft: { flex: 1, paddingRight: 18 },
  colDivider: { width: 1, backgroundColor: BORDER },
  colRight: { flex: 1, paddingLeft: 18 },

  partyLabel: {
    fontSize: 7.5,
    fontFamily: "Inter",
    fontWeight: 700,
    color: ACCENT,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  partyName: { fontSize: 13, fontFamily: "Inter", fontWeight: 700, color: NAVY, marginTop: 5 },
  fieldLabel: { fontSize: 7.5, color: MUTED, marginTop: 10 },
  fieldValue: { fontSize: 10, color: NAVY, marginTop: 2, lineHeight: 1.35 },

  routeKind: {
    fontSize: 8,
    fontFamily: "Inter",
    fontWeight: 700,
    color: NAVY,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  routeName: { fontSize: 12, fontFamily: "Inter", fontWeight: 700, color: NAVY, marginTop: 6 },
  routeAddress: { fontSize: 9.5, color: "#374151", marginTop: 4, lineHeight: 1.4 },
  routeDateRow: { flexDirection: "row", alignItems: "baseline", marginTop: 10, gap: 6 },
  routeDateLabel: { fontSize: 8.5, color: MUTED },
  routeDateValue: { fontSize: 10.5, fontFamily: "Inter", fontWeight: 700, color: ACCENT },

  // Goods / vehicle — one aligned row of technical fields, not a floating grid.
  techRow: { flexDirection: "row" },
  techField: { flex: 1, paddingRight: 14 },
  techLabel: {
    fontSize: 7.5,
    color: MUTED,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  techValue: { fontSize: 10.5, fontFamily: "Inter", fontWeight: 700, color: NAVY, marginTop: 4 },

  // Verification band — the document's own closing stamp, not a corner QR.
  verifyBand: {
    marginTop: 26,
    backgroundColor: BG_SOFT,
    padding: 16,
    borderRadius: 3,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  verifyLeft: { flex: 1, paddingRight: 16 },
  verifyLabel: {
    fontSize: 7.5,
    color: MUTED,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  verifyUrl: { fontSize: 9, fontFamily: "Inter", fontWeight: 700, color: ACCENT, marginTop: 3 },
  verifyMeta: { fontSize: 7.5, color: MUTED, marginTop: 8, lineHeight: 1.4 },
  qrBlock: { alignItems: "center" },
  qr: { width: 66, height: 66 },
  qrCaption: { fontSize: 6.5, color: MUTED, marginTop: 4, textAlign: "center" },

  pageNumber: {
    position: "absolute",
    top: 14,
    right: 40,
    fontSize: 7,
    color: MUTED,
  },
});

function PartyColumn({
  role,
  name,
  nif,
  addressLines,
}: {
  role: string;
  name: string;
  nif: string;
  addressLines: string[];
}) {
  return (
    <View>
      <Text style={s.partyLabel}>{role}</Text>
      <Text style={s.partyName}>{name}</Text>
      <Text style={s.fieldLabel}>NIF / VAT</Text>
      <Text style={s.fieldValue}>{nif}</Text>
      <Text style={s.fieldLabel}>Domicilio</Text>
      {addressLines.map((line, i) => (
        <Text key={i} style={s.fieldValue}>
          {line}
        </Text>
      ))}
    </View>
  );
}

function RouteColumn({
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
  province?: string;
  country: string;
  dateLabel: string;
  dateValue: string;
}) {
  return (
    <View>
      <Text style={s.routeKind}>{kind}</Text>
      <Text style={s.routeName}>{name}</Text>
      <Text style={s.routeAddress}>{address}</Text>
      <Text style={s.routeAddress}>
        {formatLocationCityLine({ postalCode, city, province, country })}
      </Text>
      <View style={s.routeDateRow}>
        <Text style={s.routeDateLabel}>{dateLabel}</Text>
        <Text style={s.routeDateValue}>{dateValue}</Text>
      </View>
    </View>
  );
}

function TechField({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.techField}>
      <Text style={s.techLabel}>{label}</Text>
      <Text style={s.techValue}>{value}</Text>
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

/** The compliant DeCA document — every value is real selectable text (R-3). */
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
        {/* MASTHEAD */}
        <View>
          {p.customerLogoDataUri && (
            <View style={s.customerLogoRow}>
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <Image style={s.customerLogo} src={p.customerLogoDataUri} />
            </View>
          )}
          <View style={s.masthead}>
            <View>
              <Text style={s.brandName}>{BRAND.name}</Text>
              <Text style={s.brandSub}>Documento Electrónico de Control Administrativo</Text>
            </View>
            <View style={s.headerRight}>
              <Text style={s.docRef}>{p.reference}</Text>
              <Text style={s.docMeta}>
                Versión {p.versionNo} · {fmt(p.createdAt)}
              </Text>
              <View style={s.statusRow}>
                <View style={s.statusDot} />
                <Text style={s.statusText}>
                  {isCorrection ? "DOCUMENTO CORREGIDO" : "DOCUMENTO VIGENTE"}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View style={s.mastheadRule} />

        {/* PARTIES */}
        <View style={s.section}>
          <Text style={s.sectionHeading}>Partes del transporte</Text>
          <View style={s.twoCol}>
            <View style={s.colLeft}>
              <PartyColumn
                role={DECA_ROLES.shipper.title}
                name={p.data.shipper.name}
                nif={p.data.shipper.nif}
                addressLines={formatPartyAddressLines(p.data.shipper)}
              />
            </View>
            <View style={s.colDivider} />
            <View style={s.colRight}>
              <PartyColumn
                role={DECA_ROLES.carrier.title}
                name={p.data.carrier.name}
                nif={p.data.carrier.nif}
                addressLines={formatPartyAddressLines(p.data.carrier)}
              />
            </View>
          </View>
        </View>

        {/* ROUTE */}
        <View style={s.section}>
          <Text style={s.sectionHeading}>Ruta del transporte</Text>
          <View style={s.twoCol}>
            <View style={s.colLeft}>
              <RouteColumn
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
            </View>
            <View style={s.colDivider} />
            <View style={s.colRight}>
              <RouteColumn
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
        </View>

        {/* GOODS + VEHICLE */}
        <View style={s.section}>
          <Text style={s.sectionHeading}>Mercancía y vehículo</Text>
          <View style={s.techRow}>
            <TechField label="Naturaleza de la mercancía" value={p.data.goods} />
            <TechField label="Peso o medida" value={p.data.weight} />
          </View>
          <View style={[s.techRow, { marginTop: 14 }]}>
            <TechField label="Matrícula tractora" value={p.data.tractorPlate} />
            <TechField label="Matrícula remolque" value={p.data.trailerPlate || "—"} />
          </View>
        </View>

        {/* VERIFICATION — the document's own closing stamp, always with the content, never floating */}
        <View style={s.verifyBand} wrap={false}>
          <View style={s.verifyLeft}>
            <Text style={s.verifyLabel}>Verificación pública</Text>
            <Text style={s.verifyUrl}>{p.publicUrl}</Text>
            <Text style={s.verifyMeta}>
              Generado el {fmt(p.createdAt)}
              {p.modifiedAt ? ` · Modificado el ${fmt(p.modifiedAt)}` : ""}
            </Text>
            <Text style={s.verifyMeta}>
              {BRAND.name} v{p.appVersion}
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
