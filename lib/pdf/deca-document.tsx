import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Svg,
  Rect,
  Path,
} from "@react-pdf/renderer";
import { type DecaPayload, formatPartyAddressLines } from "@/lib/deca/schema";
import { BRAND } from "@/lib/brand";
import { DECA_ROLES } from "@/lib/deca/roles";
import { formatLocationCityLine } from "@/lib/deca/location";

/**
 * #107 — editorial redesign, second iteration (Vignelli/Swiss-inspired:
 * grid, typographic hierarchy, economy of means — never a literal copy of
 * a specific Vignelli work, never a CMR). Structural inspiration only from
 * the owner-supplied reference — no competitor branding copied. Every
 * value stays a real `<Text>` node (R-3) and every mandatory field keeps
 * EXACTLY the same content as before — only the visual system changed:
 *
 *  - FIVE clearly delimited modules, each its own labelled zone on one
 *    continuous grid (thin rules + generous-but-dense spacing, never a
 *    rounded SaaS card): Identificación del DeCA, Partes del transporte,
 *    Ruta, Mercancía y vehículo, Verificación pública.
 *  - the masthead has real presence — a bigger brand line with its own
 *    drawn mark (a blue square + white check, never a raster asset), a
 *    dedicated "Identificación del DeCA" strip (Referencia/Emitido/Estado
 *    — an even 3-way split; the bare version number reads poorly at that
 *    size, so it moved to a small footnote in the verification band
 *    instead, under the app-version line), the status rendered as a
 *    bordered technical stamp, not coloured text.
 *  - a very subtle full-page watermark (a large, low-contrast "D"
 *    monogram) — decorative but never competing with legibility.
 *  - the route section gets a discreet graphic device: a dashed vertical
 *    axis between the two columns with a small filled dot marking each
 *    point (origin/destination), not a literal map or icon.
 *  - goods/vehicle is a real bordered technical table (2×2 grid with
 *    visible cell rules), not floating label/value pairs.
 *  - the QR is the largest single element on the page, in a full-width
 *    band that anchors the bottom of the sheet: a `flex: 1` spacer between
 *    the content and this band fills whatever vertical space is left on
 *    the page, so the band always closes the page at its true bottom —
 *    without EVER being `position: absolute` (which is what caused the
 *    original "huge dead space" bug: it reserved that space regardless of
 *    how much content preceded it). A flex spacer adapts either way: a
 *    short DeCA gets a taller gap before a bottom-anchored band; a long
 *    one that fills the page naturally gets almost no gap; content that
 *    genuinely overflows to a second page just carries the band with it.
 */

const NAVY = "#16181d"; // ink — headings, primary text
const ACCENT = "#0a3d91"; // línea DeCA — the one corporate accent, used sparingly
const BORDER = "#c9c4b8"; // firm hairline, holds up in print
const MUTED = "#5c5f66";
const BG = "#fbfaf7"; // warm paper, matches the product's own --color-bg
const BG_SOFT = "#f1efe9"; // tint for the identification strip + verification band
const WATERMARK = "#eeeae0"; // barely-there tint, a hair off the paper colour

