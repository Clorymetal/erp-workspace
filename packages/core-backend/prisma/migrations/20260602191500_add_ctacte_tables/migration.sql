-- CreateTable
CREATE TABLE "Cli_Remito" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "documentType" TEXT NOT NULL DEFAULT 'Remito',
    "invoiceNumber" TEXT,
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "paymentTermDays" INTEGER NOT NULL DEFAULT 30,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "driverName" TEXT,
    "driverDni" TEXT,
    "driverPhone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cli_Remito_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Cli_PaymentItem" ADD COLUMN "remitoId" TEXT;

-- AddForeignKey
ALTER TABLE "Cli_PaymentItem" ADD CONSTRAINT "Cli_PaymentItem_remitoId_fkey" FOREIGN KEY ("remitoId") REFERENCES "Cli_Remito"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cli_Remito" ADD CONSTRAINT "Cli_Remito_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Cli_Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
