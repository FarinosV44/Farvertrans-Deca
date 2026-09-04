import type { Metadata } from "next";
import { contentMetadata, ContentPage } from "@/lib/content/public-page";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  return contentMetadata("guide", (await params).slug);
}

export default async function GuidePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { slug } = await params;
  const { preview } = await searchParams;
  return <ContentPage type="guide" slug={slug} preview={preview} />;
}
