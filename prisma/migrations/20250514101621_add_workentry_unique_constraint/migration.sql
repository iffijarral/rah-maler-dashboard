/*
  Warnings:

  - A unique constraint covering the columns `[worker_id,project_id,date]` on the table `WorkEntry` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "WorkEntry_worker_id_project_id_date_key" ON "WorkEntry"("worker_id", "project_id", "date");
