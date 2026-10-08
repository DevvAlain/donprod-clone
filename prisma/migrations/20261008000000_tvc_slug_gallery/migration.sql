-- Add slug + gallery to TvcItem (backfills existing rows from title)
ALTER TABLE "TvcItem" ADD COLUMN "slug" TEXT;
UPDATE "TvcItem" SET "slug" = lower(trim(both '-' from regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g'))) || '-' || left("id"::text, 8) WHERE "slug" IS NULL;
ALTER TABLE "TvcItem" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX "TvcItem_slug_key" ON "TvcItem"("slug");
ALTER TABLE "TvcItem" ADD COLUMN "gallery" JSONB;
