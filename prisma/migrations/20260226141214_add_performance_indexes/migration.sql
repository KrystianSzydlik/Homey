-- CreateIndex
CREATE INDEX "Recipe_householdId_idx" ON "Recipe"("householdId");

-- CreateIndex
CREATE INDEX "Todo_householdId_completed_idx" ON "Todo"("householdId", "completed");

-- CreateIndex
CREATE INDEX "User_householdId_idx" ON "User"("householdId");
