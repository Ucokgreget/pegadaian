import express from "express";
import requireAuth from "../middleware/requireAuth.js";
import { getMe } from "../controller/userController.js";

const router = express.Router();

router.get("/me", requireAuth, getMe);

export default router;
