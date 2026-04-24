/*
  Warnings:

  - You are about to drop the column `averageDaysBetweenPurchases` on the `ShoppingItem` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `ShoppingItem` table. All the data in the column will be lost.
  - You are about to drop the column `lastPurchasedAt` on the `ShoppingItem` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `ShoppingItem` table. All the data in the column will be lost.
  - You are about to drop the column `purchaseCount` on the `ShoppingItem` table. All the data in the column will be lost.
  - You are about to drop the column `purchasedAt` on the `ShoppingItem` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "ShoppingItem_householdId_purchaseCount_idx";

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "averageDaysBetweenPurchases" DOUBLE PRECISION,
ADD COLUMN     "lastPurchasedAt" TIMESTAMP(3),
ADD COLUMN     "purchaseCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "ShoppingItem" DROP COLUMN "averageDaysBetweenPurchases",
DROP COLUMN "currency",
DROP COLUMN "lastPurchasedAt",
DROP COLUMN "price",
DROP COLUMN "purchaseCount",
DROP COLUMN "purchasedAt",
ADD COLUMN     "note" TEXT;

-- CreateTable
CREATE TABLE "PurchaseRecord" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "unit" TEXT,
    "price" DECIMAL(10,2),
    "currency" TEXT NOT NULL DEFAULT 'PLN',
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "shoppingItemId" TEXT,
    "householdId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PurchaseRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PurchaseRecord_householdId_purchasedAt_idx" ON "PurchaseRecord"("householdId", "purchasedAt");

-- CreateIndex
CREATE INDEX "PurchaseRecord_productId_purchasedAt_idx" ON "PurchaseRecord"("productId", "purchasedAt");

-- CreateIndex
CREATE INDEX "PurchaseRecord_householdId_productId_purchasedAt_idx" ON "PurchaseRecord"("householdId", "productId", "purchasedAt");

-- AddForeignKey
ALTER TABLE "PurchaseRecord" ADD CONSTRAINT "PurchaseRecord_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseRecord" ADD CONSTRAINT "PurchaseRecord_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseRecord" ADD CONSTRAINT "PurchaseRecord_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
