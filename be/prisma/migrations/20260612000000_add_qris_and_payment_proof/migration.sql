-- Migration: add_qris_and_payment_proof
-- Adds QRIS static field to users and payment proof / wa_order relation to payments.

-- ── users: add qris_static column ─────────────────────────────────────────────
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "qris_static" TEXT;

-- ── payments: make invoiceId, tripayReference, merchantRef nullable ────────────
-- (required so QRIS manual payments—which have no Tripay reference—can be stored)

ALTER TABLE "payments" ALTER COLUMN "invoiceId" DROP NOT NULL;
ALTER TABLE "payments" ALTER COLUMN "tripayReference" DROP NOT NULL;
ALTER TABLE "payments" ALTER COLUMN "merchantRef" DROP NOT NULL;

-- Re-create the invoiceId FK as SET NULL so nullable rows don't violate it
ALTER TABLE "payments" DROP CONSTRAINT IF EXISTS "payments_invoiceId_fkey";
ALTER TABLE "payments"
  ADD CONSTRAINT "payments_invoiceId_fkey"
  FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- ── payments: add wa_order_id (FK → wa_orders) and proof_url ──────────────────
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "wa_order_id" INTEGER;
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "proof_url" TEXT;

ALTER TABLE "payments"
  ADD CONSTRAINT "payments_wa_order_id_fkey"
  FOREIGN KEY ("wa_order_id") REFERENCES "wa_orders"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
