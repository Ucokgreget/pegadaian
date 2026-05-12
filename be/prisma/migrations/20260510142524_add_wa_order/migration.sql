-- CreateEnum
CREATE TYPE "WAOrderStatus" AS ENUM ('COLLECTING_INFO', 'PENDING_PAYMENT', 'PAID', 'PROCESSING', 'SHIPPED', 'DONE', 'CANCELLED');

-- CreateTable
CREATE TABLE "wa_orders" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "senderPhone" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "postalCode" TEXT,
    "notes" TEXT,
    "subtotal" TEXT,
    "status" "WAOrderStatus" NOT NULL DEFAULT 'COLLECTING_INFO',
    "orderCode" TEXT NOT NULL,
    "tripayReference" TEXT,
    "paymentUrl" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wa_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wa_order_items" (
    "id" SERIAL NOT NULL,
    "waOrderId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "variantId" INTEGER,
    "productName" TEXT NOT NULL,
    "variantName" TEXT,
    "price" INTEGER NOT NULL,
    "qty" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,

    CONSTRAINT "wa_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "wa_orders_orderCode_key" ON "wa_orders"("orderCode");

-- AddForeignKey
ALTER TABLE "wa_orders" ADD CONSTRAINT "wa_orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wa_order_items" ADD CONSTRAINT "wa_order_items_waOrderId_fkey" FOREIGN KEY ("waOrderId") REFERENCES "wa_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wa_order_items" ADD CONSTRAINT "wa_order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
