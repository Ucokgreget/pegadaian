// route/paymentRoute.js
import express from "express";
import {
  generatePaymentQR,
  uploadPaymentProof,
  verifyPayment,
  listPayments,
  getPaymentById,
} from "../controller/paymentController.js";
import requireAuth from "../middleware/requireAuth.js";
import { uploadProof } from "../middleware/upload.js";

const router = express.Router();

// Semua endpoint payment butuh auth
router.use(requireAuth);

// ── WAOrder payment endpoints ────────────────────────────────────────────────

// POST /api/wa-orders/:orderCode/payment-qr
// Generate QRIS dinamis on-the-fly untuk order tertentu
router.post("/wa-orders/:orderCode/payment-qr", generatePaymentQR);

// POST /api/wa-orders/:orderCode/payment-proof
// Upload bukti pembayaran (multipart, field: "proof")
router.post(
  "/wa-orders/:orderCode/payment-proof",
  uploadProof.single("proof"),
  uploadPaymentProof
);

// ── Payment management endpoints ─────────────────────────────────────────────

// GET  /api/payments            — List payments (merchant: own only, admin: all)
router.get("/payments", listPayments);

// GET  /api/payments/:id        — Detail satu payment
router.get("/payments/:id", getPaymentById);

// PATCH /api/payments/:id/verify — Verifikasi pembayaran (PAID / FAILED)
// Body: { status: "PAID" | "FAILED" }
router.patch("/payments/:id/verify", verifyPayment);

export default router;
