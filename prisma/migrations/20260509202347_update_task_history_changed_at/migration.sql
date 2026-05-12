/*
  Warnings:

  - Made the column `changed_at` on table `tasks_history` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "tasks_history" ALTER COLUMN "changed_at" SET NOT NULL,
ALTER COLUMN "changed_at" SET DEFAULT CURRENT_TIMESTAMP;
