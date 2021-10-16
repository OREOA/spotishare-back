/*
  Warnings:

  - Added the required column `played` to the `Song` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Song" ADD COLUMN     "played" BOOLEAN NOT NULL;
