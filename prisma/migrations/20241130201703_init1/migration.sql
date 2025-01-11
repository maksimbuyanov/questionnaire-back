/*
  Warnings:

  - A unique constraint covering the columns `[telegramId,questionId]` on the table `Answer` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Answer_telegramId_questionId_key" ON "Answer"("telegramId", "questionId");
