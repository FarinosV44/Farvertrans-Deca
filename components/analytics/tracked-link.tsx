"use client";
import Link from "next/link";
import { track } from "@/lib/analytics/client";
import type { EventName } from "@/lib/analytics/events";

/** A next/link that fires one analytics event on click. SSR-safe (real href). */
export function TrackedLink({
  href,
  event,
  className,
  children,
  "data-testid": testId,
}: {
  href: string;
  event: EventName;
  className?: string;
  children: React.ReactNode;
  "data-testid"?: string;
}) {
  return (
    <Link href={href} onClick={() => track(event)} className={className} data-testid={testId}>
      {children}
    </Link>
  );
}
