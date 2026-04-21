-- CreateTable
CREATE TABLE "Core_BusinessConfig" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "name" TEXT NOT NULL DEFAULT 'Clorymetal SRL',
    "taxId" TEXT NOT NULL DEFAULT '00-00000000-0',
    "address" TEXT NOT NULL DEFAULT 'Dirección Ficticia 123',
    "city" TEXT NOT NULL DEFAULT 'Resistencia',
    "province" TEXT NOT NULL DEFAULT 'Chaco',
    "phone" TEXT NOT NULL DEFAULT '3624-000000',
    "email" TEXT NOT NULL DEFAULT 'contacto@clorymetal.com.ar',
    "vatCondition" TEXT NOT NULL DEFAULT 'Responsable Inscripto',
    "logoUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Core_BusinessConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cli_Payment" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "number" TEXT,
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "paymentMethod" TEXT NOT NULL DEFAULT 'EFECTIVO',
    "referenceNotes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'CONFIRMADO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cli_Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cli_PaymentItem" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "orderId" TEXT,
    "saleId" TEXT,
    "amountPaid" DOUBLE PRECISION NOT NULL DEFAULT 0.0,

    CONSTRAINT "Cli_PaymentItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cli_Check" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "paymentId" TEXT,
    "checkNumber" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "issuerName" TEXT,
    "taxId" TEXT,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'EN_CARTERA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cli_Check_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Cli_Payment" ADD CONSTRAINT "Cli_Payment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Cli_Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cli_PaymentItem" ADD CONSTRAINT "Cli_PaymentItem_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Cli_Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cli_PaymentItem" ADD CONSTRAINT "Cli_PaymentItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Repo_Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cli_PaymentItem" ADD CONSTRAINT "Cli_PaymentItem_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale_Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cli_Check" ADD CONSTRAINT "Cli_Check_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Cli_Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cli_Check" ADD CONSTRAINT "Cli_Check_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Cli_Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
