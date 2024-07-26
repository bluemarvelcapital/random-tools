/*
  Warnings:

  - Added the required column `fulfillmentService` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `inventoryPolicy` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productType` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tags` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Made the column `contactInfo` on table `Vendor` required. This step will fail if there are existing NULL values in that column.
  - Made the column `location` on table `Vendor` required. This step will fail if there are existing NULL values in that column.
  - Made the column `openingTimes` on table `Vendor` required. This step will fail if there are existing NULL values in that column.
  - Made the column `postcode` on table `Vendor` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vendorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "stock" INTEGER NOT NULL,
    "sku" TEXT,
    "barcode" TEXT,
    "weight" REAL,
    "weightUnit" TEXT,
    "tags" TEXT NOT NULL,
    "productType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "inventoryPolicy" TEXT NOT NULL,
    "fulfillmentService" TEXT NOT NULL,
    "shopifyId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Product_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("description", "id", "price", "shopifyId", "stock", "title", "vendorId") SELECT "description", "id", "price", "shopifyId", "stock", "title", "vendorId" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE TABLE "new_Vendor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "postcode" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "openingTimes" TEXT NOT NULL,
    "contactInfo" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Vendor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Vendor" ("contactInfo", "email", "id", "latitude", "location", "longitude", "name", "openingTimes", "postcode", "userId") SELECT "contactInfo", "email", "id", "latitude", "location", "longitude", "name", "openingTimes", "postcode", "userId" FROM "Vendor";
DROP TABLE "Vendor";
ALTER TABLE "new_Vendor" RENAME TO "Vendor";
CREATE UNIQUE INDEX "Vendor_email_key" ON "Vendor"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
