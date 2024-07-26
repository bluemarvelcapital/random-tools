-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN "contactInfo" TEXT;
ALTER TABLE "Vendor" ADD COLUMN "location" TEXT;
ALTER TABLE "Vendor" ADD COLUMN "openingTimes" TEXT;

-- CreateTable
CREATE TABLE "DeletionRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vendorId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DeletionRequest_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
