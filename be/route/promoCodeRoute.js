import express from "express";
import {
  getPromoCodes,
  getPromoCodeById,
  createPromoCode,
  updatePromoCode,
  togglePromoActive,
  deletePromoCode,
} from "../controller/promoCodeController.js";

const router = express.Router();

router.get("/", getPromoCodes);
router.post("/", createPromoCode);
router.patch("/:id/toggle", togglePromoActive);
router.get("/:id", getPromoCodeById);
router.put("/:id", updatePromoCode);
router.delete("/:id", deletePromoCode);

export default router;
