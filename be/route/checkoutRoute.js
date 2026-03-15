import express from "express";
import {
  getPaymentChannels,
  createOrder,
  getInvoice,
  getUserInvoices,
} from "../controller/checkoutController.js";

const router = express.Router();

router.get("/payment-channels", getPaymentChannels);
router.post("/order", createOrder);
router.get("/invoice", getUserInvoices);
router.get("/invoice/:invoiceNumber", getInvoice);
export default router;
