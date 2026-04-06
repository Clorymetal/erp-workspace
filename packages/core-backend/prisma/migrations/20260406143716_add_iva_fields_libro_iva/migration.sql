-- CreateEnum
CREATE TYPE "PayType" AS ENUM ('MONTHLY', 'BIWEEKLY');

-- AlterTable
ALTER TABLE "Prov_Invoice" ADD COLUMN     "ivaNumber" INTEGER,
ADD COLUMN     "ivaPeriod" TEXT;

-- CreateTable
CREATE TABLE "Emp_Employee" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "payType" "PayType" NOT NULL DEFAULT 'MONTHLY',
    "baseSalary" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Emp_Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Emp_SalaryPeriod" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "periodYear" INTEGER NOT NULL,
    "periodMonth" INTEGER NOT NULL,
    "baseSalary" DOUBLE PRECISION NOT NULL,
    "firstInstallment" DOUBLE PRECISION,
    "secondInstallment" DOUBLE PRECISION,
    "totalAdvances" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "balance" DOUBLE PRECISION NOT NULL,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Emp_SalaryPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Emp_Advance" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "periodId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cashAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "checkAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "transferAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "accumulated" DOUBLE PRECISION NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Emp_Advance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Emp_SalaryPeriod_employeeId_periodYear_periodMonth_key" ON "Emp_SalaryPeriod"("employeeId", "periodYear", "periodMonth");

-- AddForeignKey
ALTER TABLE "Emp_SalaryPeriod" ADD CONSTRAINT "Emp_SalaryPeriod_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Emp_Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Emp_Advance" ADD CONSTRAINT "Emp_Advance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Emp_Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Emp_Advance" ADD CONSTRAINT "Emp_Advance_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "Emp_SalaryPeriod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
