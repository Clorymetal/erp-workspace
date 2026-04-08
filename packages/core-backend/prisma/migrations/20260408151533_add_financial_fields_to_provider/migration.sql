-- AlterTable
ALTER TABLE "Prov_Provider" ADD COLUMN     "expirationDays" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "netAmountCode" TEXT;
