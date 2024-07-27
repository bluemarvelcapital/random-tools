-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'vendor';

-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "userId" INTEGER;

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
