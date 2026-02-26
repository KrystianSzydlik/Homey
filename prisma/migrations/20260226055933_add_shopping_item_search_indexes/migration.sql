-- CreateIndex
CREATE INDEX "ShoppingItem_householdId_name_idx" ON "ShoppingItem"("householdId", "name");

-- CreateIndex
CREATE INDEX "ShoppingItem_householdId_purchaseCount_idx" ON "ShoppingItem"("householdId", "purchaseCount");
