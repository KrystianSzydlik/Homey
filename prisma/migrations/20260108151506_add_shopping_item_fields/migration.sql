/*
  Warnings:

  - Added the required column `updatedAt` to the `ShoppingItem` table without a default value. This is not possible if the table is not empty.
  - Made the column `quantity` on table `ShoppingItem` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "ShoppingCategory" AS ENUM ('VEGETABLES', 'DAIRY', 'MEAT', 'BAKERY', 'FRUITS', 'FROZEN', 'DRINKS', 'CONDIMENTS', 'SWEETS', 'OTHER');

-- AlterTable
ALTER TABLE "ShoppingItem" ADD COLUMN     "averageDaysBetweenPurchases" DOUBLE PRECISION,
ADD COLUMN     "category" "ShoppingCategory" NOT NULL DEFAULT 'OTHER',
ADD COLUMN     "emoji" TEXT,
ADD COLUMN     "lastPurchasedAt" TIMESTAMP(3),
ADD COLUMN     "position" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "purchaseCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "unit" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "quantity" SET NOT NULL,
ALTER COLUMN "quantity" SET DEFAULT '1';

-- CreateIndex
CREATE INDEX "ShoppingItem_householdId_position_idx" ON "ShoppingItem"("householdId", "position");

-- CreateIndex
CREATE INDEX "ShoppingItem_householdId_checked_idx" ON "ShoppingItem"("householdId", "checked");
