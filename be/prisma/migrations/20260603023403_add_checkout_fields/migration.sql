-- AlterTable
ALTER TABLE "wa_orders" ADD COLUMN     "shippingData" JSONB;

-- CreateTable
CREATE TABLE "checkout_fields" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "fieldKey" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "inputType" TEXT NOT NULL DEFAULT 'text',
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "checkout_fields_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "checkout_fields_userId_idx" ON "checkout_fields"("userId");

-- AddForeignKey
ALTER TABLE "checkout_fields" ADD CONSTRAINT "checkout_fields_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
