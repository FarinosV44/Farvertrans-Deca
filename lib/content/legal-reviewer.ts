import { publicEnv } from "@/lib/env";

/**
 * The site's named legal reviewer credit (SEO #3, corrected in the 2026-09
 * legal-content pass — docs/decisions.md D-108). `content/seo/pages.ts`'s
 * `legalReviewer` field and the CMS `ContentItem.legalReviewerName` column
 * both store this single combined display string, shown VERBATIM to readers
 * (credit lines, `/revision-legal`). Structured data must NOT reuse that
 * combined string as `Person.name` — search engines expect the name,
 * credential and affiliation as separate, semantically distinct properties.
 * `reviewerPersonJsonLd()` is the one place that does the split; every
 * `reviewedBy` JSON-LD block in the codebase must go through it rather than
 * building a `Person` object inline.
 *
 * Add a new entry to `KNOWN_REVIEWERS` before crediting a different reviewer
 * anywhere. An unrecognized display string falls back to putting all of it
 * in `name` (so the page never breaks), but that is not corrected structured
 * data — it is a signal to add the missing entry.
 */

export const PRAETORIA_REVIEWER_DISPLAY =
  "Juan José Farinós Ibáñez — Abogado ICAV 13.981, PRAETORIA";

/** PRAETORIA as it appears nested under a reviewer's `memberOf` — kept in sync with `lib/legal-entity.ts`. */
const PRAETORIA_MEMBER_OF = {
  "@type": "Organization" as const,
  name: "PRAETORIA, S.L.",
  url: "https://praetoriaabogados.es/",
};

const KNOWN_REVIEWERS: Record<
  string,
  { name: string; jobTitle: string; identifier: string; memberOf: typeof PRAETORIA_MEMBER_OF }
> = {
  [PRAETORIA_REVIEWER_DISPLAY]: {
    name: "Juan José Farinós Ibáñez",
    jobTitle: "Abogado",
    identifier: "ICAV 13.981",
    memberOf: PRAETORIA_MEMBER_OF,
  },
};

/**
 * Builds a schema.org `Person` object for a `reviewedBy` JSON-LD property (or
 * as a standalone entity, e.g. on `/revision-legal`) from a display string.
 * `url` always points at the public reviewer/author page, regardless of
 * which page cites the reviewer.
 */
export function reviewerPersonJsonLd(display: string) {
  const known = KNOWN_REVIEWERS[display];
  return {
    "@type": "Person" as const,
    ...(known
      ? {
          name: known.name,
          jobTitle: known.jobTitle,
          identifier: known.identifier,
          memberOf: known.memberOf,
        }
      : { name: display }),
    url: `${publicEnv.baseUrl}/revision-legal`,
  };
}
