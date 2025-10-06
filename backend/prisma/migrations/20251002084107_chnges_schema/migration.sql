/*
  Warnings:

  - The `paymentGateway` column on the `Registration` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `paymentStatus` column on the `Registration` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `visibility` on the `Event` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `role` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('STUDENT', 'ORGANIZER', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."EventVisibility" AS ENUM ('OWN', 'SELECTED', 'ALL');

-- CreateEnum
CREATE TYPE "public"."PaymentGateway" AS ENUM ('RAZORPAY', 'STRIPE');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED');

-- AlterTable
ALTER TABLE "public"."Event" DROP COLUMN "visibility",
ADD COLUMN     "visibility" "public"."EventVisibility" NOT NULL;

-- AlterTable
ALTER TABLE "public"."Registration" DROP COLUMN "paymentGateway",
ADD COLUMN     "paymentGateway" "public"."PaymentGateway",
DROP COLUMN "paymentStatus",
ADD COLUMN     "paymentStatus" "public"."PaymentStatus";

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "role",
ADD COLUMN     "role" "public"."UserRole" NOT NULL;

-- CreateIndex
CREATE INDEX "Club_collegeId_idx" ON "public"."Club"("collegeId");

-- CreateIndex
CREATE INDEX "Event_collegeId_idx" ON "public"."Event"("collegeId");

-- CreateIndex
CREATE INDEX "Event_clubId_idx" ON "public"."Event"("clubId");

-- CreateIndex
CREATE INDEX "EventAllowedCollege_eventId_idx" ON "public"."EventAllowedCollege"("eventId");

-- CreateIndex
CREATE INDEX "EventAllowedCollege_collegeId_idx" ON "public"."EventAllowedCollege"("collegeId");

-- CreateIndex
CREATE INDEX "Registration_userId_idx" ON "public"."Registration"("userId");

-- CreateIndex
CREATE INDEX "Registration_eventId_idx" ON "public"."Registration"("eventId");

-- CreateIndex
CREATE INDEX "User_collegeId_idx" ON "public"."User"("collegeId");
