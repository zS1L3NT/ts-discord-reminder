-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "PingType" AS ENUM ('Member', 'Role');

-- CreateTable
CREATE TABLE "Alias" (
    "guild_id" TEXT NOT NULL,
    "alias" TEXT NOT NULL,
    "command" TEXT NOT NULL,

    CONSTRAINT "Alias_pkey" PRIMARY KEY ("guild_id","alias","command")
);

-- CreateTable
CREATE TABLE "Entry" (
    "guild_id" TEXT NOT NULL,
    "prefix" TEXT,
    "log_channel_id" TEXT,
    "ping_channel_id" TEXT,
    "reminders_channel_id" TEXT,
    "reminder_message_ids" TEXT[],

    CONSTRAINT "Entry_pkey" PRIMARY KEY ("guild_id")
);

-- CreateTable
CREATE TABLE "Reminder" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "priority" "Priority" NOT NULL,

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ping" (
    "reminder_id" TEXT NOT NULL,
    "reference_id" TEXT NOT NULL,
    "type" "PingType" NOT NULL,

    CONSTRAINT "Ping_pkey" PRIMARY KEY ("reminder_id","reference_id","type")
);
