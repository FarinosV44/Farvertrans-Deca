-- SEO #32 — admin-managed editorial content (guides + blog).
CREATE TYPE "ContentType" AS ENUM ('guide', 'blog');
CREATE TYPE "ContentStatus" AS ENUM ('draft', 'published', 'archived');

CREATE TABLE "content_item" (
    "id" TEXT NOT NULL,
    "type" "ContentType" NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'draft',
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "category" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "hero_image" TEXT,
    "author_name" TEXT,
    "focus_keyword" TEXT,
    "seo_title" TEXT,
    "meta_description" TEXT,
    "canonical_override" TEXT,
    "og_title" TEXT,
    "og_description" TEXT,
    "og_image" TEXT,
    "robots_index" BOOLEAN NOT NULL DEFAULT true,
    "sources" JSONB NOT NULL DEFAULT '[]',
    "related_slugs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "previous_slugs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "cta_label" TEXT,
    "published_at" TIMESTAMP(3),
    "last_reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "content_item_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "content_item_slug_key" ON "content_item"("slug");
CREATE INDEX "content_item_type_status_published_at_idx" ON "content_item"("type", "status", "published_at");
CREATE INDEX "content_item_status_idx" ON "content_item"("status");
