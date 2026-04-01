-- CreateEnum
CREATE TYPE "InvoiceType" AS ENUM ('FACTURA_A', 'FACTURA_B', 'FACTURA_C', 'NOTA_CREDITO');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('PENDIENTE', 'PAGADA_PARCIAL', 'PAGADA', 'VENCIDA');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('EFECTIVO', 'TRANSFERENCIA', 'CHEQUE');

-- CreateTable
CREATE TABLE "Prov_Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prov_Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prov_Provider" (
    "id" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "taxId" TEXT NOT NULL,
    "address" TEXT,
    "discountRate" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "categoryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prov_Provider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prov_Contact" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "role" TEXT,
    "providerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prov_Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prov_BankAccount" (
    "id" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountType" TEXT NOT NULL,
    "accountNumber" TEXT,
    "cbuCvu" TEXT,
    "alias" TEXT,
    "providerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prov_BankAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prov_Invoice" (
    "id" TEXT NOT NULL,
    "invoiceType" "InvoiceType" NOT NULL DEFAULT 'FACTURA_A',
    "pointOfSale" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "netAmount" DOUBLE PRECISION NOT NULL,
    "taxAmount" DOUBLE PRECISION NOT NULL,
    "nonTaxedAmount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'PENDIENTE',
    "providerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prov_Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prov_Payment" (
    "id" TEXT NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "referenceNotes" TEXT,
    "providerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prov_Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prov_PaymentItem" (
    "id" TEXT NOT NULL,
    "amountPaid" DOUBLE PRECISION NOT NULL,
    "paymentId" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Prov_PaymentItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prov_Check" (
    "id" TEXT NOT NULL,
    "checkNumber" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "issuerName" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prov_Check_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Prov_Category_name_key" ON "Prov_Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Prov_Provider_taxId_key" ON "Prov_Provider"("taxId");

-- CreateIndex
CREATE UNIQUE INDEX "Prov_Invoice_providerId_pointOfSale_invoiceNumber_key" ON "Prov_Invoice"("providerId", "pointOfSale", "invoiceNumber");

-- AddForeignKey
ALTER TABLE "Prov_Provider" ADD CONSTRAINT "Prov_Provider_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Prov_Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prov_Contact" ADD CONSTRAINT "Prov_Contact_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Prov_Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prov_BankAccount" ADD CONSTRAINT "Prov_BankAccount_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Prov_Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prov_Invoice" ADD CONSTRAINT "Prov_Invoice_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Prov_Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prov_Payment" ADD CONSTRAINT "Prov_Payment_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Prov_Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prov_PaymentItem" ADD CONSTRAINT "Prov_PaymentItem_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Prov_Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prov_PaymentItem" ADD CONSTRAINT "Prov_PaymentItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Prov_Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prov_Check" ADD CONSTRAINT "Prov_Check_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Prov_Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
