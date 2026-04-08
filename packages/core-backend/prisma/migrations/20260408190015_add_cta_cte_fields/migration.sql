-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('BORRADOR', 'CONFIRMADO', 'ANULADO');

-- CreateEnum
CREATE TYPE "CheckStatus" AS ENUM ('PENDIENTE', 'DEPOSITADO', 'ENTREGADO', 'RECHAZADO');

-- AlterEnum
ALTER TYPE "InvoiceType" ADD VALUE 'NOTA_DEBITO';

-- AlterTable
ALTER TABLE "Prov_Check" ADD COLUMN     "status" "CheckStatus" NOT NULL DEFAULT 'PENDIENTE';

-- AlterTable
ALTER TABLE "Prov_Payment" ADD COLUMN     "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "number" TEXT,
ADD COLUMN     "status" "PaymentStatus" NOT NULL DEFAULT 'CONFIRMADO';
