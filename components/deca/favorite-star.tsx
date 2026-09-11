"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type RouteInfo = {
  routeKey: string;
  loadCity: string;
  loadCountry: string | null;
  unloadCity: string;
  unloadCountry: string | null;
};
type PayloadInput =
  | { kind: "company" | "vehicle" | "location" | "template" | "shipment"; id: string }
  | { kind: "route"; route: RouteInfo };

/**
 * #78 — a one-click star that pins a saved record / template / route to the top
 * of its list and the wizard dropdowns. Company-scoped; toggling never creates
 * a record. Optimistic, reverts on error.
 */
export function FavoriteStar({
  favorite,
  payload,
  label,
}: {
  favorite: boolean;
  payload: PayloadInput;
  label: string;
}) {
  const router = useRouter();
  const [on, setOn] = useState(favorite);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    const next = !on;
    setOn(next);
    setBusy(true);
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...payload, favorite: next }),
      });
      if (!res.ok) setOn(!next);
      else router.refresh();
    } catch {
      setOn(!next);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={on}
      data-testid="favorite-star"
      title={on ? `${label} — quitar de favoritos` : `${label} — marcar como favorito`}
      className={`shrink-0 text-base leading-none disabled:opacity-50 ${
        on
          ? "text-[var(--color-warn)]"
          : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
      }`}
    >
      <span aria-hidden>{on ? "★" : "☆"}</span>
      <span className="sr-only">{on ? "Favorito" : "Marcar como favorito"}</span>
    </button>
  );
}