const s = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 28,
    paddingHorizontal: 38,
    fontSize: 9.5,
    fontFamily: "Inter",
    color: NAVY,
    backgroundColor: BG,
  },

  watermark: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  watermarkText: {
    fontSize: 340,
    fontFamily: "Inter",
    fontWeight: 700,
    color: WATERMARK,
  },

  // Brand row — real presence, no colour block, no badge.
  brandRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  brandMarkWrap: { flexDirection: "row", alignItems: "center" },
  brandMark: { width: 24, height: 24, marginRight: 9 },
  brandName: {
    fontSize: 19,
    fontFamily: "Inter",
    fontWeight: 700,
    letterSpacing: 0.3,
    color: NAVY,
  },
  brandSub: { fontSize: 8.5, color: MUTED, marginTop: 3 },
  customerLogo: { width: 84, height: 28, objectFit: "contain" },

  sectionHeading: {
    fontSize: 8,
    fontFamily: "Inter",
    fontWeight: 700,
    color: MUTED,
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  // Identification strip — its own delimited module, a technical document's
  // own title block (reference/version/issued/status), not tucked into a
  // corner of the brand row.
  idZone: { backgroundColor: BG_SOFT, borderRadius: 2, padding: 12, marginTop: 12 },
  idRow: { flexDirection: "row", marginTop: 8 },
  idFieldRef: { flex: 1, paddingRight: 12 },
  idFieldWide: { flex: 1, paddingRight: 12 },
  idLabel: { fontSize: 7, color: MUTED, textTransform: "uppercase", letterSpacing: 0.5 },
  idValueRef: { fontSize: 15, fontFamily: "Inter", fontWeight: 700, color: NAVY, marginTop: 3 },
  idValue: { fontSize: 10, fontFamily: "Inter", fontWeight: 700, color: NAVY, marginTop: 3 },
  statusTag: {
    alignSelf: "flex-start",
    borderWidth: 1.2,
    borderColor: ACCENT,
    borderRadius: 2,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginTop: 3,
  },
  statusTagText: {
    fontSize: 8,
    fontFamily: "Inter",
    fontWeight: 700,
    letterSpacing: 0.5,
    color: ACCENT,
  },

  mastheadRule: { borderBottomWidth: 2, borderBottomColor: ACCENT, marginTop: 16 },

  // Section shell — a label + one continuous grid, no card.
  section: { marginTop: 17 },
  sectionBody: { marginTop: 10 },

  // Two-column editorial layout, shared by parties + route.
  twoCol: { flexDirection: "row" },
  colLeft: { flex: 1, paddingRight: 16 },
  colRight: { flex: 1, paddingLeft: 16 },
  colDivider: { width: 1, backgroundColor: BORDER },
  colDividerDashed: {
    width: 0,
    borderLeftWidth: 1,
    borderLeftColor: ACCENT,
    borderStyle: "dashed",
  },

  partyLabel: {
    fontSize: 7.5,
    fontFamily: "Inter",
    fontWeight: 700,
    color: ACCENT,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  partyName: { fontSize: 13, fontFamily: "Inter", fontWeight: 700, color: NAVY, marginTop: 4 },
  fieldLabel: { fontSize: 7.5, color: MUTED, marginTop: 7 },
  fieldValue: { fontSize: 10, color: NAVY, marginTop: 1.5, lineHeight: 1.3 },

  routeKindRow: { flexDirection: "row", alignItems: "center" },
  routeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: ACCENT, marginRight: 6 },
  routeKind: {
    fontSize: 8,
    fontFamily: "Inter",
    fontWeight: 700,
    color: NAVY,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  routeName: { fontSize: 12, fontFamily: "Inter", fontWeight: 700, color: NAVY, marginTop: 6 },
  routeAddress: { fontSize: 9.5, color: "#374151", marginTop: 3, lineHeight: 1.35 },
  routeDateRow: { flexDirection: "row", alignItems: "baseline", marginTop: 8, gap: 6 },
  routeDateLabel: { fontSize: 8.5, color: MUTED },
  routeDateValue: { fontSize: 10.5, fontFamily: "Inter", fontWeight: 700, color: ACCENT },

  // Goods / vehicle — a real bordered technical table (2×2), not floating pairs.
  techTable: { borderWidth: 1, borderColor: BORDER, borderRadius: 2 },
  techTableRow: { flexDirection: "row" },
  techTableRowBorder: { borderTopWidth: 1, borderTopColor: BORDER },
  techCell: { flex: 1, padding: 10 },
  techCellBorder: { borderLeftWidth: 1, borderLeftColor: BORDER },
  techLabel: { fontSize: 7.5, color: MUTED, textTransform: "uppercase", letterSpacing: 0.4 },
  techValue: { fontSize: 11, fontFamily: "Inter", fontWeight: 700, color: NAVY, marginTop: 4 },

  spacer: { flex: 1, minHeight: 16 },

  // Verification band — the document's closing stamp; the largest, most
  // prominent element on the page. Anchored to the bottom via the spacer
  // above it, never position:absolute.
  verifyBand: {
    backgroundColor: BG_SOFT,
    borderRadius: 3,
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  verifyLeft: { flex: 1, paddingRight: 20 },
  verifyLabel: { fontSize: 8, color: MUTED, textTransform: "uppercase", letterSpacing: 0.8 },
  verifyRef: { fontSize: 11, fontFamily: "Inter", fontWeight: 700, color: NAVY, marginTop: 5 },
  verifyUrl: { fontSize: 9.5, fontFamily: "Inter", fontWeight: 700, color: ACCENT, marginTop: 4 },
  verifyMeta: { fontSize: 7.5, color: MUTED, marginTop: 8, lineHeight: 1.4 },
  verifyDocVersion: { fontSize: 6.5, color: MUTED, marginTop: 2 },
  qrBlock: { alignItems: "center" },
  qr: { width: 96, height: 96 },
  qrCaption: { fontSize: 7, color: MUTED, marginTop: 6, textAlign: "center", maxWidth: 96 },

  pageNumber: {
    position: "absolute",
    top: 14,
    right: 38,
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
      <View style={s.routeKindRow}>
        <View style={s.routeDot} />
        <Text style={s.routeKind}>{kind}</Text>
      </View>
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

function TechCell({
  label,
  value,
  bordered,
}: {
  label: string;
  value: string;
  bordered?: boolean;
}) {
  return (
    <View style={[s.techCell, ...(bordered ? [s.techCellBorder] : [])]}>
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
        {/* WATERMARK — decorative only, behind every other element (render order = stacking order) */}
        <View style={s.watermark} fixed>
          <Text style={s.watermarkText}>D</Text>
        </View>

        {/* BRAND ROW — the mark is drawn (Svg/Rect/Path), never a raster
            asset, so it stays crisp at any zoom and needs no image file. */}
        <View style={s.brandRow}>
          <View style={s.brandMarkWrap}>
            <Svg style={s.brandMark} viewBox="0 0 24 24">
              <Rect x={0} y={0} width={24} height={24} rx={5} fill={ACCENT} />
              <Path
                d="M6.5 12.6L10 16.1L18 7.7"
                stroke="#ffffff"
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </Svg>
            <View>
              <Text style={s.brandName}>{BRAND.name}</Text>
              <Text style={s.brandSub}>Documento Electrónico de Control Administrativo</Text>
            </View>
          </View>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          {p.customerLogoDataUri && <Image style={s.customerLogo} src={p.customerLogoDataUri} />}
        </View>

        {/* IDENTIFICACIÓN DEL DECA — its own delimited module */}
        <View style={s.idZone}>
          <Text style={s.sectionHeading}>Identificación del DeCA</Text>
          <View style={s.idRow}>
            <View style={s.idFieldRef}>
              <Text style={s.idLabel}>Referencia</Text>
              <Text style={s.idValueRef}>{p.reference}</Text>
            </View>
            <View style={s.idFieldWide}>
              <Text style={s.idLabel}>Emitido</Text>
              <Text style={s.idValue}>{fmt(p.createdAt)}</Text>
            </View>
            <View style={s.idFieldWide}>
              <Text style={s.idLabel}>Estado</Text>
              <View style={s.statusTag}>
                <Text style={s.statusTagText}>
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
          <View style={[s.twoCol, s.sectionBody]}>
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

        {/* ROUTE — a discreet origin→destination graphic device */}
        <View style={s.section}>
          <Text style={s.sectionHeading}>Ruta del transporte</Text>
          <View style={[s.twoCol, s.sectionBody]}>
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
            <View style={s.colDividerDashed} />
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

        {/* GOODS + VEHICLE — a real technical table */}
        <View style={s.section}>
          <Text style={s.sectionHeading}>Mercancía y vehículo</Text>
          <View style={[s.techTable, s.sectionBody]}>
            <View style={s.techTableRow}>
              <TechCell label="Naturaleza de la mercancía" value={p.data.goods} />
              <TechCell label="Peso o medida" value={p.data.weight} bordered />
            </View>
            <View style={[s.techTableRow, s.techTableRowBorder]}>
              <TechCell label="Matrícula tractora" value={p.data.tractorPlate} />
              <TechCell label="Matrícula remolque" value={p.data.trailerPlate || "—"} bordered />
            </View>
          </View>
        </View>

        {/* Fills whatever vertical space remains, so the band below always
            closes the physical page — never position:absolute. */}
        <View style={s.spacer} />

        {/* VERIFICACIÓN PÚBLICA — the largest, most prominent element on the page */}
        <View style={s.verifyBand} wrap={false}>
          <View style={s.verifyLeft}>
            <Text style={s.verifyLabel}>Verificación pública</Text>
            <Text style={s.verifyRef}>{p.reference}</Text>
            <Text style={s.verifyUrl}>{p.publicUrl}</Text>
            <Text style={s.verifyMeta}>
              Generado el {fmt(p.createdAt)}
              {p.modifiedAt ? ` · Modificado el ${fmt(p.modifiedAt)}` : ""}
            </Text>
            <Text style={s.verifyMeta}>
              {BRAND.name} v{p.appVersion}
            </Text>
            <Text style={s.verifyDocVersion}>Versión {p.versionNo} del documento</Text>
          </View>
          <View style={s.qrBlock}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image style={s.qr} src={p.qrDataUri} />
            <Text style={s.qrCaption}>Escanea para verificar la versión vigente</Text>
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
