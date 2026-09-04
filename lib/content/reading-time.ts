/**
 * Estimated reading time for a CMS markdown body (SEO #32 follow-up). Pure —
 * strips markdown syntax before counting words, at ~200 words/minute (Spanish
 * average), floor 1 minute.
 */
export function estimateReadingMinutes(body: string): number {
  const plain = body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*`|_-]/g, " ")
    .replace(/::: faq[\s\S]*?:::/g, " ");
  const words = plain.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
