/*
  Warnings:

  - Added the required column `phone` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `planned_price` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `status` on the `Project` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `phone` to the `Worker` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('active', 'pending', 'completed', 'stalled', 'cancelled');

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "phone" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "totalAmount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "planned_price" INTEGER NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "ProjectStatus" NOT NULL;

-- AlterTable
ALTER TABLE "Worker" ADD COLUMN     "phone" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "ProjectService" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "service_id" TEXT NOT NULL,
    "unitPrice" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "ProjectService_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectService_project_id_service_id_key" ON "ProjectService"("project_id", "service_id");

-- CreateIndex
CREATE INDEX "Customer_name_idx" ON "Customer"("name");

-- CreateIndex
CREATE INDEX "Invoice_totalAmount_idx" ON "Invoice"("totalAmount");

-- CreateIndex
CREATE INDEX "Payment_worker_id_date_idx" ON "Payment"("worker_id", "date");

-- CreateIndex
CREATE INDEX "Project_name_idx" ON "Project"("name");

-- CreateIndex
CREATE INDEX "Project_customer_id_is_deleted_idx" ON "Project"("customer_id", "is_deleted");

-- CreateIndex
CREATE INDEX "Vacation_worker_id_start_date_idx" ON "Vacation"("worker_id", "start_date");

-- CreateIndex
CREATE INDEX "WorkEntry_worker_id_date_idx" ON "WorkEntry"("worker_id", "date");

-- CreateIndex
CREATE INDEX "WorkEntry_project_id_date_idx" ON "WorkEntry"("project_id", "date");

-- CreateIndex
CREATE INDEX "Worker_is_deleted_name_idx" ON "Worker"("is_deleted", "name");

-- CreateIndex
CREATE INDEX "Worker_is_deleted_email_idx" ON "Worker"("is_deleted", "email");

-- AddForeignKey
ALTER TABLE "ProjectService" ADD CONSTRAINT "ProjectService_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectService" ADD CONSTRAINT "ProjectService_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
