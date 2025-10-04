/*
  Warnings:

  - You are about to drop the column `developer_name` on the `properties` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ReraApprovalStatus" AS ENUM ('approved', 'pending', 'not_registered');

-- AlterTable
ALTER TABLE "properties" DROP COLUMN "developer_name",
ADD COLUMN     "builder_id" INTEGER;

-- CreateTable
CREATE TABLE "builders" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "history" TEXT NOT NULL,
    "past_projects" JSONB NOT NULL,
    "delivery_track_record" JSONB NOT NULL,
    "ratings" DECIMAL(3,1) NOT NULL,
    "financial_stability" JSONB NOT NULL,
    "awards" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "builders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rera_compliance" (
    "id" SERIAL NOT NULL,
    "property_id" INTEGER NOT NULL,
    "registration_number" TEXT NOT NULL,
    "approval_status" "ReraApprovalStatus" NOT NULL,
    "complaint_history" JSONB NOT NULL,
    "project_timeline" JSONB NOT NULL,
    "approved_building_plans" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rera_compliance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "rera_compliance_property_id_key" ON "rera_compliance"("property_id");

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_builder_id_fkey" FOREIGN KEY ("builder_id") REFERENCES "builders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rera_compliance" ADD CONSTRAINT "rera_compliance_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
