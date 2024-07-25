/*
  Warnings:

  - Added the required column `email` to the `Vendor` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Vendor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL
);
INSERT INTO "new_Vendor" ("id", "name") SELECT "id", "name" FROM "Vendor";
DROP TABLE "Vendor";
ALTER TABLE "new_Vendor" RENAME TO "Vendor";
CREATE UNIQUE INDEX "Vendor_email_key" ON "Vendor"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
