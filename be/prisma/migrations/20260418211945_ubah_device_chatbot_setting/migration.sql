/*
  Warnings:

  - You are about to drop the column `device` on the `chatbot_settings` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `stock` on the `products` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "chatbot_settings" DROP COLUMN "device";

-- AlterTable
ALTER TABLE "products" DROP COLUMN "price",
DROP COLUMN "stock";
