import express from "express";
import jwt from "jsonwebtoken";
import {
  login,
  register,
  logout,
  getMe,
  refreshAccessToken,
  loginWithRememberMe,
} from "../controller/authController.js";
import validate from "../middleware/validate.js";
import requireAuth from "../middleware/requireAuth.js";
import { loginSchema, registerSchema } from "../schema/auth.schema.js";
import passport from "../config/passport.js";

const router = express.Router();

// ─── Email / Password ─────────────────────────────────────────────────────────
router.post("/login", validate(loginSchema), login);
router.post("/register", validate(registerSchema), register);
router.post("/logout", requireAuth, logout);
router.get("/me", requireAuth, getMe);
router.post("/refresh", refreshAccessToken);
router.post("/remember", loginWithRememberMe);

// ─── Google OAuth ─────────────────────────────────────────────────────────────

/**
 * GET /auth/google
 * Memulai alur Google OAuth — browser diarahkan ke halaman consent Google.
 */
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

/**
 * GET /auth/google/callback
 * Google mengarahkan kembali ke sini setelah user menyetujui.
 * Passport memvalidasi code, mengupsert user, lalu kita:
 *   1. Buat JWT yang sama dengan login biasa
 *   2. Redirect ke FRONTEND_URL/auth/callback?token=JWT
 */
router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${
      process.env.FRONTEND_URL ?? "http://localhost:3000"
    }/login?error=oauth_failed`,
  }),
  (req, res) => {
    const user = req.user;

    const token = jwt.sign(
      { email: user.email, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "4h", subject: String(user.id) }
    );

    const frontendUrl = process.env.FRONTEND_URL ?? "http://localhost:3000";
    res.redirect(
      `${frontendUrl}/auth/callback?token=${encodeURIComponent(token)}`
    );
  }
);

export default router;
