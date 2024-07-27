/*
  Warnings:

  - You are about to drop the column `userId` on the `Vendor` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Vendor" DROP CONSTRAINT "Vendor_userId_fkey";

-- AlterTable
ALTER TABLE "Vendor" DROP COLUMN "userId";
