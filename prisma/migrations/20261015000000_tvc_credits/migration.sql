-- Add credits/date/location to TvcItem
ALTER TABLE "TvcItem" ADD COLUMN "credits" JSONB;
ALTER TABLE "TvcItem" ADD COLUMN "dateLabel" VARCHAR(120);
ALTER TABLE "TvcItem" ADD COLUMN "location" VARCHAR(160);
