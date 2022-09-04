/*
  Warnings:

  - Added the required column `guild_id` to the `Reminder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Reminder" ADD COLUMN     "guild_id" TEXT NOT NULL;
