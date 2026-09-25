-- CreateEnum
CREATE TYPE "ProjectVisibility" AS ENUM ('VISIBLE', 'HIDDEN');

-- CreateTable
CREATE TABLE "Admin" (
    "id" UUID NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "title" VARCHAR(240) NOT NULL,
    "artist" VARCHAR(240),
    "vimeoUrl" TEXT,
    "aspectRatio" DECIMAL(8,4) NOT NULL DEFAULT 1.7778,
    "dateLabel" VARCHAR(120),
    "runtimeSeconds" INTEGER,
    "locations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "coordinates" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "description" TEXT,
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "content" JSONB,
    "thumbnailDesktopUrl" TEXT,
    "thumbnailMobileUrl" TEXT,
    "thumbnailPlaceholderUrl" TEXT,
    "mobilePreviewUrl" TEXT,
    "seoTitle" VARCHAR(240),
    "seoDescription" TEXT,
    "ogImageUrl" TEXT,
    "visibility" "ProjectVisibility" NOT NULL DEFAULT 'VISIBLE',
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(80) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectTag" (
    "projectId" UUID NOT NULL,
    "tagId" UUID NOT NULL,

    CONSTRAINT "ProjectTag_pkey" PRIMARY KEY ("projectId","tagId")
);

-- CreateTable
CREATE TABLE "ProjectCredit" (
    "id" UUID NOT NULL,
    "projectId" UUID NOT NULL,
    "label" VARCHAR(120) NOT NULL,
    "value" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProjectCredit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectStill" (
    "id" UUID NOT NULL,
    "projectId" UUID NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "placeholderUrl" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProjectStill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectViewDedup" (
    "id" UUID NOT NULL,
    "projectId" UUID NOT NULL,
    "visitorHash" VARCHAR(128) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectViewDedup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE INDEX "Project_visibility_displayOrder_idx" ON "Project"("visibility", "displayOrder");

-- CreateIndex
CREATE INDEX "Project_createdAt_idx" ON "Project"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_slug_key" ON "Tag"("slug");

-- CreateIndex
CREATE INDEX "ProjectTag_tagId_idx" ON "ProjectTag"("tagId");

-- CreateIndex
CREATE INDEX "ProjectCredit_projectId_displayOrder_idx" ON "ProjectCredit"("projectId", "displayOrder");

-- CreateIndex
CREATE INDEX "ProjectStill_projectId_displayOrder_idx" ON "ProjectStill"("projectId", "displayOrder");

-- CreateIndex
CREATE INDEX "ProjectViewDedup_expiresAt_idx" ON "ProjectViewDedup"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectViewDedup_projectId_visitorHash_key" ON "ProjectViewDedup"("projectId", "visitorHash");

-- AddForeignKey
ALTER TABLE "ProjectTag" ADD CONSTRAINT "ProjectTag_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectTag" ADD CONSTRAINT "ProjectTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectCredit" ADD CONSTRAINT "ProjectCredit_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectStill" ADD CONSTRAINT "ProjectStill_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectViewDedup" ADD CONSTRAINT "ProjectViewDedup_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
