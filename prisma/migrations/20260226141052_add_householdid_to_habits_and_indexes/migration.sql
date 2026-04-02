/*
  Warnings:

  - Added the required column `householdId` to the `Habit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `householdId` to the `HabitCompletion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Habit" ADD COLUMN     "householdId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "HabitCompletion" ADD COLUMN     "householdId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Habit_householdId_idx" ON "Habit"("householdId");

-- CreateIndex
CREATE INDEX "Habit_userId_idx" ON "Habit"("userId");

-- CreateIndex
CREATE INDEX "HabitCompletion_habitId_date_idx" ON "HabitCompletion"("habitId", "date");

-- CreateIndex
CREATE INDEX "HabitCompletion_householdId_date_idx" ON "HabitCompletion"("householdId", "date");

-- AddForeignKey
ALTER TABLE "Habit" ADD CONSTRAINT "Habit_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HabitCompletion" ADD CONSTRAINT "HabitCompletion_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
