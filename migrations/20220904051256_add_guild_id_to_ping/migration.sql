/*
  Warnings:

  - The primary key for the `Ping` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `guild_id` to the `Ping` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Ping" DROP CONSTRAINT "Ping_pkey",
ADD COLUMN     "guild_id" TEXT NOT NULL,
ADD CONSTRAINT "Ping_pkey" PRIMARY KEY ("guild_id", "reminder_id", "reference_id", "type");
