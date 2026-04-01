-- AlterTable
ALTER TABLE "Prov_Invoice" ADD COLUMN     "isCtaCte" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "perceptionAmount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "receptionDate" TIMESTAMP(3),
ALTER COLUMN "dueDate" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Prov_Provider" ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "province" TEXT,
ADD COLUMN     "taxCondition" TEXT;

-- CreateTable
CREATE TABLE "Core_Parameter" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "key" TEXT,
    "value" TEXT NOT NULL,
    "label" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Core_Parameter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Core_Notification" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'INFO',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Core_Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Core_Parameter_category_key_key" ON "Core_Parameter"("category", "key");
