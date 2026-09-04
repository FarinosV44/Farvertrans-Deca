import type { Metadata } from "next";
import { contentMetadata, ContentPage } from "@/lib/content/public-page";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  return contentMetadata("blog", (await params).slug);
}

export default async function BlogPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { slug } = await params;
  const { preview } = await searchParams;
  return <ContentPage type="blog" slug={slug} preview={preview} />;
}
