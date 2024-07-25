-- This is an empty migration.

-- Ensure columns are added if they don't exist
PRAGMA foreign_keys=off;

-- Temporarily rename the existing Vendor table
ALTER TABLE "Vendor" RENAME TO "Vendor_temp";

-- Create a new Vendor table with the correct schema
CREATE TABLE "Vendor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL UNIQUE,
    "latitude" REAL NOT NULL DEFAULT 51.509865,
    "longitude" REAL NOT NULL DEFAULT -0.118092,
    "userId" INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY ("userId") REFERENCES "User"("id")
);

-- Copy data from the old Vendor table to the new Vendor table
INSERT INTO "Vendor" ("id", "name", "email", "latitude", "longitude", "userId")
SELECT "id", "name", "email", COALESCE("latitude", 51.509865), COALESCE("longitude", -0.118092), COALESCE("userId", 1)
FROM "Vendor_temp";

-- Drop the old Vendor table
DROP TABLE "Vendor_temp";

PRAGMA foreign_keys=on;
