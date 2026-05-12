-- AlterTable
ALTER TABLE "tasks_history" ALTER COLUMN "changed_at" DROP NOT NULL,
ALTER COLUMN "changed_at" DROP DEFAULT;
