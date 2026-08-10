-- CreateEnum
CREATE TYPE "ActivityPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateTable
CREATE TABLE "manual_activities" (
    "id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "priority" "ActivityPriority" NOT NULL DEFAULT 'MEDIUM',
    "due_date" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "archived_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "manual_activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "manual_activities_archived_at_idx" ON "manual_activities"("archived_at");

-- CreateIndex
CREATE INDEX "manual_activities_completed_at_idx" ON "manual_activities"("completed_at");

-- CreateIndex
CREATE INDEX "manual_activities_due_date_idx" ON "manual_activities"("due_date");
