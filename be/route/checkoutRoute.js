import express from "express";
import {
  getPaymentChannels,
  createOrder,
  getInvoice,
  getUserInvoices,
  handleCallback,
} from "../controller/checkoutController.js";
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

router.post("/callback", handleCallback);
router.get("/payment-channels", requireAuth, getPaymentChannels);
router.post("/order", requireAuth, createOrder);
router.get("/invoice", requireAuth, getUserInvoices);
router.get("/invoice/:id", requireAuth, getInvoice);

export default router;
