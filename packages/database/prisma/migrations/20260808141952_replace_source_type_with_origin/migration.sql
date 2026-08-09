/*
  Warnings:

  - You are about to drop the column `source_type` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `source_url` on the `products` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "products" DROP COLUMN "source_type",
DROP COLUMN "source_url",
ADD COLUMN     "origin_id" UUID,
ADD COLUMN     "origin_url" VARCHAR(2048);

-- CreateTable
CREATE TABLE "origins" (
    "id" UUID NOT NULL,
    "name" VARCHAR(60) NOT NULL,

    CONSTRAINT "origins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "origins_name_key" ON "origins"("name");

-- CreateIndex
CREATE INDEX "products_origin_id_idx" ON "products"("origin_id");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_origin_id_fkey" FOREIGN KEY ("origin_id") REFERENCES "origins"("id") ON DELETE SET NULL ON UPDATE CASCADE;
