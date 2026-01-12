import express from "express";
import { login, register, logout } from "../controller/authController.js";
import validate from "../middleware/validate.js";
import { loginSchema } from "../schema/auth.schema.js";

const router = express.Router();

router.post("/login", validate(loginSchema), login);
router.post("/register", register);
router.post("/logout", logout);

export default router;
