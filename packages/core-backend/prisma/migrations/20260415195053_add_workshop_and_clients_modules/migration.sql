-- CreateEnum
CREATE TYPE "OrderPriority" AS ENUM ('NORMAL', 'MEDIA', 'ALTA', 'URGENTE');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('INGRESADO', 'PRESUPUESTO_PENDIENTE', 'EN_REPARACION', 'ESPERANDO_REPUESTOS', 'LISTO', 'ENTREGADO', 'ANULADO');

-- CreateEnum
CREATE TYPE "SaleStatus" AS ENUM ('PENDIENTE', 'DESPACHADO', 'EN_VIAJE', 'COBRADO', 'MUESTRA_PENDIENTE', 'ANULADO');

-- CreateTable
CREATE TABLE "Cli_Client" (
    "id" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "taxId" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "taxCondition" TEXT DEFAULT 'RI',
    "paymentTermsDays" INTEGER NOT NULL DEFAULT 30,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cli_Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Repo_Order" (
    "id" TEXT NOT NULL,
    "orderNumber" SERIAL NOT NULL,
    "patent" TEXT,
    "vehicleBrand" TEXT,
    "pieceSummary" TEXT,
    "problemDescription" TEXT,
    "priority" "OrderPriority" NOT NULL DEFAULT 'NORMAL',
    "status" "OrderStatus" NOT NULL DEFAULT 'INGRESADO',
    "clientId" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3),
    "entryDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishDate" TIMESTAMP(3),
    "deliveryDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Repo_Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Repo_Task" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "pieceName" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "mechanicId" INTEGER,
    "laborPrice" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "partsCost" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "totalPrice" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Repo_Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sale_Order" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT,
    "remitoNumber" TEXT,
    "clientId" TEXT NOT NULL,
    "status" "SaleStatus" NOT NULL DEFAULT 'PENDIENTE',
    "isCOD" BOOLEAN NOT NULL DEFAULT false,
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "itemsDescription" TEXT,
    "saleDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3),
    "shipDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sale_Order_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cli_Client_taxId_key" ON "Cli_Client"("taxId");

-- CreateIndex
CREATE UNIQUE INDEX "Repo_Order_orderNumber_key" ON "Repo_Order"("orderNumber");

-- CreateIndex
CREATE INDEX "Repo_Order_patent_idx" ON "Repo_Order"("patent");

-- AddForeignKey
ALTER TABLE "Repo_Order" ADD CONSTRAINT "Repo_Order_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Cli_Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Repo_Task" ADD CONSTRAINT "Repo_Task_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Repo_Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Repo_Task" ADD CONSTRAINT "Repo_Task_mechanicId_fkey" FOREIGN KEY ("mechanicId") REFERENCES "Emp_Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale_Order" ADD CONSTRAINT "Sale_Order_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Cli_Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
