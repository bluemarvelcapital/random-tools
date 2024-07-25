/*
  Warnings:

  - Added the required column `latitude` to the `Vendor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitude` to the `Vendor` table without a default value. This is not possible if the table is not empty.
  - Made the column `userId` on table `Vendor` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables

PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Vendor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    CONSTRAINT "Vendor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Vendor" ("email", "id", "name", "userId") SELECT "email", "id", "name", "userId" FROM "Vendor";
DROP TABLE "Vendor";
ALTER TABLE "new_Vendor" RENAME TO "Vendor";
CREATE UNIQUE INDEX "Vendor_email_key" ON "Vendor"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
