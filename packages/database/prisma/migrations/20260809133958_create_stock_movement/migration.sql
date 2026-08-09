-- CreateEnum
CREATE TYPE "StockMovementDirection" AS ENUM ('IN', 'OUT', 'BOTH');

-- CreateTable
CREATE TABLE "stock_movement_types" (
    "id" UUID NOT NULL,
    "code" VARCHAR(40) NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "direction" "StockMovementDirection" NOT NULL,

    CONSTRAINT "stock_movement_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_movements" (
    "id" UUID NOT NULL,
    "variant_id" UUID NOT NULL,
    "movement_type_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(10,2),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "stock_movement_types_code_key" ON "stock_movement_types"("code");

-- CreateIndex
CREATE INDEX "stock_movements_variant_id_created_at_idx" ON "stock_movements"("variant_id", "created_at");

-- CreateIndex
CREATE INDEX "stock_movements_movement_type_id_idx" ON "stock_movements"("movement_type_id");

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_movement_type_id_fkey" FOREIGN KEY ("movement_type_id") REFERENCES "stock_movement_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
