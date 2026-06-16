// route/settingsRoute.js
import express from "express";
import {
  setQrisStatic,
  getQrisStatic,
} from "../controller/settingsController.js";
import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

// Semua endpoint settings butuh auth
router.use(requireAuth);

// GET  /api/settings/qris  — Info QRIS statis merchant saat ini
router.get("/qris", getQrisStatic);

// PUT  /api/settings/qris  — Set / update QRIS statis merchant
// Body: { qrisStatic: string }
router.put("/qris", setQrisStatic);

export default router;
