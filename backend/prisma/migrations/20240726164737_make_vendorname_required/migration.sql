/*
  Warnings:

  - Made the column `vendorName` on table `Product` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "vendorName" SET NOT NULL;
