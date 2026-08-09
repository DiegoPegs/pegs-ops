-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('PLANNED', 'DONE', 'CANCELLED');

-- CreateTable
CREATE TABLE "events" (
    "id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "event_date" TIMESTAMP(3) NOT NULL,
    "status" "EventStatus" NOT NULL DEFAULT 'PLANNED',
    "notes" TEXT,
    "archived_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_items" (
    "id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "variant_id" UUID NOT NULL,
    "target_quantity" INTEGER NOT NULL,

    CONSTRAINT "event_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "events_event_date_idx" ON "events"("event_date");

-- CreateIndex
CREATE INDEX "events_archived_at_idx" ON "events"("archived_at");

-- CreateIndex
CREATE INDEX "event_items_event_id_idx" ON "event_items"("event_id");

-- CreateIndex
CREATE INDEX "event_items_variant_id_idx" ON "event_items"("variant_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_items_event_id_variant_id_key" ON "event_items"("event_id", "variant_id");

-- AddForeignKey
ALTER TABLE "event_items" ADD CONSTRAINT "event_items_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_items" ADD CONSTRAINT "event_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
