-- CreateEnum
CREATE TYPE "TvcType" AS ENUM ('HIGHLIGHTED', 'CSR');

-- CreateTable
CREATE TABLE "TvcItem" (
    "id" UUID NOT NULL,
    "type" "TvcType" NOT NULL,
    "title" VARCHAR(240) NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "imagePublicId" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TvcItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TvcItem_type_displayOrder_idx" ON "TvcItem"("type", "displayOrder");
