/*
  Warnings:

  - You are about to drop the column `vimeoUrl` on the `Project` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ProjectVideoType" AS ENUM ('YOUTUBE', 'CLOUDINARY');

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "vimeoUrl",
ADD COLUMN     "thumbnailDesktopPublicId" TEXT,
ADD COLUMN     "thumbnailMobilePublicId" TEXT,
ADD COLUMN     "thumbnailPlaceholderPublicId" TEXT,
ADD COLUMN     "videoPublicId" TEXT,
ADD COLUMN     "videoType" "ProjectVideoType",
ADD COLUMN     "videoUrl" TEXT;

-- AlterTable
ALTER TABLE "ProjectStill" ADD COLUMN     "publicId" TEXT;
