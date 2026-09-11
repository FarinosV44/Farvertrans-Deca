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
import {
  type DecaPayload,
  formatPartyAddressLines,
  resolveShipment,
  sumWeights,
} from "@/lib/deca/schema";
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

  // #112 — multiple shipments ("envíos") per DeCA. Each shipment beyond the
  // first opens with a visibly separated, solid-fill badge — "muy visible y
  // separada" per the Resolución's own wording — never rendered at all for
  // the (still default, still most common) single-shipment case, so today's
  // exact single-origin/destination layout is byte-for-byte unchanged then.
  shipmentDivider: { borderTopWidth: 1, borderTopColor: BORDER, marginTop: 22, paddingTop: 2 },
  shipmentBadge: {
    alignSelf: "flex-start",
    backgroundColor: ACCENT,
    borderRadius: 2,
    paddingHorizontal: 9,
    paddingVertical: 4,
    marginTop: 14,
  },
  shipmentBadgeText: {
    fontSize: 9,
    fontFamily: "Inter",
    fontWeight: 700,
    color: "#ffffff",
    letterSpacing: 0.8,
  },
  totalWeightRow: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "baseline",
  },
  totalWeightLabel: {
    fontSize: 8,
    color: MUTED,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginRight: 6,
  },
  totalWeightValue: { fontSize: 12, fontFamily: "Inter", fontWeight: 700, color: NAVY },
  // No italic — only Inter Regular/Bold are registered (`lib/pdf/fonts.ts`).
  shipmentDisclaimer: { fontSize: 7.5, color: MUTED, marginTop: 6 },

  spacer: { flex: 1, minHeight: 16 },

  // Verification band — the document's closing stamp; the largest, most
  // prominent element on the page. Anchored to the bottom via the spacer
  // above it, never position:absolute.
  //
  // STRICT TWO-COLUMN LAYOUT (2026-09-10): the left column holds the text, the
  // right column is a FIXED-WIDTH box reserving the QR + caption. The QR box
  // never grows or shrinks (`flexShrink/flexGrow: 0`, explicit `width`); the
  // text column is `flex: 1` + `minWidth: 0` + `maxWidth`-capped so it takes
  // exactly the space that is left and no more. @react-pdf 4.x has no
  // `word-break` and hyphenation is disabled project-wide, so the long
  // verification URL (one space-less token) is pre-split into fixed-length
  // lines by `urlLines()` and rendered as stacked <Text> nodes — it wraps
  // inside the left column and can never reach the QR. `overflow: hidden` is a
  // last-resort clamp that the conservative line length keeps from ever firing.
  verifyBand: {
    backgroundColor: BG_SOFT,
    borderRadius: 3,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  // page content width 519.28 − band padding 30 − QR column 112 = 377.28
  verifyLeft: {
    flex: 1,
    minWidth: 0,
    maxWidth: 377,
    paddingRight: 16,
    overflow: "hidden",
  },
  verifyLabel: { fontSize: 8, color: MUTED, textTransform: "uppercase", letterSpacing: 0.8 },
  verifyRef: { fontSize: 11, fontFamily: "Inter", fontWeight: 700, color: NAVY, marginTop: 5 },
  verifyUrlBlock: { marginTop: 4 },
  verifyUrl: {
    fontSize: 9.5,
    fontFamily: "Inter",
    fontWeight: 700,
    color: ACCENT,
    lineHeight: 1.3,
  },
  verifyMeta: { fontSize: 7.5, color: MUTED, marginTop: 8, lineHeight: 1.4 },
  verifyDocVersion: { fontSize: 6.5, color: MUTED, marginTop: 2 },
  // Fixed reserved column: 96pt QR + an 8pt quiet zone on each side. Never
  // grows, never shrinks — the text column stops where this one begins.
  qrColumn: { width: 112, flexShrink: 0, flexGrow: 0, alignItems: "center" },
  qr: { width: 96, height: 96 },
  qrCaption: { fontSize: 7, color: MUTED, marginTop: 6, textAlign: "center", width: 96 },

  pageNumber: {
    position: "absolute",
    top: 14,
    right: 38,
    fontSize: 7,
    color: MUTED,
  },
});

/**
 * The verification URL is a single long token with no spaces. @react-pdf 4.x
 * has no `word-break` / `overflow-wrap`, this project disables hyphenation
 * project-wide (`lib/pdf/fonts.ts`), and U+200B / U+00AD are not honoured as
 * break points either — so without help the URL is laid out as one atom that
 * overflows its column and paints across the QR (bug 2026-09-10).
 *
 * Fix: pre-split the URL into fixed-length lines rendered as stacked <Text>
 * nodes. 40 chars at 9.5pt Inter-Bold is ≈ 220pt — comfortably inside the
 * ≈ 345pt of text width the left column has after its padding — so it always
 * wraps well before the QR column and never hyphenates. The QR still encodes
 * the exact, unmodified `publicUrl`; only the visible text is chunked.
 */
