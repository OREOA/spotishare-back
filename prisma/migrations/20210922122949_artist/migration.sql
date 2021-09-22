/*
  Warnings:

  - A unique constraint covering the columns `[artistId]` on the table `Song` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `album` to the `Song` table without a default value. This is not possible if the table is not empty.
  - Added the required column `albumImg` to the `Song` table without a default value. This is not possible if the table is not empty.
  - Added the required column `artistId` to the `Song` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Song` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Song" ADD COLUMN     "album" TEXT NOT NULL,
ADD COLUMN     "albumImg" TEXT NOT NULL,
ADD COLUMN     "artistId" INTEGER NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Artist" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "votes" INTEGER,
    "sessionId" TEXT NOT NULL,

    CONSTRAINT "Artist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Artist_sessionId_key" ON "Artist"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Song_artistId_key" ON "Song"("artistId");

-- AddForeignKey
ALTER TABLE "Song" ADD CONSTRAINT "Song_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Artist" ADD CONSTRAINT "Artist_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
