/*
  Warnings:

  - A unique constraint covering the columns `[moduleId,userSession]` on the table `user_progress` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "user_progress_moduleId_userSession_key" ON "user_progress"("moduleId", "userSession");
