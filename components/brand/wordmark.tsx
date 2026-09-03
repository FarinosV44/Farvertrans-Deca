import { BRAND } from "@/lib/brand";

/**
 * The brand mark: a rounded-square check glyph + the wordmark. Used in the
 * header, auth pages and (as text) the PDF footer. Sizes cleanly from 20px
 * (favicon-adjacent) up. Pure SVG + text — no external asset.
 */
export function Wordmark({
  size = 28,
  showText = true,
  className = "",
}: {
  size?: number;
  showText?: boolean;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <BrandGlyph size={size} />
      {showText && (
        <span className="font-bold tracking-tight" style={{ fontSize: size * 0.62 }}>
          {BRAND.name}
        </span>
      )}
    </span>
  );
}

/** Just the glyph — for favicons, tight headers and the account menu. */
export function BrandGlyph({ size = 28 }: { size?: number }) {
  return (
    <svg
      aria-hidden
      width={size}
      height={size}
      viewBox="0 0 32 32"
      style={{ flex: "none" }}
      role="img"
    >
      <rect width="32" height="32" rx="8" fill={BRAND.color} />
      <path
        d="M9.5 16.4l4 4 9-9"
        fill="none"
        stroke="#fff"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
