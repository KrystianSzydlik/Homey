-- AlterTable
ALTER TABLE "ShoppingItem" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'PLN',
ADD COLUMN     "purchasedAt" TIMESTAMP(3);