function urlLines(url: string, maxChars = 40): string[] {
  return url.match(new RegExp(`.{1,${maxChars}}`, "g")) ?? [url];
}

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

        {/* #112 — one ROUTE + GOODS/VEHICLE block PER SHIPMENT. Exactly one
            shipment (still the default, still the common case) renders
            IDENTICALLY to before #112 — no "ENVÍO 1" badge, no total —
            so today's single-origin/destination PDF is byte-for-byte
            unchanged. Multiple shipments each get a visibly separated,
            solid-fill "ENVÍO N" badge (Resolución apdo. Sexto: "muy visible
            y separada"), never implying an execution order. */}
        {p.data.shipments.map((shipment, i) => {
          const multi = p.data.shipments.length > 1;
          const r = resolveShipment(p.data, shipment);
          return (
            <View key={i} style={multi && i > 0 ? s.shipmentDivider : undefined}>
              {multi && (
                <View style={s.shipmentBadge}>
                  <Text style={s.shipmentBadgeText}>ENVÍO {i + 1}</Text>
                </View>
              )}

              {/* ROUTE — a discreet origin→destination graphic device */}
              <View style={s.section}>
                <Text style={s.sectionHeading}>Ruta del transporte</Text>
                <View style={[s.twoCol, s.sectionBody]}>
                  <View style={s.colLeft}>
                    <RouteColumn
                      kind="Lugar de carga"
                      name={r.loadLocation.name}
                      address={r.loadLocation.address}
                      postalCode={r.loadLocation.postalCode}
                      city={r.loadLocation.city}
                      province={r.loadLocation.province}
                      country={r.loadLocation.country}
                      dateLabel="Fecha de carga"
                      dateValue={r.loadDate}
                    />
                  </View>
                  <View style={s.colDividerDashed} />
                  <View style={s.colRight}>
                    <RouteColumn
                      kind="Lugar de descarga"
                      name={r.unloadLocation.name}
                      address={r.unloadLocation.address}
                      postalCode={r.unloadLocation.postalCode}
                      city={r.unloadLocation.city}
                      province={r.unloadLocation.province}
                      country={r.unloadLocation.country}
                      dateLabel="Fecha de descarga"
                      dateValue={r.unloadDate}
                    />
                  </View>
                </View>
              </View>

              {/* GOODS + VEHICLE — a real technical table */}
              <View style={s.section}>
                <Text style={s.sectionHeading}>Mercancía y vehículo</Text>
                <View style={[s.techTable, s.sectionBody]}>
                  <View style={s.techTableRow}>
                    <TechCell label="Naturaleza de la mercancía" value={r.goods} />
                    <TechCell label="Peso o medida" value={r.weight} bordered />
                  </View>
                  <View style={[s.techTableRow, s.techTableRowBorder]}>
                    <TechCell label="Matrícula tractora" value={r.tractorPlate} />
                    <TechCell label="Matrícula remolque" value={r.trailerPlate || "—"} bordered />
                  </View>
                  {r.recipient && (
                    <View style={[s.techTableRow, s.techTableRowBorder]}>
                      <TechCell label="Destinatario" value={r.recipient} />
                      <View style={[s.techCell, s.techCellBorder]} />
                    </View>
                  )}
                </View>
              </View>
            </View>
          );
        })}

        {/* PESO TOTAL — only once every shipment's weight is numeric-parseable
            (never a fabricated or partial total); each shipment's own weight
            stays fully visible above, this never replaces it. */}
        {p.data.shipments.length > 1 &&
          (() => {
            const totals = sumWeights(p.data.shipments.map((sh) => resolveShipment(p.data, sh)));
            return totals.allParsed ? (
              <View style={s.totalWeightRow}>
                <Text style={s.totalWeightLabel}>Peso total</Text>
                <Text style={s.totalWeightValue}>{totals.total}</Text>
              </View>
            ) : null;
          })()}
        {p.data.shipments.length > 1 && (
          <Text style={s.shipmentDisclaimer}>
            La numeración de los envíos tiene carácter identificativo y no determina su orden de
            ejecución.
          </Text>
        )}

        {/* Fills whatever vertical space remains, so the band below always
            closes the physical page — never position:absolute. */}
        <View style={s.spacer} />

        {/* VERIFICACIÓN PÚBLICA — the largest, most prominent element on the page */}
        <View style={s.verifyBand} wrap={false}>
          <View style={s.verifyLeft}>
            <Text style={s.verifyLabel}>Verificación pública</Text>
            <Text style={s.verifyRef}>{p.reference}</Text>
            <View style={s.verifyUrlBlock}>
              {urlLines(p.publicUrl).map((line, i) => (
                <Text key={i} style={s.verifyUrl}>
                  {line}
                </Text>
              ))}
            </View>
            <Text style={s.verifyMeta}>
              Generado el {fmt(p.createdAt)}
              {p.modifiedAt ? ` · Modificado el ${fmt(p.modifiedAt)}` : ""}
            </Text>
            <Text style={s.verifyMeta}>
              {BRAND.name} v{p.appVersion}
            </Text>
            <Text style={s.verifyDocVersion}>Versión {p.versionNo} del documento</Text>
          </View>
          <View style={s.qrColumn}>
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
