/*
  Warnings:

  - Made the column `productId` on table `ShoppingItem` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "ShoppingItem" DROP CONSTRAINT "ShoppingItem_productId_fkey";

-- AlterTable
ALTER TABLE "ShoppingItem" ALTER COLUMN "productId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "ShoppingItem" ADD CONSTRAINT "ShoppingItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
