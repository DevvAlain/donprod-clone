CREATE TABLE "ContactSettings" (
    "id" VARCHAR(32) NOT NULL DEFAULT 'default',
    "readyText" VARCHAR(120) NOT NULL,
    "designerLabel" VARCHAR(240) NOT NULL,
    "designerUrl" VARCHAR(2048) NOT NULL,
    "locationName" VARCHAR(120) NOT NULL,
    "locationAddress" VARCHAR(240) NOT NULL,
    "coordinates" VARCHAR(240) NOT NULL,
    "footerBrand" VARCHAR(120) NOT NULL,
    "footerDescription" VARCHAR(240) NOT NULL,
    "copyrightYear" VARCHAR(10) NOT NULL,
    "showreelUrl" VARCHAR(2048) NOT NULL,
    "tickerText" VARCHAR(240) NOT NULL,
    "socialLinks" JSONB NOT NULL,
    "btsImages" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactSettings_pkey" PRIMARY KEY ("id")
);
