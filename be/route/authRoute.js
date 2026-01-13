import express from "express";
import {
  login,
  register,
  logout,
  getMe,
} from "../controller/authController.js";
import validate from "../middleware/validate.js";
import requireAuth from "../middleware/requireAuth.js";
import { loginSchema } from "../schema/auth.schema.js";

const router = express.Router();

router.post("/login", validate(loginSchema), login);
router.post("/register", register);
router.post("/logout", logout);
router.get("/me", requireAuth, getMe);

export default router;
